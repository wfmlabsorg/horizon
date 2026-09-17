# offered

**Name:** Offered contacts
**Formula:** Contacts that reached a human-staffed skill queue in the period, counted once per
contact at first queue entry. `offered = handled + abandoned + still_in_queue_at_period_end`.
**Unit:** count per period (interval, day)
**Source system:** Contact router (ACD) queue events; mock: `02-demand/demand-daily-*.csv`
column `offered`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [M]

## Known traps

- Email "offered" is arrivals into the work queue, not a queue-offer event. Email does not
  abandon; it ages. The reconciliation identity above needs the backlog term on email.
- Voice offers exclude calls that dropped in the IVR before reaching a skill; those are
  contacts but not offered. Do not use offered as the demand driver for IVR capacity.
- Re-offers after a transfer are excluded (one contact, one offer).
- Interval offered is attributed to the interval of first queue entry, not of answer.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
