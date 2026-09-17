# scheduled-hours

**Name:** Scheduled hours
**Formula:** Σ(shift hours on the published schedule for the period), per skill, cohort and
region, before any shrinkage. Breaks inside shifts are included in scheduled hours (they are
shrinkage).
**Unit:** hours per period
**Source system:** WFM scheduling system (IEX-shaped export); Crestline Services schedule file;
mock: `04-supply/supply-daily-*.csv` column `scheduled_h`
**Owner:** Halcyon scheduling lead (Larkspur Travel)
**Highest attainable grade:** [M] (home team); [A] or [E] (vendor, where the schedule arrives
as headcount by interval and is converted)

## Known traps

- Crestline Services delivers a headcount-by-interval plan, not a schedule. Converting it to
  hours is a computation with an assumed interval length and an assumed break policy; grade
  accordingly.
- "Published schedule" is the version in force at the start of the day. Intraday changes are in
  `staffed-hours`, not here. Comparing scheduled to staffed is the point.
- Training days scheduled off-phone are scheduled hours (and then planned shrinkage). A training
  pull that was not on the published schedule shows as a staffed-hours shortfall against
  schedule, which is the supply-side regime break the phase-0 data contains.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
