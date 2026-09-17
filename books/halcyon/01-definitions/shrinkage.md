# shrinkage

**Name:** Shrinkage
**Formula:** `shrinkage = 1 − productive_h / scheduled_h`, split into planned (on the
published schedule: breaks, training, meetings, leave) and unplanned (absence, lateness,
unscheduled aux). `planned + unplanned = shrinkage`.
**Unit:** percent
**Source system:** Computed from `scheduled-hours` and `productive-hours`; mock:
`04-supply/supply-daily-*.csv` columns `shrink_planned_pct`, `shrink_unplanned_pct`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M] for home team; [E] for vendor)

## Known traps

- The base is scheduled hours, not paid hours and not staffed hours. A shrinkage figure on a
  paid-hours base is systematically higher and is a different definition.
- Planned shrinkage is a planning input; unplanned shrinkage is a planning assumption. The
  capacity plan carries them as two assumption-register rows, not one.
- A training pull off the published schedule is unplanned shrinkage on the day it happens and
  a supply-side cause of a service miss. It is not a demand event, however much it looks like
  one in the SL chart. The phase-0 data contains one such two-day break.
- Vendor shrinkage is not observable in the mock (no agent-state records); it is inferred from
  headcount delivered versus headcount planned and graded [E].

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
