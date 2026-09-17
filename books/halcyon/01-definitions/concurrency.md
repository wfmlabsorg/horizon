# concurrency

**Name:** Effective concurrency
**Formula:** `effective_concurrency = Σ(chat session elapsed seconds) / Σ(agent seconds in
chat-handling state)` for the period and skill. Voice and email: defined as 1.
**Unit:** ratio (sessions per agent-second)
**Source system:** Computed from ACD contact records and agent-state records; mock:
`04-supply/supply-daily-*.csv` column `concurrency_eff`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M]); [E] when agent-state records are absent

## Known traps

- The configured maximum (phase 0: 3 on chat) is a ceiling, not this number. Effective
  concurrency at low volume runs near 1 and at peak approaches the ceiling. Using the ceiling in
  `aht-agent-work` under-states agent time at off-peak.
- Effective concurrency differs by cohort and by tenure. New agents run lower. A cohort mix
  change moves this number with no change in policy.
- Crestline Services reports session counts but not agent-state seconds in the phase-0 mock;
  their concurrency is estimated from the home-team ratio with a stated adjustment, graded [E].

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
