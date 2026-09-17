/** Book loading, date arithmetic, CHANGELOG append and markdown helpers. All reads are cached per process. */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync } from "fs";
import { join, resolve, relative } from "path";
import { parseCsv, num } from "./csv";
import type { Book, DemandRow, IntervalRow, CohortRow, TxRow, TravelerRow, BeaconRow, SupplyRow, ForecastRow, EventRow, Region, Channel, CohortKey, Grade } from "./types";

export const ROOT = resolve(import.meta.dir, "..", "..");
export const DAY1 = "2026-07-20"; // migration day 1 (Monday)

// ---------- dates ----------
export function toUtc(date: string): number { const [y, m, d] = date.split("-").map(Number); return Date.UTC(y, m - 1, d); }
export function fromUtc(ms: number): string { return new Date(ms).toISOString().slice(0, 10); }
export function addDays(date: string, n: number): string { return fromUtc(toUtc(date) + n * 86400000); }
export function dayNumber(date: string): number { return Math.round((toUtc(date) - toUtc(DAY1)) / 86400000) + 1; }
export function dowIndex(date: string): number { return (new Date(toUtc(date)).getUTCDay() + 6) % 7; } // 0 = Monday
export const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export function isWeekend(date: string): boolean { return dowIndex(date) >= 5; }
export function isoWeek(date: string): { year: number; week: number; label: string; monday: string; sunday: string } {
  const d = new Date(toUtc(date));
  const dayNum = (d.getUTCDay() + 6) % 7;
  const monday = fromUtc(toUtc(date) - dayNum * 86400000);
  const thursday = new Date(toUtc(monday) + 3 * 86400000);
  const year = thursday.getUTCFullYear();
  const jan4 = Date.UTC(year, 0, 4);
  const jan4Dow = (new Date(jan4).getUTCDay() + 6) % 7;
  const week1Monday = jan4 - jan4Dow * 86400000;
  const week = Math.round((toUtc(monday) - week1Monday) / (7 * 86400000)) + 1;
  return { year, week, label: `${year}-W${String(week).padStart(2, "0")}`, monday, sunday: addDays(monday, 6) };
}
export function weekFromLabel(label: string): { monday: string; sunday: string; label: string } {
  const m = /^(\d{4})-W(\d{2})$/.exec(label);
  if (!m) throw new Error(`bad week label ${label}; expected YYYY-Www`);
  const year = Number(m[1]), week = Number(m[2]);
  const jan4 = Date.UTC(year, 0, 4);
  const jan4Dow = (new Date(jan4).getUTCDay() + 6) % 7;
  const monday = fromUtc(jan4 - jan4Dow * 86400000 + (week - 1) * 7 * 86400000);
  return { monday, sunday: addDays(monday, 6), label };
}
export function businessDaysBetween(a: string, b: string): number { // business days from a to b (a < b)
  let n = 0;
  for (let d = addDays(a, 1); d <= b; d = addDays(d, 1)) if (!isWeekend(d)) n++;
  return n;
}
export function fmtDate(d: string): string { const [y, m, dd] = d.split("-"); const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1]; return `${Number(dd)} ${M}${y === "2026" ? "" : " " + y}`; }

// ---------- loading ----------
const cache = new Map<string, Book>();
function ledgerFiles(dir: string, what: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.startsWith(what + "-") && f.endsWith(".csv")).sort();
}
function readAll<T>(dir: string, what: string, map: (r: Record<string, string>, file: string) => T): { rows: T[]; files: string[] } {
  const files = ledgerFiles(dir, what);
  // keep only the highest version per period
  const latest = new Map<string, string>();
  for (const f of files) {
    const m = /^(.*)-v(\d{3})\.csv$/.exec(f);
    if (!m) continue;
    const prev = latest.get(m[1]);
    if (!prev || prev < f) latest.set(m[1], f);
  }
  const rows: T[] = [];
  const used = [...latest.values()].sort();
  for (const f of used) for (const r of parseCsv(readFileSync(join(dir, f), "utf8"))) rows.push(map(r, f));
  return { rows, files: used };
}

export function loadBook(client: string): Book {
  if (cache.has(client)) return cache.get(client)!;
  const dir = join(ROOT, "books", client);
  if (!existsSync(dir)) throw new Error(`no book at ${dir}`);
  const demandDir = join(dir, "02-demand"), supplyDir = join(dir, "04-supply");
  const demand = readAll<DemandRow>(demandDir, "demand-daily", (r, file) => ({
    date: r.date, day: num(r.day), region: r.region as Region, channel: r.channel as Channel, platform: r.platform,
    offered: num(r.offered), handled: num(r.handled), handled_in_sl: num(r.handled_in_sl), abandoned: num(r.abandoned),
    asa_s: num(r.asa_s), sl_pct: num(r.sl_pct), aht_elapsed_s: num(r.aht_elapsed_s), aht_agent_work_s: num(r.aht_agent_work_s), version: r.version, file,
  }));
  const interval = readAll<IntervalRow>(demandDir, "demand-interval", (r) => ({ date: r.date, interval_start: r.interval_start, channel: r.channel as Channel, offered: num(r.offered), handled: num(r.handled), handled_in_sl: num(r.handled_in_sl), abandoned: num(r.abandoned) }));
  const cohort = readAll<CohortRow>(demandDir, "demand-cohort", (r, file) => ({ date: r.date, day: num(r.day), cohort: r.cohort as CohortKey, team: r.team, channel: r.channel as Channel, handled: num(r.handled), aht_elapsed_s: num(r.aht_elapsed_s), aht_agent_work_s: num(r.aht_agent_work_s), productive_h: num(r.productive_h), file }));
  const tx = readAll<TxRow>(demandDir, "transactions-daily", (r) => ({ date: r.date, region: r.region as Region, platform: r.platform, transactions: num(r.transactions) }));
  const travelers = readAll<TravelerRow>(demandDir, "travelers-daily", (r) => ({ date: r.date, contacts: num(r.contacts), active_travelers: num(r.active_travelers), contacts_per_traveler_day: num(r.contacts_per_traveler_day), transactions_migrated_regions: num(r.transactions_migrated_regions), contacts_per_transaction: num(r.contacts_per_transaction) }));
  const beacon = readAll<BeaconRow>(demandDir, "beacon-daily", (r) => ({ date: r.date, day: num(r.day), region: r.region as Region, transactions: num(r.transactions), contacts_total: num(r.contacts_total), contacts_voice: num(r.contacts_voice), contacts_messaging: num(r.contacts_messaging), contacts_email: num(r.contacts_email), contacts_per_transaction: num(r.contacts_per_transaction), voice_aht_agent_work_s: num(r.voice_aht_agent_work_s), messaging_aht_agent_work_s: num(r.messaging_aht_agent_work_s), email_aht_agent_work_s: num(r.email_aht_agent_work_s) }));
  const supply = readAll<SupplyRow>(supplyDir, "supply-daily", (r, file) => ({
    date: r.date, day: num(r.day), cohort: r.cohort as CohortKey, team: r.team, scheduled_h: num(r.scheduled_h), staffed_h: num(r.staffed_h), productive_h: num(r.productive_h),
    shrink_planned_pct: num(r.shrink_planned_pct), shrink_unplanned_pct: num(r.shrink_unplanned_pct), occupancy_pct: num(r.occupancy_pct), concurrency_eff: num(r.concurrency_eff),
    headcount: num(r.headcount), headcount_in_training: num(r.headcount_in_training), agents_scheduled: num(r.agents_scheduled), status: r.status, version: r.version, file,
  }));
  const forecast = parseCsv(readFileSync(join(dir, "03-forecast", "v000-plan-of-record", "forecast-daily.csv"), "utf8")).map<ForecastRow>((r) => ({
    date: r.date, day: num(r.day), region: r.region as Region, channel: r.channel as Channel, offered_fc: num(r.offered_fc), aht_agent_work_fc_s: num(r.aht_agent_work_fc_s),
    fc_transactions: num(r.fc_transactions), fc_required_productive_h: num(r.fc_required_productive_h), planned_crestline_heads: num(r.planned_crestline_heads), planned_home_heads: num(r.planned_home_heads),
  }));
  const events = parseCsv(readFileSync(join(dir, "05-events", "events.csv"), "utf8")).map<EventRow>((r) => ({
    event_id: r.event_id, type: r.type, start_day: num(r.start_day), start_date: r.start_date, end_day: num(r.end_day), end_date: r.end_date, effect_window_days: num(r.effect_window_days),
    region: r.region, channel_scope: r.channel_scope, planned: r.planned === "yes", description: r.description, expected_signature: r.expected_signature,
    grade: (/\[([MCEA])\]/.exec(r.grade)?.[1] ?? "A") as Grade, source: r.source,
  }));
  const book: Book = { client, dir, root: ROOT, demand: demand.rows, interval: interval.rows, cohort: cohort.rows, tx: tx.rows, travelers: travelers.rows, beacon: beacon.rows, supply: supply.rows, forecast, events, demandFiles: demand.files, supplyFiles: supply.files };
  cache.set(client, book);
  return book;
}

/** The versioned file that holds a date's rows, for citation. */
export function fileFor(files: string[], what: string, date: string): string {
  const month = date.slice(0, 7);
  return files.filter((f) => f.startsWith(`${what}-${month}-`)).sort().pop() ?? `${what}-${month}-v001.csv`;
}

// ---------- writing ----------
export function ensureDir(p: string): void { mkdirSync(p, { recursive: true }); }
export function writeText(path: string, text: string): void { ensureDir(resolve(path, "..")); writeFileSync(path, text); }
export function rel(book: Book, path: string): string { return relative(book.dir, path); }

/** Append rows to the book CHANGELOG (| Date | Path | Actor | Why |). */
export function changelog(book: Book, date: string, entries: { path: string; actor: string; why: string }[]): string[] {
  const file = join(book.dir, "CHANGELOG.md");
  const lines = entries.map((e) => `| ${date} | \`${e.path}\` | ${e.actor} | ${e.why} |`);
  appendFileSync(file, lines.join("\n") + "\n");
  return lines;
}

// ---------- markdown ----------
export function table(header: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => String(v).replace(/\|/g, "\\|");
  return [`| ${header.join(" | ")} |`, `|${header.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.map(esc).join(" | ")} |`)].join("\n");
}
export function parseTable(md: string, firstHeaderCell: string): { header: string[]; rows: string[][]; start: number; end: number } | null {
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`| ${firstHeaderCell} |`) || lines[i].startsWith(`| ${firstHeaderCell} `) && lines[i].startsWith("|")) {
      const header = splitRow(lines[i]);
      if (header[0] !== firstHeaderCell) continue;
      let j = i + 2;
      const rows: string[][] = [];
      while (j < lines.length && lines[j].startsWith("|")) { rows.push(splitRow(lines[j])); j++; }
      return { header, rows, start: i, end: j };
    }
  }
  return null;
}
export function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  for (let i = 1; i < line.length; i++) {
    const c = line[i];
    if (c === "\\" && line[i + 1] === "|") { cur += "|"; i++; continue; }
    if (c === "|") { cells.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim().length) cells.push(cur.trim());
  return cells;
}
export const pct = (v: number, d = 1): string => (Number.isFinite(v) ? `${v >= 0 && d >= 0 ? "" : ""}${v.toFixed(d)}%` : "—");
export const signed = (v: number, d = 1, unit = ""): string => (Number.isFinite(v) ? `${v > 0 ? "+" : ""}${v.toFixed(d)}${unit}` : "—");
export const n0 = (v: number): string => (Number.isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");
export const n1 = (v: number): string => (Number.isFinite(v) ? v.toFixed(1) : "—");
export const n2 = (v: number): string => (Number.isFinite(v) ? v.toFixed(2) : "—");
export const g = (grade: Grade): string => `[${grade}]`;
export function readIfExists(path: string): string | null { return existsSync(path) ? readFileSync(path, "utf8") : null; }
