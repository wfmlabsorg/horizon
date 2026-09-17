/**
 * Coordinator: orders the stages, writes the run state (schemas/run-state.schema.json) and the run log, appends
 * CHANGELOG rows, stops at a blocked gate, and never lets an agent actor decide a human gate. Phase 1 has no stage
 * that blocks; the structure is here so phases 2–3 can plug the Forecaster, Evaluator and planner gate in.
 */
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import type { Book, StageRecord, Variance, ScoutResult, LibrarianResult, Reconciliation } from "./types";
import { changelog, writeText, table, isoWeek, weekFromLabel, addDays, rel } from "./book";
import { runDataEngineer } from "./dataEngineer";
import { runPostAnalyst } from "./postAnalyst";
import { runScout } from "./scout";
import { runLibrarian } from "./librarian";
import { renderDailyNote, renderWeeklyReview, renderRegisterReport } from "./reporter";

interface Gate { name: string; kind: "agent" | "human"; status: "pending" | "passed" | "blocked" | "waived"; decided_by?: string; decided_at?: string; reason?: string; rules_checked?: string[] }

function nextRunId(book: Book, prefix: string): string {
  const dir = join(book.dir, "08-reports", "runs");
  let r = 0;
  if (existsSync(dir)) for (const f of readdirSync(dir)) { const m = new RegExp(`^${prefix}-r(\\d+)\\.json$`).exec(f); if (m) r = Math.max(r, Number(m[1])); }
  return `${prefix}-r${r + 1}`;
}
const ts = (date: string, minutes: number) => `${date}T${String(6 + Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00+00:00`;
/** Directory as written into run states: repo-relative, never a machine path. */
const bookDir = (book: Book) => `books/${book.client}`;

export function runDaily(book: Book, date: string, log: (s: string) => void): { runId: string; status: string; note: string } {
  const runId = nextRunId(book, `daily-${date}`);
  const issued = addDays(date, 1); // the daily clock runs the morning after the scoring day; the note's Issued line says so
  const stages: StageRecord[] = [];
  const entries: { path: string; actor: string; why: string }[] = [];
  let minute = 0;
  const stage = (id: number, name: string, agent: string, fn?: () => { outputs: string[]; notes: string; inputs?: string[] }): StageRecord => {
    const started = ts(issued, minute);
    if (!fn) { const s: StageRecord = { id, name, agent, status: "skipped", input_files: [], output_files: [], started_at: started, completed_at: started, notes: "phase 1: stage not implemented; structure only" }; stages.push(s); return s; }
    const r = fn();
    minute += 4;
    const s: StageRecord = { id, name, agent, status: "completed", input_files: r.inputs ?? [], output_files: r.outputs, started_at: started, completed_at: ts(issued, minute), notes: r.notes };
    stages.push(s);
    return s;
  };
  const clock = new Date(date + "T00:00:00Z");
  if (Number.isNaN(clock.getTime())) throw new Error(`bad date ${date}`);
  if (!book.demand.some((r) => r.date === date)) throw new Error(`no demand rows for ${date} in ${book.client}`);

  // 1–2 DataEngineer
  let rec!: Reconciliation;
  stage(1, "ingest", "DataEngineer", () => { rec = runDataEngineer(book, date); return { inputs: [`02-demand/${rec.demandFile}`, `04-supply/${rec.supplyFile}`], outputs: ["02-demand/RECONCILIATION.md", "04-supply/RECONCILIATION.md"], notes: `read the ${date} rows from the versioned month files; ${rec.checks.length} checks` }; });
  stage(2, "reconcile", "DataEngineer", () => ({ outputs: ["02-demand/RECONCILIATION.md", "04-supply/RECONCILIATION.md"], notes: `reconciled: ${rec.reconciled}; ${rec.checks.filter((c) => !c.ok).map((c) => "FAIL " + c.name).join("; ") || "all identities close"}${rec.outliers.length ? "; outliers flagged: " + rec.outliers.length : ""}` }));
  entries.push({ path: "02-demand/RECONCILIATION.md", actor: "agent:DataEngineer", why: `${runId}: reconciliation stamp for ${date} (${rec.reconciled ? "closes" : "does not close"})` });
  entries.push({ path: "04-supply/RECONCILIATION.md", actor: "agent:DataEngineer", why: `${runId}: reconciliation stamp for ${date}` });
  // 3–4 PostAnalyst
  let v!: Variance;
  stage(3, "score", "PostAnalyst", () => { v = runPostAnalyst(book, date, rec); return { inputs: [`02-demand/${rec.demandFile}`, `04-supply/${rec.supplyFile}`, "03-forecast/v000-plan-of-record/forecast-daily.csv"], outputs: [rel(book, v.file)], notes: `scored v000 on ${v.scores.length} region×channel rows` }; });
  stage(4, "decompose", "PostAnalyst", () => ({ outputs: [rel(book, v.file)], notes: `sequential decomposition; ${v.flags.length} new regime flag(s), ${v.continuing.length} continuing` }));
  entries.push({ path: rel(book, v.file), actor: "agent:PostAnalyst", why: `${runId}: variance, decomposition, SPC (${v.flags.length} flag(s))` });
  // 5 Scout
  let scout!: ScoutResult;
  stage(5, "match_events", "Scout", () => { scout = runScout(book, date, v); return { inputs: ["05-events/events.csv", rel(book, v.file)], outputs: scout.proposed.map((p) => rel(book, p.file)), notes: `${scout.matches.length} event(s) matched (${scout.matches.filter((m) => m.explains).length} explain a break); ${scout.proposed.length} proposed` }; });
  for (const p of scout.proposed) entries.push({ path: rel(book, p.file), actor: "agent:Scout", why: `${runId}: proposed event [E] for ${p.forFlag} — awaiting planner review` });
  // 6 Librarian (stands in for the CausalAnalyst in phase 1)
  let lib!: LibrarianResult;
  stage(6, "update_hypotheses", "Librarian", () => { lib = runLibrarian(book, date, v, scout); return { inputs: ["06-questions/register.md"], outputs: [...(lib.opened.length || lib.touched.length ? ["06-questions/register.md"] : []), ...lib.touched.map((t) => `06-questions/${t.id}.md`)], notes: `${lib.opened.length} XR opened, ${lib.touched.filter((t) => !t.opened).length} touched` }; });
  for (const r of lib.opened) entries.push({ path: `06-questions/${r.id}.md`, actor: "agent:Librarian", why: `${runId}: ${r.id} opened (Sev ${r.sev} proposed) with a hypothesis table — ${r.title.slice(0, 80)}…` });
  if (lib.opened.length || lib.touched.some((t) => !t.opened)) entries.push({ path: "06-questions/register.md", actor: "agent:Librarian", why: `${runId}: ${lib.opened.map((r) => r.id + " opened").concat(lib.touched.filter((t) => !t.opened).map((t) => t.id + " touched")).join(", ")}` });
  // 7–9 not in phase 1
  stage(7, "reforecast", "Forecaster");
  stage(8, "evaluate", "Evaluator");
  const gates: Gate[] = [
    { name: "evaluator", kind: "agent", status: "waived", decided_by: "agent:Coordinator", decided_at: ts(issued, minute), reason: "phase 1 has no Evaluator stage; the Reporter checks answer-first shape, grades and definition slugs by rule", rules_checked: ["grades-present", "definitions-cited", "sums-reconcile", "answer-first-shape"] },
    { name: "planner-reforecast", kind: "human", status: "pending", reason: "no reforecast proposed: phase 1 has no Forecaster; v000 plan of record carried forward (Coordinator rule: no decision → carry the prior approved version)" },
  ];
  const blocked = gates.some((g) => g.status === "blocked");
  const gateStage: StageRecord = { id: 9, name: "planner_gate", agent: "Planner", status: blocked ? "blocked" : "skipped", input_files: [], output_files: [], started_at: ts(issued, minute), completed_at: ts(issued, minute), notes: blocked ? "blocked" : "not raised: nothing proposed; v000 carried" };
  stages.push(gateStage);
  let note = "";
  if (!blocked) {
    stage(10, "publish", "Reporter", () => { note = join(book.dir, "08-reports", "daily", `${date}.md`); writeText(note, renderDailyNote(book, date, runId, rec, v, scout, lib)); return { inputs: [rel(book, v.file), "05-events/events.csv", "06-questions/register.md"], outputs: [rel(book, note)], notes: "daily note from ledgers only; v000 in force" }; });
    entries.push({ path: rel(book, note), actor: "agent:Reporter", why: `${runId}: daily note issued` });
  }
  stage(11, "export_iex", "Adapter-IEX");
  // run state
  const state = {
    pipeline: "HORIZON", book: { client: book.client, directory: bookDir(book) }, clock: "daily", run_date: date, run_id: runId,
    status: blocked ? "blocked" : "completed", stages, gates,
    reforecast: { status: "not_needed", trigger: v.flags.length ? v.flags.map((f) => f.series).join("; ") : "clock" },
    variance_summary: { by_channel: v.byChannel.map((b) => ({ channel: b.channel, forecast: round(b.offered_fc), actual: b.offered_act, variance_pct: round(b.offered_dpct), decomposition: { volume: round(b.volume_h), handle_time: round(b.handle_h), mix: round(b.mix_h), supply: round(b.supply_h), residual: round(b.residual_h), method: "sequential" } })), regime_flags: v.flags.map((f) => `${f.series}: ${f.kind} (${f.rule}), ${f.side}-side, onset ${f.onset}`) },
    events_matched: scout.matches.map((m) => m.event.event_id).filter((id) => /^EV-/.test(id)), questions_touched: lib.touched.map((t) => t.id), skills_invoked: ["VarianceAnalysis", "ProcessCapability", "StatisticalAnalysis"], causal_escalation: false,
    changelog_entries: [] as string[], created_at: ts(issued, 0), updated_at: ts(issued, minute), completed_at: ts(issued, minute),
  };
  const runsDir = join(book.dir, "08-reports", "runs");
  const statePath = join(runsDir, `${runId}.json`);
  entries.push({ path: rel(book, statePath), actor: "agent:Coordinator", why: `${runId}: run state (${state.status})` });
  state.changelog_entries = changelog(book, date, entries);
  writeText(statePath, JSON.stringify(state, null, 2) + "\n");
  writeText(join(runsDir, `${runId}.md`), `# Run: ${book.client} · daily · ${date} · ${runId}\n\n${table(["Step", "Agent", "Started", "Finished", "Wrote", "Verdict"], stages.map((s) => [String(s.id), s.agent, s.started_at.slice(11, 16), s.completed_at.slice(11, 16), s.output_files.join(", ") || "—", s.status === "completed" ? s.notes : s.status]))}\n\nGates: ${gates.map((g) => `${g.name} ${g.status}${g.decided_by ? " (" + g.decided_by + ")" : ""}`).join(" · ")}. No agent decided a human gate.\n`);
  log(`${runId}: ${state.status}; ${v.flags.length} flag(s); ${scout.matches.length} event(s) matched; ${lib.opened.length} XR opened; note ${rel(book, note)}`);
  return { runId, status: state.status, note };
}

export function runWeekly(book: Book, label: string, log: (s: string) => void): string {
  const { monday, sunday } = weekFromLabel(label);
  const runId = nextRunId(book, `weekly-${label}`);
  const issue = addDays(sunday, 1);
  const file = join(book.dir, "08-reports", "weekly", `${label}.md`);
  writeText(file, renderWeeklyReview(book, label, monday, sunday, runId));
  const stages: StageRecord[] = [
    { id: 1, name: "score", agent: "PostAnalyst", status: "completed", input_files: ["02-demand", "03-forecast/v000-plan-of-record", "04-supply"], output_files: [], started_at: ts(issue, 0), completed_at: ts(issue, 5), notes: "variance review across the week (computed for the review; no separate file in phase 1)" },
    { id: 2, name: "reforecast", agent: "Forecaster", status: "skipped", input_files: [], output_files: [], started_at: ts(issue, 5), completed_at: ts(issue, 5), notes: "assumption register refresh rendered by the Reporter from observed values; no new version (phase 1)" },
    { id: 3, name: "backlog_review", agent: "Librarian", status: "completed", input_files: ["06-questions/register.md"], output_files: [], started_at: ts(issue, 5), completed_at: ts(issue, 8), notes: "staleness flags from the register" },
    { id: 4, name: "publish", agent: "Reporter", status: "completed", input_files: ["08-reports/runs/daily-*.json", "06-questions/register.md"], output_files: [rel(book, file)], started_at: ts(issue, 8), completed_at: ts(issue, 12), notes: "weekly review" },
    { id: 5, name: "evaluate", agent: "Evaluator", status: "skipped", input_files: [], output_files: [], started_at: ts(issue, 12), completed_at: ts(issue, 12), notes: "phase 1" },
    { id: 6, name: "planner_gate", agent: "Planner", status: "skipped", input_files: [], output_files: [], started_at: ts(issue, 12), completed_at: ts(issue, 12), notes: "planner review of the register: not raised in the scripted demo" },
  ];
  const gates: Gate[] = [{ name: "planner-publication", kind: "human", status: "pending", reason: "inside the planning team; review requested, not blocking" }];
  const statePath = join(book.dir, "08-reports", "runs", `${runId}.json`);
  const entries = changelog(book, issue, [{ path: rel(book, file), actor: "agent:Reporter", why: `${runId}: weekly review ${label} (${monday} to ${sunday})` }, { path: rel(book, statePath), actor: "agent:Coordinator", why: `${runId}: run state` }]);
  writeText(statePath, JSON.stringify({ pipeline: "HORIZON", book: { client: book.client, directory: bookDir(book) }, clock: "weekly", run_date: sunday, run_id: runId, status: "completed", stages, gates, changelog_entries: entries, created_at: ts(issue, 0), completed_at: ts(issue, 12) }, null, 2) + "\n");
  log(`${runId}: completed; ${rel(book, file)}`);
  return file;
}

export function runRegisterReport(book: Book, date: string, log: (s: string) => void): string {
  const runId = nextRunId(book, `register-${date}`);
  const file = join(book.dir, "08-reports", "register", `${date}.md`);
  writeText(file, renderRegisterReport(book, date));
  const stages: StageRecord[] = [{ id: 1, name: "register_report", agent: "Reporter", status: "completed", input_files: ["06-questions/register.md"], output_files: [rel(book, file)], started_at: ts(date, 0), completed_at: ts(date, 6), notes: "register report from the register and its change log only" }];
  const gates: Gate[] = [{ name: "planner-publication", kind: "human", status: "pending", reason: "planner review of the register; not blocking inside the planning team" }];
  const statePath = join(book.dir, "08-reports", "runs", `${runId}.json`);
  const entries = changelog(book, date, [{ path: rel(book, file), actor: "agent:Reporter", why: `${runId}: register report` }, { path: rel(book, statePath), actor: "agent:Coordinator", why: `${runId}: run state` }]);
  writeText(statePath, JSON.stringify({ pipeline: "HORIZON", book: { client: book.client, directory: bookDir(book) }, clock: "weekly", run_date: date, run_id: runId, status: "completed", stages, gates, changelog_entries: entries, created_at: ts(date, 0), completed_at: ts(date, 6) }, null, 2) + "\n");
  log(`${runId}: completed; ${rel(book, file)}`);
  return file;
}
const round = (v: number) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);
export { isoWeek };
