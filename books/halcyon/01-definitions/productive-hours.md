# productive-hours

**Name:** Productive hours
**Formula:** `productive_h = staffed_h − Σ(hours in non-productive aux states)`. The
productive states are: available, handling (talk/chat/email work), after-contact work, hold.
Every other aux code is non-productive. The aux-code mapping table is in `00-profile/`.
**Unit:** hours per period
**Source system:** Computed from ACD agent-state records; mock: `04-supply/supply-daily-*.csv`
column `productive_h`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M])

## Known traps

- The aux-code mapping is a definition, not a fact. Moving "coaching" from productive to
  non-productive changes this number with no change in the floor. Mapping changes are logged
  in this file's change history and in `05-events/` as `product-change`.
- Crestline Services' own productive-hours figure uses a different mapping (they count
  "system issue" as productive). Re-map before comparing.
- Productive hours are the denominator of `occupancy` and the supply side of the gap in
  `07-plans/`. A productive-hour definition that quietly includes non-productive time makes
  occupancy look better and the gap look smaller. That is the direction this number errs in
  when nobody is watching.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
