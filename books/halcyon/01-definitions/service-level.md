# service-level

**Name:** Service level
**Formula:** `service_level = handled_in_sl / (offered − abandoned_short)`. Abandons after the
short-abandon threshold stay in the denominator (they count against SL).
**Unit:** percent
**Source system:** Computed; mock: `02-demand/demand-daily-*.csv` column `sl_pct`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M])

## Known traps

- Denominator choice changes the number by several points on a bad day. The book uses one
  denominator, stated above. Vendor and client reports that use `handled` as the denominator
  are a different definition and must be re-computed before comparison.
- A whole-book SL is a contact-weighted average across channels and regions; it can hold while
  one channel or one migrated region breaks. The daily note reports SL by channel and region,
  never a single figure.
- Daily SL is not the mean of interval SLs. Compute from summed numerators and denominators.
- When SL breaks, re-contacts rise within the day and next day, which lifts `offered` and
  breaks SL further. The spillover is real demand; the forecast must not treat it as noise,
  and the capacity plan must not treat it as structural.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
