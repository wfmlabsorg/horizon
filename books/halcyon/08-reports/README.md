# 08-reports — dispatches

Everything in this folder is **derived**. Reports are generated from the ledgers by the
Reporter on the clock, dated, issued, and never edited. If a report is wrong, the ledger it
came from is wrong; fix that and regenerate.

## Dispatch lifecycle

| Step | Rule |
|---|---|
| Generate | From ledgers only (02, 03, 04, 05, 06, 07 and the run state). Never from memory, never from the messages. |
| Gate | The daily note and the register report go through the `planner-publication` gate when they carry a reforecast decision or a Sev 1–2 change; otherwise the Evaluator's `answer-first-shape` check suffices. |
| Issue | Filename carries the date: `daily-note-YYYY-MM-DD.md`, `weekly-review-YYYY-Www.md`, `register-report-YYYY-MM-DD.md`. A CHANGELOG line records the issue. |
| Supersede | The next issue supersedes the last. Old issues stay; nothing is deleted. |
| Rerun | A rerun on the same date replaces the file and the CHANGELOG says why (usually a ledger correction). The replaced text is not kept; the ledger history is what matters. |
| Never | Hand-edit a report. Add a number that is not in a ledger. Present an association as a cause. Omit a grade. |

## The three reports

| Report | Clock | Template | Reads |
|---|---|---|---|
| Daily note | daily, after the planner gate | `TEMPLATE-daily-note.md` | run state, 02, 03 (approved + proposed), 04, 05, 06 (open rows) |
| Weekly review | weekly | `TEMPLATE-weekly-review.md` | the week's daily notes' sources, 03 assumption registers, 06 |
| Register report | weekly, and Sev 1 flash on change | `TEMPLATE-register-report.md` | 06 register.md and its change log only |

## Answer-first shape (all three)

Title sentence with a grade · what changed · decision requested (or "none") · next date ·
what would change the answer. Figures carry unit, period and grade. No adjectives about
severity ("critical", "concerning"); the fields carry that. Names as recorded in the ledgers.
Length: a daily note is one screen; a register report for ten open Sev 1–2 items fits in two
pages, and if it does not, the register has too many Sev 1–2 items and that is the first line.
