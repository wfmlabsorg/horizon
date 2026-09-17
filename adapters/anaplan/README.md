# Anaplan adapter (mock)

**What the real integration is.** Anaplan holds the long-term plan: FTE and hours by book,
region, channel and month, rolled into the annual operating plan and the finance view. The
planning organization publishes its monthly capacity plan into it after sign-off; finance
reads it from there. The real link is a scheduled import of a flat file (or an API push in
the same shape).

**What the mock does.** One direction, one file: after the monthly planner sign-off, the
adapter writes `plan-export-<period>-v<nnn>.csv` from the signed `07-plans/v<nnn>-*/` folder.
Nothing is read back; the plan of record lives in the book, not in Anaplan.

| Direction | File | Written by | Read by |
|---|---|---|---|
| Book → Anaplan | `plan-export-<period>-v<nnn>.csv` | Adapter-Anaplan, from a **signed** plan version | the mock Anaplan (a folder) |

The adapter refuses a plan whose sign-off is not recorded by a human actor. That is the
monthly gate, enforced at the file boundary.

## Files

- `SPEC.md` — column layout, one row per book × region × channel × cohort × month.
- `anaplan.ts` — typed interface and `--dry-run` validator.
- `samples/plan-export-sample.csv`.

## Grades at the boundary

Every row carries a grade and an `assumptions_ref`. Anaplan itself has no grade column; the
mock keeps it because the plan's FTE is `[E]` as soon as any load-bearing assumption is, and
a finance reader deserves to see that. Month-grain FTE is a monthly average; ramp inside a
month is lost at this grain and is carried in the plan note, not the export.
