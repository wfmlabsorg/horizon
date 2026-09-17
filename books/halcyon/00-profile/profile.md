# Halcyon Group — client profile

**Planning organization:** Larkspur Travel (travel management company), workforce planning.
**Client:** Halcyon Group, a corporate account. One book of business, three channels, 24/7.
**Profile owner:** human:Halcyon planning lead (Larkspur Travel).
**Status:** phase 0 profile, 2026-07-13, ahead of the Beacon → Meridian migration.

*Everything in this book is fictitious and synthetic. See `sim/README.md`.*

## Contract shape

| | |
|---|---|
| Service window | 24 hours, 7 days, all channels |
| Channels | Voice, chat (Meridian) / messaging (Beacon), email |
| Service targets | Voice **80% in 20 s** · Chat **80% in 3 min** · Email **90% in 2 h** (first response) |
| Bot | **Off** for this book. Contract clause: human-first service; no automated deflection before an agent. The Larkspur benchmark book on Meridian runs a bot, so its ratios are not comparable |
| Measurement basis | Service level per channel per day = `handled_in_sl ÷ offered` (definition `service-level`) |
| Reporting | Daily note, weekly review, monthly plan; all through the book's ledgers |

## Demand shape (as known at profile time, all on Beacon)

| | North | East | West | Book |
|---|---|---|---|---|
| Share of transactions | 8% | 7% | 85% | 100% |
| Transactions, weekday base | ≈100 | ≈88 | ≈1,060 | ≈1,250 |
| Contacts per transaction (Beacon, per region) | 0.90 | 0.90 | 0.25 | **0.35 by composition** |
| Channel mix of contacts | voice 25% · messaging 58% · email 17% (same in all regions) | | | |

Transactions carry a weekday shape (Tuesday peak, weekends ≈40% of a weekday). Contacts per transaction run ≈25% higher on weekends because more travelers are in trip. The definition `contacts-per-transaction` requires the ratio to be computed per region and per platform; the book-level 0.35 is a transaction-weighted mean and is not a planning ratio for any single region.

## Regions and phases

| Phase | Region | Go-live | Day | Share of transactions | Cumulative migrated |
|---|---|---|---|---|---|
| 1 | North | 2026-07-21 (Tue) | 2 | 8% | 8% |
| 2 | East | 2026-08-25 (Tue) | 37 | 7% | 15% |
| 3 | West | 2026-12-01 (Tue), **planned** | 135 | 85% | 100% |

Day 1 of the book is Monday 2026-07-20. Phase 3 is outside the 120-day window; its sizing is the open planning question.

## Cohorts

| Cohort | Type | Heads | Engaged | Notes |
|---|---|---|---|---|
| **Crestline Services** | Outsourced vendor | 16 at phase 1 (hypercare), 20 from phase 2 | From day 1 | Meridian-certified before go-live per vendor statement. Schedules arrive as headcount; hours are derived at 8 h per scheduled shift |
| **Larkspur home team** | In-house | 10 | Classroom training day 36, nesting day 50, live day 71 | Cross-skilled across all three channels |

Both cohorts are blended on all channels; there is no channel-dedicated team.

## Platforms

| | Beacon (legacy) | Meridian (new) |
|---|---|---|
| Chat model | **Asynchronous messaging, no timeout.** A conversation can stay open for hours; elapsed time is measured in hours and is not a handle-time measure | **Synchronous chat, 10-minute inactivity timeout.** Elapsed time is measured in seconds and includes the customer's wait up to the timeout |
| Comparable AHT | Agent work time per conversation (≈380 s messaging, 1,150 s voice, 420 s email) | `aht_agent_sec` (agent work, = elapsed ÷ effective concurrency) is the comparable number; `aht_sec` (elapsed) is not |
| Concurrency | Not meaningful (asynchronous) | Configured maximum 3; effective concurrency is computed, not configured |
| Bot | Off | **Off** (contract) |
| Voice | Same telephony on both; the platform change alters the desktop and the wrap-up flow | |
| Transactions | Booking platform is unchanged by the migration; the transaction count is comparable across platforms | |

Any metric measured on Beacon and applied to Meridian is [E] at best and needs a named bridge assumption in the forecast's register (see `01-definitions/INDEX.md`, "Metrics affected by the migration").

## Where things live

- Planned dates: `00-profile/calendar.md`
- Actuals: `02-demand/`, `04-supply/`
- Events as they happened: `05-events/events.csv`
- The plan the migration started with: `03-forecast/v000-plan-of-record/`
