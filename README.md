# HORIZON — Planning Horizon Engine

**Built by the Workforce Planning team | PAI v2.0 Architecture**

HORIZON is a mock of how a workforce planning organization runs its books of business when the
planning artifacts are living data structures instead of spreadsheets, and the daily work of
updating, reforecasting, explaining and answering is done by a team of specialist agents under a
coordinator, with planners approving rather than typing.

Built on the Miessler PAI (Personal AI) architecture — scaffolding matters more than the model,
and the file system is the context system.

The planning organization is **Larkspur Travel**, a travel management company. The book is
**Halcyon Group**, a corporate client migrating from the legacy servicing platform **Beacon** to
the new platform **Meridian**, served by an outsourced vendor team, **Crestline Services**, and the
in-house **Larkspur home team**. Nothing in it is real: synthetic data with a known ground truth.

## What It Does

HORIZON replaces three things people do in spreadsheets today:

1. **The daily update-and-reforecast.** Actuals arrive, get reconciled and versioned, yesterday's forecast is scored, the miss is decomposed, events are matched, a reforecast is proposed with its assumption register, and a planner approves it before the daily note goes out.
2. **The "why did it go bump" investigation.** A question arrives, gets classified, opens a row in the book's register with a hypothesis table, and is answered within 48 hours as a graded card that says what would change the answer.
3. **The monthly capacity plan.** Requirement hours → FTE → roster shape → gap, by channel, with scenarios, in the shape the long-term planning system consumes, waiting for a signature.

It mimics the two real integration points, IEX (short-term forecast load) and Anaplan (long-term
plan), as adapters that read and write files in those shapes.

## Architecture

```
                         The Algorithm
     OBSERVE -> THINK -> PLAN -> BUILD -> EXECUTE -> VERIFY -> LEARN

    ┌────────────────────────────────────────────────────────────────┐
    │                        HORIZON Engine                          │
    │                                                                │
    │  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐ │
    │  │  TELOS   │  │  MEMORY  │  │   Standards (8)              │ │
    │  │ Mission  │  │ Learning │  │   grades · answer-first ·    │ │
    │  │ Context  │  │ System   │  │   intake · clocks · ledgers  │ │
    │  └──────────┘  └──────────┘  │   gates · handoffs · rungs   │ │
    │                              └──────────────────────────────┘ │
    │                                                                │
    │  ┌──────────────────────────────────────────────────────────┐ │
    │  │                   Agent Team (11)                        │ │
    │  │                                                          │ │
    │  │   intake door ──► Librarian                              │ │
    │  │                                                          │ │
    │  │   daily clock:  DataEngineer → PostAnalyst → Scout       │ │
    │  │                 → CausalAnalyst → Forecaster             │ │
    │  │                 → Evaluator → [planner gate]             │ │
    │  │                 → Reporter → Adapters (IEX)              │ │
    │  │                                                          │ │
    │  │   monthly:      Forecaster → CapacityPlanner             │ │
    │  │                 → Evaluator → [planner sign-off]         │ │
    │  │                 → Adapters (Anaplan)                     │ │
    │  │                                                          │ │
    │  │   Coordinator runs the clocks and holds the gates        │ │
    │  └──────────────────────────────────────────────────────────┘ │
    │                                                                │
    │  ┌──────────────────────────────────────────────────────────┐ │
    │  │                 Books of Business (ledgers)              │ │
    │  │   profile · definitions · demand · forecast · supply     │ │
    │  │   events · questions · plans · reports · CHANGELOG       │ │
    │  └──────────────────────────────────────────────────────────┘ │
    │                                                                │
    │  ┌──────────────────────────────────────────────────────────┐ │
    │  │              Analytical Skills (17)                      │ │
    │  │   Statistical | Causal | Framework | Delivery            │ │
    │  └──────────────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────────────┘
```

## Agent Team

| Agent | Specialty | Rung | Writes to |
|-------|-----------|------|-----------|
| **Coordinator** | State machine, clocks, routing, gates, backlog | — | CHANGELOG, run log |
| **Librarian** | Intake: classifies every ask, pins definitions, opens register rows | — | definitions, events, questions |
| **DataEngineer** | ETL, QA, reconciliation (sums match, definitions cited), versioning | — | demand, supply |
| **PostAnalyst** | Forecast vs actual by channel and interval; variance into volume, handle time, mix, supply; SPC and regime detection | 1 | forecast (variance), reports |
| **Scout** | External and internal intelligence; proposes events with effect windows; correlation screens | 1 | events |
| **CausalAnalyst** | DAG per question; structural vs transitional; confounder isolation; identifiability; tests and what would change the answer | 2–3 | questions |
| **Forecaster** | Short-term and mid-term reforecast; every assumption registered and versioned; scenario runs | — | forecast |
| **CapacityPlanner** | Requirement hours → FTE → roster shape → gap; scenarios; long-term plan in Anaplan shape | — | plans |
| **Evaluator** | Adversarial review: no unlabeled carried assumption, grades present, rung respected, definitions cited; blocks or passes | — | run log |
| **Reporter** | Answer-first daily note, weekly review, register report | — | reports |
| **Adapters** | IEX (forecast CSV in/out), Anaplan (monthly plan export), email (intake), all mocked as file exchanges | — | forecast, plans |

## Ledgers

Every planning object is a versioned file with a change log and a definitions block. Nothing is
overwritten; a re-pull is a new version.

| Ledger | Holds | Lifecycle |
|--------|-------|-----------|
| `00-profile/` | Client profile, contract, channels, service targets, sites and vendors, phase and event calendar | Ledger |
| `01-definitions/` | One file per metric: name, formula, source, owner, change history | Ledger |
| `02-demand/` | Daily and interval actuals by channel: offered, handled, AHT, SL, ASA, abandoned; transactions; travelers | Ledger |
| `03-forecast/` | Versioned forecasts by horizon (short 1–6 wk, mid 3–18 mo, long AOP), each with an assumption register and lineage | Ledger + archive |
| `04-supply/` | Scheduled, staffed, productive hours; shrinkage; occupancy; headcount by cohort and tenure; vendor | Ledger |
| `05-events/` | The intelligence ledger: go-lives, outages, weather, holidays, client events, product changes, business asks; typed, dated, effect window, grade | Ledger |
| `06-questions/` | The register: XR rows, hypotheses with tests, graded findings, answer cards; the knowledge base | Ledger |
| `07-plans/` | Requirement hours → FTE → roster → gap; scenarios; Anaplan-shaped exports | Ledger + archive |
| `08-reports/` | Daily note, weekly review, register report, run logs | Dispatch |
| `CHANGELOG.md` | Every write, by whom (agent or human), why | Ledger |

## The Clocks

| Clock | What happens | Gate |
|-------|--------------|------|
| **Daily** | Actuals arrive → DataEngineer reconciles and versions → PostAnalyst scores yesterday's forecast and decomposes the miss → Scout matches events to the miss and proposes new ones → CausalAnalyst updates open hypotheses where a test now has data → Forecaster proposes the reforecast with its assumption register → Evaluator passes or blocks → **planner gate** → Reporter publishes the daily note → IEX adapter writes the forecast file | Planner approves the reforecast |
| **Weekly** | Variance review across the week; assumption register refresh; register report in answer-first form; backlog of open questions with staleness flags | Planner reviews the register |
| **Monthly** | Mid- and long-term reforecast; capacity plan; scenario pack; Anaplan export | **Planner sign-off** |
| **Ad hoc** | Anything that arrives by email or ask goes to the Librarian. Six fields: the question in one sentence, the decision it feeds, who decides, when it is needed, what data exists, what done looks like. If the requester cannot state the decision, it is a data pull. | — |

## Methodology

**Every number carries a grade.**

| Grade | Meaning |
|-------|---------|
| **[M]** | Measured — read from a versioned ledger, definition cited |
| **[C]** | Computed — formula stated, inputs graded |
| **[E]** | Estimated — range and assumption stated |
| **[A]** | Asserted — one source; never load-bearing alone |

Nothing carried across a channel or platform change is presented as measured. A benchmark
carried from another book is [A] until this book measures it.

**Pearl's Ladder of Causation** governs who may say what:

- **Rung 1 (Association):** "X and Y co-occur" — PostAnalyst, Scout
- **Rung 2 (Intervention):** "Changing X causes Y to change" — CausalAnalyst
- **Rung 3 (Counterfactual):** "Had X not occurred, Y would not have happened" — CausalAnalyst

No Rung 1 finding is presented as causal. The Evaluator reviews every causal claim, reforecast
and plan before it reaches a planner. Every driver is tagged **structural** or **transitional**,
because that decides steady-state staffing.

**Answer-first outputs.** Title sentence with grade, what changed, decision requested, next date.
Same shape for a daily note, a question card and a plan.

**The Algorithm** (OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN) structures all
non-trivial work with explicit success criteria and verification.

## Quick Start

Phase 1 is a deterministic TypeScript clock on bun: no model calls at runtime, no dependencies
beyond bun built-ins. The agent files in `agents/` are the behavioral spec; `Tools/clock/` is the
code that implements them (see `Tools/clock/README.md` for the stages and the rules).

```bash
bun run sim/generate.ts                                                         # regenerate the synthetic world (18 checks PASS)
bun run Tools/run-clock.ts daily --book halcyon --date 2026-07-22               # one daily clock (scores day 3)
bun run Tools/run-clock.ts daily --book halcyon --from 2026-07-21 --to 2026-11-16
bun run Tools/run-clock.ts weekly --book halcyon --week 2026-W36                # or --from 2026-W30 --to 2026-W46
bun run Tools/run-clock.ts register-report --book halcyon --date 2026-09-13
bun run Tools/run-clock.ts demo --book halcyon                                  # the whole scripted demo, in calendar order
```

Each daily run reconciles the ledgers (DataEngineer), scores the plan of record and decomposes the
miss with SPC and regime detection (PostAnalyst), matches events and proposes candidates (Scout),
opens or touches register rows with hypothesis tables (Librarian), and publishes the daily note
(Reporter), with the Coordinator writing a run state per `schemas/run-state.schema.json`.

### Scripted demo

The tree carries the full run: 119 daily notes, 17 weekly reviews and two register reports for the
Halcyon book, produced by `demo` and checked against the ground truth in
`docs/PHASE-1-VERIFICATION.md`. Open these three first:

1. `books/halcyon/08-reports/daily/2026-07-22.md` — day 3: the loop names a structural handle-time shift the humans in the real case found on day 56, opens XR-001, and asks a named human for a decision inside 48 hours.
2. `books/halcyon/08-reports/daily/2026-09-02.md` — day 45: growth without population; XR-004 opens with five hypotheses (seasonal transactions, re-contact spillover, chat→voice overflow, incident or retries, definition change), each tagged structural or transitional with the test that settles it.
3. `books/halcyon/08-reports/daily/2026-09-14.md` — day 57: "on a supply break, not a demand break" — a day that reads as a demand spike on every dashboard, separated from demand by productive hours and a transaction check.

And then: `books/halcyon/08-reports/register/2026-09-13.md` (the register report at day 56, reconstructed as of that date), `books/halcyon/08-reports/daily/2026-08-12.md` (a quiet day, for contrast: service met target and the plan was still wrong by 2.5×), `books/halcyon/08-reports/weekly/2026-W36.md`, and `books/halcyon/06-questions/register.md` for every question the loop opened.

### In a Codespace

1. Create a Codespace from this repository (Code → Codespaces → Create). First build takes a few minutes.
2. Open a terminal and run `claude`.
3. Sign in one of two ways when prompted: with a Claude account that carries a subscription (follow the URL, paste the code), or by adding `ANTHROPIC_API_KEY` as a Codespace secret before creating the Codespace. Either works; the setup script needs neither.
4. Ask for the daily loop on the Halcyon book: "Run today's daily clock for halcyon" — in phase 1 that runs the commands above.

### Example Session

```
User: Run today's daily clock for halcyon.

HORIZON: Running the daily clock for books/halcyon, data date 2026-03-14.

  1. DataEngineer: 02-demand 2026-03-14.v1 and 04-supply 2026-03-14.v1 written.
     Offered = handled + abandoned reconciles on all three channels. Definitions cited.
  2. PostAnalyst: Voice handled 4,210 [M] vs forecast 4,180 [C], +0.7%. AHT 452s [M]
     vs 412s [C], +40s. Decomposition: handle time 92% of the hours miss [C], volume 8%.
     SPC: AHT out of control since day 3 of phase 2. This is association.
  3. Scout: No event in 05-events explains day 3. Proposes "Meridian go-live, Crestline
     cohort" with effect window from go-live, grade [A] pending planner review.
  4. CausalAnalyst: XR-004 hypothesis table updated. Level shift with no learning curve
     for the Crestline cohort, curve for the Larkspur home team. Tag: structural [C].
  5. Forecaster: 03-forecast 2026-03-15.v1 proposed. Voice AHT assumption 452s [M]
     replaces 412s (carried, now relabeled). Register attached.
  6. Evaluator: PASS.
  7. Gate request to planner: approve reforecast 2026-03-15.v1.

  Waiting for approval. Daily note and IEX file follow on approval.
```

## Book Structure

```
books/<client>/
├── 00-profile/        client profile, contract, channels, service targets, sites and vendors, calendar
├── 01-definitions/    one file per metric: name, formula, source, owner, change history
├── 02-demand/         daily (and interval) actuals by channel; transactions; travelers
├── 03-forecast/       versioned forecasts by horizon, each with an assumption register and lineage
├── 04-supply/         scheduled, staffed, productive hours; shrinkage; occupancy; headcount by cohort
├── 05-events/         the intelligence ledger: typed, dated, effect window, grade
├── 06-questions/      the register: XR rows, hypotheses with tests, graded findings, answer cards
├── 07-plans/          requirement hours → FTE → roster → gap; scenarios; Anaplan-shaped exports
├── 08-reports/        daily note, weekly review, register report, run logs
└── CHANGELOG.md       every write, by whom (agent or human), why
```

`01-source/` (raw pulls) is never committed. Ledgers are CSV or JSON with a markdown header;
reports are markdown.

## Demo Storyline

Day 1 to day 40 of the Halcyon migration from Beacon to Meridian, in a Codespace.

- The chain flags the handle-time shift on **day 2** and confirms it on **day 3** (in the real case the humans saw it on day 56): a level shift for the Crestline cohort with no learning curve, a curve for the Larkspur home team, hidden in phase 1 by an oversized buffer.
- Phase 2 lands on plan and the daily note says so.
- Growth without population is flagged on **day 45** with hypotheses and their tests: seasonal transactions, re-contact spillover once service level breaks, chat-to-voice overflow, and a definition change.
- A two-day supply-side regime break (a training pull) that looks like demand is separated from the demand trend.
- The outage day and the weather day are isolated from the trend because both are in the event ledger.
- A bot switched off means a benchmark carried from another book is wrong by construction; the grade rule catches it.
- One metric with two definitions in circulation is caught by the definitions ledger.
- A leader asks "why did service break on day 38" and gets a graded answer card in the register within the hour, with what would change the answer.
- The monthly plan proposes phase 3 sizing in hours by channel with the assumption register attached, and waits for a signature.

## Repository Layout

```
horizon/
├── CLAUDE.md          identity, principles, clocks, agent table
├── ALGORITHM.md       the universal problem-solving framework
├── README.md          this file
├── docs/              DESIGN.md, PHASE-1-BACKLOG.md, PHASE-1-VERIFICATION.md
├── agents/            11 agent definitions
├── skills/            17 analytical skills
├── context/horizon/   8 operating standards
├── hooks/             session and security hooks
├── Tools/             skill index and search; run-clock.ts + clock/ (the phase-1 daily, weekly and register clocks)
├── TELOS/             mission context
├── MEMORY/            learnings and signals
├── books/             books of business (one folder per client)
├── schemas/           ledger schemas
├── adapters/          IEX, Anaplan, email file adapters (mocked)
└── sim/               synthetic world generator with ground truth
```

---

*Built by the Workforce Planning team*
*Architecture: PAI v2.0 (Miessler philosophy — scaffolding > model)*
