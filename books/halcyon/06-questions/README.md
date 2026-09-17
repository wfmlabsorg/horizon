# 06-questions — the register

The register (`register.md`) is where every question about this book lives: performance
questions, planning requests that turned out to be questions, and anything the daily loop
opened on its own. Each row is an **XR** item. Hypothesis tables hang off XR rows; answered
questions become cards filed in `knowledge/`.

## Rules

1. **The register is the source; reports are derived.** The register report in `08-reports/`
   is generated from `register.md` and never written from memory or from the messages. If the
   report is wrong, fix the register and regenerate.
2. **Email enters at grade `[A]`.** Whatever a message says, the row's grade is Asserted until
   a measure on a known definition or a producible artifact is named. A described-but-absent
   report does not raise the grade.
3. **Severity is set by the register owner, never by the sender.** The register owner for this
   book is the Halcyon planning lead. A sender's severity proposal is recorded in `notes` and
   raised at the next review. The same holds for the agents: the Librarian proposes, the
   register owner sets.
4. **Title is the answer.** The title column is one sentence a reader with no context could
   act on, and it carries the grade when rendered. "Chat waits in East" is a topic, not a
   title. "East chat waits rose because agent-work handle time stepped up 18% at go-live and
   staffing did not" is a title.
5. **Every Sev 1–2 row states what would change the answer.** `open` is legal on Sev 3–4 only.
6. **A row is never deleted or renumbered.** Closed rows stay. A reopened question is a new
   XR that cites the old one.
7. **Structural or transitional** is tagged on every driver in every hypothesis table before
   a finding reaches a plan.

## Staleness rule

A row is stale when its `last_update` is older than the limit for its severity, in business
days:

| Sev | Meaning | Stale after |
|---|---|---|
| 1 | Harm to the client, a service target or a contract position is occurring or imminent | 2 business days |
| 2 | Material impact likely within the reporting cycle without action; beyond the owning function's authority | 5 business days |
| 3 | Managed within the owning function; leader informed, no decision needed | 10 business days |
| 4 | Watch item, or resolved with its monitoring period running | 30 business days |

Stale rows appear in the register report with the line-of-sight contact to ask. Severity is
impact; urgency is read from trend, expected close and the decision date together. Do not fold
urgency into severity.

## Status and trend

Status: New → Assessing → Mitigating → Monitoring → Resolved → Closed (see
`/schemas/question.schema.json`). Trend tracks the path to close, not the latest measure: a
measure that improved while the fix slipped is Worsening.

## Files

| File | What |
|---|---|
| `register.md` | The register: header line, the table, the change log |
| `INTAKE.md` | The six-field intake form and the routing rule |
| `TEMPLATE-xr-row.md` | One row, field by field, for a new XR |
| `TEMPLATE-hypothesis-table.md` | The hypothesis table attached to an XR row |
| `TEMPLATE-answer-card.md` | The answer-first card produced when a question is answered |
| `hypotheses/` | One file per XR with an open hypothesis table: `XR-###-hypotheses.md` |
| `knowledge/` | Filed answer cards, `README.md` says how |

## Precedence on updates (from the register method)

Later message wins on status, trend, next action, last update. Severity: register owner only.
Owner: only on the word of the outgoing owner, the incoming owner or the executive. Expected
close may move on any owner or line-of-sight message; count successive later moves as `SLIP×n`
in notes and flag at n ≥ 2. Grade rises only with an artifact or measure named. Title,
description, business risk, decision needed and line of sight change only on an owner or
line-of-sight message with a quoted supporting sentence. Nothing applies without a quote.
