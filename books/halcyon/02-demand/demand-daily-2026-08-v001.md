# demand-daily-2026-08-v001.csv

**Ledger:** demand-daily · **Period:** 2026-08 · **Version:** v001 · **Supersedes:** none
**Source system:** synthetic export (`sim/generate.ts`, seed 20260720) standing in for the platform export · **Pulled at:** 2026-08-01T06:00:00+00:00 (simulated monthly pull; the daily clock reads only rows dated on or before its run date)
**Written by:** agent:DataEngineer · **Reconciled:** per day, see `RECONCILIATION.md` in this folder

Daily actuals by region × channel on Meridian. Regions appear from their go-live day (North day 2, East day 37). Offered, handled, handled-in-SL and abandoned are split from the skill-level export by region of the traveler profile (largest-remainder allocation on transaction weight, stated here because the export is by skill); handle time and ASA are measured at skill level and are therefore identical across regions on a day.

Chat: `aht_elapsed_s` is wall-clock session time including the customer's wait up to the 600 s inactivity timeout and time on concurrent chats; `aht_agent_work_s` is elapsed ÷ effective concurrency. Voice and email: the two are equal. **Never labelled AHT.** The plan of record cites `aht-agent-work`; compare like with like.

## Columns, definitions and grades

| column | definition (slug in `01-definitions/`) | grade | note |
|---|---|---|---|
| `date` | — | — | Day 1 = 2026-07-20 (Mon); `day` and `dow` are convenience columns |
| `region` | — | — | North · East (West is on Beacon in this window) |
| `channel` | — | — | voice · chat · email |
| `platform` | — | — | Meridian |
| `offered` | `offered` | [M] | email: arrivals |
| `handled` | `handled` | [M] | email: = offered (no abandons; backlog carried) |
| `handled_in_sl` | `handled-in-sl` | [M] | threshold voice 20 s · chat 180 s · email 7,200 s |
| `abandoned` | `abandoned` | [M] | chat: customer exits before answer; post-answer timeouts are not abandons |
| `asa_s` | `asa` | [C] | email: first-response time |
| `sl_pct` | `service-level` | [C] | `handled_in_sl ÷ offered × 100` (no short-abandon exclusion in this export) |
| `aht_elapsed_s` | `aht-elapsed` | [M] | see note above |
| `aht_agent_work_s` | `aht-agent-work` | [C] | the staffing number; chat = elapsed ÷ `concurrency_eff` (04-supply) |
| `version` | — | — | ledger file version |
| `actor` | — | — | who wrote the row |

Reconciliation identities (DataEngineer): `offered = handled + abandoned` on voice and chat; `handled = offered` on email; `handled_in_sl ≤ handled`; the sum over regions of a channel-day equals the sum of that channel-day's rows in `demand-interval`; the sum over regions of `handled` equals the sum over cohorts in `demand-cohort`.

## Provenance

Synthetic data with a recorded ground truth in `sim/GROUND-TRUTH.md`; regenerate with `bun run sim/generate.ts`. Rows in this file: 114. A re-pull would be `v002` with `supersedes: v001`; this file is never overwritten.
