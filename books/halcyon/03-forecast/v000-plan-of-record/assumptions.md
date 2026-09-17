# Assumption register — v000-plan-of-record

**Forecast version:** v000 · **Horizon:** short (scored daily) and mid (the only version in force) · **Grain:** daily
**Produced by:** human:planning lead (Larkspur Travel) · **Date:** 2026-07-13 · **Status:** approved (plan of record at migration start; frozen, never edited; superseded only by a new version)
**Forecast grade:** [A] (= lowest grade in the table below: AS-001, AS-003, AS-008/009, AS-014–AS-023)

Rules: every load-bearing input is a row. `carried_from` is never blank; anything from another
book, platform, channel or era cannot be `[M]`. `structural/transitional` is never blank.
`what would change it` names an observation and a threshold. Rows are never deleted.

Phase 1 note: the columns follow `TEMPLATE-assumption-register.md`. The ids `AS-###` replace the
phase-0 `A##` labels one for one (A08 → AS-008). The phase-0 register presented four carried Beacon
measurements as if they applied on Meridian; this version labels them `other-platform` and `[E]`,
which is what the register would have done had it existed at the time. Nothing else changed.

| id | assumption | value | grade | carried_from | structural / transitional | what would change it | owner |
|---|---|---|---|---|---|---|---|
| AS-001 | Whole-book transactions, weekday base | 1,250 per weekday | [A] | client-statement: booking-platform monthly report, June 2026 | structural | four weeks of book transactions outside 1,150–1,350 per weekday | planning lead |
| AS-002 | Weekday shape on transactions | Mon 1.08 · Tue 1.12 · Wed 1.08 · Thu 1.02 · Fri 0.90 · Sat 0.38 · Sun 0.42 | [C] | other-platform: Beacon, last 8 weeks | structural | any weekday factor off by more than 0.10 over four weeks | planning lead |
| AS-003 | Seasonality | none ("autumn peak is a West phenomenon; migrated regions are flat") | [A] | judgement: planning lead | structural | migrated-region transactions rising more than 15% over four weeks with West rising too | planning lead |
| AS-004 | Regional shares of transactions | North 8% · East 7% · West 85% | [C] | client-statement: booking platform, June 2026 | structural | any share moving more than 2 points | planning lead |
| AS-005 | Phase 1 scope and date | North, day 2 (2026-07-21) | [A] | client-statement: migration programme calendar | structural | a calendar change | migration PM |
| AS-006 | Phase 2 scope and date | East, day 37 (2026-08-25) | [A] | client-statement: migration programme calendar | structural | a calendar change | migration PM |
| AS-007 | Phase 3 scope and date | West, day 135 (2026-12-01) | [A] | client-statement: migration programme calendar | structural | a calendar change; outside this forecast's window | migration PM |
| AS-008 | **Contacts per transaction** (`contacts-per-transaction`) | **0.35** applied to every migrated region | [A] | **other-platform: whole-book Beacon, June 2026, contacts ÷ transactions** | structural | the migrated regions' own Beacon ratio (North 0.93 [M]) differing from 0.35 — it does; the definition file says per region per platform and this plan did not do that | planning lead |
| AS-009 | Benchmark cross-check on AS-008 | 0.20 contacts per transaction ("Meridian books run lower than Beacon; 0.35 is therefore conservative") | [A] | **other-book: another Larkspur book already on Meridian, bot ON** | structural | the benchmark book's bot state differing from Halcyon's — it does (AS-021, EV-002); the cross-check is void by construction | planning lead |
| AS-010 | Channel mix | voice 25% · chat 58% · email 17% | [C] | other-platform: Beacon channel split, messaging mapped to chat | structural | voice share outside 20–30% for two weeks | planning lead |
| AS-011 | **Voice handle time** (`aht-agent-work`) | **1,150 s** | [E] (was presented as [M]) | **other-platform: Beacon ACD, 8-week mean, carried without a bridge** | structural | Meridian voice `aht-agent-work` outside 1,050–1,250 s for 14 days | planning lead |
| AS-012 | **Chat handle time** (`aht-agent-work`) | **380 s** | [E] (was presented as [M]) | **other-platform: Beacon messaging agent-work time per conversation** | structural | Meridian chat `aht-agent-work` outside 340–420 s for 14 days. Beacon messaging is asynchronous, so there is no elapsed comparator; any comparison to Meridian `aht_elapsed_s` is a different definition | planning lead |
| AS-013 | Email handle time (`aht-agent-work`) | 420 s | [E] (was presented as [M]) | other-platform: Beacon, 8-week mean | structural | Meridian email `aht-agent-work` outside 380–460 s for 14 days | planning lead |
| AS-014 | Learning curve | none for either cohort | [A] | vendor-statement: "agents are Meridian-certified"; home team assumed to complete the curve in nesting | transitional | cohort handle time falling ≥10% over three weeks after go-live | planning lead |
| AS-015 | Occupancy for requirement (`requirement-hours`) | 85% | [A] | judgement: Larkspur planning standard | structural | delivered occupancy at target service level outside 80–90% | planning lead |
| AS-016 | Shrinkage (`shrinkage`) | 18% in-day (planned), 5% absence (unplanned) | [A] | vendor-statement: Crestline contract schedule | structural | measured unplanned shrinkage above 8% for a week; used to translate requirement to heads, not in the daily forecast | planning lead |
| AS-017 | Crestline heads, phase 1 | 16 | [A] | vendor-statement: hypercare agreement | transitional | the hypercare window ending (day 15) | planning lead |
| AS-018 | Crestline heads, phase 2 | 20 | [C] | prior-version: AS-008 × AS-011–AS-013 → ≈14 productive hours per weekday "covered by the phase 1 buffer", plus 4 heads for East coverage | structural | any of AS-008, AS-011–AS-013 moving; this row inherits their grade, so it is [E] presented as [C] | planning lead |
| AS-019 | Home team | 10 heads; training day 36, nesting day 50, live day 71 | [A] | client-statement: Larkspur L&D calendar | structural | a calendar change | Larkspur L&D |
| AS-020 | Service targets (`service-level`) | voice 80% in 20 s · chat 80% in 3 min · email 90% in 2 h | [A] | client-statement: Halcyon contract | structural | a contract change | account lead |
| AS-021 | Chat bot | off for Halcyon (human-first clause) | [A] | client-statement: contract | structural | a contract change. Recorded, but not connected to AS-009 | account lead |
| AS-022 | Meridian chat inactivity timeout | 600 s | [A] | vendor-statement: platform configuration | structural | a configuration change (log as product-change in 05-events). Not connected to AS-008 or AS-012 | platform config |
| AS-023 | Re-contact and overflow | not modelled | [A] | judgement | transitional | contacts per traveler-day above 1.2 or voice share above 30% once service level breaks | planning lead |

## Sensitivity (required for approved versions)

| id | range tested | effect on offered | effect on requirement hours |
|---|---|---|---|
| AS-008 | 0.35 → 0.93 (North's own Beacon ratio) | +166% | +166% |
| AS-011 | 1,150 → 1,955 s (1.70×) | — | +70% on voice |
| AS-012 | 380 → 551 s (1.45×) | — | +45% on chat |
| AS-015 | 80% → 90% | — | ∓6% |

The sensitivity table was not produced at approval; it is filled here from the definitions' stated
ranges so the register is complete. It is not a reforecast.

## Retired or replaced in this version

| id | reason | replaced by |
|---|---|---|
| — | none: v000 is the first version | — |

## What the register would have caught

Four rows carry a Beacon measurement across a platform change and, in the phase-0 register, presented it at Meridian without an [E] grade or a bridge: AS-008, AS-011, AS-012, AS-013. One row (AS-009) cites a benchmark whose condition (bot on) contradicts a stated fact of the book (AS-021). One row (AS-018) is computed from the four carried rows and inherits their grade, which makes the phase 2 staffing an [E] presented as a [C]. Nothing in the register is wrong as a Beacon measurement; everything is wrong as a Meridian forecast.

## Formulae (for the [C] rows)

- `fc_transactions = 1250 × regional share × weekday factor` (AS-001, AS-002, AS-004), per region from its go-live day
- `offered_fc = fc_transactions × 0.35 × channel mix` (AS-008, AS-010)
- `fc_workload_h = offered_fc × aht_agent_work_fc_s ÷ 3600` (AS-011–AS-013)
- `fc_required_productive_h = fc_workload_h ÷ 0.85` (AS-015)
