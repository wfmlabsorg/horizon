#!/usr/bin/env bun
/**
 * HORIZON · phase 1 clock runner (deterministic, no LLM calls, bun built-ins only)
 *
 *   bun run Tools/run-clock.ts daily --book halcyon --date 2026-07-22
 *   bun run Tools/run-clock.ts daily --book halcyon --from 2026-07-21 --to 2026-11-16
 *   bun run Tools/run-clock.ts weekly --book halcyon --week 2026-W31          (or --from 2026-W30 --to 2026-W46)
 *   bun run Tools/run-clock.ts register-report --book halcyon --date 2026-09-13
 *   bun run Tools/run-clock.ts demo --book halcyon        (the scripted demo: every daily, every completed week's review
 *                                                          after its Sunday, register reports on 2026-09-13 and 2026-11-16,
 *                                                          all in calendar order so each dispatch sees the ledgers as they were)
 *
 * Stages live in Tools/clock/, one module per agent. Outputs go into books/<book>/ (ledgers and dispatches).
 */
import { loadBook, addDays, isoWeek } from "./clock/book";
import { runDaily, runWeekly, runRegisterReport } from "./clock/coordinator";

function arg(name: string): string | undefined { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; }
const cmd = process.argv[2];
const bookName = arg("book") ?? "halcyon";
const log = (s: string) => console.log(s);

if (!cmd || ["-h", "--help", "help"].includes(cmd)) {
  console.log("usage: bun run Tools/run-clock.ts <daily|weekly|register-report|demo> --book <client> [--date YYYY-MM-DD | --from A --to B | --week YYYY-Www]");
  process.exit(0);
}
const book = loadBook(bookName);
let errors = 0;
try {
  if (cmd === "daily") {
    const from = arg("from") ?? arg("date"), to = arg("to") ?? from;
    if (!from) throw new Error("daily needs --date or --from/--to");
    for (let d = from; d <= to!; d = addDays(d, 1)) runDaily(book, d, log);
  } else if (cmd === "weekly") {
    const wk = arg("week");
    if (wk) runWeekly(book, wk, log);
    else {
      const from = arg("from"), to = arg("to");
      if (from && to && /W/.test(from)) {
        let cur = from;
        while (cur <= to) { runWeekly(book, cur, log); const { monday } = isoWeek(cur.includes("W") ? weekMonday(cur) : cur); cur = isoWeek(addDays(monday, 7)).label; }
      } else if (arg("date")) runWeekly(book, isoWeek(arg("date")!).label, log);
      else throw new Error("weekly needs --week YYYY-Www, --date, or --from/--to week labels");
    }
  } else if (cmd === "demo") {
    const from = arg("from") ?? "2026-07-21", to = arg("to") ?? "2026-11-16";
    const registerDays = (arg("register") ?? "2026-09-13,2026-11-16").split(",");
    for (let d = from; d <= to; d = addDays(d, 1)) {
      runDaily(book, d, log);
      if (isoWeek(d).sunday === d) runWeekly(book, isoWeek(d).label, log);
      if (registerDays.includes(d)) runRegisterReport(book, d, log);
    }
  } else if (cmd === "register-report") {
    const d = arg("date");
    if (!d) throw new Error("register-report needs --date");
    runRegisterReport(book, d, log);
  } else throw new Error(`unknown command ${cmd}`);
} catch (e) {
  errors++;
  console.error(`error: ${(e as Error).message}`);
}
function weekMonday(label: string): string { const m = /^(\d{4})-W(\d{2})$/.exec(label)!; const jan4 = Date.UTC(Number(m[1]), 0, 4); const dow = (new Date(jan4).getUTCDay() + 6) % 7; return new Date(jan4 - dow * 86400000 + (Number(m[2]) - 1) * 7 * 86400000).toISOString().slice(0, 10); }
process.exit(errors ? 1 : 0);
