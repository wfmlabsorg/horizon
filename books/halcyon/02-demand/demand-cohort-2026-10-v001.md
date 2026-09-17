# demand-cohort-2026-10-v001.csv

**Ledger:** demand-cohort · **Period:** 2026-10 · **Version:** v001 · **Supersedes:** none
**Source system:** synthetic export (`sim/generate.ts`, seed 20260720) standing in for the platform export · **Pulled at:** 2026-10-01T06:00:00+00:00 (simulated monthly pull; the daily clock reads only rows dated on or before its run date)
**Written by:** agent:DataEngineer · **Reconciled:** per day, see `RECONCILIATION.md` in this folder

Handled contacts and handle time by cohort (`vendor` = Crestline Services, `home-team` = Larkspur home team) and channel: the agent-group view. `handled` sums to the channel-day total in `demand-daily`. `productive_h` is the cohort's whole-day productive hours copied from `04-supply` for convenience; the supply ledger is authoritative.

Chat: `aht_elapsed_s` is wall-clock session time including the customer's wait up to the 600 s inactivity timeout and time on concurrent chats; `aht_agent_work_s` is elapsed ÷ effective concurrency. Voice and email: the two are equal. **Never labelled AHT.** The plan of record cites `aht-agent-work`; compare like with like.

## Columns, definitions and grades

| column | definition (slug in `01-definitions/`) | grade | note |
|---|---|---|---|
| `date` | — | — |  |
| `cohort` | — | — | vendor · home-team (schema enum) |
| `team` | — | — | Crestline Services · Larkspur home team |
| `channel` | — | — |  |
| `platform` | — | — |  |
| `handled` | `handled` | [M] |  |
| `aht_elapsed_s` | `aht-elapsed` | [M] | per cohort |
| `aht_agent_work_s` | `aht-agent-work` | [C] | per cohort |
| `productive_h` | `productive-hours` | [M] | whole cohort-day, all channels; from 04-supply |
| `version` | — | — |  |
| `actor` | — | — |  |

## Provenance

Synthetic data with a recorded ground truth in `sim/GROUND-TRUTH.md`; regenerate with `bun run sim/generate.ts`. Rows in this file: 186. A re-pull would be `v002` with `supersedes: v001`; this file is never overwritten.
