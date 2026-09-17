# supply-daily-2026-11-v001.csv

**Ledger:** supply-daily · **Period:** 2026-11 · **Version:** v001 · **Supersedes:** none
**Source system:** synthetic export (`sim/generate.ts`, seed 20260720) standing in for the platform export · **Pulled at:** 2026-11-01T06:00:00+00:00 (simulated monthly pull; the daily clock reads only rows dated on or before its run date)
**Written by:** agent:DataEngineer · **Reconciled:** per day, see `RECONCILIATION.md` in this folder

Supply by cohort per day. Both cohorts are blended pools across all channels and both migrated regions, so `region` and `channel` carry `all` (the supply schema allows `all` for a blended pool; a dedicated split would be a computed allocation, not a measurement, and is not stored). Vendor schedules arrive as headcount; hours are derived at 8 h per scheduled shift.

## Columns, definitions and grades

| column | definition (slug in `01-definitions/`) | grade | note |
|---|---|---|---|
| `date` | — | — |  |
| `region` | — | — | `all` — blended pool |
| `channel` | — | — | `all` — blended pool |
| `cohort` | — | — | vendor · home-team |
| `team` | — | — | Crestline Services · Larkspur home team |
| `scheduled_h` | `scheduled-hours` | [M] | `agents_scheduled × 8`, plus classroom hours for a cohort in training |
| `staffed_h` | `staffed-hours` | [M] | scheduled minus absence |
| `productive_h` | `productive-hours` | [C] | staffed minus in-day shrinkage; nesting counted at 25 % of staffed |
| `shrink_planned_pct` | `shrinkage` | [C] | base = scheduled hours; breaks, coaching, scheduled training, classroom, nesting |
| `shrink_unplanned_pct` | `shrinkage` | [C] | base = scheduled hours; absence, lateness, and any in-day loss above the contracted 18 % (an off-schedule pull) |
| `occupancy_pct` | `occupancy` | [C] | `Σ(handled × aht_agent_work_s) ÷ 3600 ÷ productive_h`, agent-work numerator, from demand-cohort |
| `concurrency_eff` | `concurrency` | [C] home-team / [E] vendor | effective chat concurrency for the day; the configured ceiling is 3 |
| `headcount` | `fte` | [M] | contracted (vendor) or assigned (home team) heads on the book |
| `headcount_in_training` | `fte` | [M] | classroom, nesting, or pulled into a session that day |
| `agents_scheduled` | — | [M] | heads rostered to a shift; extra column beyond the schema |
| `status` | — | — | readiness · phase-1 hypercare · phase-2 steady state · surge add · classroom training · nesting · live · not yet engaged |
| `version` | — | — |  |
| `actor` | — | — |  |

Identity: `shrink_planned_pct + shrink_unplanned_pct = (1 − productive_h ÷ scheduled_h) × 100` within rounding.

## Provenance

Synthetic data with a recorded ground truth in `sim/GROUND-TRUTH.md`; regenerate with `bun run sim/generate.ts`. Rows in this file: 32. A re-pull would be `v002` with `supersedes: v001`; this file is never overwritten.
