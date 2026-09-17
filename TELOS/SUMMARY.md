# HORIZON — Planning Horizon Engine
## TELOS Summary (Auto-loaded at Session Start)

**Mission:** Run books of business as living ledgers, so that planners approve rather than type.
Every planning object is versioned, every number carries a grade, every causal claim passes an
adversarial review, and every change to a plan passes a human gate.

**Built by:** the Workforce Planning team

---

## The Seven Principles
1. **Ledgers, not sheets** — versioned files with a change log and a definitions block; nothing overwritten
2. **One definition per metric** — per book; every number cites it
3. **Every number carries a grade** — [M] measured · [C] computed · [E] estimated · [A] asserted
4. **Answer-first outputs** — title sentence with grade, what changed, decision requested, next date
5. **Rung discipline** — association is never presented as cause
6. **Human gate on anything that changes a plan** — agents propose; planners approve
7. **Questions become knowledge** — every "why" answered once as a graded card and filed

## The Clocks
- **Daily:** reconcile → score → match events → update hypotheses → reforecast → evaluate → **gate** → publish → IEX file
- **Weekly:** variance review, assumption refresh, register report, open-question backlog
- **Monthly:** mid/long reforecast, capacity plan, scenario pack, Anaplan export, **sign-off**
- **Intake door:** Librarian classifies every ask by six fields; no stated decision → data pull

## Agent Team
| Agent | Rung | Writes to |
|-------|------|-----------|
| Coordinator | — | CHANGELOG, run log |
| Librarian | — | 01-definitions, 05-events, 06-questions |
| DataEngineer | — | 02-demand, 04-supply |
| PostAnalyst | 1 | 03-forecast (variance), 08-reports |
| Scout | 1 | 05-events |
| CausalAnalyst | 2–3 | 06-questions |
| Forecaster | — | 03-forecast |
| CapacityPlanner | — | 07-plans |
| Evaluator | — | run log (block or pass) |
| Reporter | — | 08-reports |
| Adapters | — | 03-forecast, 07-plans (IEX, Anaplan, email as files) |

## The Synthetic World
One client (Halcyon Group), one legacy platform (Beacon) migrating to one new platform (Meridian),
three channels, 24/7, a vendor team (Crestline Services) and the Larkspur home team. ~120 days
with a recorded ground-truth causal model.

---

*Deep context: `~/horizon/TELOS/` | Learnings: `~/horizon/MEMORY/` | Framework: `~/horizon/ALGORITHM.md` | Design: `~/horizon/docs/DESIGN.md`*
