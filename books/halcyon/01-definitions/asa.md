# asa

**Name:** Average speed of answer
**Formula:** `asa = Σ(wait from first queue entry to answer, handled contacts) / handled`.
Email: time from arrival to first agent response.
**Unit:** seconds (email: reported in seconds, displayed in hours)
**Source system:** Computed from ACD contact-level wait; mock: `02-demand/demand-daily-*.csv`
column `asa_s`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M])

## Known traps

- ASA excludes abandoned contacts by this definition. A queue with heavy abandonment can show
  a good ASA. Always read with `abandoned` and `service-level`.
- The mean hides the tail. Where a distribution matters (weather days, outages) the daily note
  reports the 90th percentile alongside, graded [C], from the interval ledger.
- Daily ASA is contact-weighted across intervals, not the mean of interval ASAs.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
