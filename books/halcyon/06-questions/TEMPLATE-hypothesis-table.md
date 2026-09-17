# Hypothesis table — XR-###

**Question (title sentence):** <copy from the register>
**Opened:** YYYY-MM-DD · **Owner:** agent:CausalAnalyst · **Rung reached:** 1 | 2 | 3
**DAG:** <path to the diagram or a one-line description of nodes and arrows>
**Confounders named:** <e.g. EV-004 outage in the same week as the go-live; vendor cohort change
and channel change together>

Rules: every row has a **structural or transitional** tag; `unknown` is legal but blocks any
plan that cites the row. Association is never written as cause: a row reaches `supported` at
rung 1 only as "associated with"; a causal claim needs rung 2 or above and an Evaluator pass.
The residual, after decomposition, is its own row, labelled as residual.

| id | claim | driver | structural / transitional | evidence for | evidence against | test that settles it | data needed | status | grade |
|---|---|---|---|---|---|---|---|---|---|
| H-001 | <one falsifiable sentence> | <named cause> | structural / transitional / unknown | <text [grade] source> | <text [grade] source> | <test + threshold> | <ledger file, grain, period> | open / testing / supported / refuted / inconclusive / superseded | [M]/[C]/[E]/[A] |
| H-002 | | | | | | | | | |
| H-res | Residual after decomposition | unexplained | unknown | | | | | open | [E] |

## Decomposition (PostAnalyst, rung 1)

Method: shapley | sequential · Period: … · Baseline: forecast v<nnn>

| component | share of miss | grade |
|---|---|---|
| volume | | |
| handle time | | |
| mix | | |
| supply | | |
| residual | | |

## What would change the answer

<the observation that would move the leading hypothesis from supported to refuted, or the
reverse, with its threshold and where it would be seen>

## Evaluator

Result: pass | block | pending · Date: … · Notes: <rung respected? grades present? definitions
cited? carried assumptions labelled?>
