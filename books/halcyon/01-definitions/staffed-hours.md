# staffed-hours

**Name:** Staffed hours
**Formula:** Σ(agent seconds logged in to the ACD in any state other than logged-out) / 3600,
per skill (by primary skill), cohort and region.
**Unit:** hours per period
**Source system:** ACD agent-state records; mock: `04-supply/supply-daily-*.csv` column
`staffed_h`
**Owner:** Halcyon real-time lead (Larkspur Travel)
**Highest attainable grade:** [M]

## Known traps

- Logged-in on chat is not the same as available for a session; an agent at their concurrency
  ceiling is staffed but cannot take an offer. Staffed hours do not measure capacity on chat
  without `concurrency`.
- Multi-skilled agents are attributed to their primary skill here. Skill-level staffing for a
  requirement comparison uses time-in-skill from the interval ledger, which is a different
  cut.
- Vendor agent-state records arrive a day late in the mock. Yesterday's vendor staffed hours in
  today's daily note are [E] until the file lands; the note says so.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
