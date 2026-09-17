# Tools/clock — the phase-1 clock runner

`bun run Tools/run-clock.ts <daily|weekly|register-report|demo> --book halcyon …` runs the clocks
deterministically: TypeScript on bun, no LLM calls, no dependencies beyond bun built-ins (the CSV
parser and the markdown table helpers are in this folder). Every stage is a module named for the
agent whose `agents/<Name>.md` it implements; the agent file is the behavioral spec, the module is
the phase-1 mechanisation of it. Outputs are ledgers and dispatches in `books/<book>/`; nothing
is kept in memory between runs, so a rerun on a date is idempotent (it replaces the dispatch, the
reconciliation stamp and the day row in a hypothesis table, reuses proposed-event ids, and appends
CHANGELOG rows and a new `r<n>` run state).

| Module | Agent | Daily stage(s) | Writes |
|---|---|---|---|
| `dataEngineer.ts` | DataEngineer | 1 ingest · 2 reconcile | `02-demand/RECONCILIATION.md`, `04-supply/RECONCILIATION.md` (one stamp row per date) |
| `postAnalyst.ts` | PostAnalyst | 3 score · 4 decompose (with `spc.ts`) | `03-forecast/variance/YYYY-MM-DD.md` |
| `scout.ts` | Scout | 5 match_events | `05-events/proposed/EV-###.md`, `proposed/INDEX.md` (never `events.csv`) |
| `librarian.ts` | Librarian (stands in for the CausalAnalyst until phase 2) | 6 update_hypotheses | `06-questions/register.md` (rows + change log), `06-questions/XR-###.md` |
| `reporter.ts` | Reporter | 10 publish; weekly; register report | `08-reports/daily/`, `weekly/`, `register/` |
| `coordinator.ts` | Coordinator | orders the stages, gates, run state | `08-reports/runs/<run-id>.json` (`/schemas/run-state.schema.json`) and `.md` run log; `CHANGELOG.md` |
| `book.ts`, `csv.ts`, `types.ts` | — | loading, dates, tables | — |

Stages 7 (Forecaster), 8 (Evaluator), 9 (planner gate) and 11 (IEX export) are present in every run
state as `skipped`, with the gates recorded (`evaluator` waived by the Coordinator with the rules
checked by the Reporter; `planner-reforecast` pending because nothing is proposed). The Coordinator
stops before `publish` if any gate is `blocked`; no agent actor may decide a human gate (the schema
rejects it, and the code never writes one).

## Commands

```bash
bun run Tools/run-clock.ts daily --book halcyon --date 2026-07-22
bun run Tools/run-clock.ts daily --book halcyon --from 2026-07-21 --to 2026-11-16
bun run Tools/run-clock.ts weekly --book halcyon --week 2026-W31            # or --from 2026-W30 --to 2026-W46
bun run Tools/run-clock.ts register-report --book halcyon --date 2026-09-13
bun run Tools/run-clock.ts demo --book halcyon                               # everything, in calendar order
```

`demo` runs every daily clock from 2026-07-21 to 2026-11-16, the weekly review after each Sunday,
and the register report on 2026-09-13 and 2026-11-16, **in calendar order**. Order matters for the
weekly and register dispatches: they read the register as of their issue date (reconstructed from
the register's change log), so running them out of order is safe, but the daily notes they cite
must exist.

## The rules, and why they are set where they are

The rules were fixed from first principles before the outputs were compared with
`sim/GROUND-TRUTH.md`; the comparison is in `docs/PHASE-1-VERIFICATION.md` and no rule was
tuned to it.

### Scoring (PostAnalyst)

- **Forecast in force:** v000 plan of record, always (phase 1 has no Forecaster). Forecast rows are
  [C] on their stated formula with [E] inputs; actuals [M]; everything computed [C]. Handle time is
  `aht-agent-work` everywhere; chat `aht-elapsed` is shown beside it with the concurrency that links
  them, because the plan's chat figure and the export's elapsed figure are different definitions.
- **Tolerances:** offered ±15% (≈2σ of the day-level contact noise: 6% contacts ⊕ 5% transactions),
  handle time ±10% (≈2.5σ of 4% day-level handle-time noise), service level = the contract target.
  **Where the sigmas come from:** they are the book's observed day-level noise. In phase 1 the book
  is synthetic, so "observed" means the simulator's own noise parameters (`sim/generate.ts:103`,
  `noise: { tx: 0.05, contacts: 0.06, aht: 0.04 }`); on a real book they would be estimated from the
  Beacon history the same way the SPC baseline is. The arithmetic on top (2σ, 2.5σ) is the
  first-principles part; the inputs are read off the world, and that is stated so nobody has to
  discover it by opening the generator.
- **Requirement hours** = offered × aht-agent-work ÷ 3600 ÷ 0.85 (AS-015). **Sequential
  decomposition**: volume at forecast handle time and forecast mix, then mix at forecast handle
  time, then handle time at forecast volume; the Δvolume × Δhandle-time interaction is stated as the
  residual, not absorbed. This is the exact two-factor identity, so the residual is the interaction
  and nothing else. **Supply** is the hours lost to unplanned shrinkage against the published
  schedule, allocated to rows by share of actual requirement and stated beside the miss, because it
  is not part of the demand-side identity.
- **Simpson check:** any blended handle-time shift beyond tolerance is restated within cohort.
- **Transactions same-weekday check:** today ÷ the mean of the last three same weekdays; within
  ±12% is "flat" (2σ of 5% noise plus drift). A contact move with flat transactions is not a change
  in travel activity. The title sentences state the transaction share of a contact move rather than
  a binary, because during a ramp the three-week mean lags.
- **Composition check:** Meridian contacts per transaction against the plan's 0.35 and against each
  migrated region's own Beacon ratio from `beacon-daily`.

### SPC and regime detection (`spc.ts`)

Individuals chart with moving-range σ (σ = mean moving range ÷ 1.128). Western Electric **rule 1**
(one point beyond 3σ) and **rule 2** (two of three consecutive beyond 2σ, same side); the rule is
named on every flag. A **trend** is a least-squares slope over 21 points with |t| > 4 and a fitted
change > 3σ.

- **Baseline:** the last 28 in-regime points before today, minimum 14 (short baselines give
  unreliable limits). Handle-time series for the vendor cohort use the **Beacon history as a carried
  baseline** (graded [E]) until 14 Meridian points exist or a shift is confirmed; offered series
  have no comparable carry and wait.
- **Series charted:** offered ÷ forecast (attainment) by channel at book level, so the plan's weekday
  shape and go-live steps sit in the denominator and only unplanned movement remains, with the
  profile's weekend contacts-per-transaction boost (1.25, [A]) divided out; `aht-agent-work` by
  cohort × channel; chat `aht-elapsed` at skill level; unplanned shrinkage and productive hours by
  cohort (weekend schedule factor 0.8 from the profile).
- **Materiality floor** on top of the statistical rule: offered attainment 10% of the mean, handle
  time 5%, chat elapsed 10%, unplanned shrinkage 5 points, productive hours 10%. A control chart
  finds statistical signals; the analyst filters by what would matter to a plan. The floors are set
  at roughly one scheduled head on the smallest series: 10% of offered or productive hours at
  phase-1 volumes is about one shift of work, 5% of handle time is the smallest shift a capacity
  plan would re-staff for (requirement hours move one-for-one with it), and 5 points of unplanned
  shrinkage is the contracted absence allowance (AS-016) — below that a day is inside the contract.
- **Regime kinds:** one point out = *transient*; a second consecutive point out, or rule 2, =
  *level shift*, which re-bases the series from its onset; a slope = *trend*. The trend test asks
  for `|t| > 4` rather than the textbook 2–3 because successive days on these series are
  autocorrelated (a ramp, a feedback loop), which inflates the ordinary t-statistic; 4 is the
  margin that keeps a 21-day window from flagging the tail of a level shift as a trend. Until 14 post-onset
  points exist the excursion is reported as *continuing*, and spikes on top of the new level are
  caught with provisional limits (post-onset mean, pre-shift σ; a spike, not a continuing climb).
- **Side:** a flag on a `04-supply` series is supply-side, on a `02-demand` series demand-side; the
  note says which ledger the break lives in. A supply-side flag with flat transactions and a same-day
  offered rise is written as "consistent with retries, not new demand".

### Event matching (Scout)

Read the ledger before the world. An accepted event matches a miss or flag when its window
(`start` to `end + effect_window_days`) covers the date and its region, channel and cohort scope
covers the series. An event **explains** a break only if it is graded [M] (a fact of occurrence),
**unplanned** (a planned event was already in the forecast, so a miss on it is a failed assumption
and stays a question), and its dates cover the day or its start lies within three days before the
onset. A planned heads change in the plan of record explains a supply step in the same direction.
[E] and [A] events are reported as co-occurring and handed to the hypothesis table. For a flag no
[M] event accounts for, the Scout proposes one candidate event per (side, family, onset) at grade
[E] into `05-events/proposed/`, never into the accepted ledger.

### Questions (Librarian)

A question opens for a **level shift or trend** that no event explains (a single transient is noted
and screened, not asked), and for a **forecast miss beyond tolerance on three consecutive days**
(one book-level row for the composition trap). Families: handle time by cohort, offered (book),
chat elapsed, supply by cohort. An open row covers a new flag of the same family whose onset lies
inside one regime window (42 days for a cohort's handle time, 21 for offered and chat elapsed, 10
for supply); covered flags append to "what each day's data did" instead of opening a duplicate.
The windows are the length of the mechanism each family is asking about: a learning curve is
planned at eight weeks (AS-014, EV-009), so a cohort's handle time is one question for 42 days; a
seasonal ramp or a concurrency swing runs about a month, so offered and chat elapsed get 21; a
supply break is a schedule event and recurs within a fortnight as a different event, so 10.
Every row has a title that is an answer sentence with a grade, a severity **proposed** in Notes
(the register owner sets it: Sev 1 when SL is breached two days running, Sev 2 for a forecast or
go-live effect not on plan, Sev 3–4 for favourable or definitional moves), status Assessing, trend,
owner `human:planner`, and what would change the answer. The hypothesis table has at least three
hypotheses with a structural-or-transitional tag each, the tests that settle them, and the
residual as its own row. Touches append a change-log row for `last_update`, so reports can
reconstruct the register as of any date.

### Reporting (Reporter)

Title sentences are generated by rule, in this priority: a supply-side flag → "the day is
supply-side…"; a demand-side flag on the channel → what stepped/trended, by how much, against which
baseline, the transaction share, SL, and the explaining event if any; SL missed → "missed SL by N
points because requirement hours ran +H and <driver> carries X%"; outside tolerance but SL met →
"landed … the buffer absorbed it"; otherwise "landed within tolerance". The reforecast block always
reads "not needed" or "proposed: blocked — phase 1 has no Forecaster". The weekly review's
assumption-register refresh compares each carried v000 row with the week's observation; the
register report follows `TEMPLATE-register-report.md` with staleness by the 2/5/10/30 business-day
rule (`06-questions/README.md`): the ladder is the reporting cadence each severity is owed —
Sev 1 is harm occurring, so two business days is one daily note without a touch; Sev 2 is
material within the cycle, so one working week; Sev 3 is managed inside the function, so two; Sev
4 is a watch item, so a month. Every register report also says that in phase 1 no CausalAnalyst
touches rows between flags, so stale rows are the argument for phase 2.
