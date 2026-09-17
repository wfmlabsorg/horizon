# Lineage — v000-plan-of-record

**Parent version:** none (first version) · **Trigger:** migration start; the plan of record the book began with · **Status:** approved by human:planning lead, 2026-07-13

## Inputs

| Kind | File or source | Version | Grade | Note |
|---|---|---|---|---|
| demand | `02-demand/beacon-daily-2026-05..07-v001.csv` (the Beacon history, whole book) | v001 | [M] on Beacon | contacts per transaction 0.35 taken whole-book (AS-008); handle times taken as 8-week means (AS-011–AS-013) |
| client | booking-platform monthly report, June 2026 | — | [A] | transactions base and regional shares (AS-001, AS-004) |
| calendar | migration programme calendar; Larkspur L&D calendar | — | [A] | phase dates and cohort dates (AS-005–AS-007, AS-019) |
| vendor | Crestline hypercare agreement and contract schedule | — | [A] | heads and shrinkage (AS-016–AS-018) |
| other book | a Larkspur book already on Meridian, bot on | — | [A] | the 0.20 cross-check (AS-009) — void for Halcyon, whose bot is off |

## Method

Flat phase lines: for each region from its go-live day, `1,250 × share × weekday factor` transactions, `× 0.35` contacts, split by the Beacon channel mix; workload at the Beacon agent-work handle time; requirement at 85% occupancy. No seasonality, no learning curve, no re-contact or overflow. Written by `sim/generate.ts` (section 6) from the same parameters the plan used, so the plan is reproducible.

## Events and questions considered

Events: the planned items on the calendar (EV-001, EV-003, EV-004, EV-006, EV-009, EV-012). Questions: none (the register was empty at migration start).

## What the daily clock does with it

Phase 1 scores v000 every day (`Tools/run-clock.ts daily`) and never proposes a new version: the reforecast block of each daily note reads "proposed: blocked — phase 1 has no Forecaster; v000 remains in force". The weekly review's assumption-register refresh shows what a Forecaster would revise.
