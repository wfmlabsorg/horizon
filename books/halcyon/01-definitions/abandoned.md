# abandoned

**Name:** Abandoned contacts
**Formula:** Offered contacts where the customer left the queue before an agent answered.
Short abandons (wait < 5 s) are counted in `abandoned` and separately tagged `abandoned_short`.
**Unit:** count per period
**Source system:** Contact router (ACD); mock: `02-demand/demand-daily-*.csv` column
`abandoned`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [M]

## Known traps

- Email does not abandon. The column is zero on email by definition, not by performance.
- Chat: a customer who leaves after the agent accepted is a handled contact with a short
  handle time, not an abandon. A customer who leaves while waiting is an abandon. A session the
  system closed for inactivity before acceptance is an abandon; after acceptance it is a
  timeout inside handle time (see `aht-elapsed`).
- Reporting "abandon rate" needs its denominator stated: offered (this book) or offered minus
  short abandons (some vendor reports). Crestline Services' own dashboard uses the second.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
