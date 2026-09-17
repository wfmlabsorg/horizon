/**
 * Librarian stage (daily step 4 in phase 1; the CausalAnalyst is phase 2): when a regime flag fires with no
 * explaining accepted event, open an XR row in 06-questions/register.md and a hypothesis table 06-questions/XR-###.md
 * with at least three hypotheses, each tagged structural or transitional. Persistent tolerance misses against the
 * plan (three consecutive days) open a row too. An open row that already covers the series is touched, not duplicated.
 */
import { join } from "path";
import type { Book, Variance, ScoutResult, LibrarianResult, XrRow, XrTouch, RegimeFlag, Channel, Grade } from "./types";
import { CHANNELS, TEAM_NAME, SL_TARGET } from "./types";
import { addDays, readIfExists, writeText, parseTable, splitRow, table, n0, n1, n2, signed, dayNumber, fmtDate } from "./book";
import { TOL_OFFERED_PCT, TOL_AHT_PCT } from "./postAnalyst";

const REGISTER_HEADER = ["ID", "Title", "Description", "Opened", "Sev", "Status", "Trend", "Business risk", "Decision needed", "Owner", "Line of sight", "Expected close", "Next action", "Last update", "Grade", "Source", "Would change the answer", "Hypotheses", "Route", "Notes"];

interface Hyp { id: string; claim: string; driver: string; tag: "structural" | "transitional" | "unknown"; side: string; evFor: string; evAgainst: string; test: string; data: string; status: string; grade: Grade }
interface Candidate { key: string; family: string; onset: string; title: string; description: string; sev: number; risk: string; would: string; hyps: Omit<Hyp, "id">[]; flags: RegimeFlag[]; decomposition: string; linked: string[] }

export function runLibrarian(book: Book, date: string, v: Variance, scout: ScoutResult): LibrarianResult {
  const regPath = join(book.dir, "06-questions", "register.md");
  const reg = readRegister(regPath);
  const opened: XrRow[] = [], touched: XrTouch[] = [], movements: string[] = [];
  const changes: string[][] = [];
  const candidates = buildCandidates(book, date, v, scout);

  for (const c of candidates) {
    const open = reg.rows.find((r) => r.status !== "Resolved" && r.status !== "Closed" && covers(r, c));
    if (open) {
      // touch: append what today's data did, update last update and trend
      const slBad = c.flags.some((f) => f.channel && (v.byChannel.find((b) => b.channel === f.channel)?.slMet === false));
      const prevLu = open.last_update;
      open.last_update = `${date} · agent:Librarian · ledger`;
      if (prevLu !== open.last_update) changes.push([date, open.id, "last_update", prevLu, open.last_update, `03-forecast/variance/${date}.md`, "agent:Librarian"]);
      // the Description is never frozen: the opening reading stays, the latest reading is re-rendered on every touch
      const atOpening = /^At opening \(([^)]+)\): (.*?)(?: · Latest \([^)]+\): .*)?$/.exec(open.description);
      const openingText = atOpening ? atOpening[2] : open.description;
      const newDesc = `At opening (${fmtDate(open.opened)}): ${openingText} · Latest (${fmtDate(date)}): ${c.description}`;
      if (newDesc !== open.description) { changes.push([date, open.id, "description", "superseded (see previous row)", newDesc, `03-forecast/variance/${date}.md`, "agent:Librarian"]); open.description = newDesc; }
      // business risk is stated at opening and changes only on an owner's word (register precedence rule); the Latest description carries today's figures
      const newTrend = slBad ? "Worsening" : "Stable";
      if (open.trend !== newTrend) { changes.push([date, open.id, "trend", open.trend, newTrend, `03-forecast/variance/${date}.md`, "agent:Librarian"]); open.trend = newTrend; }
      open.source = `03-forecast/variance/${date}.md`;
      const what = whatTodayDid(c, v);
      const hFile = join(book.dir, "06-questions", `${open.id}.md`);
      refreshEvidence(hFile, c);
      const lead = appendDay(hFile, date, what, c);
      touched.push({ id: open.id, h: lead.id, claim: lead.claim, status: lead.status, whatTodayDid: what, nextTest: lead.test, opened: false });
      continue;
    }
    const id = `XR-${String(nextId(reg.rows)).padStart(3, "0")}`;
    const row: XrRow = {
      id, title: c.title, description: `At opening (${fmtDate(date)}): ${c.description}`, opened: date, sev: c.sev, status: "Assessing", trend: c.flags.some((f) => f.channel && v.byChannel.find((b) => b.channel === f.channel)?.slMet === false) ? "Worsening" : "Stable",
      business_risk: c.risk, decision_needed: c.sev <= 2 ? `Yes — confirm severity and whether the plan of record is reforecast (phase 1 has no Forecaster); by ${addDays(date, 2)}; decider Halcyon planning lead` : "No",
      owner: "human:planner", line_of_sight: "Halcyon planning lead", expected_close: `${addDays(date, 14)} · indicative · assuming the settling tests below have data within two weeks`,
      next_action: `48-hour readout of the hypothesis table — human:planner — ${addDays(date, 2)}`, last_update: `${date} · agent:Librarian · ledger`, grade: "C",
      source: `03-forecast/variance/${date}.md`, would_change: c.would, hypotheses: `06-questions/${id}.md`, route: "performance-question",
      notes: `Sev ${c.sev} proposed by agent:Librarian (register owner to confirm); key=${c.key}; onset=${c.onset}${c.linked.length ? "; co-occurring events " + c.linked.join(", ") : ""}`,
    };
    reg.rows.push(row);
    opened.push(row);
    changes.push([date, id, "opened", "—", `Sev ${c.sev} proposed, Status Assessing`, `03-forecast/variance/${date}.md`, "agent:Librarian"]);
    movements.push(`${id} opened (Sev ${c.sev} proposed, Assessing): ${c.title}`);
    const hFile = join(book.dir, "06-questions", `${id}.md`);
    writeText(hFile, renderHypotheses(id, date, c));
    appendDay(hFile, date, whatTodayDid(c, v), c);
    touched.push({ id, h: "H-001", claim: c.hyps[0].claim, status: "open", whatTodayDid: "opened the row", nextTest: c.hyps[0].test, opened: true });
  }
  if (opened.length || touched.length) writeRegister(regPath, reg, date, changes);
  return { date, opened, touched, movements };
}

function covers(r: XrRow, c: Candidate): boolean {
  const key = /key=([^;]+)/.exec(r.notes)?.[1] ?? "";
  const onset = /onset=([0-9-]+)/.exec(r.notes)?.[1] ?? r.opened;
  if (key === c.key) return true;
  const fam = key.split("@")[0];
  if (fam !== c.family) return false;
  // same family: covered if the onsets fall inside one regime window — 42 days for a cohort's handle time (a learning
  // curve runs eight weeks), 21 for chat elapsed and offered (a ramp runs a month), 10 for supply (short breaks recur)
  const days = Math.abs(dayNumber(onset) - dayNumber(c.onset));
  const windowDays = fam.startsWith("aht|") ? 42 : fam === "aht-elapsed|chat" ? 21 : fam === "offered|book" ? 21 : 10;
  return days <= windowDays;
}

// ---------------------------------------------------------------------------
// candidates from today's flags and misses
// ---------------------------------------------------------------------------
function buildCandidates(book: Book, date: string, v: Variance, scout: ScoutResult): Candidate[] {
  const out: Candidate[] = [];
  const slMissed = (ch: Channel) => v.byChannel.find((b) => b.channel === ch)?.slMet === false;
  const slTwoDays = (ch: Channel) => slMissed(ch) && (book.demand.filter((r) => r.date === addDays(date, -1) && r.channel === ch).reduce((a, r) => a + r.handled_in_sl, 0) / Math.max(1, book.demand.filter((r) => r.date === addDays(date, -1) && r.channel === ch).reduce((a, r) => a + r.offered, 0))) * 100 < SL_TARGET[ch].pct;
  const cooc = (f: RegimeFlag) => scout.matches.filter((m) => m.matchedTo.includes(`flag: ${f.series}`)).map((m) => m.event.event_id);
  const tx = v.txChecks.find((t) => t.region === "book");
  const txFlat = tx ? tx.flat : true;

  // group unexplained flags by family @ onset. A single point beyond limits (transient) is noted in the daily note and
  // screened by the Scout; it becomes a question only when it persists (level shift) or accumulates (trend).
  const groups = new Map<string, RegimeFlag[]>();
  for (const f of scout.unexplained.filter((x) => x.kind === "level shift" || x.kind === "trend")) {
    const fam = f.seriesKey.startsWith("aht-agent-work|") ? `aht|${f.cohort}` : f.seriesKey.startsWith("offered-attainment|") ? "offered|book" : f.seriesKey.startsWith("aht-elapsed") ? "aht-elapsed|chat" : `supply|${f.cohort}`;
    const k = `${fam}@${f.onset}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(f);
  }
  for (const [key, flags] of groups) {
    const fam = key.split("@")[0], onset = key.split("@")[1];
    const f0 = flags[0];
    const chs = [...new Set(flags.map((f) => f.channel).filter(Boolean))] as Channel[];
    const anySl = chs.some(slMissed), sev1 = chs.some(slTwoDays);
    const linked = [...new Set(flags.flatMap(cooc))];
    const magText = flags.map((f) => `${f.channel ?? f.series.split(" · ")[1]} ${signed(f.magnitudePct, 0, "%")}`).join(", ");
    if (fam.startsWith("aht|")) {
      const team = TEAM_NAME[f0.cohort!];
      const down = f0.direction === "down";
      out.push({
        key, family: fam, onset, flags, linked,
        title: down
          ? `${team} handle time is trending down on ${chs.join(" and ")} from ${onset} (${magText} over 14 days) while Crestline Services' level does not move; the shape is a learning curve, not a level change [C]`
          : `${team} handle time on Meridian is a level shift ${f0.direction} on ${chs.join(" and ")} from ${onset} (${magText} against the ${f0.baselineGrade === "E" ? "carried Beacon baseline" : "in-regime baseline"}) with no learning curve visible; ${anySl ? "service level is breached" : "service level is unaffected so far"} [C]`,
        description: `${team} \`aht-agent-work\` on ${chs.join(", ")} ${down ? "is falling since" : "left control on"} ${onset} (${f0.rule}, ${down ? "downward move read as a curve, not a level change" : f0.kind}). Values on ${fmtDate(date)}: ${flags.map((f) => `${f.channel} ${n0(f.value)} s vs baseline ${n0(f.mean)} s`).join("; ")}. The plan of record carries the Beacon handle time (AS-011/AS-012) as if it applied on Meridian; whether the shift persists decides steady-state staffing for phase 3.`,
        sev: sev1 ? 1 : anySl ? 2 : 2, risk: `Requirement hours ${signed(v.byChannel.filter((b) => chs.includes(b.channel)).reduce((a, b) => a + b.handle_h, 0), 0, " h")}/day on handle time alone at the volume of ${fmtDate(date)} [C]; phase 3 sizing inherits the wrong handle time if the shift is structural and unlabelled`,
        would: down
          ? `${team} \`aht-agent-work\` on ${chs[0]} back at its pre-trend level (within ±5%) for 14 days would refute the curve; reaching ≤1.15× the Beacon baseline by day 56 after go-live would confirm it`
          : `Fourteen consecutive days of ${team} \`aht-agent-work\` on ${chs[0]} within ±5% of the plan's ${n0(v.byChannel.find((b) => b.channel === chs[0])?.aht_fc ?? 0)} s would refute the level shift; a monotone fall of ≥10% over 21 days would make it a curve (transitional)`,
        hyps: down ? [
          { claim: `${team} handle time falls toward 1.05× the Beacon baseline over eight weeks from go-live (a learning curve)`, driver: "tenure / learning curve", tag: "transitional", side: "handle-time", evFor: `trend flag ${f0.rule}, ${magText} [C]`, evAgainst: "—", test: "slope continues: AHT ≤ 1.15× Beacon by day 56 after go-live; Crestline flat over the same window", data: "02-demand demand-cohort daily, home-team and vendor, go-live → +56 d", status: "open", grade: "E" },
          { claim: "The fall is a tenure-mix change inside the cohort, not individual learning", driver: "tenure mix", tag: "transitional", side: "mix", evFor: "—", evAgainst: "cohort headcount constant at 10 [M]", test: "AHT by tenure band (supply tenure_band split) shows no within-band fall", data: "04-supply tenure_band split (not in the phase-1 mock)", status: "open", grade: "E" },
          { claim: "Easier contact types are being routed to the home team", driver: "routing / contact mix", tag: "structural", side: "mix", evFor: "—", evAgainst: "both cohorts blended on all channels per profile [A]", test: "contact-type mix by cohort differs by >10 points", data: "contact-type export by cohort (not in the phase-1 mock)", status: "open", grade: "E" },
          { claim: "Residual after decomposition", driver: "unexplained", tag: "unknown", side: "other", evFor: "", evAgainst: "", test: "", data: "", status: "open", grade: "E" },
        ] : [
          { claim: `Meridian changes the work content of a ${chs.join("/")} contact for ${team} (desktop, wrap-up flow), a level shift that persists`, driver: "platform go-live: work content", tag: "structural", side: "handle-time", evFor: `${f0.rule} on ${onset}; ${magText} [C]; no fall over the days since`, evAgainst: "—", test: "AHT flat within ±5% for 28 days after onset and the same shift appears on the East cohort at its go-live", data: "02-demand demand-cohort daily by channel; 05-events EV-004", status: "open", grade: "E" },
          { claim: `${team} is on a learning curve that will return handle time toward the Beacon level`, driver: "learning curve", tag: "transitional", side: "handle-time", evFor: "vendor statement: agents Meridian-certified (AS-014) [A]", evAgainst: `no fall between onset and today [C]`, test: "AHT falls ≥10% by day 21 after onset", data: "02-demand demand-cohort daily, 21 days", status: "open", grade: "E" },
          { claim: "The export's handle-time column changed definition at go-live (elapsed vs agent-work)", driver: "definition change", tag: "structural", side: "definition", evFor: "—", evAgainst: `on voice elapsed = agent-work by definition; chat elapsed ÷ concurrency_eff reconciles to agent-work [C]`, test: "aht_elapsed_s ÷ concurrency_eff = aht_agent_work_s within 2% on every day", data: "02-demand demand-daily, 04-supply concurrency_eff", status: "testing", grade: "C" },
          { claim: "The contact-type mix at cut-over is heavier (migration questions), inflating handle time transiently", driver: "contact-type mix at cut-over", tag: "transitional", side: "mix", evFor: "hypercare period [A]", evAgainst: "—", test: "AHT by contact type once the export carries it; or the shift decays after the 14-day hypercare window", data: "contact-type export (not in the phase-1 mock); EV-001 window", status: "open", grade: "E" },
          { claim: "Residual after decomposition", driver: "unexplained", tag: "unknown", side: "other", evFor: "", evAgainst: "", test: "", data: "", status: "open", grade: "E" },
        ],
        decomposition: decompText(v, chs),
      });
    } else if (fam === "offered|book") {
      const chsText = chs.join(", ");
      const cptd = v.ratio?.cptdActual ?? NaN;
      out.push({
        key, family: fam, onset, flags, linked,
        title: f0.direction === "down"
          ? `Offered contacts on ${chsText} stepped down from ${onset} (${magText} against the forecast-attainment baseline) with book transactions ×${n2(tx?.ratio ?? NaN)} same-weekday: the fall is in contacts per transaction, not in travel activity, which is what an unwinding re-contact or overflow loop looks like [C]`
          : `Offered contacts on ${chsText} ${f0.kind === "trend" ? "are rising" : "stepped up"} from ${onset} (${magText} against the forecast-attainment baseline) with book transactions ×${n2(tx?.ratio ?? NaN)} same-weekday and no new migrated population: ${txFlat ? "the move is in contacts per transaction, not in travel activity" : "part of the growth is transactions, the rest is contacts per transaction"}; three mechanisms fit and each has a test [C]`,
        description: `Forecast attainment (offered ÷ v000) on ${chsText} left control on ${onset} (${f0.rule}). Migrated regions unchanged since the last go-live. Contacts per transaction on Meridian ${n2(v.ratio?.cptActual ?? NaN)} [C], contacts per traveler-day ${n2(cptd)} [C]. ${anySl ? "Service level is breached on " + chs.filter(slMissed).join(", ") + "." : "Service level holds."}`,
        sev: sev1 ? 1 : f0.direction === "down" && !anySl ? 3 : 2, risk: `Requirement hours ${signed(v.byChannel.reduce((a, b) => a + b.miss_h, 0), 0, " h")}/day against the plan of record on ${fmtDate(date)} [C]; the plan holds Crestline at 20 heads (AS-018)`,
        would: f0.direction === "down"
          ? `Contacts per transaction rising again above 1.2 while service level holds would refute the unwinding reading; contacts per traveler-day ≤1.15 and voice share at 25% ±3 points for 14 days would confirm it`
          : `West transactions on Beacon flat (±5%) over the same 14 days would refute the seasonal hypothesis; contacts per traveler-day back to ≤1.15 for 7 days would refute spillover; voice share of contacts back to 25% ±3 points would refute overflow`,
        hyps: [
          { claim: "Seasonal transaction growth lifts contacts in proportion, in every region including West on Beacon", driver: "seasonal transactions", tag: "structural", side: "demand", evFor: `book transactions ×${n2(tx?.ratio ?? NaN)} same-weekday [M]; EV-005 seasonal pattern [E] in the ledger`, evAgainst: "—", test: "West (Beacon) transactions rise in step with North/East (±10%) over the same 14 days — if yes, growth is not migration", data: "02-demand transactions-daily by region, 14 days", status: "open", grade: "E" },
          { claim: "Re-contact spillover: once service level broke, repeat contacts lift contacts per transaction and per traveler-day", driver: "re-contact spillover", tag: "transitional", side: "demand", evFor: `contacts per traveler-day ${n2(cptd)} [C] vs ≈1.1 in phase 1; cpt ${n2(v.ratio?.cptActual ?? NaN)} [C]`, evAgainst: "—", test: "contacts per traveler-day rises ≥10% with a 1–3 week lag on the chat abandon rate and unwinds when SL recovers", data: "02-demand travelers-daily, demand-daily abandoned; lagged correlation", status: "open", grade: "E" },
          { claim: "Channel overflow: chat abandons turn into voice calls, doubling calls per transaction", driver: "chat → voice overflow", tag: "transitional", side: "mix", evFor: `voice share of offered ${n0((100 * (v.byChannel.find((b) => b.channel === "voice")?.offered_act ?? 0)) / Math.max(1, v.byChannel.reduce((a, b) => a + b.offered_act, 0)))}% vs 25% plan mix [C]`, evAgainst: "—", test: "voice share of contacts tracks the chat abandon rate lagged 1–3 weeks; voice share returns to 25% ±3 when chat SL recovers", data: "02-demand demand-daily by channel, 6 weeks", status: "open", grade: "E" },
          { claim: "A platform incident or same-day retry wave lifted offered with no change in travel activity", driver: "incident / retries", tag: "transitional", side: "demand", evFor: `abandons ${v.byChannel.map((b) => b.channel + " " + n1(v.scores.filter((s) => s.channel === b.channel).reduce((a, s) => a + s.abandoned_pct, 0) / Math.max(1, v.scores.filter((s) => s.channel === b.channel).length)) + "%").join(", ")} [C]`, evAgainst: "no [M] incident in 05-events for the onset date", test: "an incident record dated the onset day, or offered falling back within 2 days of abandons falling", data: "05-events; 02-demand demand-daily abandoned, daily", status: "open", grade: "E" },
          { claim: "Contact counting changed (sessions vs threads) in the export", driver: "definition change", tag: "structural", side: "definition", evFor: "—", evAgainst: "export version unchanged (v001) [M]", test: "export version and definition change history unchanged", data: "02-demand version column; 01-definitions change history", status: "open", grade: "E" },
          { claim: "Residual after decomposition", driver: "unexplained", tag: "unknown", side: "other", evFor: "", evAgainst: "", test: "", data: "", status: "open", grade: "E" },
        ],
        decomposition: decompText(v, chs.length ? chs : CHANNELS),
      });
    } else if (fam === "aht-elapsed|chat") {
      out.push({
        key, family: fam, onset, flags, linked,
        title: `Chat \`aht-elapsed\` left control ${f0.direction} from ${onset} (${signed(f0.magnitudePct, 0, "%")}) while \`aht-agent-work\` did not: the movement is concurrency or timeout, not work content [C]`,
        description: `Chat elapsed handle time ${n0(f0.value)} s vs baseline ${n0(f0.mean)} s (${f0.rule}). Agent-work handle time is within its limits. Effective concurrency ${n2(book.supply.find((r) => r.date === date && r.cohort === "vendor")?.concurrency_eff ?? NaN)} [E] on ${fmtDate(date)}.`,
        sev: 3, risk: "None to staffing if agent-work is flat; a report that reads elapsed as AHT would over-state chat requirement by the concurrency factor [C]",
        would: "aht_elapsed_s ÷ concurrency_eff diverging from aht_agent_work_s by >5% would mean a work-content change after all",
        hyps: [
          { claim: "Effective concurrency rises with load, stretching elapsed time per session with no change in agent work", driver: "load-driven concurrency", tag: "transitional", side: "handle-time", evFor: `agent-work in control [C]; concurrency_eff up [E]`, evAgainst: "—", test: "elapsed ÷ concurrency_eff = agent-work within 2% every day", data: "02-demand demand-daily chat; 04-supply concurrency_eff", status: "testing", grade: "C" },
          { claim: "The chat inactivity timeout was changed", driver: "timeout policy", tag: "structural", side: "definition", evFor: "—", evAgainst: "no product-change event in 05-events [M]", test: "platform configuration record dated at onset", data: "05-events; platform config export", status: "open", grade: "E" },
          { claim: "Work content per chat rose (a real handle-time shift)", driver: "work content", tag: "structural", side: "handle-time", evFor: "—", evAgainst: "aht-agent-work within limits [C]", test: "aht-agent-work leaves control in the same direction", data: "02-demand demand-cohort chat", status: "open", grade: "E" },
          { claim: "Residual after decomposition", driver: "unexplained", tag: "unknown", side: "other", evFor: "", evAgainst: "", test: "", data: "", status: "open", grade: "E" },
        ],
        decomposition: decompText(v, ["chat"]),
      });
    } else {
      const team = TEAM_NAME[f0.cohort!];
      const down = f0.direction === "down" || f0.seriesKey.startsWith("shrink");
      const shrinkFlag = flags.some((f) => f.seriesKey.startsWith("shrink"));
      const sup = book.supply.find((r) => r.date === date && r.cohort === f0.cohort);
      const prevSched = book.supply.find((r) => r.date === addDays(date, -7) && r.cohort === f0.cohort)?.scheduled_h ?? NaN;
      const schedUnchanged = sup && Number.isFinite(prevSched) ? Math.abs(sup.scheduled_h - prevSched) < 0.5 : false;
      const demandFlagsToday = v.flags.filter((f) => f.side === "demand");
      const pullDays = book.supply.filter((r) => r.cohort === f0.cohort && r.date >= onset && r.date <= date);
      const lostH = pullDays.reduce((a, r) => a + (r.scheduled_h * r.shrink_unplanned_pct) / 100, 0);
      const unplannedRange = pullDays.length > 1 ? `${n1(Math.min(...pullDays.map((r) => r.shrink_unplanned_pct)))}–${n1(Math.max(...pullDays.map((r) => r.shrink_unplanned_pct)))}%` : `${n1(sup?.shrink_unplanned_pct ?? NaN)}%`;
      const dayRange = onset === date ? fmtDate(date) : `${fmtDate(onset).split(" ")[0]}–${fmtDate(date)}`;
      const retriesClause = demandFlagsToday.length
        ? txFlat ? "the same-day contact rise is consistent with retries of abandons" : `transactions moved ×${n2(tx?.ratio ?? NaN)} same-weekday, so part of the contact rise may be real demand`
        : txFlat ? "the demand side did not move" : `transactions moved ×${n2(tx?.ratio ?? NaN)} same-weekday alongside it`;
      out.push({
        key, family: fam, onset, flags, linked,
        title: down
          ? shrinkFlag
            ? `${team} lost ${n0(lostH)} productive hours to unplanned shrinkage on ${dayRange} (${unplannedRange} of schedule vs ≈5% baseline) with the schedule ${schedUnchanged ? "unchanged" : "changed"}: the break is supply-side, in 04-supply, and ${retriesClause} [C]`
            : `${team} productive hours ${f0.kind === "trend" ? "are trending down" : "stepped down"} from ${onset} (${signed(f0.magnitudePct, 0, "%")} vs baseline) with the schedule ${schedUnchanged ? "unchanged" : "changed"}: the break is supply-side, in 04-supply [C]`
          : `${team} productive hours stepped up from ${onset} (${signed(f0.magnitudePct, 0, "%")} vs baseline) with no change in the plan of record: capacity moved, not demand [C]`,
        description: `${f0.series} left control on ${onset} (${f0.rule}, ${f0.kind}). ${pullDays.map((r) => `${fmtDate(r.date)}: scheduled ${n1(r.scheduled_h)} h, productive ${n1(r.productive_h)} h, unplanned shrinkage ${n1(r.shrink_unplanned_pct)}%`).join("; ")} [M]/[C]. Transactions ×${n2(tx?.ratio ?? NaN)} same-weekday on ${fmtDate(date)} (${txFlat ? "flat" : "moved"}) [M].${linked.length ? " Co-occurring ledger events: " + linked.join(", ") + "." : ""}`,
        sev: down ? (sev1 || chs.some(slMissed) || v.byChannel.some((b) => !b.slMet) ? 2 : 3) : 4,
        risk: down ? `Service level ${v.byChannel.map((b) => `${b.channel} ${n1(b.sl_act)}%`).join(", ")} on ${fmtDate(date)} against targets [C]; ${n1(v.supplyGapH)} h lost [C]` : `None; capacity above plan by ${signed(f0.magnitudePct, 0, "%")} [C], cost side only`,
        would: down ? `Productive hours back within limits tomorrow with the schedule unchanged would make it a transient pull; a second week at this level would make it a structural shrinkage change` : `Headcount column stepping up in 04-supply would make it a structural add; productive hours back to baseline within a week would make it overtime`,
        hyps: down ? [
          { claim: "Agents were pulled off the published schedule into a training or briefing session", driver: "off-schedule training pull", tag: "transitional", side: "supply", evFor: `headcount_in_training ${sup?.headcount_in_training ?? "?"} on ${fmtDate(date)} with agents_scheduled unchanged [M]${linked.includes("EV-007") ? "; EV-007 vendor notice [A] co-occurs" : ""}`, evAgainst: "—", test: "vendor roster or notice names the session; productive hours return to baseline the day after it ends", data: "04-supply supply-daily next 3 days; vendor notice", status: "testing", grade: "E" },
          { claim: "An absence cluster (unplanned) reduced staffed hours", driver: "absence", tag: "transitional", side: "supply", evFor: "—", evAgainst: `staffed ${n1(sup?.staffed_h ?? NaN)} h vs scheduled ${n1(sup?.scheduled_h ?? NaN)} h: absence is normal [M]`, test: "staffed ÷ scheduled below 0.9", data: "04-supply supply-daily", status: "refuted", grade: "C" },
          { claim: "A system-access loss stopped scheduled agents from working", driver: "platform / access incident", tag: "transitional", side: "supply", evFor: "—", evAgainst: "no [M] incident in 05-events on the date", test: "incident record; interval productive profile shows a gap", data: "05-events; agent-state records (not in the phase-1 mock)", status: "open", grade: "E" },
          { claim: "The day reads as a demand spike only because retries of abandoned contacts lift offered", driver: "retry artefact", tag: "transitional", side: "demand", evFor: `abandons up [M]${txFlat ? `; transactions flat ×${n2(tx?.ratio ?? NaN)} [M]` : ""}`, evAgainst: txFlat ? "—" : `transactions moved ×${n2(tx?.ratio ?? NaN)} same-weekday [M]: part of the rise may be real demand`, test: "offered rise ≈ 0.3 × abandoned; transactions flat; falls back when hours return", data: "02-demand demand-daily; transactions-daily", status: "testing", grade: "C" },
          { claim: "Residual after decomposition", driver: "unexplained", tag: "unknown", side: "other", evFor: "", evAgainst: "", test: "", data: "", status: "open", grade: "E" },
        ] : [
          { claim: "Headcount was added to the cohort", driver: "headcount add", tag: "structural", side: "supply", evFor: `headcount ${sup?.headcount ?? "?"} [M]${linked.includes("EV-010") ? "; EV-010 change request [A] co-occurs" : ""}`, evAgainst: "—", test: "headcount column steps and stays for 4 weeks", data: "04-supply supply-daily", status: "testing", grade: "C" },
          { claim: "Overtime lifted productive hours without a headcount change", driver: "overtime", tag: "transitional", side: "supply", evFor: "—", evAgainst: "—", test: "scheduled hours per head above 8 × scheduled agents", data: "04-supply supply-daily", status: "open", grade: "E" },
          { claim: "The schedule pattern changed (more weekday shifts)", driver: "schedule change", tag: "structural", side: "supply", evFor: "—", evAgainst: "—", test: "agents_scheduled ÷ headcount changes by >5 points", data: "04-supply supply-daily", status: "open", grade: "E" },
          { claim: "Residual after decomposition", driver: "unexplained", tag: "unknown", side: "other", evFor: "", evAgainst: "", test: "", data: "", status: "open", grade: "E" },
        ],
        decomposition: decompText(v, CHANNELS),
      });
    }
  }

  // persistent tolerance miss against the plan (three consecutive days), book level, one row
  const missDays = (kind: "offered" | "aht") => [0, 1, 2].every((i) => {
    const d = addDays(date, -i);
    const a = book.demand.filter((r) => r.date === d), f = book.forecast.filter((r) => r.date === d);
    if (!a.length || !f.length) return false;
    return CHANNELS.some((ch) => {
      const oa = a.filter((r) => r.channel === ch).reduce((s, r) => s + r.offered, 0), of = f.filter((r) => r.channel === ch).reduce((s, r) => s + r.offered_fc, 0);
      const aa = a.find((r) => r.channel === ch)?.aht_agent_work_s ?? 0, af = f.find((r) => r.channel === ch)?.aht_agent_work_fc_s ?? 0;
      return kind === "offered" ? of > 0 && Math.abs((oa - of) / of) * 100 > TOL_OFFERED_PCT : af > 0 && Math.abs((aa - af) / af) * 100 > TOL_AHT_PCT;
    });
  });
  if (missDays("offered") && v.ratio) {
    const r = v.ratio;
    const chs = v.byChannel.filter((b) => Math.abs(b.offered_dpct) > TOL_OFFERED_PCT).map((b) => b.channel);
    const worst = v.byChannel.reduce((a, b) => (Math.abs(b.offered_dpct) > Math.abs(a.offered_dpct) ? b : a));
    const onset = addDays(date, -2);
    out.push({
      key: `offered|book@miss`, family: "offered|book", onset, flags: [], linked: [],
      title: `Offered contacts on Meridian run ${n1(r.cptActual / r.cptPlan)}× the plan of record on ${chs.join(", ")} for three consecutive days because the plan carried the whole-book Beacon ratio ${n2(r.cptPlan)} while the migrated regions' own Beacon ratio was ${r.beaconByRegion.map((b) => `${b.region} ${n2(b.cpt)}`).join(", ")}: a composition error in the plan, not a demand change [C]`,
      description: `Contacts per transaction on Meridian ${n2(r.cptActual)} [C] vs plan ${n2(r.cptPlan)} [A]; Beacon history by region ${r.beaconByRegion.map((b) => `${b.region} ${n2(b.cpt)} [M]`).join(", ")}, whole book ${n2(r.beaconBook)} [M]. Offered ${signed(worst.offered_dpct, 0, "%")} vs forecast on ${worst.channel} on ${fmtDate(date)}. Service level ${v.byChannel.every((b) => b.slMet) ? "holds on every channel (phase-1 buffer)" : "is breached on " + v.byChannel.filter((b) => !b.slMet).map((b) => b.channel).join(", ")}.`,
      sev: 2, risk: `Every requirement in the plan of record is understated by the ratio factor (≈${n1(r.cptActual / r.cptPlan)}×) [C]; phase 3 sizing built the same way is wrong before it starts`,
      would: `Meridian contacts per transaction for North within ±15% of North's Beacon ratio for 14 days confirms composition, not behaviour; a per-region ratio drifting above 1.2 would mean re-contact or counting has changed too`,
      hyps: [
        { claim: "The plan applied the whole-book Beacon ratio to a region whose own ratio is 2.6× higher (composition), so the miss is the plan's, not the region's", driver: "composition trap in contacts-per-transaction", tag: "structural", side: "definition", evFor: `North Beacon cpt ${n2(r.beaconByRegion[0]?.cpt ?? NaN)} [M] vs whole-book ${n2(r.beaconBook)} [M]; Meridian cpt ${n2(r.cptActual)} [C]`, evAgainst: "—", test: "Meridian per-region cpt within ±15% of the same region's Beacon cpt for 14 days", data: "02-demand beacon-daily, travelers-daily, transactions-daily", status: "testing", grade: "C" },
        { claim: "Meridian counts contacts differently from Beacon (sessions vs threads), inflating the ratio", driver: "definition change at go-live", tag: "structural", side: "definition", evFor: "—", evAgainst: `Meridian cpt ${n2(r.cptActual)} ≈ North Beacon ${n2(r.beaconByRegion[0]?.cpt ?? NaN)}: no inflation beyond composition [C]`, test: "Meridian cpt exceeds the region's Beacon cpt by >15% with flat transactions", data: "02-demand travelers-daily vs beacon-daily", status: "testing", grade: "C" },
        { claim: "Post-go-live re-contacts inflate the ratio transiently", driver: "re-contact at cut-over", tag: "transitional", side: "demand", evFor: "—", evAgainst: "—", test: "contacts per traveler-day falls to ≤1.15 within 3 weeks of go-live", data: "02-demand travelers-daily, 21 days", status: "open", grade: "E" },
        { claim: "The 0.20 benchmark cross-check (AS-009) does not apply: it is a post-bot ratio and Halcyon's bot is off (EV-002)", driver: "carried benchmark from another book", tag: "structural", side: "definition", evFor: "EV-002 bot OFF [M]; AS-021 [A]", evAgainst: "—", test: "none needed: the benchmark's condition is contradicted by an [M] record", data: "05-events EV-002; v000 register AS-009/AS-021", status: "supported", grade: "M" },
        { claim: "Residual after decomposition", driver: "unexplained", tag: "unknown", side: "other", evFor: "", evAgainst: "", test: "", data: "", status: "open", grade: "E" },
      ],
      decomposition: decompText(v, CHANNELS),
    });
  }
  return out;
}

function decompText(v: Variance, chs: Channel[]): string {
  const rows = v.byChannel.filter((b) => chs.includes(b.channel));
  const s = (f: (b: typeof rows[number]) => number) => rows.reduce((a, b) => a + f(b), 0);
  const miss = s((b) => b.miss_h);
  const share = (x: number) => (miss !== 0 ? `${n0((100 * x) / Math.abs(miss))}%` : "—");
  return table(["component", "hours", "share of miss", "grade"], [
    ["volume", signed(s((b) => b.volume_h), 1), share(s((b) => b.volume_h)), "[C]"],
    ["handle time", signed(s((b) => b.handle_h), 1), share(s((b) => b.handle_h)), "[C]"],
    ["mix", signed(s((b) => b.mix_h), 1), share(s((b) => b.mix_h)), "[C]"],
    ["supply (hours lost to unplanned shrinkage, beside the miss)", signed(s((b) => b.supply_h), 1), "—", "[C]"],
    ["residual (interaction Δvolume × Δhandle time)", signed(s((b) => b.residual_h), 1), share(s((b) => b.residual_h)), "[C]"],
  ]);
}

function whatTodayDid(c: Candidate, v: Variance): string {
  if (c.flags.length) return c.flags.map((f) => `${f.series}: ${f.kind} (${f.rule}), ${signed(f.magnitudePct, 0, "%")} vs baseline ${n1(f.mean)}, onset ${f.onset}`).join("; ") + `; SL ${v.byChannel.map((b) => `${b.channel} ${n1(b.sl_act)}%`).join(", ")}`;
  return `offered ${v.byChannel.map((b) => `${b.channel} ${signed(b.offered_dpct, 0, "%")}`).join(", ")} vs v000; cpt ${n2(v.ratio?.cptActual ?? NaN)}; SL ${v.byChannel.map((b) => `${b.channel} ${n1(b.sl_act)}%`).join(", ")}`;
}

// ---------------------------------------------------------------------------
// hypothesis file
// ---------------------------------------------------------------------------
function renderHypotheses(id: string, date: string, c: Candidate): string {
  const hyps: Hyp[] = c.hyps.map((h, i) => ({ id: i === c.hyps.length - 1 ? "H-res" : `H-${String(i + 1).padStart(3, "0")}`, ...h }));
  return `# Hypothesis table — ${id}

**Question (title sentence):** ${c.title}
**Opened:** ${date} · **Owner:** agent:Librarian (phase 1; the CausalAnalyst takes ownership in phase 2) · **Rung reached:** 1
**DAG:** not drawn in phase 1. Nodes named: ${[...new Set(c.hyps.map((h) => h.driver))].join(" → outcome; ")} → outcome.
**Confounders named:** ${c.linked.length ? c.linked.join(", ") + " co-occur in the ledger" : "none logged in 05-events for the onset date"}${c.family === "offered|book" ? "; the East go-live (EV-004) and the seasonal ramp (EV-005) start on the same day by the calendar" : ""}

Rules: every row has a **structural or transitional** tag; \`unknown\` is legal but blocks any plan that cites the row. Association is never written as cause: a row reaches \`supported\` at rung 1 only as "associated with"; a causal claim needs rung 2 or above and an Evaluator pass. The residual, after decomposition, is its own row, labelled as residual.

${table(["id", "claim", "driver", "structural / transitional", "evidence for", "evidence against", "test that settles it", "data needed", "status", "grade"],
  hyps.map((h) => [h.id, h.claim, h.driver, h.tag, h.evFor || "—", h.evAgainst || "—", h.test || "—", h.data || "—", h.status, `[${h.grade}]`]))}

## Decomposition (PostAnalyst, rung 1)

Method: sequential · Period: ${date} · Baseline: forecast v000

${c.decomposition}

## What would change the answer

${c.would}.

## Evaluator

Result: pending · Date: — · Notes: phase 1 has no Evaluator stage; rung 1 only, grades present, definitions cited by slug.

## What each day's data did

| date | observation | hypotheses touched |
|---|---|---|
`;
}

/** Re-render the evidence columns of a hypothesis table from today's candidate, keeping ids, status and grade. */
function refreshEvidence(hFile: string, c: Candidate): void {
  const md = readIfExists(hFile);
  if (!md) return;
  const t = parseTable(md, "id");
  if (!t) return;
  const rows = t.rows.map((r, i) => {
    const h = c.hyps[i];
    if (!h || r[1] !== h.claim) return r;
    return [r[0], r[1], r[2], r[3], h.evFor || "—", h.evAgainst || "—", r[6], r[7], r[8], r[9]];
  });
  const lines = md.split("\n");
  const out = [...lines.slice(0, t.start), ...table(t.header, rows).split("\n"), ...lines.slice(t.end)].join("\n");
  writeText(hFile, out);
}

function appendDay(hFile: string, date: string, what: string, c: Candidate): { id: string; claim: string; status: string; test: string } {
  const md = readIfExists(hFile) ?? renderHypotheses("XR-?", date, c);
  const t = parseTable(md, "id");
  const lead = t && t.rows.length ? { id: t.rows[0][0], claim: t.rows[0][1], status: t.rows[0][8], test: t.rows[0][6] } : { id: "H-001", claim: c.hyps[0].claim, status: "open", test: c.hyps[0].test };
  const dt = parseTable(md, "date");
  const rows = (dt?.rows ?? []).filter((r) => r[0] !== date);
  rows.push([date, what, lead.id]);
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  const head = dt ? md.split("\n").slice(0, dt.start).join("\n") : md.trimEnd();
  writeText(hFile, head + "\n" + table(["date", "observation", "hypotheses touched"], rows) + "\n");
  return lead;
}

// ---------------------------------------------------------------------------
// register read / write
// ---------------------------------------------------------------------------
/**
 * Read the register. With `asOf`, reconstruct the state on that date from the change log: rows opened later are
 * dropped and last_update / trend are rolled back to the latest change-log entry on or before the date. Reports are
 * dispatches and must not see rows the register did not hold on their issue date.
 */
export function readRegister(path: string, asOf?: string): { rows: XrRow[]; md: string } {
  const md = readIfExists(path) ?? "";
  const t = parseTable(md, "ID");
  let rows: XrRow[] = (t?.rows ?? []).filter((r) => r.length >= 20).map((r) => ({
    id: r[0], title: r[1], description: r[2], opened: r[3], sev: Number(r[4]), status: r[5], trend: r[6], business_risk: r[7], decision_needed: r[8], owner: r[9], line_of_sight: r[10],
    expected_close: r[11], next_action: r[12], last_update: r[13], grade: r[14].replace(/[\[\]]/g, "") as Grade, source: r[15], would_change: r[16], hypotheses: r[17], route: r[18], notes: r[19],
  }));
  if (asOf) {
    rows = rows.filter((r) => r.opened <= asOf);
    const cl = parseTable(md, "Date");
    for (const r of rows) {
      const mine = (cl?.rows ?? []).filter((c) => c[1] === r.id);
      const upTo = mine.filter((c) => c[0] <= asOf);
      const luRows = upTo.filter((c) => c[2] === "last_update");
      const luAll = mine.filter((c) => c[2] === "last_update");
      if (luRows.length) r.last_update = luRows[luRows.length - 1][4];
      else if (luAll.length) r.last_update = luAll[0][3];
      const trRows = upTo.filter((c) => c[2] === "trend");
      const trAll = mine.filter((c) => c[2] === "trend");
      if (trRows.length) r.trend = trRows[trRows.length - 1][4];
      else if (trAll.length) r.trend = trAll[0][3];
      for (const field of ["description"] as const) {
        const fr = upTo.filter((c) => c[2] === field), fa = mine.filter((c) => c[2] === field);
        if (fr.length) r[field] = fr[fr.length - 1][4];
        else if (fa.length) r[field] = field === "description" ? r.description.replace(/ · Latest \([^)]+\): .*$/, "") : fa[0][3];
      }
      const stRows = upTo.filter((c) => c[2] === "status");
      const stAll = mine.filter((c) => c[2] === "status");
      if (stRows.length) r.status = stRows[stRows.length - 1][4];
      else if (stAll.length) r.status = stAll[0][3];
    }
  }
  return { rows, md };
}
function nextId(rows: XrRow[]): number { return rows.reduce((m, r) => Math.max(m, Number(r.id.replace("XR-", ""))), 0) + 1; }

function writeRegister(path: string, reg: { rows: XrRow[]; md: string }, date: string, changes: string[][]): void {
  let md = reg.md;
  const lines = md.split("\n");
  // header line
  const open = reg.rows.filter((r) => r.status !== "Resolved" && r.status !== "Closed");
  const count = (s: number) => open.filter((r) => r.sev === s).length;
  const hi = lines.findIndex((l) => l.startsWith("Register as of:"));
  const prevReport = /Previous report: ([^·]+)/.exec(lines[hi] ?? "")?.[1]?.trim() ?? "none";
  if (hi >= 0) lines[hi] = `Register as of: ${date} · Previous report: ${prevReport} · Open: Sev1 ${count(1)} · Sev2 ${count(2)} · Sev3 ${count(3)} · Sev4 ${count(4)}`;
  md = lines.join("\n");
  // register table
  const t = parseTable(md, "ID")!;
  const rowsMd = table(REGISTER_HEADER, reg.rows.map((r) => [r.id, r.title, r.description, r.opened, String(r.sev), r.status, r.trend, r.business_risk, r.decision_needed, r.owner, r.line_of_sight, r.expected_close, r.next_action, r.last_update, `[${r.grade}]`, r.source, r.would_change, r.hypotheses, r.route, r.notes]));
  const before = md.split("\n").slice(0, t.start).join("\n");
  const after = md.split("\n").slice(t.end).join("\n");
  md = before + "\n" + rowsMd + "\n" + after;
  // change log
  const cl = parseTable(md, "Date")!;
  const clRows = [...cl.rows, ...changes];
  const clMd = table(["Date", "ID", "Field", "From", "To", "Extract source", "Actor"], clRows);
  const b2 = md.split("\n").slice(0, cl.start).join("\n"), a2 = md.split("\n").slice(cl.end).join("\n");
  md = b2 + "\n" + clMd + "\n" + a2;
  writeText(path, md);
}
