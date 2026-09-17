# Definitions ledger — index

One file per metric. Every number in this book cites one of these files by its slug (the
filename without `.md`). A number that cites no definition is not admissible in a ledger,
plan, note or card.

Each file carries: name · formula · unit · source system · owner · highest grade it can attain
· known traps · change history. The change history inside the file is the version record;
the filename never changes.

## Demand

| Slug | Name | Unit | Best grade | Watch for |
|---|---|---|---|---|
| `contact` | Contact | count | [M] | Voice, chat and email count differently; a re-contact is a contact |
| `offered` | Offered contacts | count/period | [M] | Email "offered" is arrivals, not queue offers |
| `handled` | Handled contacts | count/period | [M] | Handled ≠ offered − abandoned on email (backlog) |
| `handled-in-sl` | Handled within service level | count/period | [M] | Threshold differs by channel; abandoned-in-threshold treatment |
| `abandoned` | Abandoned contacts | count/period | [M] | Short abandons; chat timeouts are not abandons |
| `asa` | Average speed of answer | seconds | [C] | Mean hides the tail; email uses first-response time |
| `service-level` | Service level | % | [C] | Denominator choice; one book-level SL hides channel breaks |
| `aht-elapsed` | Average handle time, elapsed | seconds | [M] | **Two definitions in circulation** — see file |
| `aht-agent-work` | Average handle time, agent work | seconds | [C] | **Two definitions in circulation** — divides by effective concurrency |
| `concurrency` | Effective concurrency | ratio | [C] | Configured maximum is not effective concurrency |
| `transaction` | Transaction | count | [M] | Booking-platform count; changes at Beacon→Meridian |
| `contacts-per-transaction` | Contacts per transaction | ratio | [C] | **Composition trap** — see file |
| `contacts-per-traveler-day` | Contacts per traveler-day | ratio | [C] | Traveler population is a monthly feed; interpolated days are [E] |

## Supply

| Slug | Name | Unit | Best grade | Watch for |
|---|---|---|---|---|
| `scheduled-hours` | Scheduled hours | hours/period | [M] | Vendor schedules arrive as headcount, not hours |
| `staffed-hours` | Staffed hours | hours/period | [M] | Logged-in ≠ staffed on chat with concurrency |
| `productive-hours` | Productive hours | hours/period | [C] | Aux-code mapping is a definition, not a fact |
| `shrinkage` | Shrinkage | % | [C] | Planned vs unplanned; base is scheduled, not paid |
| `occupancy` | Occupancy | % | [C] | Elapsed vs agent-work numerator gives two occupancies |
| `requirement-hours` | Requirement hours | hours/period | [C] | Carries the grade of its worst input |
| `fte` | Full-time equivalent | FTE | [C] | Hours-per-FTE differs between the home team and Crestline |

## Metrics affected by the Beacon → Meridian migration

`transaction`, `contacts-per-transaction`, `contacts-per-traveler-day`, `aht-elapsed`,
`aht-agent-work`, `requirement-hours`, `fte`. Any of these carried across the migration
boundary is `[E]` at best, with the bridge assumption named in the forecast's assumption
register.

## Which definition each ledger column carries

Since phase 1 the ledgers carry the schema column names (`/schemas/*.schema.json`) and each
file's `.md` sidecar states the definition and grade per column, so the crosswalk is trivial:
the column name is the schema name and the slug is what the sidecar says. The table is kept
for the two columns that history has confused and for the plan of record.

| File · column | Definition | Note |
|---|---|---|
| `02-demand/demand-daily-*.csv` · `aht_elapsed_s` | `aht-elapsed` | **elapsed**; chat rows include timeout wait and concurrency. Never labelled AHT |
| `02-demand/demand-daily-*.csv` · `aht_agent_work_s` | `aht-agent-work` | the staffing number; chat = elapsed ÷ `concurrency_eff` |
| `02-demand/demand-cohort-*.csv` · same two columns | as above, by cohort | |
| `02-demand/beacon-daily-*.csv` · `*_aht_agent_work_s`, `messaging_elapsed_h` | `aht-agent-work`, `aht-elapsed` | Beacon elapsed is hours (asynchronous) and is not comparable to anything on Meridian |
| `04-supply/supply-daily-*.csv` · `shrink_planned_pct`, `shrink_unplanned_pct` | `shrinkage` | base = scheduled hours; the split is stored from phase 1 |
| `04-supply/supply-daily-*.csv` · `occupancy_pct` | `occupancy` | agent-work numerator |
| `04-supply/supply-daily-*.csv` · `concurrency_eff` | `concurrency` | [E] for the vendor cohort |
| `03-forecast/v000-plan-of-record/forecast-daily.csv` · `aht_agent_work_fc_s` | `aht-agent-work` | **stated since phase 1**: the plan carries Beacon agent-work time across the platform change, graded [E] (AS-011–AS-013). The two-definitions trap is now live in the comparison, not in the column name: chat `aht_elapsed_s` is 2–3× this figure and must never be compared to it |
| `03-forecast/v000-plan-of-record/forecast-daily.csv` · `fc_contacts_per_transaction` | `contacts-per-transaction` | the whole-book ratio applied per region; the composition trap live in the book (AS-008) |
| `07-plans/*` · `req_hours` | `requirement-hours` | |

Every other column: see the sidecar beside the file (`<what>-<period>-v<nnn>.md`) and the
folder README.

## Changing a definition

A definition changes only by a new entry in the file's change history with a date, the actor,
the old and new text, and the list of ledger versions affected. A changed definition does not
rewrite history: earlier ledger versions keep citing the earlier text, which stays in the
file. If the change alters a number's meaning, every open forecast and plan that cites it gets
an assumption-register row saying so.
