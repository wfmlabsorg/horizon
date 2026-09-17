# handled

**Name:** Handled contacts
**Formula:** Offered contacts answered by an agent in the period, counted in the interval of
answer. Voice: call connected to an agent. Chat: agent accepted the session. Email: first
agent response sent.
**Unit:** count per period
**Source system:** Contact router (ACD) agent events; mock: `02-demand/demand-daily-*.csv`
column `handled`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [M]

## Known traps

- `handled ≠ offered − abandoned` on email, because of backlog carried across the period
  boundary. On voice and chat the identity holds within a day but not within an interval.
- Handled counts contacts, not segments. A contact transferred and handled twice is one.
- Chat: sessions accepted but timed out with no agent message are handled by this definition.
  They inflate handled and depress `aht-agent-work`. Tag them; do not remove them.
- The Beacon-era export counted "handled" at wrap-up completion; the Meridian-era export counts
  at answer. The day-level difference is small; the interval-level difference is a systematic
  shift of one interval. See `INDEX.md` migration list.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
