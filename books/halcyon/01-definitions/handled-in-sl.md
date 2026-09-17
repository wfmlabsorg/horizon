# handled-in-sl

**Name:** Handled within service-level threshold
**Formula:** Handled contacts whose wait from first queue entry to answer was ≤ the channel
threshold. Thresholds are in `00-profile/` contract targets (phase 0: voice 20 s, chat 30 s,
email 4 h to first response).
**Unit:** count per period
**Source system:** Contact router (ACD); mock: `02-demand/demand-daily-*.csv` column
`handled_in_sl`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [M]

## Known traps

- The threshold is part of the definition. A number labelled "in SL" without a threshold is
  not admissible. A contract change to the threshold is a definition change (log it here).
- Abandoned contacts inside the threshold are not in this count; they are handled in the
  `service-level` denominator rule instead.
- Email: the clock starts at arrival, including out-of-hours arrival. A 4 h target measured
  against business hours is a different definition.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
