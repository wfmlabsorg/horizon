#!/usr/bin/env bun
/**
 * Anaplan adapter (mock). Phase 0: typed interface + --dry-run validation of a sample file.
 *
 *   bun adapters/anaplan/anaplan.ts --dry-run <file.csv>
 */

export type Grade = "M" | "C" | "E" | "A";
export type Region = "North" | "East" | "West";
export type Channel = "voice" | "chat" | "email";
export type Cohort = "home-team" | "vendor";

export interface PlanExportRow {
  book: string;
  region: Region;
  channel: Channel;
  cohort: Cohort;
  month: string;                     // YYYY-MM
  req_hours: number;                 // cites requirement-hours
  productive_hours_planned: number;  // cites productive-hours
  fte_required: number;              // cites fte
  fte_on_roster: number;             // cites fte
  gap_fte: number;                   // fte_on_roster - fte_required
  plan_version: string;              // v###
  scenario: string;
  grade: Grade;                      // never M
  assumptions_ref: string;
  signed_by: string;                 // human:<role>
}

const HEADER = ["book", "region", "channel", "cohort", "month", "req_hours", "productive_hours_planned", "fte_required", "fte_on_roster", "gap_fte", "plan_version", "scenario", "grade", "assumptions_ref", "signed_by"];
const REGIONS = ["North", "East", "West"];
const CHANNELS = ["voice", "chat", "email"];
const COHORTS = ["home-team", "vendor"];
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const VERSION = /^v\d{3}$/;
const HUMAN = /^human:[A-Za-z][A-Za-z0-9 _-]*$/;

export function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) throw new Error("empty file");
  const split = (l: string) => l.split(",").map((c) => c.trim());
  return { header: split(lines[0]), rows: lines.slice(1).map(split) };
}

function num(v: string, name: string, line: number, errs: string[], allowNegative = false): number {
  const n = Number(v);
  if (v === "" || Number.isNaN(n) || (!allowNegative && n < 0)) {
    errs.push(`line ${line}: ${name} must be a ${allowNegative ? "number" : "non-negative number"}, got "${v}"`);
    return NaN;
  }
  return n;
}

export function validatePlanExport(text: string): string[] {
  const errs: string[] = [];
  const { header, rows } = parseCsv(text);
  if (header.join(",") !== HEADER.join(",")) return [`header must be exactly: ${HEADER.join(",")}`];
  const seen = new Set<string>();
  const versions = new Set<string>(), signers = new Set<string>(), refs = new Set<string>();
  rows.forEach((r, i) => {
    const line = i + 2;
    if (r.length !== HEADER.length) { errs.push(`line ${line}: expected ${HEADER.length} columns, got ${r.length}`); return; }
    const [book, region, channel, cohort, month, req, prod, fteReq, fteRoster, gap, version, scenario, grade, ref, signed] = r;
    if (!book) errs.push(`line ${line}: book missing`);
    if (!REGIONS.includes(region)) errs.push(`line ${line}: bad region "${region}"`);
    if (!CHANNELS.includes(channel)) errs.push(`line ${line}: bad channel "${channel}"`);
    if (!COHORTS.includes(cohort)) errs.push(`line ${line}: bad cohort "${cohort}"`);
    if (!MONTH.test(month)) errs.push(`line ${line}: bad month "${month}"`);
    num(req, "req_hours", line, errs);
    num(prod, "productive_hours_planned", line, errs);
    const fr = num(fteReq, "fte_required", line, errs);
    const fo = num(fteRoster, "fte_on_roster", line, errs);
    const g = num(gap, "gap_fte", line, errs, true);
    if (!Number.isNaN(fr) && !Number.isNaN(fo) && !Number.isNaN(g) && Math.abs(g - (fo - fr)) > 0.005) {
      errs.push(`line ${line}: gap_fte ${g} != fte_on_roster - fte_required (${(fo - fr).toFixed(2)})`);
    }
    if (!VERSION.test(version)) errs.push(`line ${line}: bad plan_version "${version}"`);
    versions.add(version);
    if (!scenario) errs.push(`line ${line}: scenario missing`);
    if (!["C", "E", "A"].includes(grade)) errs.push(`line ${line}: grade must be C, E or A on fte_required (never M), got "${grade}"`);
    if (!ref) errs.push(`line ${line}: assumptions_ref missing`);
    refs.add(ref);
    if (!HUMAN.test(signed)) errs.push(`line ${line}: signed_by must be human:<role>, got "${signed}"`);
    signers.add(signed);
    const key = `${book}|${region}|${channel}|${cohort}|${month}`;
    if (seen.has(key)) errs.push(`line ${line}: duplicate (book, region, channel, cohort, month) ${key}`);
    seen.add(key);
  });
  if (versions.size > 1) errs.push(`file carries ${versions.size} plan versions; exactly one allowed`);
  if (signers.size > 1) errs.push(`file carries ${signers.size} signers; exactly one allowed`);
  if (refs.size > 1) errs.push(`file carries ${refs.size} assumptions_refs; exactly one allowed`);
  return errs;
}

/** Phase 4: read a signed 07-plans version and write plan-export-<period>-v<nnn>.csv */
export function exportPlan(_bookDir: string, _version: string): never {
  throw new Error("not implemented in phase 0: exportPlan refuses any plan without a human sign-off");
}

// Entry guard: Bun.main is the absolute path of the script bun was started with, so importing this module does not run the CLI.
if (Bun.main.endsWith("/anaplan.ts")) {
  const args = process.argv.slice(2);
  const dry = args.indexOf("--dry-run");
  if (dry === -1 || !args[dry + 1]) {
    console.error("usage: bun adapters/anaplan/anaplan.ts --dry-run <file.csv>");
    process.exit(2);
  }
  const file = args[dry + 1];
  const text = await Bun.file(file).text();
  const errs = validatePlanExport(text);
  if (errs.length) {
    console.error(`plan-export: ${file} FAILED (${errs.length} issue${errs.length === 1 ? "" : "s"})`);
    errs.forEach((e) => console.error("  " + e));
    process.exit(1);
  }
  console.log(`plan-export: ${file} OK (${parseCsv(text).rows.length} rows)`);
}
