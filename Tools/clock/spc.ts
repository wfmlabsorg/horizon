/**
 * SPC for the PostAnalyst: individuals chart with moving-range sigma, Western Electric rules 1 and 2,
 * a trend test, and a per-series regime state machine (level shift · trend · transient · continuing).
 *
 * First principles (see Tools/clock/README.md):
 *  - sigma = mean moving range / 1.128 (d2 for n = 2), on the baseline window;
 *  - baseline = the last 28 in-regime points before today, minimum 14 (Wheeler: short baselines give unreliable limits); series with day-of-week shape are
 *    deseasonalised with factors estimated on the baseline (needs ≥ 21 points) or supplied by the caller;
 *  - rule 1: one point beyond 3σ; rule 2: two of three consecutive points beyond 2σ on the same side;
 *  - trend: least-squares slope over the last 21 points with |t| > 4 and fitted change > 3σ;
 *  - materiality: a statistical signal counts only if it also clears a practical floor set per series (see runSpc);
 *  - a confirmed level shift (rule 2, or rule 1 on two consecutive days) re-bases the series from its onset;
 *    until 14 post-onset points exist the excursion is reported as "continuing", not as a new flag, and spikes on top of
 *    the new level are caught with provisional limits (post-onset mean, pre-shift σ).
 */

export interface Point { date: string; value: number; dow?: number }
export interface Limits { mean: number; sigma: number; ucl: number; lcl: number; n: number; baseline: string }
export interface SeriesFlag {
  date: string; onset: string; rule: string; kind: "level shift" | "trend" | "transient" | "continuing"; direction: "up" | "down";
  value: number; mean: number; sigma: number; ucl: number; lcl: number; baseline: string; magnitudePct: number;
}

export function limitsFor(values: number[], baselineDesc: string): Limits | null {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length < 8) return null;
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  let mr = 0;
  for (let i = 1; i < v.length; i++) mr += Math.abs(v[i] - v[i - 1]);
  const sigma = mr / (v.length - 1) / 1.128;
  return { mean, sigma, ucl: mean + 3 * sigma, lcl: mean - 3 * sigma, n: v.length, baseline: baselineDesc };
}

export function slopeT(values: number[]): { slope: number; t: number; change: number } {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const xm = (n - 1) / 2, ym = values.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - xm) * (values[i] - ym); sxx += (xs[i] - xm) ** 2; }
  const slope = sxy / sxx;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (values[i] - (ym + slope * (xs[i] - xm))) ** 2;
  const se = Math.sqrt(sse / (n - 2) / sxx);
  return { slope, t: se > 0 ? slope / se : 0, change: slope * (n - 1) };
}

export interface SeriesOptions {
  minBaseline?: number;        // default 8
  window?: number;             // default 28
  deseasonalise?: boolean;     // estimate day-of-week factors on the baseline
  fixedDow?: number[];         // divide every point by these day-of-week factors (a known shape from the profile); no estimation
  fallbackDow?: number[];      // factors to use when the baseline is too short to estimate them
  carry?: { values: number[]; desc: string } | null; // baseline to use before the series has enough points (e.g. Beacon history)
  minEffectPct?: number;       // materiality floor: |value − mean| must exceed this % of the mean to count as a signal
  minEffectAbs?: number;       // materiality floor in the series' own unit (used instead of minEffectPct when set)
  trendWindow?: number;        // default 21
}

/**
 * Run the state machine over the whole series (chronological) and return the flag, if any, for each date.
 * Deterministic and history-only: the flag for date t uses points ≤ t.
 */
export function analyseSeries(points: Point[], opts: SeriesOptions = {}): Map<string, SeriesFlag> {
  const minB = opts.minBaseline ?? 14, win = opts.window ?? 28, tw = opts.trendWindow ?? 21;
  const material = (x: number, mean: number) => (opts.minEffectAbs !== undefined ? Math.abs(x - mean) >= opts.minEffectAbs : Math.abs(x - mean) >= ((opts.minEffectPct ?? 0) / 100) * Math.abs(mean));
  const out = new Map<string, SeriesFlag>();
  let regimeStart = 0;              // index of the first point in the current regime
  let onset: string | null = null;  // onset of an open excursion
  let excursionDir: "up" | "down" | null = null;
  let carried: Limits | null = opts.carry ? limitsFor(opts.carry.values, opts.carry.desc) : null;
  const adj: number[] = new Array(points.length).fill(NaN);
  let lastLim: Limits | null = null;
  let lastMinB = minB;

  for (let t = 0; t < points.length; t++) {
    const base = points.slice(Math.max(regimeStart, t - win), t);
    // day-of-week factors
    let factors: number[] | null = null;
    if (opts.deseasonalise) {
      if (base.length >= 21) {
        const byDow: number[][] = [[], [], [], [], [], [], []];
        base.forEach((p) => byDow[p.dow ?? 0].push(p.value));
        const all = base.reduce((a, p) => a + p.value, 0) / base.length;
        factors = byDow.map((v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length / all : 1));
      } else if (opts.fallbackDow) factors = opts.fallbackDow;
    }
    const f = (p: Point) => (opts.fixedDow ? p.value / opts.fixedDow[p.dow ?? 0] : factors ? p.value / factors[p.dow ?? 0] : p.value);
    const baseVals = base.map(f);
    const x = f(points[t]);
    adj[t] = x;
    let lim = baseVals.length >= minB ? limitsFor(baseVals, `${base.length} prior in-regime days${factors || opts.fixedDow ? ", day-of-week adjusted" : ""}`) : null;
    let grade = "M";
    // the carried baseline is used only until the first confirmed shift; after that the series stands on its own
    if (!lim && carried && regimeStart === 0 && t < minB) { lim = carried; grade = "E"; }
    if (!lim) {
      // Not enough in-regime points yet. An open excursion is reported as continuing against the last limits, and the
      // point is also checked against provisional limits (post-onset mean, pre-shift σ) so a spike on top of the new
      // level is still caught as a transient (e.g. an outage inside a ramp).
      if (onset !== null && lastLim) {
        const post = adj.slice(regimeStart, t).filter((v) => Number.isFinite(v));
        if (post.length >= 2) {
          const pm = post.reduce((a, b) => a + b, 0) / post.length;
          const zp = lastLim.sigma > 0 ? (x - pm) / lastLim.sigma : 0;
          const prevZ = lastLim.sigma > 0 ? (post[post.length - 1] - pm) / lastLim.sigma : 0;
          // a spike, not a continuing climb: yesterday sat within 2σ of the provisional mean
          if (Math.abs(zp) > 3 && Math.abs(prevZ) <= 2 && material(x, pm)) {
            out.set(points[t].date, { date: points[t].date, onset: points[t].date, rule: "WE rule 1 (provisional limits: post-onset mean, pre-shift σ)", kind: "transient", direction: zp > 0 ? "up" : "down", value: x, mean: pm, sigma: lastLim.sigma, ucl: pm + 3 * lastLim.sigma, lcl: pm - 3 * lastLim.sigma, baseline: `${post.length} post-onset days (provisional), σ from ${lastLim.baseline}`, magnitudePct: pm !== 0 ? ((x - pm) / Math.abs(pm)) * 100 : 0 });
            continue;
          }
        }
        const magC = lastLim.mean !== 0 ? ((x - lastLim.mean) / Math.abs(lastLim.mean)) * 100 : 0;
        out.set(points[t].date, { date: points[t].date, onset, rule: "re-basing", kind: "continuing", direction: excursionDir ?? "up", value: x, mean: lastLim.mean, sigma: lastLim.sigma, ucl: lastLim.ucl, lcl: lastLim.lcl, baseline: lastLim.baseline + ` (pre-shift limits; new limits after ${lastMinB} post-onset days)`, magnitudePct: magC });
      }
      continue;
    }
    lastLim = lim;
    const z = lim.sigma > 0 ? (x - lim.mean) / lim.sigma : 0;
    const dir: "up" | "down" = z >= 0 ? "up" : "down";
    const beyond3 = Math.abs(z) > 3 && material(x, lim.mean);
    const prev = [t - 1, t - 2].map((i) => (i >= regimeStart && Number.isFinite(adj[i]) ? (adj[i] - lim!.mean) / lim!.sigma : 0));
    const rule2 = [z, ...prev].filter((v) => (dir === "up" ? v > 2 : v < -2)).length >= 2 && Math.abs(z) > 2 && material(x, lim.mean);
    const rule1 = beyond3;
    // trend over the last 14 points of the regime
    let trend = false, trendChange = 0;
    const recent = adj.slice(Math.max(regimeStart, t - (tw - 1)), t + 1).filter((v) => Number.isFinite(v));
    if (recent.length >= tw && !rule1 && !rule2) {
      const s = slopeT(recent);
      if (Math.abs(s.t) > 4 && Math.abs(s.change) > 3 * lim.sigma && material(recent[recent.length - 1], recent[0])) { trend = true; trendChange = s.change; }
    }
    const mag = lim.mean !== 0 ? ((x - lim.mean) / Math.abs(lim.mean)) * 100 : 0;
    const common = { date: points[t].date, value: x, mean: lim.mean, sigma: lim.sigma, ucl: lim.ucl, lcl: lim.lcl, baseline: `${lim.baseline}${grade === "E" ? " (carried)" : ""}`, magnitudePct: mag };
    if (onset !== null && excursionDir === dir && (rule1 || rule2 || (Math.abs(z) > 2 && material(x, lim.mean)))) {
      // excursion continues: after two points it is a level shift; re-base from onset
      const onsetIdx = points.findIndex((p) => p.date === onset);
      const persisted = t - onsetIdx + 1;
      if (persisted >= 2 && regimeStart !== onsetIdx) { regimeStart = onsetIdx; }
      out.set(points[t].date, { ...common, onset, rule: rule1 ? "WE rule 1" : rule2 ? "WE rule 2" : "beyond 2σ", kind: persisted >= 2 ? (persisted === 2 ? "level shift" : "continuing") : "transient", direction: dir });
      continue;
    }
    if (rule1 || rule2) {
      onset = rule2 && !rule1 ? points[Math.max(regimeStart, t - 2)].date : points[t].date;
      // rule 2 with the earlier point: onset is the first of the three that was beyond 2σ
      if (rule2) { for (let i = t - 2; i <= t; i++) { if (i >= regimeStart && Number.isFinite(adj[i]) && (dir === "up" ? adj[i] > lim.mean + 2 * lim.sigma : adj[i] < lim.mean - 2 * lim.sigma)) { onset = points[i].date; break; } } }
      excursionDir = dir;
      const kind: SeriesFlag["kind"] = rule2 ? "level shift" : "transient";
      if (rule2) { regimeStart = points.findIndex((p) => p.date === onset); }
      out.set(points[t].date, { ...common, onset, rule: rule1 ? (rule2 ? "WE rule 1 and 2" : "WE rule 1") : "WE rule 2", kind, direction: dir });
      continue;
    }
    if (trend) {
      const on = points[Math.max(regimeStart, t - (tw - 1))].date;
      out.set(points[t].date, { ...common, onset: on, rule: `trend (slope |t| > 4 over ${tw} d, change > 3σ)`, kind: "trend", direction: trendChange > 0 ? "up" : "down", magnitudePct: (trendChange / Math.abs(lim.mean)) * 100 });
      continue;
    }
    // back inside: close the excursion
    if (onset !== null && Math.abs(z) <= 2) { onset = null; excursionDir = null; }
  }
  return out;
}
