/**
 * DataEngineer stage (daily step 1): read the versioned ledgers for the date, reconcile, stamp.
 * Writes 02-demand/RECONCILIATION.md and 04-supply/RECONCILIATION.md (one row per date; a rerun replaces the row).
 * Produces no number of its own; flags outliers, never removes them.
 */
import { join } from "path";
import type { Book, Reconciliation } from "./types";
import { CHANNELS } from "./types";
import { fileFor, readIfExists, writeText, parseTable, table } from "./book";

export function runDataEngineer(book: Book, date: string): Reconciliation {
  const demandFile = fileFor(book.demandFiles, "demand-daily", date);
  const supplyFile = fileFor(book.supplyFiles, "supply-daily", date);
  const d = book.demand.filter((r) => r.date === date);
  const iv = book.interval.filter((r) => r.date === date);
  const co = book.cohort.filter((r) => r.date === date);
  const tr = book.travelers.find((r) => r.date === date);
  const su = book.supply.filter((r) => r.date === date);
  const checks: Reconciliation["checks"] = [];
  const outliers: string[] = [];
  const push = (name: string, ok: boolean, detail: string) => checks.push({ name, ok, detail });

  push("rows present for the date", d.length > 0 && su.length > 0, `${d.length} demand rows, ${co.length} cohort rows, ${iv.length} interval rows, ${su.length} supply rows`);
  // identity: offered = handled + abandoned (voice, chat); handled = offered (email); in_sl ≤ handled
  const bad: string[] = [];
  for (const r of d) {
    if (r.channel === "email" ? r.handled !== r.offered : r.offered !== r.handled + r.abandoned) bad.push(`${r.region}/${r.channel}`);
    if (r.handled_in_sl > r.handled) bad.push(`${r.region}/${r.channel} in_sl>handled`);
  }
  push("offered = handled + abandoned (voice, chat); handled = offered (email); handled_in_sl ≤ handled", bad.length === 0, bad.length ? `fails: ${bad.join(", ")}` : `closes on all ${d.length} rows`);
  // interval sums = channel-day sums
  const ivBad: string[] = [];
  for (const ch of ["voice", "chat"] as const) {
    const day = d.filter((r) => r.channel === ch);
    const ivr = iv.filter((r) => r.channel === ch);
    if (!day.length && !ivr.length) continue;
    for (const k of ["offered", "handled", "handled_in_sl", "abandoned"] as const) {
      const a = day.reduce((s, r) => s + r[k], 0), b = ivr.reduce((s, r) => s + r[k], 0);
      if (a !== b) ivBad.push(`${ch}.${k} daily ${a} vs interval ${b}`);
    }
  }
  push("interval rows sum to the channel-day (offered, handled, handled_in_sl, abandoned)", ivBad.length === 0, ivBad.length ? ivBad.join("; ") : `exact on ${iv.length} interval rows`);
  // cohort handled = channel-day handled
  const coBad: string[] = [];
  for (const ch of CHANNELS) {
    const a = d.filter((r) => r.channel === ch).reduce((s, r) => s + r.handled, 0);
    const b = co.filter((r) => r.channel === ch).reduce((s, r) => s + r.handled, 0);
    if (a !== b) coBad.push(`${ch} daily ${a} vs cohort ${b}`);
  }
  push("cohort rows sum to the channel-day handled", coBad.length === 0, coBad.length ? coBad.join("; ") : "exact");
  // travelers.contacts = Σ offered
  const off = d.reduce((s, r) => s + r.offered, 0);
  push("travelers-daily.contacts = Σ offered", !tr || tr.contacts === off, tr ? `${tr.contacts} vs ${off}` : "no travelers row");
  // supply: productive ≤ staffed ≤ scheduled; shrinkage split identity
  const suBad: string[] = [];
  for (const r of su) {
    if (!(r.productive_h <= r.staffed_h + 0.05 && r.staffed_h <= r.scheduled_h + 0.05)) suBad.push(`${r.cohort} hours ordering`);
    if (r.scheduled_h > 0) {
      const total = 100 * (1 - r.productive_h / r.scheduled_h);
      if (Math.abs(total - (r.shrink_planned_pct + r.shrink_unplanned_pct)) > 0.3) suBad.push(`${r.cohort} shrinkage split ${r.shrink_planned_pct}+${r.shrink_unplanned_pct} vs ${total.toFixed(1)}`);
    }
    if (r.occupancy_pct > 100) outliers.push(`${r.team} occupancy ${r.occupancy_pct}% > 100% on the agent-work numerator: flagged, not removed (either productive hours are under-recorded or handled work is over-recorded; a planner decision)`);
    if (r.shrink_unplanned_pct > 15) outliers.push(`${r.team} unplanned shrinkage ${r.shrink_unplanned_pct}% (cause not my call; handed to PostAnalyst and Scout)`);
  }
  push("productive ≤ staffed ≤ scheduled; planned + unplanned shrinkage = 1 − productive ÷ scheduled", suBad.length === 0, suBad.length ? suBad.join("; ") : `holds on ${su.length} cohort rows`);
  // versions consistent
  const versions = new Set([...d.map((r) => r.version), ...su.map((r) => r.version)]);
  push("one ledger version per date", versions.size === 1, [...versions].join(", "));

  const reconciled = checks.every((c) => c.ok);
  const rec: Reconciliation = { date, reconciled, demandFile, supplyFile, checks, outliers };
  stamp(join(book.dir, "02-demand", "RECONCILIATION.md"), "demand", rec, demandFile, checks.filter((c) => !c.name.startsWith("productive")));
  stamp(join(book.dir, "04-supply", "RECONCILIATION.md"), "supply", rec, supplyFile, checks.filter((c) => c.name.startsWith("productive") || c.name.startsWith("rows") || c.name.startsWith("one ledger")));
  return rec;
}

function stamp(path: string, ledger: string, rec: Reconciliation, file: string, checks: Reconciliation["checks"]): void {
  const header = ["date", "file", "reconciled", "checks", "notes"];
  const existing = readIfExists(path);
  let rows: string[][] = [];
  if (existing) {
    const t = parseTable(existing, "date");
    if (t) rows = t.rows.filter((r) => r[0] !== rec.date);
  }
  const notes = [...checks.filter((c) => !c.ok).map((c) => `FAIL ${c.name}: ${c.detail}`), ...(ledger === "supply" ? rec.outliers : [])].join("; ") || "—";
  rows.push([rec.date, `\`${file}\``, rec.reconciled ? "true" : "false", checks.map((c) => (c.ok ? "ok" : "FAIL") + ": " + c.name.split(" (")[0].split(";")[0]).join(" · "), notes]);
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  const md = `# ${ledger} — reconciliation stamps

One row per data date, written by agent:DataEngineer at daily step 1. A rerun on the same date replaces the row (the CHANGELOG records the rerun). \`reconciled: false\` means the PostAnalyst may score against the version but every number downstream inherits the flag. Outliers are flagged here, never removed.

${table(header, rows)}
`;
  writeText(path, md);
}
