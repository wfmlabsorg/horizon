# Daily note — Halcyon — YYYY-MM-DD

**Scoring day:** YYYY-MM-DD (D+n of migration) · **Forecast scored:** 03-forecast/v<nnn> (approved)
**Run:** daily-YYYY-MM-DD-r1 · **Issued:** YYYY-MM-DD HH:MM · **Gate:** planner-reforecast passed | not needed | blocked (by whom, why)
**Data:** 02-demand …-v<nnn> [M] · 04-supply …-v<nnn> [M]; vendor supply [E] until file lands

## The day in one line per channel

| channel | title sentence (the answer) | grade |
|---|---|---|
| voice | <e.g. "Voice landed on forecast in all regions; the East go-live effect is not visible on voice."> | [C] |
| chat | <e.g. "East chat missed SL by 9 points because agent-work handle time is 18% above forecast for the fourth day, not because volume moved."> | [C] |
| email | | |

**Decision requested:** none | <one sentence · who · by when>
**Next date:** <next scoring day or the date a test settles>
**What would change the answer:** <one observation with threshold>

## Forecast vs actual

| region | channel | offered fc | offered act | Δ% | aht_agent_work fc | act | Δ% | SL target | SL act | ASA | abandoned % |
|---|---|---|---|---|---|---|---|---|---|---|---|

All handle times cite `aht-agent-work`. Elapsed is shown only where a timeout or concurrency
question is open, and is labelled `aht-elapsed`.

## Variance decomposition (rung 1)

Method: shapley | sequential · Baseline: forecast v<nnn>

| region | channel | miss (req. hours) | volume | handle time | mix | supply | residual | grade |
|---|---|---|---|---|---|---|---|---|

Regime flags: <SPC or changepoint flags with the series, date and rule, or "none">

## Events matched

| event | type | window | matched to | effect estimate | grade |
|---|---|---|---|---|---|
| EV-### | | | <region/channel miss> | | |

Proposed by the Scout today (awaiting acceptance): <EV-### one line each, or "none">

## Open hypotheses touched today

| XR | H | claim | status | what today's data did | next test / date |
|---|---|---|---|---|---|

## Reforecast

**Status:** not needed | proposed v<nnn> | approved v<nnn> | blocked
**Trigger:** <the miss or regime flag, or the clock>
**Assumptions changed:** AS-### <from → to, grade> …
**Evaluator:** pass | block — <one line>
**Planner gate:** passed by human:<role> at HH:MM | pending | blocked — <reason>
**IEX export:** written forecast-import-<period>-v<nnn>.csv | not written (version not approved)

## Supply

| region | channel | cohort | scheduled h | staffed h | productive h | shrink planned | shrink unplanned | occupancy | grade |
|---|---|---|---|---|---|---|---|---|---|

## Register movements today

<XR rows opened, re-rated or closed, one line each, or "none">
