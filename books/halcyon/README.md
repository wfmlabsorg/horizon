# Halcyon Group — book of business

**Planning organization:** Larkspur Travel
**Client:** Halcyon Group, a corporate travel account served 24/7 across voice, chat and email
**Teams:** Larkspur home team (in-house) and Crestline Services (vendor)
**Regions:** North, East, West
**Platforms:** Beacon (legacy) migrating to Meridian in three phases

This is the only book in phase 0. It is fictitious throughout; the demand and supply
ledgers are synthetic, generated with a recorded ground-truth causal model so the planning
chain can be checked against what was actually put into the data.

## What is where

| Folder | Contents | Owner (agent) |
|---|---|---|
| `00-profile/` | Client profile, contract targets, channel and site map, migration phase calendar | Librarian |
| `01-definitions/` | Twenty metric definitions plus `INDEX.md`. Read this before reading any number | Librarian |
| `02-demand/` | Daily and interval actuals by channel, transactions, traveler-days | DataEngineer |
| `03-forecast/` | Versioned forecasts (`v000-plan-of-record/` onward), each with assumptions and lineage | Forecaster |
| `04-supply/` | Hours, shrinkage, occupancy, headcount by cohort and tenure | DataEngineer |
| `05-events/` | Typed, dated events with effect windows and grades | Scout |
| `06-questions/` | The XR register, hypothesis tables, answer cards, the knowledge base, the intake form | Librarian / CausalAnalyst |
| `07-plans/` | Capacity plans by version, scenarios, Anaplan-shaped exports | CapacityPlanner |
| `08-reports/` | Daily notes, weekly reviews, register reports (dispatches) | Reporter |
| `CHANGELOG.md` | Every write to this book | Coordinator |

## How to read this book

1. Start at `01-definitions/INDEX.md`. Two metrics in this book have had two definitions in
   circulation (`aht-elapsed` and `aht-agent-work`); the index says which one each ledger
   column carries.
2. Open `00-profile/` for the phase calendar; every variance question begins with "which
   phase were we in and which regions had migrated".
3. Read the latest `08-reports/daily-note-*.md` for the current state, then follow its
   references into `06-questions/register.md` for anything open.

## Rules specific to this book

- Numbers from the Beacon era are not comparable with numbers from the Meridian era without an
  explicit bridge assumption in the forecast's assumption register. The definitions ledger
  marks which metrics are affected.
- Contacts-per-transaction is computed per region and per platform, never as one whole-book
  ratio. See `01-definitions/contacts-per-transaction.md`.
- The vendor cohort (Crestline Services) and the home-team cohort are kept as separate cohorts
  in `04-supply/`; blended handle time is a computed number, graded `[C]`, and cites both.
- Severity on any XR row is set by the register owner (the Halcyon planning lead), never by
  the sender of the message that raised it.
