# HORIZON Mental Models

## Pearl's Ladder of Causation

| Rung | Level | Question | Agent | Example |
|------|-------|----------|-------|---------|
| 1 | Association | What do I observe? | PostAnalyst, Scout | "Handle time rose the week phase 2 landed" |
| 2 | Intervention | What happens if I do X? | CausalAnalyst | "Moving the Crestline cohort to Meridian raises AHT by 40s" |
| 3 | Counterfactual | What would have happened? | CausalAnalyst | "Had the buffer been right-sized, the shift would have shown on day 3" |

**Rule:** PostAnalyst and Scout speak at Rung 1. CausalAnalyst speaks at Rungs 2 and 3. Nothing
above Rung 1 reaches a human without passing the Evaluator.

## The Grade Ladder

| Grade | Meaning | Must state |
|-------|---------|------------|
| [M] | Measured | Source ledger, version, definition cited |
| [C] | Computed | Formula, inputs with their grades |
| [E] | Estimated | Range, assumption, what would narrow it |
| [A] | Asserted | The one source; never load-bearing alone |

A computed number inherits the weakest grade among its inputs unless the formula is stated and
the inputs are all [M].

## The Three Clocks

| Clock | Loop | Gate |
|-------|------|------|
| Daily | reconcile → score → match events → update hypotheses → reforecast → evaluate → **gate** → publish → IEX file | Planner approves the reforecast |
| Weekly | variance review → assumption refresh → register report → open-question backlog | Planner reviews the register |
| Monthly | mid/long reforecast → capacity plan → scenario pack → Anaplan export → **sign-off** | Planner signs the plan |

And the intake door, which is not a clock: anything that arrives by email or ask goes to the
Librarian and is classified before it is worked.

## The Variance Decomposition

A forecast miss decomposes into volume, handle time, mix and supply. Shapley or sequential
attribution, stated which. The residual is labeled, not hidden. Each driver is tagged
structural or transitional.

## The Hypothesis Table

Every XR row carries: claim, evidence for, evidence against, the test that settles it, the data
needed, grade. A question without a test is not yet a hypothesis.

## Ledger Lifecycles

| Lifecycle | Behavior | Examples |
|-----------|----------|----------|
| Ledger | Append only; a re-pull is a new version | demand, supply, events, definitions, questions |
| Dispatch | Derived; regenerated from ledgers | daily note, weekly review, register report, IEX file |
| Archive | Frozen at a date | signed plans, superseded forecast versions |

## The Algorithm

Universal problem-solving framework: **Current State → Ideal State via Verifiable Iteration**

OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN

Always define success criteria (BUILD) before executing. Always verify results. Always extract
learnings. Full documentation: `~/horizon/ALGORITHM.md`

## The Answer-First Shape

```
<Title sentence, with grade>
What changed
Decision requested
Next date
```

Same shape for a daily note, a question card and a plan.
