# HORIZON — a planner ecosystem, mocked end to end · Design v0.1

HORIZON (planning horizons). Built by the Workforce Planning team on the PAI lineage: file system is the context system, scaffolding over model, specialists not generalists, a human gate at every phase transition, every number graded.

## 1. What it is

A mock of how a workforce planning organization (Larkspur Travel, a travel management company) runs its books of business when the planning artifacts are living data structures instead of spreadsheets, and the daily work of updating, reforecasting, explaining and answering is done by a team of specialist agents under a coordinator, with planners approving rather than typing.

It replaces three things people do in Excel today: the daily update-and-reforecast, the "why did it go bump" investigation, and the monthly capacity plan. It mimics the two real integration points, IEX (short-term forecast load) and Anaplan (long-term plan), as adapters that read and write files in those shapes. Nothing in it is real: one fictitious client (Halcyon Group), one fictitious legacy platform (Beacon) migrating to one fictitious new platform (Meridian), one fictitious vendor team (Crestline Services) alongside the Larkspur home team, and synthetic data with a known ground truth.

## 2. Design principles

1. **Ledgers, not sheets.** Every planning object is a versioned file with a change log and a definitions block. Nothing is overwritten; a re-pull is a new version.
2. **One definition per metric.** AHT, transaction, contact, handled, offered each have one written definition per book, and every number cites it. (The lesson of the metric with two definitions in circulation: 0.35 against 0.36, 0.88 against 0.9.)
3. **Every number carries a grade.** [M] measured · [C] computed, formula stated · [E] estimated, range and assumption · [A] asserted, one source. Nothing carried across a channel or platform change is presented as measured.
4. **Answer-first outputs.** Title sentence with grade, what changed, decision requested, next date. Same shape for a daily note, a question card and a plan.
5. **Rung discipline.** Association (BlackBelt) is never presented as cause. Causal claims go through the CausalAnalyst and an adversarial Evaluator before they reach a human.
6. **Human gate on anything that changes a plan.** Reforecast, capacity plan, severity, publication. Agents propose; planners approve.
7. **Questions become knowledge.** Every "why" that arrives is answered once as a graded card and filed where the next asker finds it.

## 3. The living data structures (per book of business)

```
books/<client>/
  00-profile/        client profile, contract, channels, service targets, sites and vendors, phase and event calendar
  01-definitions/    one file per metric: name, formula, source, owner, change history
  02-demand/         daily (and interval) actuals by channel: offered, handled, AHT, SL, ASA, abandoned; transactions; travelers
  03-forecast/       versioned forecasts by horizon: short (1–6 wk, daily/interval), mid (3–18 mo, weekly), long (AOP, monthly); each with an assumption register and lineage
  04-supply/         scheduled, staffed, productive hours; shrinkage; occupancy; headcount by cohort and tenure; vendor
  05-events/         the intelligence ledger: go-lives, outages, weather, holidays, client events, product changes, business asks; typed, dated, effect window, grade
  06-questions/      the register: XR rows, hypotheses with tests, graded findings, answer cards; the knowledge base
  07-plans/          requirement hours → FTE → roster → gap; scenarios; Anaplan-shaped exports
  08-reports/        daily note, weekly review, register report; dispatch lifecycle
  CHANGELOG.md       every write, by whom (agent or human), why
```

Ledgers are CSV or JSON with a markdown header; reports are markdown. Three lifecycles from the workspace pack: ledger (append), dispatch (derived, regenerated), archive.

## 4. The agent team

| Agent | Specialty | Rung | Writes to |
|---|---|---|---|
| **Coordinator** | State machine, clocks, routing, gates, backlog | — | CHANGELOG, run log |
| **Librarian** (intake) | Classifies everything that arrives: planning request, performance question, data pull, event; pins definitions; opens XR rows | — | 01, 05, 06 |
| **DataEngineer** | ETL, QA, reconciliation (sums match, definitions cited), versioning | — | 02, 04 |
| **PostAnalyst** (BlackBelt) | Forecast vs actual by channel and interval; variance decomposed into volume, handle time, mix, supply; SPC and regime detection | 1 | 03 (variance), 08 |
| **Scout** | External and internal intelligence: weather, outages, holidays, news, client calendar, tagged emails; proposes events with effect windows; correlation screens | 1 | 05 |
| **CausalAnalyst** | DAG per question; structural vs transitional; confounder isolation; identifiability; tests and what would change the answer | 2–3 | 06 |
| **Forecaster** | Short-term reforecast (daily/interval) and mid-term; every assumption registered and versioned; scenario runs | — | 03 |
| **CapacityPlanner** | Requirement hours → FTE → roster shape → gap; scenarios; long-term plan in Anaplan shape | — | 07 |
| **Evaluator** (MethodologyChallenger) | Adversarial review; rules: no unlabeled carried assumption, grades present, rung respected, definitions cited; blocks or passes | — | run log |
| **Reporter** | Answer-first daily note, weekly review, register report | — | 08 |
| **Adapters** | IEX (forecast CSV in/out), Anaplan (monthly plan export), email (intake), all mocked as file exchanges | — | 03, 07 |

Reused from the predecessor engine as they are: DataEngineer, BlackBelt (PostAnalyst), CausalAnalyst, MethodologyChallenger (Evaluator), ProjectCoordinator, the pipeline-state schema, the BookOfWhy and Shapley skills. New: Librarian, Scout, Forecaster, CapacityPlanner, Reporter, Adapters.

## 5. The clocks

**Daily (the core loop).** Actuals arrive → DataEngineer reconciles and versions → PostAnalyst scores yesterday's forecast and decomposes the miss → Scout matches events to the miss and proposes new ones → CausalAnalyst updates open hypotheses where a test now has data → Forecaster proposes the reforecast with its assumption register → Evaluator passes or blocks → **planner gate** → Reporter publishes the daily note → IEX adapter writes the forecast file.

**Weekly.** Variance review across the week; assumption register refresh; register report in answer-first form; backlog of open questions with staleness flags.

**Monthly.** Mid- and long-term reforecast; capacity plan; scenario pack; Anaplan export; **planner sign-off**.

**Ad hoc (the intake door).** Anything that arrives by email or ask goes to the Librarian. Six fields: the question in one sentence, the decision it feeds, who decides, when it is needed, what data exists, what done looks like. If the requester cannot state the decision, it is a data pull. Routed to: a planning request (CapacityPlanner), a performance question (XR row, then 48-hour readout), a data pull (definitions ledger, queue), or an event (Scout).

## 6. Hypothesis testing and confounder isolation

Each XR row carries a hypothesis table: claim, evidence for, evidence against, the test that settles it, the data needed, grade. The CausalAnalyst draws the DAG for the question and names confounders explicitly (a go-live and an outage on the same week; a channel change and a vendor change together). Isolation follows the standard method: decompose first (Shapley or sequential), test what can be tested, label the residual, and state what would change the answer. Structural versus transitional is a required tag on every driver, because it decides steady-state staffing.

## 7. The synthetic world

One fictitious corporate client (Halcyon Group) served first on the legacy platform (Beacon) and migrated to the new platform (Meridian), across three channels (voice, chat, email), 24/7, with a vendor team (Crestline Services) and an in-house team (the Larkspur home team). A generator script produces ~120 days with a recorded ground-truth causal model, so the demo can show the chain recovering the truth:

- a phased migration (phase 1 small, phase 2 doubles the population, phase 3 planned)
- a handle-time level shift at go-live with no learning curve for the Crestline cohort and a curve for the Larkspur home team
- an oversized buffer in phase 1 that hides the shift
- growth after phase 2 with no new population (seasonal transactions plus re-contact spillover once SL breaks)
- a two-day supply-side regime break (training pull) that looks like demand
- an outage on one day and a weather event on another, both in the event ledger
- a bot switched off, so a benchmark carried from another book is wrong by construction
- one metric with two definitions in circulation, so the definitions ledger has something to catch

## 8. The demo storyline

Day 1 to day 40 of the migration in a Codespace. The chain flags the handle-time shift on day 3 (the humans in the real case saw it on day 56). Phase 2 lands on plan and the note says so. Growth without population is flagged on day 44 with three hypotheses and their tests. The outage day is isolated from the demand trend. A leader asks "why did service break on day 38" and gets a graded answer card in the register within the hour, with what would change the answer. The monthly plan proposes phase 3 sizing in hours by channel with the assumption register attached, and waits for a signature.

## 9. Build phases

| Phase | Delivers | Reuses |
|---|---|---|
| 0 | Repo skeleton; book structure; definitions ledger; synthetic generator with ground truth | Predecessor skeleton, simulation generator pattern |
| 1 | Daily loop, minimal: DataEngineer → PostAnalyst → Reporter. The daily note exists | DataEngineer, BlackBelt, VarianceAnalysis |
| 2 | Events and hypotheses: Scout, Librarian intake, XR register, CausalAnalyst | Research intake, CausalInference, BookOfWhy, register schema |
| 3 | Forecaster + Evaluator + planner gate; IEX adapter (mock) | MethodologyChallenger, pipeline-state |
| 4 | CapacityPlanner, scenarios, Anaplan adapter (mock); monthly clock | ShapleyDecomposition, MeasureAnything |
| 5 | Question cards → knowledge base; leadership README; scripted demo run committed | ReportCompiler, answer-first format |

Phase 1 is one evening. Phases 2–3 make it a demo. Phases 4–5 make it an ecosystem.

## 10. Out of scope for v1, by design

Real integrations (IEX, Anaplan, email are file adapters); real data; scheduling and real-time (the next layers down the planning stack, same pattern); multi-book optimization (the ontology and constraint calculator sit above this and consume its ledgers later).

## 11. Open decisions

Scripted or live demo · public or private repository · whether a second book is added in v1 to exercise the carried-benchmark rule.

## 12. Names

| Role | Name |
|---|---|
| Planning organization | Larkspur Travel (a travel management company) |
| Client book | Halcyon Group |
| Legacy servicing platform | Beacon |
| New platform | Meridian |
| Outsourced vendor team | Crestline Services |
| In-house cohort | Larkspur home team |

All fictitious. No real vendor, account or person is referenced anywhere in the repository.
