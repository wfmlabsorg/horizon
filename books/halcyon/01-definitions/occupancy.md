# occupancy

**Name:** Occupancy
**Formula:** `occupancy = Σ(handled × aht_agent_work) / (productive_h × 3600)`, per skill,
cohort and region. The numerator is **agent-work** time.
**Unit:** percent
**Source system:** Computed; mock: `04-supply/supply-daily-*.csv` column `occupancy_pct`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M]/[C])

## Known traps

- Using `aht-elapsed` in the numerator gives a second "occupancy" that exceeds 100% on chat at
  peak. It is not stored in this book. If a report shows chat occupancy above 100%, it used the
  elapsed number, and the report is wrong, not the floor.
- Occupancy is a result, not a driver. A target occupancy in the capacity plan is an
  assumption-register row (structural), and the plan's FTE is sensitive to it; say by how much.
- Occupancy at day grain hides interval occupancy above the sustainable level. The daily note
  reports the share of intervals above the sustainable threshold from the interval ledger.
- Denominator is productive hours. A productive-hours definition that includes non-productive
  time depresses occupancy.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
