# contact

**Name:** Contact
**Formula:** One customer-initiated interaction on one channel that reaches the routing layer.
Voice: one inbound call leg. Chat: one chat session. Email: one inbound message thread opened
(replies inside an existing thread within 7 days are the same contact).
**Unit:** count
**Source system:** Contact router (ACD) event log; mock: `02-demand/` daily and interval ledgers
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [M]

## Known traps

- A re-contact (the same traveler about the same trip within 72 h) is a contact. It is not
  removed from demand; it is tagged so `contacts-per-transaction` can be split into first and
  repeat.
- Transfers between skills create a second router event but one contact. Count by originating
  contact ID, not by segment.
- Email threads: a thread reopened after 7 days is a new contact. This threshold is a
  definition choice; it is stated here so that no one "corrects" it silently.
- Bot-deflected sessions are not contacts unless they reach a human skill. Phase-0 synthetic
  data has no bot, so any bot-era benchmark from another book overstates deflection here.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
