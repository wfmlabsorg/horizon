# Phase 1 backlog — reconciliation items from the phase 0 build, and what phase 1 found

Recorded 2026-09-16 at merge; updated 2026-09-17 at the end of phase 1. Each is a decision, not a defect to hide.

## Resolved in phase 1

1. **Column and file naming.** *Resolved.* The generator writes the schema column names (`aht_elapsed_s`, `aht_agent_work_s`, `asa_s`, `scheduled_h`, `staffed_h`, `productive_h`, `shrink_planned_pct`, `shrink_unplanned_pct`, `occupancy_pct`, `concurrency_eff`, `headcount_in_training`) and versioned file names `<what>-<period>-v001.csv`, **one file per calendar month** with a `.md` sidecar each. Monthly rather than daily because the source systems deliver monthly pulls and the DataEngineer's job is to read one date's rows and stamp the reconciliation per day (`RECONCILIATION.md`); 720 daily files would say nothing the stamp does not. `demand-daily` is split by region (allocation on transaction weight, stated in the sidecar); supply rows carry `region = channel = all` because the cohorts are blended pools, and the supply schema now allows `all`. The old files were deleted (a shape change, not a re-pull). Seed and planted effects unchanged; 18 signature checks PASS.
2. **Plan-of-record assumptions.** *Resolved.* `forecast-daily.csv` is by region × channel; `fc_aht_sec` is now `aht_agent_work_fc_s` and the sidecar states the definition and the carry. `assumptions.md` follows `TEMPLATE-assumption-register.md` (AS-001 … AS-023; carried rows labelled `other-platform` [E]); `version.json` and `lineage.md` added. The traps stay: the ratio is still the whole-book 0.35 applied per region, the handle times are still Beacon's.
3. **Chat inactivity timeout.** *Resolved at merge* (600 s everywhere).
4. **Surge event EV-010.** *Kept.* The recovery is confounded three ways on purpose; the chain opened XR-007 for the capacity step and cited EV-010 [A] without treating it as the explanation.
5. **Predecessor references.** *Resolved.* Only `docs/DESIGN.md`.

## Found in phase 1, for phase 2 onward

6. **The events ledger has no cohort column.** The Scout infers the cohort from the description ("home team", "Crestline"). Add `cohort` to `events.csv` and `event.schema.json`.
7. **`events.csv` is not in the event schema's shape** (`event_id`/`start_date`/`planned` vs `id`/`start`/`status`). The Scout's proposals follow the schema's fields in markdown; when a planner accepts one, the ledger needs a row shape that fits both. Decide in phase 2 (the Librarian owns 05).
8. **Same-weekday transactions inside a ramp.** The three-week same-weekday mean lags a seasonal ramp; the outage day read ×1.23 (truth ×1.09). Use a seasonally adjusted or West-referenced comparison.
9. **Trend detection latency.** The 21-point slope test found the home-team learning curve three weeks after go-live. A cusum on the cohort series would find it in about ten days; decide whether to add it (it is a different rule, so document it).
10. **Transient flags are noisy** (about one a week on the vendor handle-time series). The materiality floor keeps them out of the register, and the Scout proposes a candidate for each; 39 candidates over 119 days is more than a planner will review. Options: propose only for transients that coincide with an SL miss, or batch them weekly.
11. **Occupancy above 100%** on days 57–58 and a few break days: the generator does not cap handled work by delivered hours. Either cap it or keep it as the DataEngineer's outlier example. Kept for now.
12. **Rule-2 onset dating** puts a shift at the first of the three points beyond 2σ (surge add reads day 76, chat step day 43). Acceptable for a rung-1 flag; the CausalAnalyst should date the break from the event.
13. **The CHANGELOG mixes real dates and simulated dates.** Phase-0 and phase-1 build rows are dated 2026-09-16/17; clock rows carry the simulated run date. Add a `run_id` column or a `simulated: true` marker in phase 2.
14. **Register touches only happen on flags.** Without a CausalAnalyst nothing updates a row between flags, so the 2026-11-16 register report lists six stale rows. Phase 2's CausalAnalyst stage should touch every open row whose settling test has new data.
15. **Weekly review has no PostAnalyst file of its own.** `03-forecast/variance/weekly/YYYY-Www.md` (PostAnalyst spec) is not written; the review computes the week inline. Add it when the Forecaster's assumption refresh needs a source.
16. **Interval-level SPC and occupancy share** (the occupancy definition asks for the share of intervals above the sustainable threshold) are not computed. Phase 2 or 3.
17. **A general schema validator** (`schemas/README.md`) is still not written; run-state files were checked by hand against the schema.
