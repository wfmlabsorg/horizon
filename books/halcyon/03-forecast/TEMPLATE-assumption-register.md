# Assumption register — v<nnn>-<label>

**Forecast version:** v<nnn> · **Horizon:** short | mid | long · **Grain:** interval | daily | weekly | monthly
**Produced by:** agent:Forecaster · **Date:** YYYY-MM-DD · **Status:** proposed | approved | superseded
**Forecast grade:** [ ] (= lowest grade in the table below)

Rules: every load-bearing input is a row. `carried_from` is never blank; anything from another
book, platform, channel or era cannot be `[M]`. `structural/transitional` is never blank; it
decides whether the row reaches the capacity plan. `what would change it` names an observation
and a threshold, not a feeling. Rows are never deleted; a retired row gets `status: retired`
and, if replaced, the id that replaces it.

| id | assumption | value | grade | carried_from | structural / transitional | what would change it | owner |
|---|---|---|---|---|---|---|---|
| AS-001 | <e.g. contacts per transaction, East, Meridian> | <point or range + unit> | [M]/[C]/[E]/[A] | measured-this-book: `02-demand/…-v002.csv` / prior-version: v001 AS-004 / other-book: … / vendor-statement: … / judgement | structural / transitional / unknown | <observation + threshold, e.g. two weeks of East cpt outside 0.42–0.48> | <one role or name> |
| AS-002 | | | | | | | |

## Sensitivity (required for approved versions)

| id | range tested | effect on offered | effect on requirement hours |
|---|---|---|---|
| AS-001 | low → high | ±n% | ±n% |

## Retired or replaced in this version

| id | reason | replaced by |
|---|---|---|
| | | |
