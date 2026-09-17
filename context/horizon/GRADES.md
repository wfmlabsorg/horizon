# Grade Standard

**Purpose:** Every number that leaves an agent carries a grade. A number without a grade is not a number yet.

---

## The Four Grades

| Grade | Meaning | Must state alongside the number |
|-------|---------|--------------------------------|
| **[M]** Measured | Read from a versioned ledger | Ledger path, version, definition file cited |
| **[C]** Computed | Derived by a stated formula | The formula, each input with its own grade |
| **[E]** Estimated | Judged, modeled or extrapolated | The range, the assumption, what would narrow it |
| **[A]** Asserted | Taken from one source without measurement | The one source; never load-bearing on its own |

---

## Inheritance

- A [C] number inherits the **weakest** grade among its inputs, unless the formula is stated and every input is [M].
- A number carried across a **channel change** or a **platform change** (Beacon → Meridian) is never [M] on the new side. It is [A] until this side measures it.
- A benchmark carried from **another book** is [A] in this book, whatever it was in its own.
- A number carried from a **prior forecast version** without re-derivation is labeled `carried` next to its grade.

---

## Writing the Grade

Inline, immediately after the number:

```
AHT voice 412s [M] (02-demand/2026-03-14.v2, def: 01-definitions/aht.md)
Requirement 1,840 h [C] = offered [M] × AHT [M] / occupancy target [A]  → inherits [A]
Phase 3 volume uplift +38% [E] (range 30–45%; assumes phase 2 ratio holds; narrowed by first week of phase 3 actuals)
Chat concurrency 2.4 [A] (00-profile/contract.md, not yet measured on Meridian)
```

---

## What the Evaluator Checks

- Every number has a grade
- Every [M] cites a definition
- Every [C] states its formula and its inputs' grades
- Every [E] states a range and an assumption
- No [A] is load-bearing alone in a decision
- No carried assumption is unlabeled
