# fte

**Name:** Full-time equivalent
**Formula:** `fte = req_h / (hours_per_fte_per_period × (1 − planned_shrinkage) ×
(1 − unplanned_shrinkage))`, per cohort, skill and region. Hours per FTE per period is a
cohort-specific contract figure from `00-profile/` (phase 0: home team 37.5 h/week; Crestline
Services 40 h/week).
**Unit:** FTE
**Source system:** Computed by the CapacityPlanner; mock: `07-plans/v<nnn>-*/capacity-plan.csv`
column `fte_required`; headcount actuals in `04-supply/headcount-monthly-*.csv`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (required); [M] (on-roster headcount converted at the
contract hours)

## Known traps

- Hours per FTE differ between cohorts. One book-level FTE figure blends two conversion rates;
  show FTE by cohort and let the total be a sum.
- FTE required and headcount on roster are different things: headcount includes people in
  training and on leave, who are not productive hours. The gap in `07-plans/` is in hours first
  and FTE second.
- The Anaplan-shaped export carries FTE at month grain by book, region and channel. An FTE at
  month grain is an average over the month, not a point figure; ramp within the month is lost
  at that grain and must be carried as a plan note.
- A "5 FTE" ask that arrives by email is a planning request only if the decision it feeds can
  be stated. Otherwise it is a data pull (see `06-questions/INTAKE.md`).

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
