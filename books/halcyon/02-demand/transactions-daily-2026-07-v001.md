# transactions-daily-2026-07-v001.csv

**Ledger:** transactions-daily · **Period:** 2026-07 · **Version:** v001 · **Supersedes:** none
**Source system:** synthetic export (`sim/generate.ts`, seed 20260720) standing in for the platform export · **Pulled at:** 2026-07-01T06:00:00+00:00 (simulated monthly pull; the daily clock reads only rows dated on or before its run date)
**Written by:** agent:DataEngineer · **Reconciled:** per day, see `RECONCILIATION.md` in this folder

Transactions per day by region for the whole Halcyon book (all three regions, whatever platform each is on) with the platform the region is on that day. The booking platform is unchanged by the migration, so this count is comparable across the Beacon → Meridian boundary.

## Columns, definitions and grades

| column | definition (slug in `01-definitions/`) | grade | note |
|---|---|---|---|
| `date` | — | — |  |
| `region` | — | — | North · East · West |
| `platform` | — | — | Beacon · Meridian, by region and day |
| `transactions` | `transaction` | [M] | bookings, changes and cancellations completed in the travel system |
| `version` | — | — |  |
| `actor` | — | — |  |

## Provenance

Synthetic data with a recorded ground truth in `sim/GROUND-TRUTH.md`; regenerate with `bun run sim/generate.ts`. Rows in this file: 36. A re-pull would be `v002` with `supersedes: v001`; this file is never overwritten.
