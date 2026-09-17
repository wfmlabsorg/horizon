/**
 * Scout stage (daily step 3, rung 1): read the ledger before the world. Match accepted events whose effect window
 * covers the date to the day's misses and regime flags; for regime flags with no explaining event, propose a
 * candidate event (grade [E]) into 05-events/proposed/, never into the accepted ledger.
 *
 * Rule: an event explains a break only if it is (a) graded [M] — a fact of occurrence — (b) unplanned, because a
 * planned event was already in the forecast and a miss on a planned event is a failed assumption, not an explanation,
 * and (c) its start lies within three days before the break's onset. [E] and [A] events, and planned ones, are
 * reported as co-occurring and handed to the hypothesis table as candidates.
 */
import { join } from "path";
import type { Book, Variance, ScoutResult, EventMatch, ProposedEvent, RegimeFlag, EventRow, Side } from "./types";
import { addDays, readIfExists, writeText, ensureDir, n1, signed, parseTable, table, fmtDate } from "./book";
import { TOL_OFFERED_PCT, TOL_AHT_PCT } from "./postAnalyst";

const SIDE_OF_TYPE: Record<string, Side | "both"> = { "go-live": "both", config: "demand", training: "supply", nesting: "supply", seasonal: "demand", outage: "demand", weather: "demand", "vendor-change": "supply" };

function covers(ev: EventRow, date: string): boolean {
  return date >= ev.start_date && date <= addDays(ev.end_date, ev.effect_window_days);
}
function scopeRegion(ev: EventRow, region?: string): boolean {
  if (!region) return true;
  return ev.region === "all" || ev.region === region || ev.region.split("+").includes(region);
}
/** Which cohort an event is about, read from its description (the phase-0 ledger has no cohort column). */
function cohortOf(ev: EventRow): "vendor" | "home-team" | "any" {
  const d = ev.description.toLowerCase();
  if (d.includes("home team")) return "home-team";
  if (d.includes("crestline")) return "vendor";
  return "any";
}
function scopeCohort(ev: EventRow, cohort?: string): boolean {
  if (!cohort) return true;
  const c = cohortOf(ev);
  return c === "any" || c === cohort;
}
function scopeChannel(ev: EventRow, channel?: string): boolean {
  if (!channel) return true;
  return ev.channel_scope === "all" || ev.channel_scope.split("+").includes(channel);
}

export function runScout(book: Book, date: string, v: Variance): ScoutResult {
  const matches: EventMatch[] = [];
  const active = book.events.filter((ev) => covers(ev, date) && ev.type !== "go-live" ? true : covers(ev, date));
  // misses: region × channel rows outside tolerance, and SL misses
  const misses = v.scores.filter((s) => Math.abs(s.offered_dpct) > TOL_OFFERED_PCT || Math.abs(s.aht_dpct) > TOL_AHT_PCT || s.sl_act < s.sl_target)
    .map((s) => ({ key: `${s.region}/${s.channel}`, region: s.region, channel: s.channel, text: `${s.region}/${s.channel}: offered ${signed(s.offered_dpct, 0, "%")}, handle time ${signed(s.aht_dpct, 0, "%")}, SL ${n1(s.sl_act)}% vs ${s.sl_target}%` }));
  const allFlags = [...v.flags, ...v.continuing];
  for (const ev of active) {
    const side = SIDE_OF_TYPE[ev.type] ?? "both";
    const matchedTo: string[] = [];
    for (const m of misses) if (scopeRegion(ev, m.region) && scopeChannel(ev, m.channel) && side !== "supply") matchedTo.push(m.key);
    for (const f of allFlags) {
      const sideOk = side === "both" || side === f.side;
      if (sideOk && scopeRegion(ev, f.region) && scopeChannel(ev, f.channel) && scopeCohort(ev, f.cohort)) matchedTo.push(`flag: ${f.series}`);
    }
    if (side === "supply" && v.supplyGapH > 0 && ev.type !== "nesting" && ev.type !== "training") matchedTo.push("supply gap");
    if (side === "supply" && ev.type === "training" && cohortOf(ev) !== "home-team" && v.supplyGapH > 0) matchedTo.push("supply gap");
    if (!matchedTo.length) continue;
    const explains = ev.grade === "M" && !ev.planned && ((date >= ev.start_date && date <= ev.end_date) || allFlags.some((f) => f.onset >= ev.start_date && f.onset <= addDays(ev.start_date, 3) && (side === "both" || side === f.side)));
    const effect = effectEstimate(ev, v);
    matches.push({ event: ev, matchedTo: [...new Set(matchedTo)], explains, effectEstimate: effect, grade: ev.grade, window: `${ev.start_date}${ev.end_date !== ev.start_date ? " → " + ev.end_date : ""}${ev.effect_window_days ? ` +${ev.effect_window_days} d` : ""}` });
  }
  // a supply step that the plan of record itself contains (planned heads change at the onset) is explained by the plan
  for (const f of allFlags.filter((x) => x.side === "supply")) {
    const heads = (d: string, co: string) => { const r = book.forecast.find((x) => x.date === d && x.channel === "voice"); return r ? (co === "vendor" ? r.planned_crestline_heads : r.planned_home_heads) : NaN; };
    const before = heads(addDays(f.onset, -1), f.cohort!), at = heads(f.onset, f.cohort!);
    if (Number.isFinite(before) && Number.isFinite(at) && before !== at && ((at > before) === (f.direction === "up"))) {
      const planEv: EventRow = { event_id: "v000", type: "go-live", start_day: 0, start_date: f.onset, end_day: 0, end_date: f.onset, effect_window_days: 0, region: "North+East", channel_scope: "all", planned: true, description: `plan of record: planned ${f.cohort === "vendor" ? "Crestline" : "home-team"} heads ${before} → ${at} on ${f.onset}`, expected_signature: "", grade: "M", source: "03-forecast/v000-plan-of-record/forecast-daily.csv" };
      matches.push({ event: planEv, matchedTo: [`flag: ${f.series}`], explains: true, effectEstimate: `planned heads ${before} → ${at} [A] (v000 AS-017/AS-018/AS-019)`, grade: "A", window: f.onset });
    }
  }
  // unexplained regime flags → candidate events
  const explainedFlags = new Set<string>();
  for (const m of matches) if (m.explains) for (const t of m.matchedTo) if (t.startsWith("flag: ")) explainedFlags.add(t.slice(6));
  const unexplained = v.flags.filter((f) => !explainedFlags.has(f.series) && f.kind !== "continuing");
  const proposed: ProposedEvent[] = [];
  const cooccurring = (f: RegimeFlag) => matches.filter((m) => m.matchedTo.includes(`flag: ${f.series}`)).map((m) => `${m.event.event_id} (${m.event.type}, [${m.event.grade}]${m.event.planned ? ", planned" : ""})`);
  // one candidate per (side, family, onset); none when an [M] event already accounts for the occurrence at the onset
  const seen = new Set<string>();
  for (const f of unexplained) {
    const fam = f.seriesKey.startsWith("aht-agent-work|") ? `aht|${f.cohort}` : f.seriesKey.startsWith("offered-attainment|") ? "offered" : f.seriesKey.startsWith("aht-elapsed") ? "aht-elapsed" : `supply|${f.cohort}`;
    const key = `${fam}@${f.onset}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const accounted = matches.some((m) => (m.event.grade === "M" || m.explains) && m.matchedTo.includes(`flag: ${f.series}`) && f.onset >= m.event.start_date && f.onset <= addDays(m.event.start_date, 3));
    if (accounted) continue;
    proposed.push(propose(book, date, f, v, cooccurring(f)));
  }
  return { date, matches, proposed, unexplained };
}

function effectEstimate(ev: EventRow, v: Variance): string {
  const side = SIDE_OF_TYPE[ev.type] ?? "both";
  if (side === "supply") return `unplanned hours lost today ${n1(v.supplyGapH)} h [C]`;
  const rows = v.scores.filter((s) => scopeRegion(ev, s.region) && scopeChannel(ev, s.channel));
  if (!rows.length) return "—";
  const miss = rows.reduce((a, s) => a + s.miss_h, 0);
  const tx = v.txChecks.find((t) => t.region === (ev.region.includes("+") || ev.region === "all" ? "book" : ev.region));
  return `req-hours miss in scope ${signed(miss, 1, " h")} [C]; transactions ${tx && Number.isFinite(tx.ratio) ? `×${tx.ratio.toFixed(2)} same-weekday (${tx.flat ? "flat" : "moved"})` : "n/a (no same-weekday history yet)"} [M]`;
}

function nextEventId(book: Book, proposedDir: string): number {
  let max = 0;
  for (const ev of book.events) max = Math.max(max, Number(ev.event_id.replace("EV-", "")));
  const idx = readIfExists(join(proposedDir, "INDEX.md"));
  if (idx) { const t = parseTable(idx, "id"); if (t) for (const r of t.rows) max = Math.max(max, Number(r[0].replace("EV-", ""))); }
  return max + 1;
}

function propose(book: Book, date: string, f: RegimeFlag, v: Variance, cooccurring: string[]): ProposedEvent {
  const dir = join(book.dir, "05-events", "proposed");
  ensureDir(dir);
  const key = `${f.seriesKey}@${f.onset}`;
  // idempotent: reuse the id if this (series, onset) was already proposed
  let id: string | null = null;
  const idx = readIfExists(join(dir, "INDEX.md"));
  const rows: string[][] = idx ? (parseTable(idx, "id")?.rows ?? []) : [];
  for (const r of rows) if (r[3] === key) id = r[0];
  if (!id) id = `EV-${String(nextEventId(book, dir)).padStart(3, "0")}`;
  const tx = v.txChecks.find((t) => t.region === "book");
  let type = "other", title = "", candidates = "";
  const dirWord = f.direction === "up" ? "up" : "down";
  if (f.side === "supply") {
    type = f.seriesKey.startsWith("shrink") || f.direction === "down" ? "training" : "vendor-change";
    title = f.direction === "down" || f.seriesKey.startsWith("shrink")
      ? `Unplanned supply loss in ${f.cohort === "vendor" ? "Crestline Services" : "the Larkspur home team"} from ${f.onset}: ${f.series.split(" · ").pop()} ${signed(f.magnitudePct, 0, "%")} against schedule, schedule unchanged`
      : `Capacity step ${dirWord} for ${f.cohort === "vendor" ? "Crestline Services" : "the Larkspur home team"} from ${f.onset}: productive hours ${signed(f.magnitudePct, 0, "%")} with no change in the plan of record`;
    candidates = f.direction === "down" || f.seriesKey.startsWith("shrink") ? "an off-schedule training or briefing pull; a system-access outage for the cohort; unplanned absence cluster" : "a headcount add not yet in the ledger; a schedule change; overtime";
  } else if (f.seriesKey.startsWith("aht-")) {
    type = "product-change";
    title = `Handle-time ${f.kind} ${dirWord} on ${f.channel} for ${f.cohort ? (f.cohort === "vendor" ? "Crestline Services" : "the Larkspur home team") : "the skill"} from ${f.onset}: ${f.definition} ${signed(f.magnitudePct, 0, "%")} vs baseline`;
    candidates = f.definition === "aht-elapsed" ? "a timeout or concurrency policy change; load-driven concurrency; a routing change" : "a desktop or wrap-up flow change at go-live; a contact-type mix change; a tenure mix change; a definition change in the export";
  } else {
    type = tx && !tx.flat ? "client-event" : "outage";
    title = tx && !tx.flat
      ? `Transaction-driven demand ${dirWord} on ${f.channel} from ${f.onset}: offered ${signed(f.magnitudePct, 0, "%")} vs forecast attainment baseline with book transactions ×${tx.ratio.toFixed(2)} same-weekday`
      : `Contact ${f.kind} ${dirWord} on ${f.channel} from ${f.onset} with transactions flat (×${tx ? tx.ratio.toFixed(2) : "n/a"} same-weekday): offered ${signed(f.magnitudePct, 0, "%")} vs attainment baseline`;
    candidates = tx && !tx.flat ? "seasonal travel pattern; a client event or disruption; a policy change at the client" : "a platform incident; a re-contact wave after abandons; a client communication; a routing or counting change";
  }
  const file = join(dir, `${id}.md`);
  const md = `# ${id} · proposed · ${type}

**Status:** proposed (agent:Scout, ${date}) — awaiting planner review; **not** in the accepted ledger.
**Title:** ${title}
**Grade:** [E] — the break is measured [M] in the ledger; the event behind it is inferred. Range: the effect is ${signed(f.magnitudePct * 0.5, 0, "%")} to ${signed(f.magnitudePct * 1.5, 0, "%")} on the series if the candidate is real; assumption: one cause, onset ${f.onset}.
**Side:** ${f.side} · **Series:** ${f.series} · **Rule:** ${f.rule} · **Kind:** ${f.kind} · **Regions:** ${f.region ?? "North+East"} · **Channels:** ${f.channel ?? "all"}
**Effect window (proposed):** ${f.onset} → open; ${f.kind === "transient" ? "1 day" : "until the series re-bases"}
**Source:** internal — 03-forecast/variance/${date}.md (the break itself); no external source found in the mock feeds

## Correlation screen (rung 1)

The series left control on ${f.onset} (${f.rule}); value ${n1(f.value)} against baseline mean ${n1(f.mean)}, limits ${n1(f.lcl)}–${n1(f.ucl)} (baseline: ${f.baseline}). Transactions today ×${tx ? tx.ratio.toFixed(2) : "n/a"} same-weekday. Co-occurring ledger events: ${cooccurring.length ? cooccurring.join(", ") : "none"}. This is a screen, not a finding of cause.

## Candidate explanations to screen

${candidates}.

## What would confirm it

An [M] record of the candidate (incident ticket, vendor roster, client bulletin) dated on or before ${f.onset}; or the series returning inside limits without one.
`;
  writeText(file, md);
  const firstProposed = rows.find((r) => r[0] === id)?.[1] ?? date; // an id keeps its first proposal date on re-proposal
  const newRows = rows.filter((r) => r[0] !== id);
  newRows.push([id, firstProposed, type, key, title.replace(/\|/g, "/"), "proposed"]);
  newRows.sort((a, b) => a[0].localeCompare(b[0]));
  writeText(join(dir, "INDEX.md"), `# Proposed events (Scout)\n\nCandidates proposed by agent:Scout for planner review. Nothing here is in \`events.csv\` until a planner accepts it; ids are permanent whether accepted or rejected.\n\n${table(["id", "proposed", "type", "key", "title", "status"], newRows)}\n`);
  return { id, file, title, side: f.side, forFlag: f.series, grade: "E" };
}
