#!/usr/bin/env bun
/**
 * HORIZON · phase 0 · synthetic world generator
 *
 * Produces 120 days of daily and 30-minute actuals for the Halcyon Group book
 * as it migrates from Beacon (asynchronous messaging, no timeout) to Meridian
 * (synchronous chat, 10-minute timeout), plus supply by cohort, the events
 * ledger, and the v000 plan-of-record forecast built on the wrong assumptions.
 *
 * Everything is synthetic. The causal model is recorded in sim/GROUND-TRUTH.md
 * and the day-level latents are written to sim/ground-truth-daily.csv so the
 * planted effects can be checked against what the agent chain recovers.
 *
 * Run:  bun run sim/generate.ts          (from the repo root)
 * Seed: 20260720 (deterministic; change P.seed to get a different world)
 */

import { mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";

// ---------------------------------------------------------------------------
// 0. Parameters — every planted effect is a named number here
// ---------------------------------------------------------------------------
export const P = {
  seed: 20260720,
  days: 120,
  day1: Date.UTC(2026, 6, 20), // 2026-07-20, a Monday
  beaconLookbackDays: 56, // Beacon history written for days -55..0

  // Whole-book transactions (weekday base) and regional shares
  txWeekdayBase: 1250,
  regionShare: { North: 0.08, East: 0.07, West: 0.85 },
  // Mon..Sun multipliers on transactions
  dowTx: [1.08, 1.12, 1.08, 1.02, 0.9, 0.38, 0.42],
  weekendRatioBoost: 1.25, // contacts per transaction run higher on weekends (travelers in trip)

  // Contacts per transaction (the ratio trap)
  ratioBeacon: { North: 0.9, East: 0.9, West: 0.253 }, // whole-book ≈ 0.35 by composition
  ratioMeridian: 0.98, // migrated regions on Meridian, before any spillover
  carriedBenchmark: 0.2, // another book, post-bot — wrong for Halcyon (bot OFF)

  // Channel mix of contacts (same on Beacon messaging→chat and Meridian, so mix is not a confounder)
  mix: { voice: 0.25, chat: 0.58, email: 0.17 },

  // Reference AHT, agent-work seconds, Beacon baseline (what the plan carried)
  refAht: { voice: 1150, chat: 380, email: 420 },
  // Cohort multipliers on the reference AHT
  crestlineMult: { voice: 1.7, chat: 1.45, email: 1.1 }, // level shift at go-live, NO learning curve
  homeCurve: { start: 1.5, end: 1.05, weeks: 8 }, // Larkspur home team learning curve from live day
  chatConcurrency: { base: 2.0, extra: 1.2 }, // effective concurrency 2.0 → 3.2 as load rises

  // Phases
  phase1Day: 2, // North live on Meridian
  phase2Day: 37, // East live on Meridian
  phase3PlannedDay: 135, // West, planned 2026-12-01, not live in the window

  // Seasonal ramp after phase 2 (+40 % over 4 weeks), plateau, then eases
  seasonRampStart: 37,
  seasonRampDays: 28,
  seasonPeak: 1.4,
  seasonEaseStart: 100,
  seasonEnd: 1.25,

  // Supply · Crestline Services (vendor)
  crestlineHeads: { phase1: 16, phase2: 20, surge: 28 },
  crestlineSurgeDay: 78, // reactive add after the break, at Crestline AHT
  shiftHours: 8,
  absenceRate: 0.05,
  inDayShrinkage: 0.18,
  trainingPull: { start: 57, end: 58, shrinkage: 0.43 }, // productive hours −30 %
  maxOccupancy: 0.92,
  reqOccupancy: 0.85, // the occupancy used to state "true requirement"

  // Supply · Larkspur home team (in-house)
  homeHeads: 10,
  homeTrainingStart: 36,
  homeNestingStart: 50,
  homeLiveDay: 71,
  nestingProductivity: 0.25,

  // Service-level response curves (logistic in load ρ)
  sl: {
    voice: { max: 0.97, rc: 0.9, w: 0.08, floor: 0.1 },
    chat: { max: 0.97, rc: 0.8, w: 0.09, floor: 0.08 },
    email: { max: 0.98, rc: 0.95, w: 0.08, floor: 0.1 },
  },
  retrySameDay: 0.3, // share of abandons that re-present the same day

  // Feedback: chat abandon (EWMA) → voice overflow and re-contact spillover
  ewmaAlpha: 0.15,
  ewmaRef: 0.22,
  overflowMax: 1.0, // voice contacts up to +100 % (calls per transaction double)
  spilloverMax: 0.15, // contacts per transaction up to +15 %
  cptdBase: 1.12, // contacts per traveler-day
  cptdExtra: 0.2,

  // Surprises
  outageDay: 63,
  outage: { voice: 1.6, chat: 1.5, email: 1.3, chatAbandonFloor: 0.55, voiceAbandonFloor: 0.35, slCut: 0.4, ahtUp: 1.15 },
  weather: { region: "East", tx: { 80: 1.5, 81: 1.7, 82: 1.4, 83: 1.15 }, ratio: { 80: 1.25, 81: 1.25, 82: 1.25, 83: 1.1 }, voiceSkew: 1.2 },

  // Noise (lognormal sigma)
  noise: { tx: 0.05, contacts: 0.06, aht: 0.04, sl: 0.02, interval: 0.15, intervalAht: 0.06 },

  // Plan of record (v000) — what the planner carried
  plan: { ratio: 0.35, occupancy: 0.85, crestlineHeads: { phase1: 16, phase2: 20 }, homeHeads: 10 },
} as const;

// ---------------------------------------------------------------------------
// 1. Utilities
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(P.seed);
function randn(mean = 0, sd = 1): number {
  let u1 = rand();
  while (u1 <= 1e-12) u1 = rand();
  const u2 = rand();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
const ln = (sd: number) => Math.exp(randn(0, sd) - (sd * sd) / 2); // mean-1 lognormal
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const r0 = (v: number) => Math.round(v);
const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const r3 = (v: number) => Math.round(v * 1000) / 1000;

function dateOf(day: number): string {
  return new Date(P.day1 + (day - 1) * 86400000).toISOString().slice(0, 10);
}
function dow(day: number): number {
  return (((day - 1) % 7) + 7) % 7; // 0 = Monday
}
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const isWeekend = (day: number) => dow(day) >= 5;

/** Largest-remainder integer allocation of `total` across `weights`, with optional caps. */
function allocate(total: number, weights: number[], caps?: number[]): number[] {
  const n = weights.length;
  const out = new Array(n).fill(0);
  if (total <= 0) return out;
  let remaining = total;
  let open = weights.map((w, i) => (caps ? Math.min(w, caps[i] > 0 ? w : 0) : w));
  for (let pass = 0; pass < 5 && remaining > 0; pass++) {
    const sw = open.reduce((a, b) => a + b, 0);
    if (sw <= 0) break;
    const raw = open.map((w) => (remaining * w) / sw);
    const fl = raw.map((v, i) => Math.min(Math.floor(v), caps ? caps[i] - out[i] : Infinity));
    let used = 0;
    fl.forEach((v, i) => {
      out[i] += v;
      used += v;
    });
    let left = remaining - used;
    const order = raw.map((v, i) => ({ i, f: v - Math.floor(v) })).sort((a, b) => b.f - a.f);
    for (const { i } of order) {
      if (left <= 0) break;
      if (!caps || out[i] < caps[i]) {
        out[i] += 1;
        left -= 1;
      }
    }
    remaining = left;
    open = open.map((w, i) => (caps && out[i] >= caps[i] ? 0 : w));
  }
  return out;
}

function csv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}

const ROOT = resolve(import.meta.dir, "..");
const BOOK = join(ROOT, "books", "halcyon");
const OUT = {
  demand: join(BOOK, "02-demand"),
  supply: join(BOOK, "04-supply"),
  events: join(BOOK, "05-events"),
  plan: join(BOOK, "03-forecast", "v000-plan-of-record"),
  sim: import.meta.dir,
};
for (const d of Object.values(OUT)) mkdirSync(d, { recursive: true });

function writeCsv(dir: string, name: string, rows: Record<string, unknown>[], header: string) {
  writeFileSync(join(dir, `${name}.csv`), csv(rows));
  writeFileSync(
    join(dir, `${name}.md`),
    `# ${name}.csv\n\n${header.trim()}\n\n## Provenance\n\nGenerated by \`sim/generate.ts\` (seed ${P.seed}); synthetic data with a recorded ground truth in \`sim/GROUND-TRUTH.md\`. Regenerate with \`bun run sim/generate.ts\`. Rows: ${rows.length}.\n`,
  );
}

// ---------------------------------------------------------------------------
// 2. Structural functions (the causal model)
// ---------------------------------------------------------------------------
type Region = "North" | "East" | "West";
type Channel = "voice" | "chat" | "email";
type Cohort = "Crestline Services" | "Larkspur home team";
const REGIONS: Region[] = ["North", "East", "West"];
const CHANNELS: Channel[] = ["voice", "chat", "email"];

function season(day: number): number {
  if (day < P.seasonRampStart) return 1;
  if (day < P.seasonRampStart + P.seasonRampDays) return 1 + (P.seasonPeak - 1) * ((day - P.seasonRampStart) / P.seasonRampDays);
  if (day < P.seasonEaseStart) return P.seasonPeak;
  return P.seasonPeak - (P.seasonPeak - P.seasonEnd) * Math.min(1, (day - P.seasonEaseStart) / (P.days - P.seasonEaseStart));
}
function migrated(day: number, r: Region): boolean {
  if (r === "North") return day >= P.phase1Day;
  if (r === "East") return day >= P.phase2Day;
  return false;
}
function platformOf(day: number, r: Region) {
  return migrated(day, r) ? "Meridian" : "Beacon";
}
function weatherTx(day: number, r: Region): number {
  return r === P.weather.region ? (P.weather.tx as Record<number, number>)[day] ?? 1 : 1;
}
function weatherRatio(day: number, r: Region): number {
  return r === P.weather.region ? (P.weather.ratio as Record<number, number>)[day] ?? 1 : 1;
}
function slCurve(ch: Channel, rho: number): number {
  const c = P.sl[ch];
  return c.floor + (c.max - c.floor) / (1 + Math.exp((rho - c.rc) / c.w));
}
function abandonFn(ch: Channel, sl: number): number {
  if (ch === "email") return 0;
  return ch === "voice" ? 0.02 + 0.45 * Math.pow(1 - sl, 1.5) : 0.03 + 0.4 * Math.pow(1 - sl, 1.5);
}
function asaFn(ch: Channel, sl: number): number {
  const q = Math.pow(1 - sl, 2);
  return ch === "voice" ? 12 + 900 * q : ch === "chat" ? 45 + 1500 * q : 2400 + 40000 * q;
}
function homeMult(day: number): number {
  if (day < P.homeLiveDay) return P.homeCurve.start;
  const f = Math.min(1, (day - P.homeLiveDay) / (P.homeCurve.weeks * 7));
  return P.homeCurve.start - (P.homeCurve.start - P.homeCurve.end) * f;
}
/** Workload-weighted multiplier of a cohort (used to turn productive hours into reference-AHT capacity). */
function cohortAvgMult(m: Record<Channel, number>): number {
  let num = 0,
    den = 0;
  for (const ch of CHANNELS) {
    const w = P.mix[ch] * P.refAht[ch];
    num += w * m[ch];
    den += w;
  }
  return num / den;
}

// ---------------------------------------------------------------------------
// 3. Supply by cohort
// ---------------------------------------------------------------------------
interface SupplyRow {
  date: string;
  day: number;
  dow: string;
  cohort: Cohort;
  headcount: number;
  agents_scheduled: number;
  agents_in_training: number;
  scheduled_hours: number;
  staffed_hours: number;
  productive_hours: number;
  shrinkage_pct: number;
  status: string;
}
function crestlineHeads(day: number): number {
  if (day < P.phase2Day) return P.crestlineHeads.phase1;
  if (day < P.crestlineSurgeDay) return P.crestlineHeads.phase2;
  return P.crestlineHeads.surge;
}
function supplyFor(day: number): SupplyRow[] {
  const rows: SupplyRow[] = [];
  // Crestline
  {
    const heads = crestlineHeads(day);
    const sched = day === 1 ? 0 : Math.round(heads * (isWeekend(day) ? 0.58 : 0.72));
    const inTraining = day === 1 ? heads : day >= P.trainingPull.start && day <= P.trainingPull.end ? 6 : 0;
    const scheduled = sched * P.shiftHours + (day === 1 ? heads * P.shiftHours : 0);
    const absence = clamp(P.absenceRate * ln(0.25), 0, 0.15);
    const staffed = scheduled * (1 - absence);
    const shr = day >= P.trainingPull.start && day <= P.trainingPull.end ? P.trainingPull.shrinkage : clamp(P.inDayShrinkage * ln(0.08), 0.1, 0.3);
    const productive = day === 1 ? 0 : staffed * (1 - shr);
    rows.push({
      date: dateOf(day), day, dow: DOW[dow(day)], cohort: "Crestline Services", headcount: heads, agents_scheduled: sched,
      agents_in_training: inTraining, scheduled_hours: r1(scheduled), staffed_hours: r1(staffed), productive_hours: r1(productive),
      shrinkage_pct: r1(100 * (1 - productive / Math.max(1, staffed))),
      status: day === 1 ? "readiness" : day < P.phase2Day ? "phase-1 hypercare" : day < P.crestlineSurgeDay ? "phase-2 steady state" : "surge add",
    });
  }
  // Larkspur home team
  {
    const heads = P.homeHeads;
    let sched = 0, inTraining = 0, productive = 0, scheduled = 0, staffed = 0, status = "not yet engaged";
    if (day >= P.homeTrainingStart && day < P.homeNestingStart) {
      inTraining = heads;
      scheduled = isWeekend(day) ? 0 : heads * P.shiftHours;
      staffed = scheduled * (1 - P.absenceRate);
      productive = 0;
      status = "classroom training";
    } else if (day >= P.homeNestingStart && day < P.homeLiveDay) {
      inTraining = heads;
      sched = isWeekend(day) ? 4 : 8;
      scheduled = sched * P.shiftHours;
      staffed = scheduled * (1 - clamp(P.absenceRate * ln(0.25), 0, 0.15));
      productive = staffed * P.nestingProductivity * (1 - P.inDayShrinkage);
      status = "nesting";
    } else if (day >= P.homeLiveDay) {
      sched = isWeekend(day) ? 6 : 7;
      scheduled = sched * P.shiftHours;
      staffed = scheduled * (1 - clamp(P.absenceRate * ln(0.25), 0, 0.15));
      productive = staffed * (1 - clamp(P.inDayShrinkage * ln(0.08), 0.1, 0.3));
      status = "live";
    }
    rows.push({
      date: dateOf(day), day, dow: DOW[dow(day)], cohort: "Larkspur home team", headcount: day >= P.homeTrainingStart ? heads : 0,
      agents_scheduled: sched, agents_in_training: inTraining, scheduled_hours: r1(scheduled), staffed_hours: r1(staffed),
      productive_hours: r1(productive), shrinkage_pct: staffed > 0 ? r1(100 * (1 - productive / staffed)) : 0, status,
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 4. The daily engine
// ---------------------------------------------------------------------------
interface ChannelDay {
  date: string; day: number; dow: string; platform: string; channel: Channel;
  offered: number; handled: number; handled_in_sl: number; abandoned: number;
  asa_sec: number; sl_pct: number; aht_sec: number; aht_agent_sec: number;
}
interface Truth {
  day: number; date: string; season_factor: number; migrated_regions: string; tx_migrated: number;
  base_contacts: number; ratio_true: number; overflow_mult: number; spillover_mult: number; ewma_chat_abandon: number;
  capacity_ref_hours: number; workload_ref_hours: number; rho: number; occupancy_pct: number;
  crestline_voice_mult: number; home_mult: number; chat_concurrency: number; outage: number; weather: number; training_pull: number;
  chat_sl_true: number; voice_sl_true: number;
}

const demandRows: ChannelDay[] = [];
const intervalRows: Record<string, unknown>[] = [];
const cohortRows: Record<string, unknown>[] = [];
const txRows: Record<string, unknown>[] = [];
const travelerRows: Record<string, unknown>[] = [];
const supplyRows: SupplyRow[] = [];
const beaconRows: Record<string, unknown>[] = [];
const truthRows: Truth[] = [];

// Intraday profile (48 half-hours), planning-org local time; North and East share a time zone in this world.
const PROFILE = Array.from({ length: 48 }, (_, i) => {
  const h = i / 2;
  return 0.12 + 1.0 * Math.exp(-Math.pow((h - 10.5) / 2.2, 2)) + 0.85 * Math.exp(-Math.pow((h - 15) / 2.5, 2));
});
const PROFILE_MEAN = PROFILE.reduce((a, b) => a + b, 0) / 48;

let ewmaChatAbandon = 0;

// Beacon history before day 1 (whole book) — establishes the 0.9 vs 0.35 composition
for (let day = 1 - P.beaconLookbackDays; day <= P.days; day++) {
  for (const r of REGIONS) {
    if (day >= 1 && migrated(day, r)) continue;
    const tx = P.txWeekdayBase * P.regionShare[r] * P.dowTx[dow(day)] * season(day) * weatherTx(day, r) * ln(P.noise.tx);
    const ratio = P.ratioBeacon[r] * (isWeekend(day) ? P.weekendRatioBoost : 1) * weatherRatio(day, r) * ln(P.noise.contacts);
    const contacts = tx * ratio;
    const voice = r0(contacts * P.mix.voice), msg = r0(contacts * P.mix.chat), email = r0(contacts * P.mix.email);
    beaconRows.push({
      date: dateOf(day), day, dow: DOW[dow(day)], region: r, platform: "Beacon", transactions: r0(tx),
      contacts_voice: voice, contacts_messaging: msg, contacts_email: email, contacts_total: voice + msg + email,
      contacts_per_transaction: r3((voice + msg + email) / Math.max(1, r0(tx))),
      voice_aht_sec: r0(P.refAht.voice * ln(P.noise.aht)),
      messaging_aht_agent_sec: r0(P.refAht.chat * ln(P.noise.aht)),
      messaging_elapsed_hours: r1(6.5 * ln(0.2)), // asynchronous, no timeout: elapsed is hours, not seconds
      email_aht_sec: r0(P.refAht.email * ln(P.noise.aht)),
    });
  }
}

for (let day = 1; day <= P.days; day++) {
  const date = dateOf(day);
  const wk = isWeekend(day);
  const s = season(day);
  const outage = day === P.outageDay ? 1 : 0;
  const weather = weatherTx(day, "East") !== 1 ? 1 : 0;
  const pull = day >= P.trainingPull.start && day <= P.trainingPull.end ? 1 : 0;

  // --- transactions by region (whole book; platform tagged)
  const tx: Record<Region, number> = { North: 0, East: 0, West: 0 };
  for (const r of REGIONS) {
    tx[r] = r0(P.txWeekdayBase * P.regionShare[r] * P.dowTx[dow(day)] * s * weatherTx(day, r) * ln(P.noise.tx));
    txRows.push({ date, day, dow: DOW[dow(day)], region: r, platform: platformOf(day, r), transactions: tx[r] });
  }
  const migratedRegions = REGIONS.filter((r) => migrated(day, r));
  const txMigrated = migratedRegions.reduce((a, r) => a + tx[r], 0);

  // --- feedback multipliers from yesterday's state (lagged, so no fixed point)
  const fb = clamp(ewmaChatAbandon / P.ewmaRef, 0, 1);
  const overflowMult = 1 + P.overflowMax * fb;
  const spilloverMult = 1 + P.spilloverMax * fb;

  // --- base contacts on Meridian
  let baseContacts = 0;
  for (const r of migratedRegions) {
    baseContacts += tx[r] * P.ratioMeridian * (wk ? P.weekendRatioBoost : 1) * weatherRatio(day, r) * spilloverMult;
  }
  baseContacts *= ln(P.noise.contacts);
  const voiceSkew = weather ? P.weather.voiceSkew : 1;
  const baseOffered: Record<Channel, number> = {
    voice: baseContacts * P.mix.voice * overflowMult * voiceSkew * (outage ? P.outage.voice : 1),
    chat: baseContacts * P.mix.chat * (outage ? P.outage.chat : 1),
    email: baseContacts * P.mix.email * (outage ? P.outage.email : 1),
  };

  // --- supply
  const sup = supplyFor(day);
  supplyRows.push(...sup);
  const hm = homeMult(day);
  const cohortMult: Record<Cohort, Record<Channel, number>> = {
    "Crestline Services": { ...P.crestlineMult },
    "Larkspur home team": { voice: hm, chat: hm, email: hm },
  };
  const cap: { cohort: Cohort; prod: number; eff: number }[] = sup.map((row) => ({
    cohort: row.cohort,
    prod: row.productive_hours,
    eff: row.productive_hours / cohortAvgMult(cohortMult[row.cohort]),
  }));
  const capacityRef = cap.reduce((a, c) => a + c.eff, 0) * P.maxOccupancy; // reference-AHT hours available

  // --- load, two passes (same-day retries of abandons)
  const refWork = (o: Record<Channel, number>) => CHANNELS.reduce((a, ch) => a + (o[ch] * P.refAht[ch]) / 3600, 0);
  let rho = day >= P.phase1Day && capacityRef > 0 ? refWork(baseOffered) / capacityRef : 0;
  const offered: Record<Channel, number> = { ...baseOffered };
  if (day >= P.phase1Day) {
    for (const ch of ["voice", "chat"] as Channel[]) {
      const slEst = outage ? slCurve(ch, rho) * P.outage.slCut : slCurve(ch, rho);
      const ab = outage ? Math.max(abandonFn(ch, slEst), ch === "chat" ? P.outage.chatAbandonFloor : P.outage.voiceAbandonFloor) : abandonFn(ch, slEst);
      offered[ch] = baseOffered[ch] * (1 + P.retrySameDay * ab);
    }
    rho = capacityRef > 0 ? refWork(offered) / capacityRef : 0;
  }

  // --- concurrency (the two-definitions trap on chat)
  const conc = P.chatConcurrency.base + P.chatConcurrency.extra * clamp((rho - 0.5) / 0.5, 0, 1);

  // --- per-channel outcomes
  const shares = cap.map((c) => c.eff / Math.max(1e-9, cap.reduce((a, x) => a + x.eff, 0)));
  const dayOut: Record<Channel, ChannelDay> = {} as never;
  let chatAbandonRate = 0;
  let workloadActual = 0;
  for (const ch of CHANNELS) {
    const off = day >= P.phase1Day ? r0(offered[ch]) : 0;
    let sl = clamp(slCurve(ch, rho) + randn(0, P.noise.sl), 0.02, 0.995);
    if (outage) sl *= P.outage.slCut;
    let ab = abandonFn(ch, sl);
    if (outage) ab = Math.max(ab, ch === "chat" ? P.outage.chatAbandonFloor : ch === "voice" ? P.outage.voiceAbandonFloor : 0);
    const abandoned = ch === "email" ? 0 : Math.min(off, r0(off * ab));
    const handled = off - abandoned;
    const inSl = Math.min(handled, r0(off * sl));
    const slPct = off > 0 ? (100 * inSl) / off : 0;
    // blended AHT across cohorts (handled share ∝ effective capacity)
    let mult = 0;
    cap.forEach((c, i) => (mult += shares[i] * cohortMult[c.cohort][ch]));
    if (!cap.some((c) => c.eff > 0)) mult = P.crestlineMult[ch];
    const ahtAgent = P.refAht[ch] * mult * ln(P.noise.aht) * (outage ? P.outage.ahtUp : 1);
    const ahtElapsed = ch === "chat" ? ahtAgent * conc : ahtAgent;
    workloadActual += (handled * ahtAgent) / 3600;
    if (ch === "chat") chatAbandonRate = off > 0 ? abandoned / off : 0;
    dayOut[ch] = {
      date, day, dow: DOW[dow(day)], platform: "Meridian", channel: ch, offered: off, handled, handled_in_sl: inSl, abandoned,
      asa_sec: off > 0 ? r0(asaFn(ch, sl) * ln(0.08)) : 0, sl_pct: r1(slPct), aht_sec: off > 0 ? r0(ahtElapsed) : 0, aht_agent_sec: off > 0 ? r0(ahtAgent) : 0,
    };
    demandRows.push(dayOut[ch]);

    // cohort split of handled
    const caps = cap.map((c) => (c.eff > 0 ? handled : 0));
    const split = allocate(handled, cap.map((c) => c.eff), caps);
    cap.forEach((c, i) => {
      if (c.prod <= 0 && split[i] === 0) return;
      const a = P.refAht[ch] * cohortMult[c.cohort][ch] * ln(P.noise.aht) * (outage ? P.outage.ahtUp : 1);
      cohortRows.push({
        date, day, cohort: c.cohort, channel: ch, handled: split[i], aht_sec: split[i] > 0 ? r0(ch === "chat" ? a * conc : a) : 0,
        aht_agent_sec: split[i] > 0 ? r0(a) : 0, productive_hours: r1(c.prod),
      });
    });
  }
  const totalProductive = cap.reduce((a, c) => a + c.prod, 0);
  const occupancy = totalProductive > 0 ? (100 * workloadActual) / totalProductive : 0;

  // --- travelers
  const contactsTotal = CHANNELS.reduce((a, ch) => a + dayOut[ch].offered, 0);
  const cptd = P.cptdBase + P.cptdExtra * fb;
  travelerRows.push({
    date, day, dow: DOW[dow(day)], platform: "Meridian", contacts: contactsTotal,
    distinct_travelers: contactsTotal > 0 ? r0(contactsTotal / (cptd * ln(0.03))) : 0,
    contacts_per_traveler_day: contactsTotal > 0 ? r3(cptd * ln(0.03)) : 0,
    transactions_migrated_regions: txMigrated,
    contacts_per_transaction: txMigrated > 0 ? r3(contactsTotal / txMigrated) : 0,
  });

  // --- intervals (chat and voice)
  for (const ch of ["voice", "chat"] as Channel[]) {
    const d = dayOut[ch];
    const w = PROFILE.map((p) => p * ln(P.noise.interval));
    const off = allocate(d.offered, w);
    const rhoI = PROFILE.map((p) => rho * (p / (0.55 * p + 0.45 * PROFILE_MEAN)) * ln(0.1));
    const slI = rhoI.map((r) => clamp((outage ? P.outage.slCut : 1) * slCurve(ch, r) + randn(0, 0.03), 0.02, 0.995));
    const abW = off.map((o, i) => o * Math.max(abandonFn(ch, slI[i]), outage ? (ch === "chat" ? P.outage.chatAbandonFloor : P.outage.voiceAbandonFloor) : 0));
    const ab = allocate(d.abandoned, abW, off);
    const hd = off.map((o, i) => o - ab[i]);
    const inW = off.map((o, i) => o * slI[i]);
    const inSl = allocate(d.handled_in_sl, inW, hd);
    for (let i = 0; i < 48; i++) {
      const hh = String(Math.floor(i / 2)).padStart(2, "0"), mm = i % 2 ? "30" : "00";
      const ag = off[i] > 0 ? d.aht_agent_sec * ln(P.noise.intervalAht) : 0;
      intervalRows.push({
        date, day, interval_start: `${hh}:${mm}`, channel: ch, offered: off[i], handled: hd[i], handled_in_sl: inSl[i], abandoned: ab[i],
        asa_sec: off[i] > 0 ? r0(asaFn(ch, off[i] > 0 ? inSl[i] / off[i] : slI[i]) * ln(0.1)) : 0,
        sl_pct: off[i] > 0 ? r1((100 * inSl[i]) / off[i]) : 0,
        aht_sec: r0(ch === "chat" ? ag * conc : ag), aht_agent_sec: r0(ag),
      });
    }
  }

  // --- state update and truth
  if (day >= P.phase1Day) ewmaChatAbandon = P.ewmaAlpha * chatAbandonRate + (1 - P.ewmaAlpha) * ewmaChatAbandon;
  truthRows.push({
    day, date, season_factor: r3(s), migrated_regions: migratedRegions.join("+") || "none", tx_migrated: txMigrated,
    base_contacts: r0(baseContacts), ratio_true: txMigrated > 0 ? r3(baseContacts / txMigrated) : 0, overflow_mult: r3(overflowMult),
    spillover_mult: r3(spilloverMult), ewma_chat_abandon: r3(ewmaChatAbandon), capacity_ref_hours: r1(capacityRef),
    workload_ref_hours: r1(refWork(offered)), rho: r3(rho), occupancy_pct: r1(occupancy), crestline_voice_mult: P.crestlineMult.voice,
    home_mult: r3(hm), chat_concurrency: r2(conc), outage, weather, training_pull: pull,
    chat_sl_true: r1(100 * slCurve("chat", rho) * (outage ? P.outage.slCut : 1)), voice_sl_true: r1(100 * slCurve("voice", rho) * (outage ? P.outage.slCut : 1)),
  });
}

// ---------------------------------------------------------------------------
// 5. Events ledger (planned items and surprises, with true dates)
// ---------------------------------------------------------------------------
const ev = (id: string, type: string, start: number, end: number, win: number, region: string, channels: string, planned: string, desc: string, sig: string, grade: string, source: string) => ({
  event_id: id, type, start_day: start, start_date: dateOf(start), end_day: end, end_date: dateOf(end), effect_window_days: win, region, channel_scope: channels,
  planned, description: desc, expected_signature: sig, grade, source,
});
const eventRows = [
  ev("EV-001", "go-live", P.phase1Day, P.phase1Day, 14, "North", "all", "yes", "Phase 1: North region moves from Beacon to Meridian. Crestline Services takes all Meridian contacts under hypercare staffing.", "Meridian contacts start; voice AHT vs the Beacon baseline is the first thing to check.", "[M] platform cut-over log", "migration programme calendar"),
  ev("EV-002", "config", P.phase1Day, P.days, 0, "North+East", "chat", "yes", "Chat bot switched OFF for the Halcyon book on Meridian (client contract clause: human-first). The benchmark book that runs 0.20 contacts per transaction has the bot ON.", "No bot deflection; contacts per transaction stays near the Beacon regional level (~0.9), not 0.2.", "[M] platform configuration", "Meridian configuration export"),
  ev("EV-003", "training", P.homeTrainingStart, P.homeNestingStart - 1, 0, "n/a", "none", "yes", "Larkspur home team (10) in classroom training for Meridian; no live contacts.", "Home team hours appear as training, productive 0.", "[M] training roster", "Larkspur L&D calendar"),
  ev("EV-004", "go-live", P.phase2Day, P.phase2Day, 14, "East", "all", "yes", "Phase 2: East region moves to Meridian. Migrated population roughly doubles; Crestline held at 20 heads per the plan of record.", "Contacts step up overnight (~1.9×); transactions do not.", "[M] platform cut-over log", "migration programme calendar"),
  ev("EV-005", "seasonal", P.seasonRampStart, P.seasonRampStart + P.seasonRampDays, 28, "all", "all", "no", "Autumn travel season: whole-book transactions climb about 40% over four weeks after phase 2, plateau, then ease from day 100.", "Transactions rise in every region including West (still on Beacon), so it is not a migration effect.", "[E] seasonal pattern, prior years", "Scout — client travel calendar"),
  ev("EV-006", "nesting", P.homeNestingStart, P.homeLiveDay - 1, 0, "North+East", "all", "yes", "Larkspur home team nesting: takes live contacts at ~40% productivity with a supervisor; AHT starts at ~1.5× the Beacon baseline.", "Home-team handled volume small; their AHT high but falling.", "[M] training roster", "Larkspur L&D calendar"),
  ev("EV-007", "training", P.trainingPull.start, P.trainingPull.end, 2, "North+East", "all", "no", "Crestline pulls six scheduled agents into a Meridian release training on both days; schedules unchanged, productive hours down ~30%.", "SL, ASA and abandons collapse for two days with no change in transactions; offered rises only through same-day retries. Looks like demand; is supply.", "[A] vendor notice after the fact", "Crestline Services daily ops email"),
  ev("EV-008", "outage", P.outageDay, P.outageDay, 1, "North+East", "chat+voice", "no", "Meridian platform outage (~4 h): chat sessions dropped, customers retry and call. Transactions unaffected.", "Contacts spike (chat ×1.5, voice ×1.6), abandons very high, transactions flat.", "[M] platform incident record", "Meridian incident INC-2026-0920"),
  ev("EV-009", "go-live", P.homeLiveDay, P.homeLiveDay, 56, "North+East", "all", "yes", "Larkspur home team live (10 heads, ~7 scheduled per day). Learning curve: AHT from ~1.5× to ~1.05× of the Beacon baseline over eight weeks.", "Blended AHT starts to fall while Crestline AHT does not.", "[M] roster", "Larkspur L&D calendar"),
  ev("EV-010", "vendor-change", P.crestlineSurgeDay, P.crestlineSurgeDay, 21, "North+East", "all", "no", "Reactive surge add: Crestline +8 heads approved after the service break; arrive at Crestline's Meridian AHT (no curve).", "Capacity step; SL recovers over ~3 weeks as the voice overflow unwinds. Confounded with the home team curve.", "[A] change request", "Crestline Services change request CR-0412"),
  ev("EV-011", "weather", 80, 82, 4, "East", "all", "no", "Severe weather in East: flight cancellations and rebooking. Transactions ×1.5–1.7 and contacts per transaction ×1.25 in East for three days, tail on day 83.", "Transactions AND contacts spike together, East only; voice-skewed.", "[M] client disruption bulletin", "Scout — weather feed + client bulletin"),
  ev("EV-012", "go-live", P.phase3PlannedDay, P.phase3PlannedDay, 14, "West", "all", "yes", "Phase 3 planned: West region (85% of transactions) to Meridian. Not live in this window.", "None in the window; sizing is the open planning question.", "[A] programme plan", "migration programme calendar"),
];

// ---------------------------------------------------------------------------
// 6. Plan of record v000 (the wrong assumptions, faithfully applied)
// ---------------------------------------------------------------------------
const planRows: Record<string, unknown>[] = [];
for (let day = 1; day <= P.days; day++) {
  const scope = day >= P.phase2Day ? "North+East" : day >= P.phase1Day ? "North" : "none";
  const share = (day >= P.phase1Day ? P.regionShare.North : 0) + (day >= P.phase2Day ? P.regionShare.East : 0);
  const txPlan = P.txWeekdayBase * share * P.dowTx[dow(day)]; // flat phase line, no seasonality
  const contacts = txPlan * P.plan.ratio;
  for (const ch of CHANNELS) {
    const off = contacts * P.mix[ch];
    const aht = P.refAht[ch];
    const work = (off * aht) / 3600;
    planRows.push({
      date: dateOf(day), day, dow: DOW[dow(day)], region_scope: scope, channel: ch, fc_transactions: r0(txPlan), fc_contacts_per_transaction: P.plan.ratio,
      fc_offered: r1(off), fc_aht_sec: aht, fc_workload_hours: r2(work), fc_required_productive_hours: r2(work / P.plan.occupancy),
      sl_target: ch === "voice" ? "80% in 20 s" : ch === "chat" ? "80% in 3 min" : "90% in 2 h",
      planned_crestline_heads: day >= P.phase2Day ? P.plan.crestlineHeads.phase2 : P.plan.crestlineHeads.phase1,
      planned_home_heads: day >= P.homeLiveDay ? P.plan.homeHeads : 0,
      forecast_version: "v000", assumption_ref: "assumptions.md",
    });
  }
}

// ---------------------------------------------------------------------------
// 7. Write everything
// ---------------------------------------------------------------------------
const DEF = {
  common: `Definitions cited (see \`books/halcyon/01-definitions/\`): **Offered**, **Handled**, **Handled in SL**, **Abandoned**, **ASA**, **Service Level**, **AHT (elapsed)** → \`aht_sec\`, **AHT (agent work)** → \`aht_agent_sec\`. Service level is \`handled_in_sl / offered\`. For chat, \`aht_sec\` is elapsed session time and \`aht_agent_sec\` is agent work time (elapsed ÷ effective concurrency); for voice and email the two are equal. The plan of record carried **AHT (agent work)** — compare like with like.`,
};
writeCsv(OUT.demand, "daily-channel", demandRows, `Daily actuals by channel for the Halcyon book on Meridian, days 1–${P.days} (${dateOf(1)} to ${dateOf(P.days)}). One row per date × channel (voice, chat, email). Day 1 is pre-go-live and carries zeros.\n\n${DEF.common}`);
writeCsv(OUT.demand, "interval-30min", intervalRows, `30-minute interval actuals for chat and voice, planning-org local time (North and East share a time zone in this world). Interval rows sum exactly to \`daily-channel.csv\` for offered, handled, handled_in_sl and abandoned.\n\n${DEF.common}`);
writeCsv(OUT.demand, "daily-cohort", cohortRows, `Handled contacts and AHT by cohort (Crestline Services, Larkspur home team) and channel — the agent-group view. \`handled\` sums to \`daily-channel.csv\`. Definitions: **Handled**, **AHT (elapsed)**, **AHT (agent work)**, **Productive hours** (copied from the supply ledger for convenience).`);
writeCsv(OUT.demand, "daily-transactions", txRows, `Transactions per day by region for the whole Halcyon book (all three regions, whatever platform they are on) with the platform each region is on that day. Definition: **Transaction** (a booking, change or cancellation completed in the travel system, independent of any contact).`);
writeCsv(OUT.demand, "daily-travelers", travelerRows, `Distinct travelers contacting per day on Meridian and contacts per traveler-day, with transactions for the migrated regions and the resulting contacts per transaction. Definitions: **Contact**, **Distinct traveler**, **Contacts per traveler-day**, **Contacts per transaction**.`);
writeCsv(OUT.demand, "beacon-daily", beaconRows, `Beacon history by region: ${P.beaconLookbackDays} days before day 1 for all regions, then each region while it remains on Beacon (East to day ${P.phase2Day - 1}, West throughout). Beacon messaging is asynchronous with no timeout, so \`messaging_elapsed_hours\` is hours and only \`messaging_aht_agent_sec\` is comparable to Meridian chat **AHT (agent work)**. Definitions: **Transaction**, **Contact**, **Contacts per transaction**, **AHT (agent work)**.`);
writeCsv(OUT.supply, "daily-supply", supplyRows, `Supply by cohort per day. Definitions: **Scheduled hours** (rostered), **Staffed hours** (scheduled minus absence), **Productive hours** (staffed minus in-day shrinkage: breaks, coaching, training), **Agents scheduled**, **Agents in training**, **Shrinkage (in-day)** = 1 − productive/staffed. During nesting the home team's productive hours are counted at ${P.nestingProductivity * 100}% of staffed. Headcount is contracted heads on the book.`);
writeCsv(OUT.events, "events", eventRows, `The intelligence ledger: typed, dated events with an effect window and a grade. Planned items and surprises are both here with their true dates (\`planned\` = yes/no). Grades: [M] measured from a system record · [A] asserted by one source · [E] estimated. \`expected_signature\` says what an analyst should see in the demand and supply ledgers.`);
writeCsv(OUT.plan, "forecast-daily", planRows, `Plan of record v000: the original daily forecast by channel for days 1–${P.days}, built on the assumptions in \`assumptions.md\` (whole-book contacts-per-transaction of ${P.plan.ratio}, Beacon AHT carried as **AHT (agent work)**, flat phase lines with a weekday shape and no seasonal ramp). Required productive hours are workload ÷ ${P.plan.occupancy} occupancy.`);
writeCsv(OUT.sim, "ground-truth-daily", truthRows as unknown as Record<string, unknown>[], `Day-level latent variables of the generator — the ground truth the agent chain is supposed to recover. Not part of the book. \`rho\` is workload ÷ capacity in reference-AHT hours; \`overflow_mult\` multiplies voice contacts; \`spillover_mult\` multiplies contacts per transaction.`);

// ---------------------------------------------------------------------------
// 8. Weekly summary and signature checks
// ---------------------------------------------------------------------------
type Agg = { tx: number; txM: number; v: number; c: number; e: number; vh: number; ch: number; eh: number; vIn: number; cIn: number; eIn: number; vAht: number; cAhtE: number; cAhtA: number; prod: number; rho: number; n: number; hAht: number; hN: number; cAht: number; cN: number };
const weeks = new Map<number, Agg>();
const wkOf = (d: number) => Math.ceil(d / 7);
for (let d = 1; d <= P.days; d++) {
  const w = wkOf(d);
  if (!weeks.has(w)) weeks.set(w, { tx: 0, txM: 0, v: 0, c: 0, e: 0, vh: 0, ch: 0, eh: 0, vIn: 0, cIn: 0, eIn: 0, vAht: 0, cAhtE: 0, cAhtA: 0, prod: 0, rho: 0, n: 0, hAht: 0, hN: 0, cAht: 0, cN: 0 });
  const a = weeks.get(w)!;
  const t = truthRows[d - 1];
  txRows.filter((r) => r.day === d).forEach((r) => (a.tx += r.transactions as number));
  a.txM += t.tx_migrated;
  const rows = demandRows.filter((r) => r.day === d);
  for (const r of rows) {
    if (r.channel === "voice") { a.v += r.offered; a.vh += r.handled; a.vIn += r.handled_in_sl; a.vAht += r.aht_agent_sec * r.handled; }
    if (r.channel === "chat") { a.c += r.offered; a.ch += r.handled; a.cIn += r.handled_in_sl; a.cAhtE += r.aht_sec * r.handled; a.cAhtA += r.aht_agent_sec * r.handled; }
    if (r.channel === "email") { a.e += r.offered; a.eh += r.handled; a.eIn += r.handled_in_sl; }
  }
  supplyRows.filter((r) => r.day === d).forEach((r) => (a.prod += r.productive_hours));
  cohortRows.filter((r) => r.day === d && r.channel === "voice").forEach((r) => {
    if (r.cohort === "Larkspur home team") { a.hAht += (r.aht_agent_sec as number) * (r.handled as number); a.hN += r.handled as number; }
    else { a.cAht += (r.aht_agent_sec as number) * (r.handled as number); a.cN += r.handled as number; }
  });
  a.rho += t.rho;
  a.n++;
}
const lines: string[] = [];
lines.push("| wk | days | tx book | tx migr | voice | chat | email | c/tx | voice SL | chat SL | email SL | voice AHT agent (Crest/Home) | chat AHT elapsed/agent | prod hrs | ρ |");
lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const [w, a] of weeks) {
  const d0 = (w - 1) * 7 + 1, d1 = Math.min(P.days, w * 7);
  const pct = (x: number, y: number) => (y > 0 ? (100 * x / y).toFixed(0) + "%" : "–");
  lines.push(`| ${w} | ${d0}–${d1} | ${a.tx} | ${a.txM} | ${a.v} | ${a.c} | ${a.e} | ${a.txM > 0 ? ((a.v + a.c + a.e) / a.txM).toFixed(2) : "–"} | ${pct(a.vIn, a.v)} | ${pct(a.cIn, a.c)} | ${pct(a.eIn, a.e)} | ${a.vh > 0 ? (a.vAht / a.vh).toFixed(0) : "–"} (${a.cN > 0 ? (a.cAht / a.cN).toFixed(0) : "–"}/${a.hN > 0 ? (a.hAht / a.hN).toFixed(0) : "–"}) | ${a.ch > 0 ? (a.cAhtE / a.ch).toFixed(0) + "/" + (a.cAhtA / a.ch).toFixed(0) : "–"} | ${a.prod.toFixed(0)} | ${(a.rho / a.n).toFixed(2)} |`);
}
const summary = lines.join("\n");
writeFileSync(join(OUT.sim, "weekly-summary.md"), `# Weekly summary (generated, seed ${P.seed})\n\n${summary}\n`);
console.log(summary);

// signature checks
const D = (d: number, ch: Channel) => demandRows.find((r) => r.day === d && r.channel === ch)!;
const T = (d: number) => truthRows[d - 1];
const prodOf = (d: number) => supplyRows.filter((r) => r.day === d && r.cohort === "Crestline Services").reduce((a, r) => a + r.productive_hours, 0);
const sameDowAvg = (d: number, ch: Channel, k = 3) => { let s = 0, n = 0; for (let i = 1; i <= k; i++) { if (d - 7 * i >= P.phase2Day) { s += D(d - 7 * i, ch).offered; n++; } } return n ? s / n : 0; };
const txBook = (d: number) => txRows.filter((r) => r.day === d).reduce((a, r) => a + (r.transactions as number), 0);
const txEast = (d: number) => txRows.find((r) => r.day === d && r.region === "East")!.transactions as number;
const checks: [string, boolean, string][] = [
  ["Voice AHT shift visible on day 3 (Crestline ≥ 1.5× Beacon 1150)", D(3, "voice").aht_agent_sec >= 1.5 * P.refAht.voice, `${D(3, "voice").aht_agent_sec} s`],
  ["Phase 1 buffer hides the shift (chat SL ≥ 90% days 2–36)", demandRows.filter((r) => r.channel === "chat" && r.day >= 2 && r.day <= 36).every((r) => r.sl_pct >= 90), `min ${Math.min(...demandRows.filter((r) => r.channel === "chat" && r.day >= 2 && r.day <= 36).map((r) => r.sl_pct))}%`],
  ["Phase 1 staffing ≈ 2.5× true requirement (weekly avg)", (() => { const req = truthRows.slice(1, 36).reduce((a, t) => a + t.workload_ref_hours * cohortAvgMult(P.crestlineMult) / P.reqOccupancy, 0); const sup = supplyRows.filter((r) => r.day >= 2 && r.day <= 36 && r.cohort === "Crestline Services").reduce((a, r) => a + r.productive_hours, 0); return sup / req > 2.2 && sup / req < 2.9; })(), (() => { const req = truthRows.slice(1, 36).reduce((a, t) => a + t.workload_ref_hours * cohortAvgMult(P.crestlineMult) / P.reqOccupancy, 0); const sup = supplyRows.filter((r) => r.day >= 2 && r.day <= 36 && r.cohort === "Crestline Services").reduce((a, r) => a + r.productive_hours, 0); return (sup / req).toFixed(2) + "×"; })()],
  ["Phase 2 doubles contacts overnight (day 37 vs day 30, same weekday)", (D(37, "chat").offered + D(37, "voice").offered) / (D(30, "chat").offered + D(30, "voice").offered) > 1.6, `×${((D(37, "chat").offered + D(37, "voice").offered) / (D(30, "chat").offered + D(30, "voice").offered)).toFixed(2)}`],
  ["Phase 2 lands on plan (chat SL ≥ 80% on day 37)", D(37, "chat").sl_pct >= 80, `${D(37, "chat").sl_pct}%`],
  ["Chat SL breaks around day 44 (< 80% on day 44, < 65% by day 51)", D(44, "chat").sl_pct < 80 && D(51, "chat").sl_pct < 65, `${D(44, "chat").sl_pct}% / ${D(51, "chat").sl_pct}%`],
  ["Calls per transaction roughly double over three weeks after the break", T(65).overflow_mult >= 1.8, `overflow ×${T(65).overflow_mult}`],
  ["Re-contact spillover +10–15% contacts per transaction", T(65).spillover_mult >= 1.1, `spillover ×${T(65).spillover_mult}`],
  ["Training pull days 57–58: Crestline productive hours −30% vs the same weekday a week earlier", prodOf(57) / prodOf(50) < 0.75 && prodOf(58) / prodOf(51) < 0.75, `${(100 * prodOf(57) / prodOf(50)).toFixed(0)}% / ${(100 * prodOf(58) / prodOf(51)).toFixed(0)}%`],
  ["Training pull looks like demand: chat abandons ×2 on day 57", D(57, "chat").abandoned / Math.max(1, D(56, "chat").abandoned) > 1.5, `×${(D(57, "chat").abandoned / Math.max(1, D(56, "chat").abandoned)).toFixed(2)}`],
  ["Outage day 63: contacts spike vs same weekday, transactions flat", D(63, "chat").offered / sameDowAvg(63, "chat") > 1.3 && Math.abs(txBook(63) / ((txBook(56) + txBook(70)) / 2) - 1) < 0.12, `chat ×${(D(63, "chat").offered / sameDowAvg(63, "chat")).toFixed(2)}, book tx ${(txBook(63) / ((txBook(56) + txBook(70)) / 2)).toFixed(2)}× the adjacent Sundays`],
  ["Weather days 80–82: East transactions ×1.4+ and contacts up", txEast(81) / txEast(74) > 1.4 && D(81, "voice").offered / D(74, "voice").offered > 1.3, `East tx ×${(txEast(81) / txEast(74)).toFixed(2)}, voice ×${(D(81, "voice").offered / D(74, "voice").offered).toFixed(2)}`],
  ["Home team learning curve: last-7-day voice AHT ≤ 1.15× Beacon; Crestline still ≈1.7×", (() => { const avg = (c: Cohort) => { const r = cohortRows.filter((x) => (x.day as number) >= P.days - 6 && x.cohort === c && x.channel === "voice"); return r.reduce((a, x) => a + (x.aht_agent_sec as number) * (x.handled as number), 0) / r.reduce((a, x) => a + (x.handled as number), 0); }; return avg("Larkspur home team") <= 1.15 * P.refAht.voice && avg("Crestline Services") >= 1.6 * P.refAht.voice; })(), (() => { const avg = (c: Cohort) => { const r = cohortRows.filter((x) => (x.day as number) >= P.days - 6 && x.cohort === c && x.channel === "voice"); return r.reduce((a, x) => a + (x.aht_agent_sec as number) * (x.handled as number), 0) / r.reduce((a, x) => a + (x.handled as number), 0); }; return `home ${avg("Larkspur home team").toFixed(0)} s (${(avg("Larkspur home team") / P.refAht.voice).toFixed(2)}×), Crestline ${avg("Crestline Services").toFixed(0)} s (${(avg("Crestline Services") / P.refAht.voice).toFixed(2)}×)`; })()],
  ["Two-definitions trap: chat elapsed AHT ≥ 2× agent AHT every live day", demandRows.filter((r) => r.channel === "chat" && r.offered > 0).every((r) => r.aht_sec >= 1.9 * r.aht_agent_sec), "elapsed = agent × concurrency"],
  ["Beacon composition: whole-book ratio ≈ 0.35, North/East ≈ 0.9", (() => { const pre = beaconRows.filter((r) => (r.day as number) <= 0); const t = pre.reduce((a, r) => a + (r.transactions as number), 0), c = pre.reduce((a, r) => a + (r.contacts_total as number), 0); const n = pre.filter((r) => r.region === "North"); const tn = n.reduce((a, r) => a + (r.transactions as number), 0), cn = n.reduce((a, r) => a + (r.contacts_total as number), 0); return Math.abs(c / t - 0.35) < 0.03 && Math.abs(cn / tn - 0.9) < 0.06; })(), (() => { const pre = beaconRows.filter((r) => (r.day as number) <= 0); const t = pre.reduce((a, r) => a + (r.transactions as number), 0), c = pre.reduce((a, r) => a + (r.contacts_total as number), 0); const n = pre.filter((r) => r.region === "North"); const tn = n.reduce((a, r) => a + (r.transactions as number), 0), cn = n.reduce((a, r) => a + (r.contacts_total as number), 0); return `book ${(c / t).toFixed(3)}, North ${(cn / tn).toFixed(3)}`; })()],
  ["Interval rows reconcile to daily (offered, handled, in_sl, abandoned)", (() => { for (const r of demandRows) { if (r.channel === "email") continue; const iv = intervalRows.filter((x) => x.day === r.day && x.channel === r.channel); const s = (k: string) => iv.reduce((a, x) => a + (x[k] as number), 0); if (s("offered") !== r.offered || s("handled") !== r.handled || s("handled_in_sl") !== r.handled_in_sl || s("abandoned") !== r.abandoned) return false; } return true; })(), "exact"],
  ["Cohort rows reconcile to daily handled", (() => { for (const r of demandRows) { const s = cohortRows.filter((x) => x.day === r.day && x.channel === r.channel).reduce((a, x) => a + (x.handled as number), 0); if (s !== r.handled) return false; } return true; })(), "exact"],
  ["Service recovers by day 120 (chat SL ≥ 80% on day 120)", D(120, "chat").sl_pct >= 80, `${D(120, "chat").sl_pct}%`],
];
console.log("\nPlanted-signature checks:");
let fails = 0;
for (const [name, ok, detail] of checks) {
  if (!ok) fails++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}
console.log(`\nWrote ${demandRows.length} daily-channel rows, ${intervalRows.length} interval rows, ${cohortRows.length} cohort rows, ${txRows.length} transaction rows, ${supplyRows.length} supply rows, ${beaconRows.length} Beacon rows, ${eventRows.length} events, ${planRows.length} plan rows. ${fails ? fails + " check(s) FAILED" : "All checks passed"}.`);
