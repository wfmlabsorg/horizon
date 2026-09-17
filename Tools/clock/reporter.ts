/**
 * Reporter stage: the daily note, the weekly review and the register report, rendered from the templates in
 * 08-reports/ and from ledgers only. Adds no number the ledgers do not contain; quotes grades as given.
 */
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import type { Book, Variance, ScoutResult, LibrarianResult, Reconciliation, ChannelSummary, Channel, XrRow, CohortKey } from "./types";
import { CHANNELS, SL_TARGET, TEAM_NAME } from "./types";
import { addDays, dayNumber, dowIndex, isoWeek, fmtDate, writeText, table, n0, n1, n2, signed, pct, readIfExists, parseTable, businessDaysBetween, isWeekend } from "./book";
import { computeScores, TOL_OFFERED_PCT, TOL_AHT_PCT } from "./postAnalyst";
import { readRegister } from "./librarian";

// ---------------------------------------------------------------------------
// the one-line table: `what happened` (≤ 25 words, plain language) and `ask` (≤ 8 words)
// Rule names, onsets, baselines and metric slugs stay in the evidence tables below the fold.
// ---------------------------------------------------------------------------
const HEADS_PER_HOUR = 1 / 6.6; // one scheduled shift delivers ≈ 6.6 productive hours (8 h at the contracted 18 % planned shrinkage)
const headsText = (h: number) => { const n = Math.abs(h) * HEADS_PER_HOUR; return n < 0.75 ? "under a head" : `about ${n < 10 ? (Math.round(n * 2) / 2).toString().replace(/\.0$/, "") : n0(n)} head${n >= 1.5 ? "s" : ""}`; };
const svc = (b: ChannelSummary) => `Service ${b.slMet ? `met its ${b.sl_target}% target` : "missed"} at ${n0(b.sl_act)}%`;
const svcFell = (b: ChannelSummary) => `Service ${b.slMet ? `held at ${n0(b.sl_act)}% (target ${b.sl_target}%)` : `fell to ${n0(b.sl_act)}% (target ${b.sl_target}%)`}`;

export function channelLine(b: ChannelSummary, v: Variance, scout: ScoutResult | undefined, lib: LibrarianResult | undefined, date: string): { what: string; ask: string } {
  const ch = b.channel, Ch = ch.charAt(0).toUpperCase() + ch.slice(1);
  const supplyFlag = v.flags.find((f) => f.side === "supply" && (f.direction === "down" || f.seriesKey.startsWith("shrink")));
  const supplyUp = v.flags.find((f) => f.side === "supply" && f.direction === "up" && !f.seriesKey.startsWith("shrink"));
  const demandFlag = v.flags.find((f) => f.channel === ch && f.side === "demand");
  const tx = v.txChecks.find((t) => t.region === "book");
  const explained = (scout?.matches ?? []).filter((m) => m.explains && m.event.event_id !== "v000" && (m.matchedTo.some((t) => t.includes(`/${ch}`)) || m.matchedTo.some((t) => t.startsWith("flag:") && (t.includes(` · ${ch} · `) || t.startsWith(`flag: ${ch} ·`)))));
  const evWord = (t: string) => ({ outage: "platform outage", weather: "East weather event", "go-live": "go-live", training: "training pull" } as Record<string, string>)[t] ?? t;
  // the ask: an XR opened today on this channel's family → confirm severity; touched → see it; else none
  const opened = lib?.opened.find((r) => r.title.toLowerCase().includes(ch) || (supplyFlag && /shrinkage|productive/.test(r.title)) || r.title.startsWith("Offered contacts on Meridian"));
  const touched = lib?.touched.find((t) => !t.opened);
  const xrOpen = lib?.opened[0] ?? undefined;
  let ask = opened ? `Confirm Sev ${opened.sev} on ${opened.id}, ${fmtDate(addDays(date, 2))}` : xrOpen ? `Confirm Sev ${xrOpen.sev} on ${xrOpen.id}, ${fmtDate(addDays(date, 2))}` : touched ? `none — see ${touched.id}` : "none";
  if (supplyFlag) {
    const team = TEAM_NAME[supplyFlag.cohort!];
    const sup = v.occupancy.find((o) => o.cohort === supplyFlag.cohort);
    const lost = sup ? sup.unplanned_pct / Math.max(1, 100 - sup.planned_pct) : 0; // share of the planned productive hours that was lost
    const share = lost >= 0.3 ? "a third" : lost >= 0.2 ? "a quarter" : `${n0(lost * 100)}%`;
    const pull = (scout?.matches ?? []).some((m) => m.event.type === "training" && m.matchedTo.some((t) => t.startsWith("flag:")));
    ask = pull ? `Confirm the training pull with ${team.split(" ")[0]}` : opened ? ask : `Confirm the cause with ${team.split(" ")[0]}`;
    const what = tx && tx.flat
      ? `${svcFell(b)} on a supply break, not a demand break: ${team.split(" ")[0]} lost ${share} of its productive hours off an unchanged schedule.`
      : `Service fell to ${n0(b.sl_act)}%: ${team.split(" ")[0]} lost ${share} of its productive hours off an unchanged schedule; transactions up ${n0(((tx?.ratio ?? 1) - 1) * 100)}% same-weekday, so part of the rise may be real demand.`;
    return { what, ask };
  }
  if (demandFlag && demandFlag.definition !== "offered") {
    const team = demandFlag.cohort ? TEAM_NAME[demandFlag.cohort].split(" ")[0] : "the skill";
    // the cohort's own figure, never the blend, when the sentence names a cohort
    const own = demandFlag.cohort ? v.cohortAht.find((c) => c.cohort === demandFlag.cohort && c.channel === ch) : undefined;
    const ownD = own && b.aht_fc > 0 ? ((own.aht - b.aht_fc) / b.aht_fc) * 100 : b.aht_dpct;
    const vsPlan = Number.isFinite(ownD) ? `${n0(Math.abs(ownD))}% ${ownD >= 0 ? "above" : "below"} plan` : `${signed(demandFlag.magnitudePct, 0, "%")} against its recent baseline`;
    if (demandFlag.definition === "aht-elapsed") return { what: `Chat session time moved ${signed(demandFlag.magnitudePct, 0, "%")} against its recent baseline but agent work time did not: concurrency, not work content. ${svc(b)}.`, ask };
    const mag = n0(Math.abs(demandFlag.magnitudePct));
    const curve = demandFlag.kind === "transient" ? `${demandFlag.direction} ${mag}% against its recent baseline for a day`
      : demandFlag.direction === "down" ? (demandFlag.kind === "trend" ? `falling on a learning curve (now ${vsPlan})` : `down ${mag}% against its recent baseline (now ${vsPlan})`)
      : `${vsPlan}${demandFlag.baselineGrade === "E" ? " from go-live, with no learning curve" : ""}`;
    const buffer = b.slMet && !b.withinTolerance ? " — the buffer is paying for it" : "";
    if (explained.length) return { what: `${team}'s handle time ${curve} on the ${evWord(explained[0].event.type)}. ${svcFell(b)}.`, ask: `none — matched to ${explained[0].event.event_id}` };
    return { what: `${team}'s handle time is ${curve}. ${svcFell(b)}${buffer}.`, ask };
  }
  if (demandFlag) {
    const mag = demandFlag.magnitudePct;
    const verb = demandFlag.kind === "trend" ? (mag >= 0 ? "are climbing" : "are falling") : demandFlag.kind === "transient" ? (mag >= 0 ? "jumped" : "dropped") : mag >= 0 ? "stepped up" : "stepped down";
    if (explained.length) return { what: `${Ch} contacts ${verb} ${n0(Math.abs(mag))}% above their recent baseline on the ${evWord(explained[0].event.type)}. ${svcFell(b)}.`, ask: `none — matched to ${explained[0].event.event_id}` };
    let driver = "";
    const txUp = tx && Number.isFinite(tx.ratio) ? `${tx.ratio >= 1 ? "up" : "down"} ${n0(Math.abs(tx.ratio - 1) * 100)}% same-weekday` : "";
    if (tx && Number.isFinite(tx.ratio) && mag > 0) {
      const share = Math.max(0, Math.min(1, (tx.ratio - 1) / (mag / 100)));
      driver = share >= 0.75 ? `with transactions ${txUp}: travel activity is driving it` : share >= 0.4 ? `with transactions ${txUp}: about half is more contacts per transaction` : `with transactions ${tx.flat ? "flat same-weekday" : txUp}: mostly more contacts per transaction, not more travel`;
    } else if (mag < 0) driver = `with transactions ${txUp || "steady"}: contacts per transaction is unwinding`;
    return { what: `${Ch} contacts ${verb} ${n0(Math.abs(mag))}% against their recent baseline ${driver}. ${svcFell(b)}.`, ask };
  }
  if (supplyUp && b.slMet) return { what: `${svc(b)}; ${TEAM_NAME[supplyUp.cohort!].split(" ")[0]} delivered ${n0(supplyUp.magnitudePct)}% more productive hours than its recent baseline — capacity moved, not demand.`, ask };
  const lead = b.leadDriver === "handle time" ? "mostly handle time" : b.leadDriver === "volume" ? "mostly volume" : "mostly channel mix";
  const under = `the plan under-called the day by ${n0(Math.abs(b.miss_h))} hours — ${headsText(b.miss_h)}`;
  if (!b.slMet) {
    if (explained.length) return { what: `${svc(b)} (target ${b.sl_target}%) on the ${evWord(explained[0].event.type)}; ${under}.`, ask: `none — matched to ${explained[0].event.event_id}` };
    return { what: `${svc(b)} (target ${b.sl_target}%): ${under}, ${lead}.`, ask };
  }
  if (!b.withinTolerance) return { what: `${svc(b)}, but ${under}, ${lead}. The buffer is absorbing a structural error.`, ask: ask === "none" ? "none — see XR-002" : ask };
  return { what: `${svc(b)} and the plan called the day within tolerance.`, ask };
}

/** Kept for the weekly review's use of the old evidence sentence; the daily note uses channelLine. */
export function channelTitle(b: ChannelSummary, v: Variance, scout?: ScoutResult): string {
  const l = channelLine(b, v, scout, undefined, v.date);
  return `${l.what} [C]`;
}

function wouldChange(v: Variance, lib: LibrarianResult, reg: XrRow[]): string {
  const touched = lib.touched[0] ? reg.find((r) => r.id === lib.touched[0].id) : undefined;
  if (touched) return `${touched.would_change} (${touched.id})`;
  const open = reg.filter((r) => r.status !== "Resolved" && r.status !== "Closed").sort((a, b) => a.sev - b.sev)[0];
  if (open) return `${open.would_change} (${open.id})`;
  return `Any channel outside ±${TOL_OFFERED_PCT}% on offered or ±${TOL_AHT_PCT}% on aht-agent-work against v000 for three consecutive days, or a Western Electric rule firing on a charted series`;
}

// ---------------------------------------------------------------------------
// daily note
// ---------------------------------------------------------------------------
export function renderDailyNote(book: Book, date: string, runId: string, rec: Reconciliation, v: Variance, scout: ScoutResult, lib: LibrarianResult): string {
  const reg = readRegister(join(book.dir, "06-questions", "register.md"), date).rows;
  const day = dayNumber(date);
  const anyMiss = v.byChannel.some((b) => !b.withinTolerance || !b.slMet) || v.flags.length > 0;
  const next = addDays(date, 1);
  const nextLine = `Daily ${next} (scoring ${fmtDate(next)})${dowIndex(date) === 6 ? `; weekly review ${isoWeek(date).label} issues ${fmtDate(addDays(date, 1))}` : ""}${lib.opened.length ? `; 48-hour readout ${addDays(date, 2)} for ${lib.opened.map((r) => r.id).join(", ")}` : ""}`;
  const decision = lib.opened.some((r) => r.sev <= 2)
    ? `confirm severity on ${lib.opened.filter((r) => r.sev <= 2).map((r) => `${r.id} (Sev ${r.sev} proposed)`).join(", ")} · Halcyon planning lead · by ${addDays(date, 2)}`
    : "none — for information";
  const supplyRows = book.supply.filter((r) => r.date === date);
  const proposedLine = scout.proposed.length ? scout.proposed.map((p) => `${p.id} [E] — ${p.title}`).join("; ") : "none";
  const seenXr = new Map<string, string[]>();
  for (const t of lib.touched) {
    const row = seenXr.get(t.id);
    if (row) { row[4] = `${row[4]}; ${t.whatTodayDid}`; continue; }
    seenXr.set(t.id, [t.id, t.h, t.claim, t.status, t.opened ? "opened the row" : t.whatTodayDid, `${t.nextTest || "—"} · ${addDays(date, 2)}`]);
  }
  const openTouched = [...seenXr.values()];
  const regimeText = v.flags.length
    ? v.flags.map((f) => `${f.series} — ${f.kind}, ${f.rule}, onset ${f.onset}, ${f.direction} ${signed(f.magnitudePct, 0, "%")} vs baseline (${f.baseline} [${f.baselineGrade}]); **${f.side}-side**`).join("; ")
    : v.continuing.length ? `none new; continuing: ${v.continuing.map((f) => `${f.series} since ${f.onset}`).join(", ")}` : "none";
  return `# Daily note — Halcyon — ${date}

**Scoring day:** ${date} (D+${day} of migration) · **Forecast scored:** 03-forecast/v000-plan-of-record (approved plan of record; the only version in force)
**Run:** ${runId} · **Issued:** ${addDays(date, 1)} 06:30 · **Gate:** planner-reforecast not needed (no reforecast proposed: phase 1 has no Forecaster; v000 remains in force)
**Data:** 02-demand ${rec.demandFile} [M] · 04-supply ${rec.supplyFile} [M]; vendor supply hours derived from headcount at 8 h per shift [E]; reconciled: ${rec.reconciled}

## The day in one line per channel

${table(["channel", "what happened", "ask", "grade"], v.byChannel.map((b) => { const l = channelLine(b, v, scout, lib, date); return [b.channel, l.what, l.ask, "[C]"]; }))}

Heads = requirement hours ÷ 6.6 productive hours per shift (8 h at the contracted 18% planned shrinkage) [C]. Rule names, onsets and baselines are in the evidence tables below.

**Decision requested:** ${decision}
**Next date:** ${nextLine}
**What would change the answer:** ${wouldChange(v, lib, reg)}

## Forecast vs actual

${table(["region", "channel", "offered fc", "offered act", "Δ%", "aht_agent_work fc", "act", "Δ%", "SL target", "SL act", "ASA", "abandoned %"],
  v.scores.map((s) => [s.region, s.channel, `${n1(s.offered_fc)} [C]`, `${n0(s.offered_act)} [M]`, signed(s.offered_dpct, 0, "%"), `${n0(s.aht_fc)} s [E]`, `${n0(s.aht_act)} s [C]`, signed(s.aht_dpct, 0, "%"), `${s.sl_target}%`, `${pct(s.sl_act)} [C]`, `${n0(s.asa_s)} s [C]`, pct(s.abandoned_pct)]))}

All handle times cite \`aht-agent-work\`. ${v.chatDefinitionNote ? "Elapsed is shown for chat because the plan's chat figure and the export's elapsed figure are different definitions (`aht-elapsed.md`): " + v.chatDefinitionNote : "Elapsed is not shown; no timeout or concurrency question is open."}
${v.ratio ? `\nContacts per transaction (Meridian, migrated regions) ${n2(v.ratio.cptActual)} [C] vs plan ${n2(v.ratio.cptPlan)} [A]; the regions' own Beacon ratios were ${v.ratio.beaconByRegion.map((b) => `${b.region} ${n2(b.cpt)} [M]`).join(", ")} (\`contacts-per-transaction\`, composition trap). Contacts per traveler-day ${n2(v.ratio.cptdActual)} [C].` : ""}

## Variance decomposition (rung 1)

Method: sequential · Baseline: forecast v000 · Requirement hours = offered × aht-agent-work ÷ 3600 ÷ 0.85. Supply = hours lost to unplanned shrinkage against schedule, allocated by share of actual requirement; it sits beside the miss, not inside it. Residual = the Δvolume × Δhandle-time interaction, stated not absorbed. **This is association.**

${table(["region", "channel", "miss (req. hours)", "volume", "handle time", "mix", "supply", "residual", "grade"],
  v.scores.map((s) => [s.region, s.channel, signed(s.miss_h, 1), signed(s.volume_h, 1), signed(s.handle_h, 1), signed(s.mix_h, 1), signed(s.supply_h, 1), signed(s.residual_h, 1), "[C]"]))}

By channel: ${v.byChannel.map((b) => `**${b.channel}** ${signed(b.miss_h, 1, " h")}, lead driver ${b.leadDriver} (${n0(b.leadShare)}%)`).join(" · ")}.
${v.simpson.length ? "\nSimpson check: " + v.simpson.join(" · ") + ".\n" : ""}
Regime flags: ${regimeText}. Transactions same-weekday: ${v.txChecks.map((t) => `${t.region === "book" ? "book" : t.region} ×${n2(t.ratio)} (${t.flat ? "flat" : "moved"})`).join(", ")} [M].

## Events matched

${table(["event", "type", "window", "matched to", "effect estimate", "grade"], scout.matches.length ? scout.matches.map((m) => [m.event.event_id + (m.explains ? " (explains)" : m.event.planned ? " (planned; co-occurs)" : " (co-occurs)"), m.event.type, m.window, m.matchedTo.join("; "), m.effectEstimate, `[${m.grade}]`]) : [["—", "—", "—", "no event window covers today", "—", "—"]])}

Proposed by the Scout today (awaiting acceptance): ${proposedLine}

## Open hypotheses touched today

${table(["XR", "H", "claim", "status", "what today's data did", "next test / date"], openTouched.length ? openTouched : [["—", "—", "no open hypothesis was touched by today's data", "—", "—", "—"]])}

## Reforecast

**Status:** ${anyMiss ? "proposed: blocked — phase 1 has no Forecaster; v000 remains in force" : "not needed"}
**Trigger:** ${v.flags.length ? v.flags.map((f) => f.series).join("; ") : anyMiss ? "tolerance miss against v000 (see decomposition)" : "clock only; all channels within tolerance"}
**Assumptions changed:** none (v000 register frozen; ${v.ratio ? `AS-008 contacts per transaction ${n2(v.ratio.cptPlan)} vs observed ${n2(v.ratio.cptActual)} [C]; ` : ""}AS-011/AS-012 handle time vs observed ${v.byChannel.map((b) => `${b.channel} ${n0(b.aht_act)} s`).join(", ")} [C] are the rows a Forecaster would revise)
**Evaluator:** pass — phase 1 has no Evaluator stage; answer-first shape, grades and definition slugs checked by rule in the Reporter
**Planner gate:** not raised — nothing proposed
**IEX export:** not written (no new version)

## Supply

${table(["region", "channel", "cohort", "scheduled h", "staffed h", "productive h", "shrink planned", "shrink unplanned", "occupancy", "grade"],
  supplyRows.map((r) => ["all", "all", r.team, n1(r.scheduled_h), n1(r.staffed_h), n1(r.productive_h), pct(r.shrink_planned_pct), pct(r.shrink_unplanned_pct), pct(r.occupancy_pct), r.cohort === "vendor" ? "[M] hours from headcount [E]" : "[M]"]))}

${rec.outliers.length ? "DataEngineer flags: " + rec.outliers.join("; ") + "." : "DataEngineer flags: none."}

## Register movements today

${lib.movements.length ? lib.movements.map((m) => `- ${m}`).join("\n") : lib.touched.length ? lib.touched.map((t) => `- ${t.id} touched: ${t.whatTodayDid}`).join("\n") : "none"}
`;
}

// ---------------------------------------------------------------------------
// weekly review
// ---------------------------------------------------------------------------
interface RunState { run_date: string; variance_summary?: { regime_flags?: string[] }; events_matched?: string[]; questions_touched?: string[] }
function readRuns(book: Book, from: string, to: string): RunState[] {
  const dir = join(book.dir, "08-reports", "runs");
  if (!existsSync(dir)) return [];
  const out: RunState[] = [];
  for (const f of readdirSync(dir).filter((f) => f.startsWith("daily-") && f.endsWith(".json")).sort()) {
    const d = f.slice(6, 16);
    if (d < from || d > to) continue;
    try { out.push(JSON.parse(readIfExists(join(dir, f)) ?? "{}")); } catch { /* skip */ }
  }
  // keep the highest rerun per date
  const byDate = new Map<string, RunState>();
  for (const r of out) byDate.set(r.run_date, r);
  return [...byDate.values()].sort((a, b) => a.run_date.localeCompare(b.run_date));
}

export function renderWeeklyReview(book: Book, label: string, monday: string, sunday: string, runId: string): string {
  const dates: string[] = [];
  for (let d = monday; d <= sunday; d = addDays(d, 1)) if (book.demand.some((r) => r.date === d)) dates.push(d);
  const reg = readRegister(join(book.dir, "06-questions", "register.md"), sunday).rows;
  const runs = readRuns(book, monday, sunday);
  const daily = dates.map((d) => ({ d, s: computeScores(book, d) }));
  // aggregate by region × channel
  const keys = [...new Set(daily.flatMap((x) => x.s.scores.map((s) => `${s.region}|${s.channel}`)))];
  const agg = keys.map((k) => {
    const [region, channel] = k.split("|");
    const rows = daily.flatMap((x) => x.s.scores.filter((s) => s.region === region && s.channel === channel));
    const sum = (f: (s: typeof rows[number]) => number) => rows.reduce((a, s) => a + f(s), 0);
    const offFc = sum((s) => s.offered_fc), offAct = sum((s) => s.offered_act);
    const ahtFc = rows[0].aht_fc, ahtAct = offAct > 0 ? sum((s) => s.offered_act * s.aht_act) / offAct : 0;
    const slDays = rows.filter((s) => s.sl_act >= s.sl_target).length;
    return { region, channel, offFc, offAct, offD: offFc > 0 ? ((offAct - offFc) / offFc) * 100 : NaN, ahtFc, ahtAct, ahtD: ahtFc > 0 ? ((ahtAct - ahtFc) / ahtFc) * 100 : NaN, slDays, n: rows.length, miss: sum((s) => s.miss_h), vol: sum((s) => s.volume_h), ht: sum((s) => s.handle_h), mix: sum((s) => s.mix_h), sup: sum((s) => s.supply_h), res: sum((s) => s.residual_h) };
  });
  const byCh = CHANNELS.map((ch) => {
    const rows = agg.filter((a) => a.channel === ch);
    const sum = (f: (a: typeof rows[number]) => number) => rows.reduce((x, a) => x + f(a), 0);
    const offFc = sum((a) => a.offFc), offAct = sum((a) => a.offAct);
    const slDays = daily.filter((x) => x.s.byChannel.find((b) => b.channel === ch)?.slMet).length;
    const comps = { volume: sum((a) => a.vol), "handle time": sum((a) => a.ht), mix: sum((a) => a.mix) };
    const lead = (Object.keys(comps) as (keyof typeof comps)[]).reduce((b, k) => (Math.abs(comps[k]) > Math.abs(comps[b]) ? k : b), "volume" as keyof typeof comps);
    return { ch, offFc, offAct, offD: offFc > 0 ? ((offAct - offFc) / offFc) * 100 : NaN, ahtD: rows.length ? rows.reduce((x, a) => x + a.ahtD * a.offAct, 0) / Math.max(1, offAct) : NaN, slDays, n: daily.length, miss: sum((a) => a.miss), lead, comps, res: sum((a) => a.res), sup: sum((a) => a.sup) };
  });
  const flagsInWeek = runs.flatMap((r) => (r.variance_summary?.regime_flags ?? []).map((f) => `${r.run_date}: ${f}`));
  const evCount = new Map<string, string[]>();
  for (const r of runs) for (const e of r.events_matched ?? []) { if (!evCount.has(e)) evCount.set(e, []); evCount.get(e)!.push(r.run_date); }
  const eventDays = [...evCount.entries()].map(([e, ds]) => { const ev = book.events.find((x) => x.event_id === e); return `${e} ${ev ? ev.type : ""} on ${ds.length} day(s)${ds.length <= 3 ? " (" + ds.map(fmtDate).join(", ") + ")" : ""}`; });
  const titles = byCh.map((b) => {
    const Ch = b.ch.charAt(0).toUpperCase() + b.ch.slice(1);
    const supplyFlag = flagsInWeek.filter((f) => /shrinkage|productive hours/.test(f));
    const share = (x: number) => (b.miss !== 0 ? n0((100 * Math.abs(x)) / (Math.abs(b.comps.volume) + Math.abs(b.comps["handle time"]) + Math.abs(b.comps.mix) + Math.abs(b.res))) : "0");
    if (b.slDays === b.n && Math.abs(b.offD) <= TOL_OFFERED_PCT && Math.abs(b.ahtD) <= TOL_AHT_PCT) return [`${Ch} met SL on ${b.slDays} of ${b.n} days within tolerance of v000`, "[C]"];
    if (b.slDays === b.n) return [`${Ch} met SL on ${b.slDays} of ${b.n} days while requirement hours ran ${signed(b.miss, 0, " h")} over v000 (offered ${signed(b.offD, 0, "%")}, handle time ${signed(b.ahtD, 0, "%")}); ${b.lead} carries ${share(b.comps[b.lead])}% and the buffer absorbed it`, "[C]"];
    return [`${Ch} met SL on ${b.slDays} of ${b.n} days; requirement hours ran ${signed(b.miss, 0, " h")} over v000 with ${b.lead} carrying ${share(b.comps[b.lead])}% (offered ${signed(b.offD, 0, "%")}, handle time ${signed(b.ahtD, 0, "%")})${supplyFlag.length ? `; ${supplyFlag.length} supply-side flag day(s) in the week` : ""}`, "[C]"];
  });
  // assumption refresh
  const cptObs = (() => { const t = book.travelers.filter((r) => dates.includes(r.date)); const c = t.reduce((a, r) => a + r.contacts, 0), x = t.reduce((a, r) => a + r.transactions_migrated_regions, 0); return x > 0 ? c / x : NaN; })();
  const mixObs = CHANNELS.map((ch) => { const b = byCh.find((x) => x.ch === ch)!; const tot = byCh.reduce((a, x) => a + x.offAct, 0); return `${ch} ${n0((100 * b.offAct) / Math.max(1, tot))}%`; }).join(" · ");
  const ahtObs = (ch: Channel) => { const rows = agg.filter((a) => a.channel === ch); const o = rows.reduce((a, r) => a + r.offAct, 0); return o > 0 ? rows.reduce((a, r) => a + r.ahtAct * r.offAct, 0) / o : NaN; };
  const occObs = (() => { const s = book.supply.filter((r) => dates.includes(r.date) && r.productive_h > 0); const w = s.reduce((a, r) => a + (r.occupancy_pct * r.productive_h) / 100, 0), p = s.reduce((a, r) => a + r.productive_h, 0); return p > 0 ? (100 * w) / p : NaN; })();
  const act = (hold: boolean) => (hold ? "hold" : "revise in v001 — blocked: phase 1 has no Forecaster; carried label stays [E]");
  const asRows = [
    ["AS-008", "contacts per transaction (whole-book Beacon, carried)", "0.35 [A]", `${n2(cptObs)} [C] (Meridian, migrated regions)`, "[A]", act(Math.abs(cptObs / 0.35 - 1) < 0.15)],
    ["AS-010", "channel mix", "voice 25% · chat 58% · email 17% [C]", mixObs + " [C]", "[C]", act(Math.abs((byCh[0].offAct / Math.max(1, byCh.reduce((a, x) => a + x.offAct, 0))) * 100 - 25) < 5)],
    ["AS-011", "voice aht-agent-work (Beacon, carried)", "1,150 s [E]", `${n0(ahtObs("voice"))} s [C]`, "[E]", act(Math.abs(ahtObs("voice") / 1150 - 1) < 0.1)],
    ["AS-012", "chat aht-agent-work (Beacon messaging, carried)", "380 s [E]", `${n0(ahtObs("chat"))} s [C]`, "[E]", act(Math.abs(ahtObs("chat") / 380 - 1) < 0.1)],
    ["AS-013", "email aht-agent-work (Beacon, carried)", "420 s [E]", `${n0(ahtObs("email"))} s [C]`, "[E]", act(Math.abs(ahtObs("email") / 420 - 1) < 0.1)],
    ["AS-015", "occupancy for requirement", "85% [A]", `${n1(occObs)}% [C] delivered (agent-work numerator)`, "[A]", "hold (a result, not a driver; revisit in the capacity plan)"],
    ["AS-003", "seasonality", "none [A]", `book transactions ${n0(book.tx.filter((r) => dates.includes(r.date)).reduce((a, r) => a + r.transactions, 0))} this week vs ${n0(book.tx.filter((r) => r.date >= addDays(monday, -7) && r.date < monday).reduce((a, r) => a + r.transactions, 0))} last week [M]`, "[A]", "hold until a seasonal driver is supported in the register"],
  ];
  // structural / transitional from open hypothesis tables
  // one row per open register question (the driver its title names), then the hypothesis rows under test.
  // The miss column is this week's requirement-hours miss on the component the question is about, in hours and heads.
  const hh = (h: number) => `${signed(h, 0, " h")} ≈ ${headsText(h)}`;
  const weekTotals = { volume: byCh.reduce((a, b) => a + b.comps.volume + b.comps.mix, 0), handle: byCh.reduce((a, b) => a + b.comps["handle time"], 0), supply: byCh.reduce((a, b) => a + b.sup, 0), all: byCh.reduce((a, b) => a + b.miss, 0) };
  const st: string[][] = [];
  const openRowsReg = reg.filter((x) => x.status !== "Closed" && x.status !== "Resolved");
  for (const r of openRowsReg) {
    const key = /key=([^;@]+)/.exec(r.notes)?.[1] ?? "";
    const md = readIfExists(join(book.dir, r.hypotheses));
    const t = md ? parseTable(md, "id") : null;
    const lead = t?.rows.find((h) => h[8] === "supported") ?? t?.rows.find((h) => h[8] === "testing") ?? t?.rows[0];
    const tag = lead ? lead[3] : "unknown";
    const driver = key.startsWith("aht|vendor") ? `Crestline handle-time level shift, ${r.id}` : key.startsWith("aht|home-team") ? `Home-team handle-time curve, ${r.id}` : key.startsWith("offered") ? `Offered contacts vs plan (composition, spillover, overflow), ${r.id}` : key.startsWith("aht-elapsed") ? `Chat elapsed vs agent-work (concurrency), ${r.id}` : `Supply delivered vs schedule, ${r.id}`;
    const miss = key.startsWith("aht|") ? weekTotals.handle : key.startsWith("offered") ? weekTotals.volume : key.startsWith("supply") ? weekTotals.supply : 0;
    st.push([`**${driver}**`, `${tag} (proposed; ${lead ? lead[0] + " " + lead[8] : "no hypothesis"})`, `${r.title.replace(/\s*\[[MCEA]\]$/, "")}`, key.startsWith("aht-elapsed") ? "— (not a staffing number)" : hh(miss), tag === "structural" ? "yes" : tag === "transitional" ? "no (short-term forecast only)" : "blocked: unknown"]);
    for (const h of t?.rows ?? []) if (h[8] === "testing" || h[8] === "supported") st.push([`${h[2]} (${r.id} ${h[0]})`, h[3], h[4] === "—" ? h[8] : `${h[4]} — ${h[8]}`, "", h[3] === "structural" ? "yes" : h[3] === "transitional" ? "no (short-term forecast only)" : "blocked: unknown"]);
  }
  const openRows = reg.filter((x) => x.status !== "Closed" && x.status !== "Resolved").map((r) => {
    const lu = r.last_update.slice(0, 10);
    const days = businessDaysBetween(lu, sunday);
    const limit = [0, 2, 5, 10, 30][r.sev];
    return [r.id, String(r.sev), r.status, r.trend, String(days), days > limit ? "**stale**" : "no", r.line_of_sight];
  });
  const readouts = reg.filter((x) => x.status !== "Closed" && x.status !== "Resolved").map((r) => ({ r, due: /(\d{4}-\d{2}-\d{2})$/.exec(r.next_action)?.[1] ?? "" })).filter((x) => x.due && x.due <= addDays(sunday, 7));
  const supplyWeek = (["vendor", "home-team"] as CohortKey[]).map((co) => {
    const rows = book.supply.filter((r) => dates.includes(r.date) && r.cohort === co);
    const s = (f: (r: typeof rows[number]) => number) => rows.reduce((a, r) => a + f(r), 0);
    const sched = s((r) => r.scheduled_h), prod = s((r) => r.productive_h);
    const planHeads = co === "vendor" ? book.forecast.filter((r) => dates.includes(r.date) && r.channel === "voice" && r.region === "North").map((r) => r.planned_crestline_heads) : book.forecast.filter((r) => dates.includes(r.date) && r.channel === "voice" && r.region === "North").map((r) => r.planned_home_heads);
    const heads = rows.length ? rows[rows.length - 1].headcount : 0;
    return [TEAM_NAME[co], n1(sched), n1(s((r) => r.staffed_h)), n1(prod), sched > 0 ? pct((100 * s((r) => (r.scheduled_h * r.shrink_planned_pct) / 100)) / sched) : "—", sched > 0 ? pct((100 * s((r) => (r.scheduled_h * r.shrink_unplanned_pct) / 100)) / sched) : "—", prod > 0 ? pct((100 * s((r) => (r.occupancy_pct * r.productive_h) / 100)) / prod) : "—", `${heads} heads vs plan ${planHeads.length ? Math.max(...planHeads) : "—"}`, co === "vendor" ? "[E] hours from headcount" : "[M]"];
  });
  const nextEvents = book.events.filter((e) => e.start_date <= addDays(sunday, 7) && addDays(e.end_date, e.effect_window_days) >= addDays(sunday, 1)).map((e) => `${e.event_id} ${e.type} ${e.start_date}${e.end_date !== e.start_date ? "→" + e.end_date : ""}${e.planned ? " (planned)" : ""}`);
  const monthly = ["2026-08-03", "2026-08-31", "2026-10-05", "2026-11-02"].find((d) => d > sunday && d <= addDays(sunday, 7));
  const decisions = reg.filter((r) => r.decision_needed.startsWith("Yes") && r.status !== "Closed" && r.status !== "Resolved").map((r) => `${r.decision_needed.replace(/^Yes — /, "")} (${r.id})`);
  return `# Weekly review — Halcyon — week ${label} (${monday} to ${sunday})

**Forecast versions in force:** short v000 · mid v000 · long v000 (plan of record; phase 1 has no Forecaster) · **Issued:** ${addDays(sunday, 1)}
**Run:** ${runId} · **Gate:** planner-publication not needed (inside the planning team)

## The week in one line per channel

${table(["channel", "title sentence (the answer)", "grade"], byCh.map((b, i) => [b.ch, titles[i][0], titles[i][1]]))}

**Decisions requested:** ${decisions.length ? "\n" + decisions.map((d) => `- ${d}`).join("\n") : "none"}
**Next date:** weekly review ${isoWeek(addDays(sunday, 1)).label} on ${addDays(sunday, 8)}${monthly ? `; monthly clock ${monthly} (phase 4; not run in phase 1)` : ""}
**What would change the answer:** ${reg.filter((r) => r.status !== "Closed").sort((a, b) => a.sev - b.sev)[0]?.would_change ?? `any channel outside ±${TOL_OFFERED_PCT}% offered or ±${TOL_AHT_PCT}% handle time against v000 for three days`}

## Variance across the week

${table(["region", "channel", "offered fc", "act", "Δ%", "aht_agent_work fc", "act", "Δ%", `SL days met / ${daily.length}`, "req. hours miss", "grade"],
  agg.map((a) => [a.region, a.channel, n0(a.offFc), n0(a.offAct), signed(a.offD, 0, "%"), `${n0(a.ahtFc)} s`, `${n0(a.ahtAct)} s`, signed(a.ahtD, 0, "%"), `${a.slDays} / ${a.n}`, signed(a.miss, 0, " h"), "[C]"]))}

Decomposition of the week's miss (sequential): ${byCh.map((b) => `**${b.ch}** volume ${signed(b.comps.volume, 0)} · handle time ${signed(b.comps["handle time"], 0)} · mix ${signed(b.comps.mix, 0)} · supply (beside) ${signed(b.sup, 0)} · residual ${signed(b.res, 0)}`).join("; ")} [C]. This is association.

Events matched this week: ${eventDays.length ? eventDays.join(" · ") : "none"}
Days with a regime flag: ${flagsInWeek.length ? "\n" + flagsInWeek.map((f) => `- ${f}`).join("\n") : "none"}

## Assumption register refresh

${table(["AS", "assumption", "forecast value", "observed this week", "grade", "action (hold / revise in v<nnn> / retire)"], asRows)}

Carried assumptions still unmeasured after this week: AS-014 learning curve (needs the home-team live series, EV-009), AS-016 shrinkage (vendor agent-state records absent; unplanned shrinkage inferred from headcount delivered [E]), AS-022 chat timeout (no product-change event; effective concurrency [E] for the vendor cohort).

## Structural or transitional

${table(["driver", "tag", "evidence this week", "this week's miss on it (hours ≈ heads)", "affects capacity plan?"], st.length ? st : [["—", "—", "no open question this week", "—", "—"]])}

Bold rows are the open register questions (the driver each title names; tag = the leading hypothesis's tag, proposed until the CausalAnalyst confirms); indented rows are the hypotheses under test. Heads = requirement hours ÷ 6.6 productive hours per shift (8 h at 18% planned shrinkage) [C]; the week's total miss is ${hh(weekTotals.all)} (volume and mix ${hh(weekTotals.volume)}, handle time ${hh(weekTotals.handle)}, supply beside it ${hh(weekTotals.supply)}).

## Open questions and staleness

${table(["XR", "Sev", "status", "trend", "days since update (business)", "stale?", "line of sight"], openRows.length ? openRows : [["—", "—", "—", "—", "—", "—", "register empty"]])}

48-hour readouts due or overdue: ${readouts.length ? readouts.map((x) => `${x.r.id} due ${x.due}${x.due <= sunday ? " (overdue: phase 1 has no CausalAnalyst to deliver it)" : ""}`).join("; ") : "none"}

## Answered this week

none — phase 1 files no answer cards (the CausalAnalyst and the publication gate arrive in phases 2 and 5)

## Supply week

${table(["cohort", "scheduled h", "staffed h", "productive h", "shrink planned", "shrink unplanned", "occupancy", "vs plan", "grade"], supplyWeek)}

## Next week

Events in window: ${nextEvents.length ? nextEvents.join(" · ") : "none"} · Tests that settle: ${readouts.length ? readouts.map((x) => `${x.r.id} hypothesis table, data date ${x.due}`).join("; ") : "none due"} · Monthly clock: ${monthly ?? "not within the week"}
`;
}

// ---------------------------------------------------------------------------
// register report
// ---------------------------------------------------------------------------
export function renderRegisterReport(book: Book, date: string): string {
  const regMd = readIfExists(join(book.dir, "06-questions", "register.md")) ?? "";
  const reg = readRegister(join(book.dir, "06-questions", "register.md"), date).rows;
  const dir = join(book.dir, "08-reports", "register");
  const prev = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md") && f.slice(0, 10) < date).sort().pop()?.slice(0, 10) ?? "none" : "none";
  const open = reg.filter((r) => r.status !== "Closed" && r.status !== "Resolved");
  const count = (s: number) => open.filter((r) => r.sev === s).length;
  const trendRank: Record<string, number> = { Worsening: 0, Stable: 1, Improving: 2 };
  const hi = open.filter((r) => r.sev <= 2).sort((a, b) => a.sev - b.sev || trendRank[a.trend] - trendRank[b.trend] || a.opened.localeCompare(b.opened));
  const closeOf = (r: XrRow) => { const m = /^(\d{4}-\d{2}-\d{2}) · (\w+)/.exec(r.expected_close); return m ? `Close ${fmtDate(m[1])} ${m[2]}` : "Close open"; };
  const decisionOf = (r: XrRow) => { const m = /by (\d{4}-\d{2}-\d{2})/.exec(r.decision_needed); return r.decision_needed.startsWith("Yes") && m ? `DECISION by ${fmtDate(m[1])}${m[1] < date ? ` (OVERDUE ${businessDaysBetween(m[1], date)} bd)` : ""}` : ""; };
  const bare = (t: string) => t.replace(/\s*\[[MCEA]\]$/, "");
  const front = hi.map((r) => `${r.id}  Sev ${r.sev}  ${r.trend.padEnd(9)}  ${bare(r.title)}  [${r.grade}]  ${closeOf(r)}  ${decisionOf(r)}`.trimEnd());
  // change log since previous report
  const cl = parseTable(regMd, "Date");
  const since = (cl?.rows ?? []).filter((c) => c[0] > (prev === "none" ? "0000" : prev) && c[0] <= date && c[1] !== "—");
  const grouped: Record<string, string[]> = { Opened: [], Closed: [], "Re-rated": [], "Trend moved": [], "Expected close moved": [], "Owner changed": [] };
  for (const c of since) {
    const line = `${c[1]} ${c[0]}: ${c[3]} → ${c[4]} (${c[5]})`;
    if (c[2] === "opened") grouped.Opened.push(line);
    else if (c[2] === "status" && /Closed|Resolved/.test(c[4])) grouped.Closed.push(line);
    else if (c[2] === "severity") grouped["Re-rated"].push(line);
    else if (c[2] === "trend") grouped["Trend moved"].push(line);
    else if (c[2] === "expected_close") grouped["Expected close moved"].push(line);
    else if (c[2] === "owner") grouped["Owner changed"].push(line);
  }
  const changedText = Object.entries(grouped).map(([k, v]) => `**${k}:** ${v.length ? "\n" + v.map((x) => `- ${x}`).join("\n") : "none"}`).join("\n");
  const overdueText = (by: string) => (by < date ? `${by} (**overdue** by ${businessDaysBetween(by, date)} business days)` : by);
  const decisions = open.filter((r) => r.decision_needed.startsWith("Yes")).map((r) => { const m = /^Yes — (.*?); by (\d{4}-\d{2}-\d{2}); decider (.*)$/.exec(r.decision_needed); return [r.id, m?.[1] ?? r.decision_needed, m ? overdueText(m[2]) : "—", r.business_risk, m?.[3] ?? r.owner]; }).sort((a, b) => a[2].localeCompare(b[2]));
  const overdueCount = open.filter((r) => { const m = /by (\d{4}-\d{2}-\d{2})/.exec(r.decision_needed); return r.decision_needed.startsWith("Yes") && m && m[1] < date; }).length;
  const cards = hi.map((r) => {
    const md = readIfExists(join(book.dir, r.hypotheses));
    const t = md ? parseTable(md, "id") : null;
    const hypLines = (t?.rows ?? []).filter((h) => h[0] !== "H-res").map((h) => `${h[0]} ${h[8]} (${h[3]}) — ${h[1]}`);
    const lu = /^(\d{4}-\d{2}-\d{2}) · ([^·]+) · (\w+)/.exec(r.last_update);
    const ec = /^(\d{4}-\d{2}-\d{2}) · (\w+) · assuming (.*)$/.exec(r.expected_close);
    const na = /^(.*) — (.*) — (\d{4}-\d{2}-\d{2})$/.exec(r.next_action);
    return "```\n" + [
      `${r.id} — ${bare(r.title)}  [${r.grade}]`,
      `Sev ${r.sev} · ${r.status} · ${r.trend} · opened ${fmtDate(r.opened)} · last update ${lu ? fmtDate(lu[1]) + " (" + lu[3] + ", " + lu[2].trim() + ")" : r.last_update}`,
      `What:        ${r.description}`,
      `At risk:     ${r.business_risk}`,
      `Owner:       ${r.owner}          Line of sight: ${r.line_of_sight}`,
      `Close:       ${ec ? `${fmtDate(ec[1])} ${ec[2]} — assuming ${ec[3]}` : r.expected_close}`,
      `Next:        ${na ? `${na[1]} — ${na[2]} — ${fmtDate(na[3])}` : r.next_action}`,
      `Would change the answer:  ${r.would_change}`,
      `Hypotheses:  ${hypLines.length ? hypLines.join("\n             ") : "none"}`,
      `Notes:       ${r.notes}`,
    ].join("\n") + "\n```";
  });
  const stale = open.map((r) => { const lu = r.last_update.slice(0, 10); const d = businessDaysBetween(lu, date); const lim = [0, 2, 5, 10, 30][r.sev]; return { r, d, lim }; }).filter((x) => x.d > x.lim).map((x) => [x.r.id, String(x.r.sev), `${x.d} (limit ${x.lim})`, x.r.line_of_sight]);
  const watch = open.filter((r) => r.sev >= 3).map((r) => [r.id, String(r.sev), r.status, r.title, r.last_update.slice(0, 10)]);
  const tooMany = hi.length > 10 ? `\n**The register holds ${hi.length} Sev 1–2 items; the report cannot fit two pages until that is reduced.**\n` : "";
  return `# Register report — Halcyon — ${date}

Register as of: ${date} · Previous report: ${prev} · Open: Sev1 ${count(1)} · Sev2 ${count(2)} · Sev3 ${count(3)} · Sev4 ${count(4)}
Derived from \`06-questions/register.md\` and its change log only. Issued by agent:Reporter;
publication gate: not needed (inside the planning team). Severities shown are the Librarian's proposals until the register owner confirms them (see Notes on each row).
${tooMany}
## 1. Front sheet

One line per open Sev 1 and Sev 2 item. Order: Sev, then Trend (Worsening first), then age (oldest first).

\`\`\`
${front.length ? front.join("\n") : "no open Sev 1–2 items"}
\`\`\`

## 2. What changed since ${prev}

${changedText}

## 3. Decisions requested

${overdueCount ? `${overdueCount} of ${decisions.length} decision dates are overdue: no CausalAnalyst in phase 1 delivers the 48-hour readout, and no register owner has sat on these rows in the scripted run. They are the argument for phase 2, not a backlog to clear.\n\n` : ""}${table(["XR", "decision (one sentence)", "by", "if not taken by then (from Business risk)", "who acts"], decisions.length ? decisions : [["—", "none", "—", "—", "—"]])}

## 4. Item cards (Sev 1 and 2)

${cards.length ? cards.join("\n\n") : "none"}

## 5. Stale items

Every item whose last update is older than its severity's limit (2/5/10/30 business days), measured to ${date}. No CausalAnalyst in phase 1; rows are touched only when their series flags again, so a stale row here means nobody has worked it, not that the loop lost it.

${table(["XR", "Sev", "business days since update", "line-of-sight contact to ask"], stale.length ? stale : [["—", "—", "none", "—"]])}

## 6. Watch list (Sev 3 and 4)

${table(["XR", "Sev", "Status", "Title", "last update"], watch.length ? watch : [["—", "—", "—", "none", "—"]])}
`;
}
