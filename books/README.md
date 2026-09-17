# Books of business

A **book of business** is one client, planned as one unit: its channels, its sites and teams,
its contract targets, its history and its forecasts. Every planning object that belongs to a
book lives under `books/<client>/`, and nothing about the book lives anywhere else. The book
is the context; agents and planners read it before they act and write back to it when they
have.

There is one book in phase 0: `halcyon/` (Halcyon Group, served by Larkspur Travel).

## The folder contract

Every book has the same nine folders and a change log. An agent that knows one book knows
them all.

| Folder | Holds | Lifecycle |
|---|---|---|
| `00-profile/` | Client profile, contract, channels, service targets, sites and vendors, phase and event calendar | Ledger (versioned) |
| `01-definitions/` | One file per metric: name, formula, unit, source, owner, attainable grade, traps, change history | Ledger (versioned in place, history inside the file) |
| `02-demand/` | Daily and interval actuals by channel: offered, handled, AHT, SL, ASA, abandoned; transactions; travelers | Ledger (append, versioned pulls) |
| `03-forecast/` | Versioned forecasts by horizon, each with an assumption register and lineage | Ledger (versioned; status flow) |
| `04-supply/` | Scheduled, staffed, productive hours; shrinkage; occupancy; headcount by cohort and tenure; vendor | Ledger (append, versioned pulls) |
| `05-events/` | The intelligence ledger: go-lives, outages, weather, holidays, client events, product changes, business asks | Ledger (append) |
| `06-questions/` | The register: XR rows, hypotheses with tests, graded findings, answer cards; the knowledge base | Ledger (append) + knowledge (archive) |
| `07-plans/` | Requirement hours → FTE → roster shape → gap; scenarios; Anaplan-shaped exports | Ledger (versioned; monthly sign-off) |
| `08-reports/` | Daily note, weekly review, register report | Dispatch (derived, regenerated) |
| `CHANGELOG.md` | Every write: date, path, actor (agent or human), why | Ledger (append) |

Schemas for the rows in these ledgers are in `/schemas/`. Adapters that move files in and out
of the book in external shapes are in `/adapters/`.

## The three lifecycles

Before anything is written, decide which of the three it is. That one choice settles whether
the thing gets a version, whether it is ever edited, and whether it may be regenerated.

| Lifecycle | Rule | Lives in |
|---|---|---|
| **Ledger** | Append only, versioned. Rows are added and statuses change; nothing is deleted or overwritten. A correction is a new row or a new version that cites the one it corrects. | 00–07, CHANGELOG |
| **Dispatch** | Derived from ledgers, regenerated on the clock. Never edited by hand; if a report is wrong, the ledger it was built from is wrong, and that is what gets fixed. Each issue is dated and superseded by the next. | 08-reports |
| **Archive** | Closed and kept: superseded forecast versions, answered question cards filed as knowledge, plan versions after sign-off. Read-only. Found by ID, never renamed. | 03 (superseded), 06/knowledge, 07 (signed) |

The commonest mistake is editing a dispatch. The second commonest is overwriting a ledger
file because the numbers "were wrong". Both break lineage. Fix the source; regenerate.

## File naming

Ledger data files: `<what>-<period>-v<nnn>.csv`

- `<what>` names the content, lowercase, hyphenated: `demand-daily`, `supply-daily`,
  `demand-interval`, `transactions-daily`.
- `<period>` is the coverage: a day `2026-09-15`, a month `2026-09`, or a range
  `2026-06-01_2026-09-15`.
- `v<nnn>` is a three-digit version starting at `v001`.

Rules:

1. **Never overwrite.** A re-pull of the same period is a new version (`v002`), even if the
   only change is one corrected row. The CHANGELOG entry says why it was re-pulled.
2. The latest version is the one with the highest number; there is no `latest` symlink and no
   file without a version.
3. A file's markdown header (or its `.md` sidecar of the same name) states the source system,
   pull time, definition references and the grade of each column.
4. Forecasts and plans version by folder: `03-forecast/v<nnn>-<label>/` and
   `07-plans/v<nnn>-<label>/`. See each folder's README.
5. Reports carry the date of issue in the filename: `daily-note-2026-09-15.md`. They are
   dispatches and are not versioned; a rerun on the same date replaces the file and the
   CHANGELOG records the rerun.

## Every number cites a definition and carries a grade

No number appears in any ledger, plan, note or card without two things attached:

1. **A definition reference**: the metric file in `01-definitions/` that says what the number
   means, how it is computed and from which system. `aht-elapsed` and `aht-agent-work` are
   different numbers with different definitions; a number that says only "AHT" is not
   admissible.
2. **A grade**, one of four:

| Grade | Meaning | What must be present |
|---|---|---|
| `[M]` measured | Read from the source system on its stated definition | Source, pull version |
| `[C]` computed | Derived from measured inputs by a stated formula | The formula, and the grade of each input |
| `[E]` estimated | Not measured; a range and the assumption that produced it | Range, assumption, what would change it |
| `[A]` asserted | Stated by one source with no producible artifact | The source. Default for anything that arrives by email |

A computed number cannot grade higher than its lowest-graded input. A number carried across
a channel change, a platform change or from another book is never `[M]` in the new setting;
it is `[E]` with the carrying assumption stated, or `[A]` if it was simply taken on trust.
This is the rule that catches benchmarks that were true somewhere else.

In prose, grades are written inline in brackets after the figure: `AHT-agent-work 612 s [M]`.
In CSV ledgers, the grade is a column. In JSON, it is the `grade` field of the row envelope
(`/schemas/ledger-row.schema.json`).

## Who writes where

| Actor | May write to |
|---|---|
| Coordinator | CHANGELOG, run state |
| Librarian | 01, 05, 06 (register rows, intake) |
| DataEngineer | 02, 04 |
| PostAnalyst | 03 (variance), 08 |
| Scout | 05 |
| CausalAnalyst | 06 (hypotheses, findings) |
| Forecaster | 03 |
| CapacityPlanner | 07 |
| Reporter | 08 |
| Adapters | 03 (IEX import/export), 07 (Anaplan export), 06 (email intake) |
| Planner (human) | Approvals, severities, sign-offs, anywhere by exception with a CHANGELOG entry |

Anything that changes a plan (a reforecast, a capacity plan, a severity, a publication) needs
a human gate. Agents propose; planners approve.
