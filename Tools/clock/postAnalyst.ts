/**
 * PostAnalyst stage (daily step 2, rung 1 only): score the live forecast against the reconciled actuals,
 * decompose the requirement-hours miss (sequential: volume → mix → handle time, interaction stated as residual;
 * supply gap stated beside it), run SPC on the series that matter, and call the regime (level shift · trend ·
 * transient; demand-side · supply-side). Never "because".
 */
import { join } from "path";
import type { Book, Variance, ChannelScore, ChannelSummary, RegimeFlag, RatioCheck, TxCheck, Region, Channel, CohortKey, Reconciliation } from "./types";
import { CHANNELS, REGIONS, SL_TARGET, TEAM_NAME } from "./types";
import { analyseSeries, type Point, type SeriesFlag } from "./spc";
import { dayNumber, dowIndex, addDays, writeText, table, n0, n1, n2, signed, pct, rel } from "./book";

export const PLAN_OCCUPANCY = 0.85;        // AS-015, the plan of record's requirement occupancy
export const TOL_OFFERED_PCT = 15;         // ≈ 2σ of day-level contact noise (σ ≈ 8 %: 6 % contacts ⊕ 5 % transactions)
export const TOL_AHT_PCT = 10;             // ≈ 2.5σ of day-level handle-time noise (σ ≈ 4 %)
export const TX_FLAT_PCT = 12;             // same-weekday transactions within ±12 % = flat (2σ of 5 % noise plus weekday drift)
const PLAN_DOW = [1.08, 1.12, 1.08, 1.02, 0.9, 0.38, 0.42]; // AS-002, used for day-of-week adjustment before a baseline can estimate its own

const k = 3600 * PLAN_OCCUPANCY;

/** Pure scoring for one date (no SPC, no file): used by the daily run and by the weekly review. */
export function computeScores(book: Book, date: string): { scores: ChannelScore[]; byChannel: ChannelSummary[]; supplyGapH: number; supplyNote: string } {
  const act = book.demand.filter((r) => r.date === date);
  const fc = book.forecast.filter((r) => r.date === date);
  const sup = book.supply.filter((r) => r.date === date);
  const scores: ChannelScore[] = [];

  // --- supply gap: hours lost against the published schedule at the contracted planned shrinkage
  const supplyGapH = sup.reduce((s, r) => s + (r.scheduled_h * r.shrink_unplanned_pct) / 100, 0);
  const supplyNote = sup.map((r) => `${r.team}: scheduled ${n1(r.scheduled_h)} h, productive ${n1(r.productive_h)} h, unplanned shrinkage ${n1(r.shrink_unplanned_pct)}%`).join(" · ");

  // --- forecast vs actual, region × channel
  const regionsToday = REGIONS.filter((rg) => act.some((r) => r.region === rg));
  let reqActTotal = 0;
  for (const rg of regionsToday) {
    const a = CHANNELS.map((ch) => act.find((r) => r.region === rg && r.channel === ch)!);
    const f = CHANNELS.map((ch) => fc.find((r) => r.region === rg && r.channel === ch));
    const totAct = a.reduce((s, r) => s + r.offered, 0), totFc = f.reduce((s, r) => s + (r?.offered_fc ?? 0), 0);
    CHANNELS.forEach((ch, i) => {
      const ar = a[i], fr = f[i];
      const offFc = fr?.offered_fc ?? 0, ahtFc = fr?.aht_agent_work_fc_s ?? 0;
      const share = totFc > 0 ? offFc / totFc : 0;
      const reqFc = (offFc * ahtFc) / k, reqAct = (ar.offered * ar.aht_agent_work_s) / k;
      reqActTotal += reqAct;
      const volume = ((totAct * share - offFc) * ahtFc) / k;
      const mix = ((ar.offered - totAct * share) * ahtFc) / k;
      const handle = (offFc * (ar.aht_agent_work_s - ahtFc)) / k;
      const residual = ((ar.offered - offFc) * (ar.aht_agent_work_s - ahtFc)) / k;
      scores.push({
        region: rg, channel: ch, offered_fc: offFc, offered_act: ar.offered, offered_dpct: offFc > 0 ? ((ar.offered - offFc) / offFc) * 100 : NaN,
        aht_fc: ahtFc, aht_act: ar.aht_agent_work_s, aht_dpct: ahtFc > 0 ? ((ar.aht_agent_work_s - ahtFc) / ahtFc) * 100 : NaN, aht_elapsed_act: ar.aht_elapsed_s,
        sl_target: SL_TARGET[ch].pct, sl_act: ar.sl_pct, asa_s: ar.asa_s, abandoned_pct: ar.offered > 0 ? (100 * ar.abandoned) / ar.offered : 0,
        req_fc: reqFc, req_act: reqAct, miss_h: reqAct - reqFc, volume_h: volume, handle_h: handle, mix_h: mix, supply_h: 0, residual_h: residual,
      });
    });
  }
  for (const s of scores) s.supply_h = reqActTotal > 0 ? (supplyGapH * s.req_act) / reqActTotal : 0;

  // --- by channel (sum over regions)
  const byChannel: ChannelSummary[] = CHANNELS.map((ch) => {
    const rows = scores.filter((s) => s.channel === ch);
    const sum = (f: (s: ChannelScore) => number) => rows.reduce((a, s) => a + f(s), 0);
    const offFc = sum((s) => s.offered_fc), offAct = sum((s) => s.offered_act);
    const ahtFc = rows[0]?.aht_fc ?? 0, ahtAct = offAct > 0 ? sum((s) => s.offered_act * s.aht_act) / offAct : 0;
    const inSl = act.filter((r) => r.channel === ch).reduce((a, r) => a + r.handled_in_sl, 0);
    const slAct = offAct > 0 ? (100 * inSl) / offAct : 0;
    const comps = { volume: sum((s) => s.volume_h), "handle time": sum((s) => s.handle_h), mix: sum((s) => s.mix_h), supply: sum((s) => s.supply_h) } as const;
    const residual = sum((s) => s.residual_h);
    const demandKeys = ["volume", "handle time", "mix"] as const;
    const lead = demandKeys.reduce((b, key) => (Math.abs(comps[key]) > Math.abs(comps[b]) ? key : b), "volume" as (typeof demandKeys)[number]);
    const denom = Math.abs(comps.volume) + Math.abs(comps["handle time"]) + Math.abs(comps.mix) + Math.abs(residual);
    const offD = offFc > 0 ? ((offAct - offFc) / offFc) * 100 : NaN, ahtD = ahtFc > 0 ? ((ahtAct - ahtFc) / ahtFc) * 100 : NaN;
    return {
      channel: ch, offered_fc: offFc, offered_act: offAct, offered_dpct: offD, aht_fc: ahtFc, aht_act: ahtAct, aht_dpct: ahtD,
      aht_elapsed_act: act.find((r) => r.channel === ch)?.aht_elapsed_s ?? 0, sl_target: SL_TARGET[ch].pct, sl_act: slAct,
      miss_h: sum((s) => s.miss_h), volume_h: comps.volume, handle_h: comps["handle time"], mix_h: comps.mix, supply_h: comps.supply, residual_h: residual,
      leadDriver: lead, leadShare: denom > 0 ? (100 * Math.abs(comps[lead])) / denom : 0,
      withinTolerance: Math.abs(offD) <= TOL_OFFERED_PCT && Math.abs(ahtD) <= TOL_AHT_PCT, slMet: slAct >= SL_TARGET[ch].pct,
    };
  });

  return { scores, byChannel, supplyGapH, supplyNote };
}

export function runPostAnalyst(book: Book, date: string, rec: Reconciliation): Variance {
  const day = dayNumber(date);
  const act = book.demand.filter((r) => r.date === date);
  const fc = book.forecast.filter((r) => r.date === date);
  const sup = book.supply.filter((r) => r.date === date);
  const regionsToday = REGIONS.filter((rg) => act.some((r) => r.region === rg));
  const { scores, byChannel, supplyGapH, supplyNote } = computeScores(book, date);

  // --- SPC
  const { flags, continuing } = runSpc(book, date);

  // --- transactions same-weekday check (isolates contact moves from transaction moves)
  const txChecks: TxCheck[] = [];
  const txOn = (d: string, rg?: Region) => book.tx.filter((r) => r.date === d && (!rg || r.region === rg)).reduce((a, r) => a + r.transactions, 0);
  for (const rg of [...regionsToday, "book" as const]) {
    const region = rg === "book" ? undefined : rg;
    const today = txOn(date, region);
    const prior = [1, 2, 3].map((w) => txOn(addDays(date, -7 * w), region)).filter((v) => v > 0);
    const avg = prior.length ? prior.reduce((a, b) => a + b, 0) / prior.length : NaN;
    const ratio = avg > 0 ? today / avg : NaN;
    txChecks.push({ region: rg, today, sameWeekdayAvg: avg, ratio, flat: Number.isFinite(ratio) ? Math.abs(ratio - 1) * 100 <= TX_FLAT_PCT : true });
  }

  // --- ratio check (contacts per transaction: actual on Meridian vs plan vs the Beacon history by region)
  const tr = book.travelers.find((r) => r.date === date);
  let ratio: RatioCheck | null = null;
  if (tr && tr.transactions_migrated_regions > 0) {
    const beaconByRegion = regionsToday.map((rg) => {
      const rows = book.beacon.filter((r) => r.region === rg);
      const t = rows.reduce((a, r) => a + r.transactions, 0), c = rows.reduce((a, r) => a + r.contacts_total, 0);
      return { region: rg, cpt: t > 0 ? c / t : NaN, days: rows.length };
    });
    const pre = book.beacon.filter((r) => r.day <= 0);
    const bt = pre.reduce((a, r) => a + r.transactions, 0), bc = pre.reduce((a, r) => a + r.contacts_total, 0);
    ratio = { cptActual: tr.contacts_per_transaction, cptPlan: fc[0] ? 0.35 : 0.35, beaconByRegion, beaconBook: bt > 0 ? bc / bt : NaN, cptdActual: tr.contacts_per_traveler_day, txMigrated: tr.transactions_migrated_regions, txMigratedFc: fc.filter((r) => r.channel === "voice").reduce((a, r) => a + r.fc_transactions, 0) };
  }

  // --- two definitions on chat
  const chatAct = act.find((r) => r.channel === "chat");
  const chatFc = fc.find((r) => r.channel === "chat");
  let chatDefinitionNote: string | null = null;
  if (chatAct && chatFc && chatAct.offered > 0) {
    const elapsedVsPlan = ((chatAct.aht_elapsed_s - chatFc.aht_agent_work_fc_s) / chatFc.aht_agent_work_fc_s) * 100;
    const agentVsPlan = ((chatAct.aht_agent_work_s - chatFc.aht_agent_work_fc_s) / chatFc.aht_agent_work_fc_s) * 100;
    const conc = sup.find((r) => r.cohort === "vendor")?.concurrency_eff ?? NaN;
    const elapsedFlag = [...flags, ...continuing].find((f) => f.seriesKey === "aht-elapsed|chat");
    const agentFlag = [...flags, ...continuing].find((f) => f.seriesKey.startsWith("aht-agent-work|") && f.channel === "chat");
    chatDefinitionNote = `Chat carries two handle times. \`aht-elapsed\` ${n0(chatAct.aht_elapsed_s)} s [M] is ${signed(elapsedVsPlan, 0, "%")} against the plan's ${n0(chatFc.aht_agent_work_fc_s)} s, but the plan cites \`aht-agent-work\`, so the comparable actual is ${n0(chatAct.aht_agent_work_s)} s [C] (${signed(agentVsPlan, 0, "%")}; elapsed ÷ effective concurrency ${n2(conc)} [E]). The staffing number is the agent-work one.`
      + (elapsedFlag && !agentFlag ? ` Today \`aht-elapsed\` on chat is out of control (${elapsedFlag.rule}, ${elapsedFlag.kind} since ${elapsedFlag.onset}) while \`aht-agent-work\` is not: per \`aht-elapsed.md\` rule 3, that is a concurrency or timeout movement, not a work-content change. This is association.` : "");
  }

  // --- Simpson check: aggregate handle-time shift within cohort
  const simpson: string[] = [];
  for (const ch of CHANNELS) {
    const b = byChannel.find((x) => x.channel === ch)!;
    if (!Number.isFinite(b.aht_dpct) || Math.abs(b.aht_dpct) <= TOL_AHT_PCT) continue;
    const parts = book.cohort.filter((r) => r.date === date && r.channel === ch && r.handled > 0).map((r) => `${r.team} ${n0(r.aht_agent_work_s)} s [C] (${signed(((r.aht_agent_work_s - b.aht_fc) / b.aht_fc) * 100, 0, "%")}, ${r.handled} handled)`);
    if (parts.length) simpson.push(`${ch}: blended ${n0(b.aht_act)} s [C] vs plan ${n0(b.aht_fc)} s; within cohort — ${parts.join("; ")}`);
  }

  const occupancy = sup.map((r) => ({ cohort: r.cohort, occupancy_pct: r.occupancy_pct, productive_h: r.productive_h, scheduled_h: r.scheduled_h, unplanned_pct: r.shrink_unplanned_pct, planned_pct: r.shrink_planned_pct }));
  const file = join(book.dir, "03-forecast", "variance", `${date}.md`);
  const cohortAht = book.cohort.filter((r) => r.date === date && r.handled > 0).map((r) => ({ cohort: r.cohort, channel: r.channel, aht: r.aht_agent_work_s, handled: r.handled }));
  const v: Variance = { date, day, forecastVersion: "v000", scores, byChannel, flags, continuing, ratio, txChecks, supplyGapH, supplyNote, occupancy, chatDefinitionNote, simpson, file, cohortAht };
  writeText(file, renderVariance(book, v, rec));
  return v;
}

// ---------------------------------------------------------------------------
// SPC series
// ---------------------------------------------------------------------------
function runSpc(book: Book, date: string): { flags: RegimeFlag[]; continuing: RegimeFlag[] } {
  const flags: RegimeFlag[] = [], continuing: RegimeFlag[] = [];
  const upTo = (d: string) => d <= date;
  const dates = [...new Set(book.demand.filter((r) => upTo(r.date)).map((r) => r.date))].sort();
  const emit = (key: string, series: string, side: "demand" | "supply", definition: string, f: SeriesFlag | undefined, extra: Partial<RegimeFlag>, note: string) => {
    if (!f) return;
    const flag: RegimeFlag = { series, seriesKey: key, side, definition, date, onset: f.onset, rule: f.rule, kind: f.kind, direction: f.direction, value: f.value, mean: f.mean, sigma: f.sigma, ucl: f.ucl, lcl: f.lcl, baseline: f.baseline, baselineGrade: f.baseline.includes("carried") ? "E" : "M", magnitudePct: f.magnitudePct, note, ...extra };
    (f.kind === "continuing" ? continuing : flags).push(flag);
  };

  // a) offered attainment (actual ÷ forecast) by channel, book level. The plan carries the calendar (go-live steps)
  //    and the weekday shape, so charting attainment removes both and leaves the unplanned movement.
  for (const ch of CHANNELS) {
    const pts: Point[] = [];
    for (const d of dates) {
      const a = book.demand.filter((r) => r.date === d && r.channel === ch).reduce((s, r) => s + r.offered, 0);
      const f = book.forecast.filter((r) => r.date === d && r.channel === ch).reduce((s, r) => s + r.offered_fc, 0);
      if (f > 0 && a > 0) pts.push({ date: d, value: a / f, dow: dowIndex(d) });
    }
    // weekend factor 1.25 from 00-profile ("contacts per transaction run ≈25% higher on weekends") [A] until the baseline can estimate its own
    const res = analyseSeries(pts, { fixedDow: [1, 1, 1, 1, 1, 1.25, 1.25], minEffectPct: 10 });
    emit(`offered-attainment|${ch}`, `${ch} · offered ÷ forecast v000 (book)`, "demand", "offered", res.get(date), { channel: ch }, "forecast attainment; the plan's weekday shape and go-live steps are in the denominator; weekend contacts-per-transaction boost 1.25 (00-profile) divided out");
  }
  // b) aht-agent-work by cohort × channel, carried Beacon baseline until 8 Meridian points exist
  const carryFor = (ch: Channel) => {
    const rows = book.beacon.filter((r) => r.day <= 0);
    const vals = rows.map((r) => (ch === "voice" ? r.voice_aht_agent_work_s : ch === "chat" ? r.messaging_aht_agent_work_s : r.email_aht_agent_work_s));
    return { values: vals, desc: `Beacon history, ${rows.length} region-days before day 1 (${ch === "chat" ? "messaging agent-work" : ch}), carried across the platform change` };
  };
  for (const co of ["vendor", "home-team"] as CohortKey[]) {
    for (const ch of CHANNELS) {
      const pts: Point[] = book.cohort.filter((r) => upTo(r.date) && r.cohort === co && r.channel === ch && r.handled > 0).map((r) => ({ date: r.date, value: r.aht_agent_work_s, dow: dowIndex(r.date) }));
      if (!pts.length) continue;
      const res = analyseSeries(pts, { carry: co === "vendor" ? carryFor(ch) : null, minEffectPct: 5 });
      emit(`aht-agent-work|${co}|${ch}`, `${TEAM_NAME[co]} · ${ch} · aht-agent-work`, "demand", "aht-agent-work", res.get(date), { channel: ch, cohort: co }, co === "home-team" ? "home-team series starts at nesting; no carried baseline (the curve is the thing under study)" : "vendor cohort");
    }
  }
  // c) aht-elapsed on chat (skill level); no comparator on Beacon (asynchronous, hours)
  {
    const pts: Point[] = [];
    for (const d of dates) { const r = book.demand.find((x) => x.date === d && x.channel === "chat" && x.offered > 0); if (r) pts.push({ date: d, value: r.aht_elapsed_s, dow: dowIndex(d) }); }
    const res = analyseSeries(pts, { minEffectPct: 10 });
    emit("aht-elapsed|chat", "chat · aht-elapsed (skill)", "demand", "aht-elapsed", res.get(date), { channel: "chat" }, "elapsed includes timeout wait and concurrency; not a staffing number");
  }
  // d) supply: unplanned shrinkage and productive hours by cohort (vendor from day 2; home team once live)
  for (const co of ["vendor", "home-team"] as CohortKey[]) {
    const rows = book.supply.filter((r) => upTo(r.date) && r.cohort === co && r.scheduled_h > 0 && (co === "vendor" ? r.day >= 2 : r.status === "live"));
    if (rows.length < 2) continue;
    const resU = analyseSeries(rows.map((r) => ({ date: r.date, value: r.shrink_unplanned_pct, dow: dowIndex(r.date) })), { minEffectAbs: 5 });
    emit(`shrink-unplanned|${co}`, `${TEAM_NAME[co]} · shrinkage, unplanned`, "supply", "shrinkage", resU.get(date), { cohort: co }, "base = scheduled hours; the schedule itself is checked separately");
    // weekend schedule ≈ 0.8 × weekday (00-profile / 04-supply README: 72 % vs 58 % of heads) [A], fixed, not estimated
    const resP = analyseSeries(rows.map((r) => ({ date: r.date, value: r.productive_h, dow: dowIndex(r.date) })), { fixedDow: [1, 1, 1, 1, 1, 0.8, 0.8], minEffectPct: 10 });
    emit(`productive-h|${co}`, `${TEAM_NAME[co]} · productive hours`, "supply", "productive-hours", resP.get(date), { cohort: co }, "day-of-week adjusted");
  }
  return { flags, continuing };
}

// ---------------------------------------------------------------------------
// Variance file
// ---------------------------------------------------------------------------
function renderVariance(book: Book, v: Variance, rec: Reconciliation): string {
  const lead = v.byChannel.filter((b) => !b.withinTolerance || !b.slMet).sort((a, b) => Math.abs(b.miss_h) - Math.abs(a.miss_h))[0];
  const reqFcOf = (ch: string) => v.scores.filter((s) => s.channel === ch).reduce((a, s) => a + s.req_fc, 0);
  const title = lead
    ? `${cap(lead.channel)} requirement hours ran ${signed(lead.miss_h, 0, " h")} (${pctOf(lead.miss_h, reqFcOf(lead.channel))}) against v000; ${lead.leadDriver} carries ${n0(lead.leadShare)}% of the miss [C]`
    : `All channels landed within tolerance of forecast v000 [C]`;
  const flagLines = v.flags.length ? v.flags.map((f) => `- **${f.series}**: ${f.kind} (${f.rule}), ${f.direction} ${signed(f.magnitudePct, 0, "%")} vs baseline mean ${n1(f.mean)} (σ ${n2(f.sigma)}, limits ${n1(f.lcl)}–${n1(f.ucl)}), onset ${f.onset}. Baseline: ${f.baseline} [${f.baselineGrade}]. Side: **${f.side}** (the break is in ${f.side === "supply" ? "04-supply" : "02-demand"}). ${f.note}. This is association.`).join("\n") : "- none";
  const contLines = v.continuing.length ? v.continuing.map((f) => `- ${f.series}: continuing since ${f.onset} (${f.direction} ${signed(f.magnitudePct, 0, "%")} vs pre-shift mean ${n1(f.mean)}); ${f.baseline}`).join("\n") : "- none";
  const txLines = v.txChecks.map((t) => `${t.region === "book" ? "whole book" : t.region}: ${n0(t.today)} vs same-weekday mean ${n0(t.sameWeekdayAvg)} (×${n2(t.ratio)}, ${t.flat ? "flat" : "moved"})`).join(" · ");
  return `# Variance · ${book.client} · ${v.date} (day ${v.day}) · forecast v000 plan of record vs demand ${rec.demandFile} / supply ${rec.supplyFile}

**Title:** ${title.replace(/ \(NaN%\)/, "")}
**Rung:** 1 (association). Every driver below is handed to Scout (events) and CausalAnalyst (causes). **This is association.**
**Reconciled:** ${rec.reconciled ? "true" : "false — every number below inherits the flag"} · Grades: forecast [C] on its stated formula with [E] inputs (v000 register); actuals [M]; computed [C].

## Forecast vs actual (region × channel)

${table(["region", "channel", "offered fc [C]", "offered act [M]", "Δ%", "aht-agent-work fc [E]", "act [C]", "Δ%", "aht-elapsed act [M]", "SL target", "SL act [C]", "ASA s [C]", "abandoned %"],
  v.scores.map((s) => [s.region, s.channel, n1(s.offered_fc), n0(s.offered_act), signed(s.offered_dpct, 0, "%"), n0(s.aht_fc), n0(s.aht_act), signed(s.aht_dpct, 0, "%"), s.channel === "chat" ? n0(s.aht_elapsed_act) : "= agent-work", `${s.sl_target}%`, pct(s.sl_act), n0(s.asa_s), pct(s.abandoned_pct)]))}

All handle times cite \`aht-agent-work\` unless labelled \`aht-elapsed\`. ${v.chatDefinitionNote ?? ""}

## Decomposition (sequential, requirement hours, occupancy ${PLAN_OCCUPANCY})

Method: sequential — volume at forecast handle time and forecast mix, then mix at forecast handle time, then handle time at forecast volume; the interaction term (Δvolume × Δhandle time) is stated as the residual, not absorbed. Requirement hours = offered × aht-agent-work ÷ 3600 ÷ ${PLAN_OCCUPANCY} (\`requirement-hours\`, AS-015). Supply is the hours lost to unplanned shrinkage against the published schedule (\`shrinkage\`), allocated to rows by share of actual requirement; it is stated beside the demand-side miss, not inside it.

${table(["region", "channel", "req h fc [C]", "req h act [C]", "miss h", "volume", "mix", "handle time", "residual (interaction)", "supply gap h", "grade"],
  v.scores.map((s) => [s.region, s.channel, n1(s.req_fc), n1(s.req_act), signed(s.miss_h, 1), signed(s.volume_h, 1), signed(s.mix_h, 1), signed(s.handle_h, 1), signed(s.residual_h, 1), signed(s.supply_h, 1), "[C]"]))}

By channel: ${v.byChannel.map((b) => `**${b.channel}** miss ${signed(b.miss_h, 1, " h")} = volume ${signed(b.volume_h, 1)} · mix ${signed(b.mix_h, 1)} · handle time ${signed(b.handle_h, 1)} · residual ${signed(b.residual_h, 1)}; lead driver ${b.leadDriver} (${n0(b.leadShare)}%)`).join("; ")}.

Supply: ${v.supplyNote}. Unplanned hours lost against schedule today: ${n1(v.supplyGapH)} h [C].

${v.simpson.length ? `Simpson check (aggregate handle-time shift checked within cohort): ${v.simpson.join(" · ")}.` : "Simpson check: no aggregate handle-time shift beyond tolerance today."}

## SPC and regime

New flags today (individuals chart, moving-range σ, Western Electric rules 1 and 2, trend test; see Tools/clock/README.md):
${flagLines}

Continuing excursions (already flagged, awaiting re-based limits):
${contLines}

## Transactions same-weekday check

${txLines || "no migrated regions"}. A contact move with flat transactions is not a change in underlying travel activity (retries, re-contacts, overflow or an incident); a contact move with transactions moving in step is transaction-driven. This is association.

${v.ratio ? `## Contacts per transaction (composition check)

Meridian, migrated regions: ${n2(v.ratio.cptActual)} [C] today on ${n0(v.ratio.txMigrated)} transactions (plan v000 assumed ${n2(v.ratio.cptPlan)} [A] on ${n0(v.ratio.txMigratedFc)}). Beacon history by region: ${v.ratio.beaconByRegion.map((b) => `${b.region} ${n2(b.cpt)} [M] over ${b.days} days`).join(", ")}; whole-book Beacon ${n2(v.ratio.beaconBook)} [M]. The plan's ratio is the whole-book figure; the migrated regions' own Beacon ratios are the comparators (\`contacts-per-transaction\`, composition trap). Contacts per traveler-day ${n2(v.ratio.cptdActual)} [C].
` : ""}
## Hand-offs

- Scout: match ${v.flags.length ? v.flags.map((f) => `${f.series} (onset ${f.onset})`).join("; ") : "the tolerance misses above"} to 05-events; propose where nothing matches.
- CausalAnalyst / Librarian: ${v.flags.length ? "open or update the XR row for each flagged series" : "no new regime flag today"}. Proposed tags: level shift → structural until a curve is shown; transient → transitional; trend → unknown until the direction persists. This is association. For a causal reading, see the XR row.
`;
}
function pctOf(a: number, b: number): string { return Number.isFinite(b) && b !== 0 ? signed((100 * a) / b, 0, "%") : "NaN%"; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
