# Email adapter (mock)

**What the real integration is.** A shared planning mailbox (and the chat channel that feeds
it) is where asks, questions, updates and event notices arrive. The real integration reads
that mailbox, classifies each message, and hands it to the Librarian as an intake record. The
Librarian applies the six-field intake form and the routing rule
(`books/<client>/06-questions/INTAKE.md`).

**What the mock does.** Reads an intake JSONL file, one message per line, in the shape a
mailbox connector would produce after classification and extraction. The adapter validates the
shape; it does not classify (that is the Librarian's job in phase 2) and it does not send.

| Direction | File | Written by | Read by |
|---|---|---|---|
| Mailbox → Book | `intake-<period>-v<nnn>.jsonl` | the mock mailbox (synthetic messages) | Librarian, into `06-questions/` (register rows, hypotheses) or `05-events/` |

## Files

- `SPEC.md` — the message record, the classification vocabulary, the extracted-ask shape.
- `email.ts` — typed interfaces and `--dry-run` validator.
- `samples/intake-sample.jsonl`.

## Grades at the boundary

Everything that arrives by email enters at grade `[A]`. A figure in a message is recorded
exactly as written, with `[unit?]` if the unit or period is missing. The grade rises only when
the Librarian names a measure or a producible artifact. Sender severity proposals are recorded
in `notes`, never applied; the register owner sets severity.
