# 03-forecast — versioned forecasts

Every forecast is a folder. Nothing in a forecast folder is edited after it is proposed; a
change is a new version.

## Layout

```
03-forecast/
  README.md
  TEMPLATE-assumption-register.md
  v000-plan-of-record/
    forecast.csv        the numbers, by horizon grain (interval/daily/weekly/monthly), by region × channel
    assumptions.md      the assumption register (TEMPLATE-assumption-register.md filled in)
    lineage.md          inputs (ledger files with versions), parent version, method, trigger, events and questions considered
    version.json        descriptor validated by /schemas/forecast-version.schema.json
  v001-<label>/
  v002-<label>/
```

`v<nnn>` increments across all horizons; the horizon is in `version.json`, not the folder
name. `<label>` is a lowercase slug that says why the version exists: `plan-of-record`,
`reforecast-day12`, `phase2-golive`, `monthly-2026-10`.

## Horizons and grains

| Horizon | Range | Grain | Produced on | Consumed by |
|---|---|---|---|---|
| short | 1–6 weeks | interval and daily | daily clock (reforecast) | IEX adapter, daily note |
| mid | 3–18 months | weekly | monthly clock | capacity plan (07) |
| long | annual plan | monthly | monthly clock | capacity plan, Anaplan export |

## `forecast.csv` columns

`date` (or `week_start` / `month`), `interval_start` (short horizon only), `region`, `channel`,
`platform`, `offered_fc`, `aht_agent_work_fc_s`, `grade`, `assumption_ids`. The handle-time
column cites `aht-agent-work` and only that; a forecast that carries an elapsed handle time
is not admissible (see `01-definitions/aht-elapsed.md`).

## Status flow

```
proposed  ──(Evaluator pass + planner approval)──▶  approved  ──(next approval)──▶  superseded
    │
    └──(Evaluator block or planner rejection)──▶  stays proposed; a revised version is a new v<nnn>
```

- **proposed**: written by the Forecaster. May be scored against actuals but may not be
  exported to IEX or cited by a capacity plan.
- **approved**: one approved version per horizon at a time. The IEX adapter exports only this.
- **superseded**: the previous approved version, kept forever with `superseded_by` filled in.
  Archive lifecycle; read-only.

## Who may approve

Only a human. `version.json` rejects an `approver` that does not start with `human:`. In this
book the approver is the Halcyon planning lead (short and mid horizons) and the planning lead
plus the account lead together for the long horizon (monthly sign-off, recorded in
`07-plans/`). The Evaluator passes or blocks before the planner sees it; an Evaluator pass is
not an approval.

Evaluator rules on a forecast: every load-bearing assumption is in the register with a grade;
no carried assumption is unlabelled (`carried_from` never blank); the handle-time input cites
`aht-agent-work`; the lineage names the exact ledger versions; the grade of the forecast is the
lowest grade in the register.

## Reforecast triggers

The daily clock proposes a reforecast when the PostAnalyst's decomposition shows a miss that
is not explained by a matched event, or a regime flag; the weekly clock always refreshes the
assumption register; the monthly clock always produces a mid and long version. The trigger is
recorded in `lineage.md` and `version.json.lineage.trigger`.

## The plan of record

`v000-plan-of-record/` is the forecast the book started with (`forecast-daily.csv`, by region ×
channel, with `version.json`, `assumptions.md` and `lineage.md`). It carries a book-level
contacts-per-transaction ratio applied to every region (AS-008) and Beacon handle times carried
across the platform change and labelled, since phase 1, as `aht_agent_work_fc_s` [E]
(AS-011–AS-013), which is the point: the chain should find both. Phase 1 has no Forecaster, so
v000 is the only version and is scored every day; the daily note's reforecast block says
"proposed: blocked".
