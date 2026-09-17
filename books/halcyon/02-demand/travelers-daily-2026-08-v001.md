# travelers-daily-2026-08-v001.csv

**Ledger:** travelers-daily · **Period:** 2026-08 · **Version:** v001 · **Supersedes:** none
**Source system:** synthetic export (`sim/generate.ts`, seed 20260720) standing in for the platform export · **Pulled at:** 2026-08-01T06:00:00+00:00 (simulated monthly pull; the daily clock reads only rows dated on or before its run date)
**Written by:** agent:DataEngineer · **Reconciled:** per day, see `RECONCILIATION.md` in this folder

Distinct travelers contacting per day on Meridian, contacts per traveler-day, and contacts per transaction for the migrated regions. The ratio here is a per-platform ratio (Meridian, migrated regions), not the whole-book ratio; see `contacts-per-transaction` for the composition trap.

## Columns, definitions and grades

| column | definition (slug in `01-definitions/`) | grade | note |
|---|---|---|---|
| `date` | — | — |  |
| `platform` | — | — | Meridian |
| `contacts` | `contact` | [M] | sum of offered across channels |
| `active_travelers` | `contacts-per-traveler-day` | [E] | population input; distinct travelers contacting that day |
| `contacts_per_traveler_day` | `contacts-per-traveler-day` | [C] | `contacts ÷ active_travelers` |
| `transactions_migrated_regions` | `transaction` | [M] | sum over regions on Meridian that day |
| `contacts_per_transaction` | `contacts-per-transaction` | [C] | Meridian, migrated regions only |
| `version` | — | — |  |
| `actor` | — | — |  |

## Provenance

Synthetic data with a recorded ground truth in `sim/GROUND-TRUTH.md`; regenerate with `bun run sim/generate.ts`. Rows in this file: 31. A re-pull would be `v002` with `supersedes: v001`; this file is never overwritten.
