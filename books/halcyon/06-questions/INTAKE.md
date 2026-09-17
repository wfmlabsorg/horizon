# Intake — the door

Everything that arrives (email, chat, a question in a meeting, an ask from leadership, a notice
from the vendor) goes through this form before it touches any ledger. The Librarian fills it
from the message; if a field cannot be filled from the message, it is `null`, and the routing
rule decides what that means.

## The six fields

| # | Field | What it asks | If it cannot be stated |
|---|---|---|---|
| 1 | **Question** | The question in one sentence | Ask the requester for one sentence; do not proceed |
| 2 | **Decision it feeds** | What will be decided differently depending on the answer | **It is a data pull** (see routing) |
| 3 | **Who decides** | One name or role | `null`; raised at review |
| 4 | **When needed** | An absolute date | `null`; treated as the next weekly review |
| 5 | **What data exists** | Which ledgers and versions already hold the inputs | Filled by the Librarian from the definitions index |
| 6 | **What done looks like** | The artifact that closes it: a card, a plan, a pull, an event row | Filled by the Librarian from the route |

Everything from a message enters at grade `[A]`. Figures are carried exactly as written with
their unit and period, or `[unit?]`. Relative dates are resolved against the message date. A
message with no date is not processed.

## The routing rule

| The intake is a… | when… | routed to | done looks like |
|---|---|---|---|
| **Planning request** | field 2 is a staffing, sizing or roster decision | `07-plans/` (CapacityPlanner) | a plan version or scenario, with its assumption register, awaiting sign-off |
| **Performance question** | field 2 is stated and the question is "why" or "will it" about a measure | XR row in `register.md`, hypothesis table opened, **48-hour readout** (an answer card or a graded interim card stating what is known, what is being tested, and the next date) | an answer card filed in `knowledge/` |
| **Data pull** | **the requester cannot state the decision it feeds** (field 2 is `null`), or the ask is for numbers only | definitions ledger check (which definition, which grade) and the data queue | the numbers with their definition slugs and grades, and a note that no decision was attached |
| **Event** | the message reports something that happened or will happen with an effect window | `05-events/` (Scout) as a proposed event | an accepted event row with type, window, regions and grade |

The rule about field 2 is the one that matters. A question with no decision behind it is not
wrong; it is a data pull, and it is served as one, with the definitions attached, in queue
order. It does not open an XR row, does not get a hypothesis table and does not get a 48-hour
readout. If the requester later states the decision, it re-enters as a performance question.

## The 48-hour readout

For a performance question: within two business days of intake, the Librarian and the
CausalAnalyst return either the answer card or an interim card in the same shape whose title
sentence says what is known so far, graded, with the open hypotheses, the tests running, and
the next date. Silence is not an option; "we don't know yet, here is what would tell us" is.

## What the Librarian writes

- The filled form, as the `extracted_asks` block of the intake record (`/adapters/email/SPEC.md`).
- The route, in the XR row's `route` field or the event's `source`.
- A CHANGELOG line.
- For a performance question: the XR row (`TEMPLATE-xr-row.md`) at Status New with a proposed
  severity in Notes, and the empty hypothesis table.
