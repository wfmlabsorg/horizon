/** Shared types for the phase-1 clock. Numbers here are plain; grades and definitions are attached when rendered. */

export type Region = "North" | "East" | "West";
export type Channel = "voice" | "chat" | "email";
export type CohortKey = "vendor" | "home-team";
export type Grade = "M" | "C" | "E" | "A";

export const CHANNELS: Channel[] = ["voice", "chat", "email"];
export const REGIONS: Region[] = ["North", "East", "West"];
export const TEAM_NAME: Record<CohortKey, string> = { vendor: "Crestline Services", "home-team": "Larkspur home team" };
export const SL_TARGET: Record<Channel, { pct: number; text: string }> = {
  voice: { pct: 80, text: "80% in 20 s" },
  chat: { pct: 80, text: "80% in 3 min" },
  email: { pct: 90, text: "90% in 2 h" },
};

export interface DemandRow {
  date: string; day: number; region: Region; channel: Channel; platform: string;
  offered: number; handled: number; handled_in_sl: number; abandoned: number;
  asa_s: number; sl_pct: number; aht_elapsed_s: number; aht_agent_work_s: number; version: string; file: string;
}
export interface IntervalRow { date: string; interval_start: string; channel: Channel; offered: number; handled: number; handled_in_sl: number; abandoned: number; }
export interface CohortRow { date: string; day: number; cohort: CohortKey; team: string; channel: Channel; handled: number; aht_elapsed_s: number; aht_agent_work_s: number; productive_h: number; file: string; }
export interface TxRow { date: string; region: Region; platform: string; transactions: number; }
export interface TravelerRow { date: string; contacts: number; active_travelers: number; contacts_per_traveler_day: number; transactions_migrated_regions: number; contacts_per_transaction: number; }
export interface BeaconRow { date: string; day: number; region: Region; transactions: number; contacts_total: number; contacts_voice: number; contacts_messaging: number; contacts_email: number; contacts_per_transaction: number; voice_aht_agent_work_s: number; messaging_aht_agent_work_s: number; email_aht_agent_work_s: number; }
export interface SupplyRow {
  date: string; day: number; cohort: CohortKey; team: string; scheduled_h: number; staffed_h: number; productive_h: number;
  shrink_planned_pct: number; shrink_unplanned_pct: number; occupancy_pct: number; concurrency_eff: number;
  headcount: number; headcount_in_training: number; agents_scheduled: number; status: string; version: string; file: string;
}
export interface ForecastRow { date: string; day: number; region: Region; channel: Channel; offered_fc: number; aht_agent_work_fc_s: number; fc_transactions: number; fc_required_productive_h: number; planned_crestline_heads: number; planned_home_heads: number; }
export interface EventRow {
  event_id: string; type: string; start_day: number; start_date: string; end_day: number; end_date: string; effect_window_days: number;
  region: string; channel_scope: string; planned: boolean; description: string; expected_signature: string; grade: Grade; source: string;
}

export interface Book {
  client: string; dir: string; root: string;
  demand: DemandRow[]; interval: IntervalRow[]; cohort: CohortRow[]; tx: TxRow[]; travelers: TravelerRow[]; beacon: BeaconRow[];
  supply: SupplyRow[]; forecast: ForecastRow[]; events: EventRow[];
  demandFiles: string[]; supplyFiles: string[];
}

/** Output of the DataEngineer stage for one date. */
export interface Reconciliation {
  date: string; reconciled: boolean; demandFile: string; supplyFile: string;
  checks: { name: string; ok: boolean; detail: string }[];
  outliers: string[];
}

export type Side = "demand" | "supply";
export type RegimeKind = "level shift" | "trend" | "transient" | "continuing";

export interface RegimeFlag {
  series: string;               // e.g. "voice · offered attainment (book)" or "vendor · voice · aht-agent-work"
  seriesKey: string;            // stable key for XR de-duplication
  side: Side;
  channel?: Channel; region?: Region; cohort?: CohortKey;
  definition: string;           // definition slug the series cites
  date: string;                 // the day the flag is reported
  onset: string;                // first day of the excursion
  rule: string;                 // "WE rule 1" | "WE rule 2" | "trend (slope > 3 SE over 14 d)"
  kind: RegimeKind;
  direction: "up" | "down";
  value: number; mean: number; sigma: number; ucl: number; lcl: number;
  baseline: string;             // description of the baseline used
  baselineGrade: Grade;
  magnitudePct: number;         // (value - mean) / mean × 100
  note: string;
}

export interface ChannelScore {
  region: Region; channel: Channel;
  offered_fc: number; offered_act: number; offered_dpct: number;
  aht_fc: number; aht_act: number; aht_dpct: number; aht_elapsed_act: number;
  sl_target: number; sl_act: number; asa_s: number; abandoned_pct: number;
  req_fc: number; req_act: number; miss_h: number;
  volume_h: number; handle_h: number; mix_h: number; supply_h: number; residual_h: number;
}
export interface ChannelSummary {
  channel: Channel; offered_fc: number; offered_act: number; offered_dpct: number; aht_fc: number; aht_act: number; aht_dpct: number;
  aht_elapsed_act: number; sl_target: number; sl_act: number; miss_h: number; volume_h: number; handle_h: number; mix_h: number; supply_h: number; residual_h: number;
  leadDriver: "volume" | "handle time" | "mix" | "supply"; leadShare: number; withinTolerance: boolean; slMet: boolean;
}
export interface RatioCheck { cptActual: number; cptPlan: number; beaconByRegion: { region: Region; cpt: number; days: number }[]; beaconBook: number; cptdActual: number; txMigrated: number; txMigratedFc: number; }
export interface TxCheck { region: Region | "book"; today: number; sameWeekdayAvg: number; ratio: number; flat: boolean; }

export interface Variance {
  date: string; day: number; forecastVersion: string; scores: ChannelScore[]; byChannel: ChannelSummary[];
  flags: RegimeFlag[]; continuing: RegimeFlag[]; ratio: RatioCheck | null; txChecks: TxCheck[];
  supplyGapH: number; supplyNote: string; occupancy: { cohort: CohortKey; occupancy_pct: number; productive_h: number; scheduled_h: number; unplanned_pct: number; planned_pct: number }[];
  chatDefinitionNote: string | null; simpson: string[]; file: string;
  cohortAht: { cohort: CohortKey; channel: Channel; aht: number; handled: number }[];
}

export interface EventMatch { event: EventRow; matchedTo: string[]; explains: boolean; effectEstimate: string; grade: Grade; window: string; }
export interface ProposedEvent { id: string; file: string; title: string; side: Side; forFlag: string; grade: Grade; }
export interface ScoutResult { date: string; matches: EventMatch[]; proposed: ProposedEvent[]; unexplained: RegimeFlag[]; }

export interface XrRow {
  id: string; title: string; description: string; opened: string; sev: number; status: string; trend: string; business_risk: string;
  decision_needed: string; owner: string; line_of_sight: string; expected_close: string; next_action: string; last_update: string;
  grade: Grade; source: string; would_change: string; hypotheses: string; route: string; notes: string;
}
export interface XrTouch { id: string; h: string; claim: string; status: string; whatTodayDid: string; nextTest: string; opened: boolean; }
export interface LibrarianResult { date: string; opened: XrRow[]; touched: XrTouch[]; movements: string[]; }

export interface StageRecord { id: number; name: string; agent: string; status: string; input_files: string[]; output_files: string[]; started_at: string; completed_at: string; notes: string; }
