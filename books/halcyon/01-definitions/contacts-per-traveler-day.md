# contacts-per-traveler-day

**Name:** Contacts per traveler-day
**Formula:** `cptd = contacts / (active travelers × days in period)`, per region. Active
travelers = travelers with at least one transaction or trip in the trailing 90 days, from the
client's monthly traveler feed.
**Unit:** ratio (contacts per traveler per day)
**Source system:** Computed from `contact` (ACD) and the client traveler roster feed
(monthly); mock: `02-demand/travelers-monthly-*.csv` and derived column `cptd`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] at month grain (inputs [M]); [E] at day grain
(population interpolated between monthly feeds)

## Known traps

- The traveler population is a monthly feed. Daily values interpolate it, so daily `cptd` is
  [E] and says so. Do not read daily movements in this ratio as behaviour.
- Population is the driver that migration phases change (phase 2 doubles it). Contact growth
  with **no** population change is the signal this ratio exists to expose; check the population
  feed version before concluding anything.
- Region attaches to the traveler profile. A traveler reassigned between regions moves the
  denominator without moving any contact.
- The same composition trap as `contacts-per-transaction` applies: compute per region and
  platform.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
