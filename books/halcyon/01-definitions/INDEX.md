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

Two column vocabularies exist in phase 0. The **schema names** (`/schemas/*.schema.json`) are
the target shape for phase 1 onward and are what the definition files cite. The **phase-0
generated ledgers** in `02-demand/`, `04-supply/` and `03-forecast/v000-plan-of-record/`
pre-date the schemas and use shorter names and unversioned filenames. This table is the
crosswalk; when the two disagree, the definition slug is what a number cites, not the column.

| Phase-0 file · column | Schema column | Definition | Note |
|---|---|---|---|
| `02-demand/daily-channel.csv` · `offered` | `offered` | `offered` | |
| `02-demand/daily-channel.csv` · `handled` | `handled` | `handled` | |
| `02-demand/daily-channel.csv` · `handled_in_sl` | `handled_in_sl` | `handled-in-sl` | |
| `02-demand/daily-channel.csv` · `abandoned` | `abandoned` | `abandoned` | |
| `02-demand/daily-channel.csv` · `asa_sec` | `asa_s` | `asa` | |
| `02-demand/daily-channel.csv` · `sl_pct` | `sl_pct` | `service-level` | check the denominator in the file's `.md` header |
| `02-demand/daily-channel.csv` · `aht_sec` | `aht_elapsed_s` | `aht-elapsed` | **elapsed**; chat rows include timeout wait. Never labelled AHT |
| `02-demand/daily-channel.csv` · `aht_agent_sec` | `aht_agent_work_s` | `aht-agent-work` | the staffing number |
| `02-demand/daily-cohort.csv` · `aht_sec`, `aht_agent_sec` | as above, by cohort | `aht-elapsed`, `aht-agent-work` | |
| `02-demand/daily-transactions.csv` · `transactions` | `transactions` | `transaction` | by region and platform, as the composition trap requires |
| `02-demand/daily-travelers.csv` | `active_travelers` | `contacts-per-traveler-day` (population input) | [E] at day grain |
| `04-supply/daily-supply.csv` · `scheduled_hours` | `scheduled_h` | `scheduled-hours` | by cohort; no region split in phase 0 |
| `04-supply/daily-supply.csv` · `staffed_hours` | `staffed_h` | `staffed-hours` | |
| `04-supply/daily-supply.csv` · `productive_hours` | `productive_h` | `productive-hours` | |
| `04-supply/daily-supply.csv` · `shrinkage_pct` | `shrink_planned_pct` + `shrink_unplanned_pct` | `shrinkage` | phase 0 carries one blended figure; the split is a phase-1 item |
| `04-supply/daily-supply.csv` · `headcount`, `agents_in_training` | `headcount`, `headcount_in_training` | `fte` | |
| (not stored in phase 0) | `occupancy_pct` | `occupancy` | computed on demand from handled × aht_agent_sec / productive_hours |
| (not stored in phase 0) | `concurrency_eff` | `concurrency` | phase 0 uses the configured chat ceiling as an [E] stand-in |
| `03-forecast/v000-plan-of-record/forecast-daily.csv` · `fc_aht_sec` | `aht_agent_work_fc_s` | **must be confirmed** | the plan of record does not say which handle time it carries; this is the two-definitions trap live in the book |
| `03-forecast/v000-plan-of-record/forecast-daily.csv` · `fc_contacts_per_transaction` | — | `contacts-per-transaction` | book-level ratio; this is the composition trap live in the book |
| `07-plans/*` · `req_hours` | `req_hours` | `requirement-hours` | |

## Changing a definition

A definition changes only by a new entry in the file's change history with a date, the actor,
the old and new text, and the list of ledger versions affected. A changed definition does not
rewrite history: earlier ledger versions keep citing the earlier text, which stays in the
file. If the change alters a number's meaning, every open forecast and plan that cites it gets
an assumption-register row saying so.
