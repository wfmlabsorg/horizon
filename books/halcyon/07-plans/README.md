# 07-plans — capacity plans

A capacity plan turns an approved mid- or long-horizon forecast into hours, FTE, a roster
shape and a gap, by region, channel and cohort, by month. It is produced on the monthly clock,
carries its own assumption register, and waits for a human signature before it is exported.

## The chain

```
approved forecast (03, mid/long)          offered_fc, aht_agent_work_fc_s, by month
        │
        ▼
requirement hours   = offered × aht_agent_work / 3600 / planning occupancy        cites requirement-hours
        │
        ▼
FTE required        = req_h / (contract hours per FTE × (1 − planned shrink) × (1 − unplanned shrink))   cites fte, by cohort
        │
        ▼
roster shape        FTE by cohort × tenure band × region, with hires, attrition, ramp and training in the month
        │
        ▼
gap                 = on-roster productive capacity − requirement, in hours first, FTE second; by month
```

Every arrow carries grades. The plan's grade is the lowest grade among its load-bearing
assumptions, and the plan says which assumption that is.

## Layout

```
07-plans/
  README.md
  TEMPLATE-capacity-plan.md
  v001-<label>/
    capacity-plan.md      the TEMPLATE filled in: answer-first summary, tables, decisions requested
    capacity-plan.csv     book × region × channel × cohort × month: req_hours, productive_hours_planned, fte_required, fte_on_roster, gap_fte, grade
    assumptions.md        the assumption register (03-forecast/TEMPLATE-assumption-register.md shape)
    scenarios/            one folder per scenario: <label>/capacity-plan.csv + delta.md
    signoff.md            who signed, when, which forecast version, which scenario is base
  anaplan/
    plan-export-<period>-v<nnn>.csv      written by the Anaplan adapter after sign-off
```

## Scenarios

Each plan carries a base and at least two scenarios that move the assumptions the register
marks as most sensitive (in this book: phase-3 population timing, handle-time bridge at
go-live, vendor delivery against plan). A scenario is the same CSV with a different label
and a `delta.md` that says which assumption rows moved and by how much. Scenarios are not
signed; the base is.

## Monthly sign-off

The plan is proposed by the CapacityPlanner, passed or blocked by the Evaluator, and signed
by the Halcyon planning lead and the account lead. Signature is recorded in `signoff.md` as
`human:<role>`, the date, the forecast version cited, and the assumptions the signers
explicitly accepted at `[E]` or `[A]`. The run state records the `planner-monthly-signoff`
gate. Until signed:

- no Anaplan export;
- the plan is cited as "proposed v<nnn>" in any note, never as "the plan".

A signed plan is archive lifecycle. The next month's plan is a new version citing it.

## Evaluator rules on a plan

Every driver and assumption tagged structural or transitional; no transitional driver in the
steady-state requirement; hours by cohort use that cohort's contract hours; handle time cites
`aht-agent-work`; occupancy target is an assumption row with its sensitivity; carried figures
labelled; the gap is stated in hours before FTE.

## Anaplan-shaped export

`/adapters/anaplan/SPEC.md` defines the file. One row per book × region × channel × cohort ×
month, with grade and `assumptions_ref`, signed by a human actor. The adapter refuses anything
else.
