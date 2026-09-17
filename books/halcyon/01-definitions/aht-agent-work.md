# aht-agent-work

**Name:** Average handle time, agent work
**Formula:** Per channel:
`aht_agent_work = (aht_elapsed − mean_customer_timeout_wait) / effective_concurrency + acw`
where `effective_concurrency` is from `concurrency` for the same period and skill, timeout
wait is the portion of elapsed time the session sat idle before system close, and `acw` is
after-contact work (not divided, since it is done outside the concurrent session). On voice,
concurrency = 1 and timeout wait = 0, so `aht_agent_work = aht_elapsed`.
**Unit:** seconds
**Source system:** Computed from ACD contact records and agent-state records; mock:
`02-demand/demand-daily-*.csv` column `aht_agent_work_s`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M]; on chat the concurrency input may be [E], in
which case this number is [E])

## The two-definitions trap

This is the second of the two numbers called "AHT" in this book. The full comparison table is
in `aht-elapsed.md`; the rules are repeated here because this is the one staffing depends on.

- **This is the staffing number.** `requirement-hours` cites this file. A requirement computed
  from `aht-elapsed` on chat is wrong by the concurrency factor.
- On chat, elapsed time includes the customer's silent wait up to the inactivity timeout. That
  wait is customer time, not agent time. It is removed here.
- On chat, an agent's elapsed session time overlaps with other sessions. Dividing by
  **effective** concurrency (what actually ran, from `concurrency`), not the configured
  maximum, converts session time into agent time.
- On voice the two numbers coincide, which is how the confusion survives: a voice-first team
  learns that "AHT is AHT" and carries the habit to chat.

## Other known traps

- The grade of this number is the grade of its worst input. When effective concurrency is
  estimated (vendor data without agent-state records), this number is [E] and says so.
- A vendor cohort and the home-team cohort may run different effective concurrency on the same
  skill. Compute per cohort; blended is [C] and cites both.
- The synthetic ground truth in phase 0 applies a level shift to agent-work time at go-live,
  with a learning curve on the home-team cohort and none on Crestline Services. Elapsed time
  moves too, but not proportionally, because the timeout term does not shift.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition; two-definitions trap recorded |
