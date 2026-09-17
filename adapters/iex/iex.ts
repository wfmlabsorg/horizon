#!/usr/bin/env bun
/**
 * IEX adapter (mock). Phase 0: typed interfaces + --dry-run validation of a sample file.
 *
 *   bun adapters/iex/iex.ts --dry-run <file.csv>
 *
 * Detects forecast-import vs actuals-export from the header. Exits 1 on any violation.
 * Real behaviour (export approved forecast → file, ingest actuals file → 02-demand/04-supply)
 * is phase 1/3 and is stubbed below.
 */

export type Grade = "M" | "C" | "E" | "A";
export type Channel = "VOICE" | "CHAT" | "EMAIL";
export type Region = "NORTH" | "EAST" | "WEST";

export interface ForecastImportRow {
  date: string;            // YYYY-MM-DD
  interval_start: string;  // HH:MM
  skill: string;           // <BOOK>_<CHANNEL>_<REGION>
  contacts: number;        // cites offered
  aht_s: number;           // cites aht-agent-work
  forecast_version: string; // v###
  grade: Grade;            // never M
}

export interface ActualsExportRow {
  date: string;
  interval_start: string;
  skill: string;
  offered: number;
  handled: number;
  handled_in_sl: number;
  abandoned: number;
  asa_s: number;
  aht_s: number;           // ELAPSED; maps to aht_elapsed_s only
  staffed_agents: number;
  export_id: string;
}

const FORECAST_HEADER = ["date", "interval_start", "skill", "contacts", "aht_s", "forecast_version", "grade"];
const ACTUALS_HEADER = ["date", "interval_start", "skill", "offered", "handled", "handled_in_sl", "abandoned", "asa_s", "aht_s", "staffed_agents", "export_id"];
const SKILL = /^[A-Z0-9]+_(VOICE|CHAT|EMAIL)_(NORTH|EAST|WEST)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const INTERVAL = /^([01]\d|2[0-3]):(00|30)$/;
const VERSION = /^v\d{3}$/;

export function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) throw new Error("empty file");
  const split = (l: string) => l.split(",").map((c) => c.trim());
  return { header: split(lines[0]), rows: lines.slice(1).map(split) };
}

function num(v: string, name: string, line: number, errs: string[], integer = false): number {
  const n = Number(v);
  if (v === "" || Number.isNaN(n) || n < 0 || (integer && !Number.isInteger(n))) {
    errs.push(`line ${line}: ${name} must be a ${integer ? "non-negative integer" : "non-negative number"}, got "${v}"`);
    return NaN;
  }
  return n;
}

export function validateForecastImport(text: string): string[] {
  const errs: string[] = [];
  const { header, rows } = parseCsv(text);
  if (header.join(",") !== FORECAST_HEADER.join(",")) return [`header must be exactly: ${FORECAST_HEADER.join(",")}`];
  const seen = new Set<string>();
  const versions = new Set<string>();
  rows.forEach((r, i) => {
    const line = i + 2;
    if (r.length !== FORECAST_HEADER.length) { errs.push(`line ${line}: expected ${FORECAST_HEADER.length} columns, got ${r.length}`); return; }
    const [date, interval, skill, contacts, aht, version, grade] = r;
    if (!DATE.test(date)) errs.push(`line ${line}: bad date "${date}"`);
    if (!INTERVAL.test(interval)) errs.push(`line ${line}: bad interval_start "${interval}" (HH:00 or HH:30)`);
    if (!SKILL.test(skill)) errs.push(`line ${line}: bad skill code "${skill}"`);
    num(contacts, "contacts", line, errs);
    num(aht, "aht_s", line, errs);
    if (!VERSION.test(version)) errs.push(`line ${line}: bad forecast_version "${version}"`);
    versions.add(version);
    if (!["C", "E", "A"].includes(grade)) errs.push(`line ${line}: grade must be C, E or A on a forecast (never M), got "${grade}"`);
    const key = `${date}|${interval}|${skill}`;
    if (seen.has(key)) errs.push(`line ${line}: duplicate (date, interval, skill) ${key}`);
    seen.add(key);
  });
  if (versions.size > 1) errs.push(`file carries ${versions.size} forecast versions; exactly one allowed`);
  return errs;
}

export function validateActualsExport(text: string): string[] {
  const errs: string[] = [];
  const { header, rows } = parseCsv(text);
  if (header.join(",") !== ACTUALS_HEADER.join(",")) return [`header must be exactly: ${ACTUALS_HEADER.join(",")}`];
  const seen = new Set<string>();
  const exportIds = new Set<string>();
  rows.forEach((r, i) => {
    const line = i + 2;
    if (r.length !== ACTUALS_HEADER.length) { errs.push(`line ${line}: expected ${ACTUALS_HEADER.length} columns, got ${r.length}`); return; }
    const [date, interval, skill, offered, handled, inSl, aband, asa, aht, staffed, exportId] = r;
    if (!DATE.test(date)) errs.push(`line ${line}: bad date "${date}"`);
    if (!INTERVAL.test(interval)) errs.push(`line ${line}: bad interval_start "${interval}"`);
    if (!SKILL.test(skill)) errs.push(`line ${line}: bad skill code "${skill}"`);
    const o = num(offered, "offered", line, errs, true);
    const h = num(handled, "handled", line, errs, true);
    const s = num(inSl, "handled_in_sl", line, errs, true);
    const a = num(aband, "abandoned", line, errs, true);
    num(asa, "asa_s", line, errs);
    num(aht, "aht_s", line, errs);
    num(staffed, "staffed_agents", line, errs);
    if (!exportId) errs.push(`line ${line}: export_id missing`);
    exportIds.add(exportId);
    if (s > h) errs.push(`line ${line}: handled_in_sl (${s}) > handled (${h})`);
    if (h > o) errs.push(`line ${line}: handled (${h}) > offered (${o})`);
    const channel = skill.split("_")[1];
    if (channel === "EMAIL" && a !== 0) errs.push(`line ${line}: abandoned must be 0 on EMAIL skills`);
    if (channel !== "EMAIL" && h + a > o) errs.push(`line ${line}: handled + abandoned (${h + a}) > offered (${o})`);
    const key = `${date}|${interval}|${skill}`;
    if (seen.has(key)) errs.push(`line ${line}: duplicate (date, interval, skill) ${key}`);
    seen.add(key);
  });
  if (exportIds.size > 1) errs.push(`file carries ${exportIds.size} export_ids; exactly one allowed`);
  return errs;
}

/** Phase 1+: read an approved 03-forecast version and write forecast-import-<period>-v<nnn>.csv */
export function exportForecast(_bookDir: string, _version: string): never {
  throw new Error("not implemented in phase 0: exportForecast refuses any version whose status is not approved");
}

/** Phase 1+: ingest an actuals export into 02-demand and 04-supply as a new ledger version */
export function ingestActuals(_bookDir: string, _file: string): never {
  throw new Error("not implemented in phase 0");
}

// Entry guard: Bun.main is the absolute path of the script bun was started with, so importing this module does not run the CLI.
if (Bun.main.endsWith("/iex.ts")) {
  const args = process.argv.slice(2);
  const dry = args.indexOf("--dry-run");
  if (dry === -1 || !args[dry + 1]) {
    console.error("usage: bun adapters/iex/iex.ts --dry-run <file.csv>");
    process.exit(2);
  }
  const file = args[dry + 1];
  const text = await Bun.file(file).text();
  const header = parseCsv(text).header.join(",");
  let kind: string;
  let errs: string[];
  if (header === FORECAST_HEADER.join(",")) { kind = "forecast-import"; errs = validateForecastImport(text); }
  else if (header === ACTUALS_HEADER.join(",")) { kind = "actuals-export"; errs = validateActualsExport(text); }
  else { console.error(`unrecognized header: ${header}`); process.exit(1); }
  if (errs.length) {
    console.error(`${kind}: ${file} FAILED (${errs.length} issue${errs.length === 1 ? "" : "s"})`);
    errs.forEach((e) => console.error("  " + e));
    process.exit(1);
  }
  console.log(`${kind}: ${file} OK (${parseCsv(text).rows.length} rows)`);
}
