# requirement-hours

**Name:** Requirement hours
**Formula:** Per skill, region and period:
`req_h = (forecast_offered × forecast_aht_agent_work / 3600) / target_occupancy`
at interval grain for the short horizon (with the service-level target solved through the
queue model in the forecast, so that `target_occupancy` is the occupancy that meets SL at that
interval's load), and at month grain for the long horizon (with an assumed planning occupancy).
Summed to the period.
**Unit:** hours per period
**Source system:** Computed by the Forecaster (short) and CapacityPlanner (long); mock:
`07-plans/v<nnn>-*/capacity-plan.csv` column `req_hours`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C]; in practice [E], because forecast inputs are estimates

## Known traps

- Requirement hours carry the grade of the worst input. A forecast built on an `[A]`
  handle-time figure gives `[A]` requirement hours however careful the arithmetic. State the
  grade of each input in the plan.
- Handle time cites `aht-agent-work`, never `aht-elapsed`. On chat the difference is the whole
  concurrency factor.
- The occupancy in the denominator is a planning assumption (structural). Requirement hours are
  sensitive to it roughly one-for-one; the plan states the sensitivity.
- A requirement built on the plan-of-record forecast and a requirement built on the latest
  reforecast are two different numbers; the plan says which version it cites (lineage).

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
