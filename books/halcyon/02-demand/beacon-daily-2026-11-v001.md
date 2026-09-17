# beacon-daily-2026-11-v001.csv

**Ledger:** beacon-daily · **Period:** 2026-11 · **Version:** v001 · **Supersedes:** none
**Source system:** synthetic export (`sim/generate.ts`, seed 20260720) standing in for the platform export · **Pulled at:** 2026-11-01T06:00:00+00:00 (simulated monthly pull; the daily clock reads only rows dated on or before its run date)
**Written by:** agent:DataEngineer · **Reconciled:** per day, see `RECONCILIATION.md` in this folder

Beacon history by region: 56 days before day 1 for all regions, then each region while it remains on Beacon (East to day 36, West throughout). Beacon messaging is asynchronous with no timeout, so `messaging_elapsed_h` is hours and only `messaging_aht_agent_work_s` is comparable to Meridian chat `aht-agent-work`. Numbers from this file carried into a Meridian forecast are [E] at best, with the bridge assumption named.

## Columns, definitions and grades

| column | definition (slug in `01-definitions/`) | grade | note |
|---|---|---|---|
| `date` | — | — | negative `day` values are before migration day 1 |
| `region` | — | — |  |
| `platform` | — | — | Beacon |
| `transactions` | `transaction` | [M] |  |
| `contacts_voice` | `contact` | [M] |  |
| `contacts_messaging` | `contact` | [M] | Beacon messaging maps to Meridian chat for mix purposes only |
| `contacts_email` | `contact` | [M] |  |
| `contacts_total` | `contact` | [M] |  |
| `contacts_per_transaction` | `contacts-per-transaction` | [C] | per region, Beacon |
| `voice_aht_agent_work_s` | `aht-agent-work` | [M] | = elapsed on voice; the 1,150 s baseline the plan carried |
| `messaging_aht_agent_work_s` | `aht-agent-work` | [M] | the only messaging figure comparable to Meridian chat |
| `messaging_elapsed_h` | `aht-elapsed` | [M] | hours; not comparable to anything on Meridian |
| `email_aht_agent_work_s` | `aht-agent-work` | [M] |  |
| `version` | — | — |  |
| `actor` | — | — |  |

## Provenance

Synthetic data with a recorded ground truth in `sim/GROUND-TRUTH.md`; regenerate with `bun run sim/generate.ts`. Rows in this file: 16. A re-pull would be `v002` with `supersedes: v001`; this file is never overwritten.
