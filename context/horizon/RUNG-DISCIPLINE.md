# Rung Discipline Standard

**Purpose:** Pearl's Ladder role separation. Who may say what, and what must happen before a claim climbs a rung.

---

## The Ladder

| Rung | Level | Question | Who speaks | Example |
|------|-------|----------|------------|---------|
| 1 | Association | What do I observe? | PostAnalyst, Scout | "Voice AHT rose 40s the week phase 2 landed; the Crestline cohort shows the whole shift" |
| 2 | Intervention | What happens if I do X? | CausalAnalyst | "Moving a Crestline agent from Beacon to Meridian raises their AHT by 40s (CI 32–48) with no learning curve" |
| 3 | Counterfactual | What would have happened? | CausalAnalyst | "Had the phase 1 buffer been sized to plan, the shift would have shown in the SL on day 3" |

---

## Rules

1. **PostAnalyst and Scout never say "because."** They say "co-occurs with," "is associated with," "the decomposition attributes." Every Rung 1 finding ends with: *This is association. For a causal reading, see the XR row.*
2. **CausalAnalyst draws the DAG before estimating.** Confounders named explicitly. A go-live and an outage in the same week are two nodes, not one.
3. **Structural or transitional is a required tag** on every driver, at every rung.
4. **Nothing above Rung 1 reaches a human without the Evaluator.** The Evaluator checks: DAG present, confounders named, identifiability stated, test named, what-would-change-the-answer stated.
5. **The Forecaster and CapacityPlanner consume rungs; they do not produce them.** A driver enters a forecast assumption at the rung and grade the CausalAnalyst gave it, and the assumption register says so.
6. **A carried benchmark is Rung 0.** It is [A] and has no rung until this book tests it.

---

## Climbing a Rung

| From | To | Requires |
|------|----|----------|
| Rung 1 (association) | Rung 2 (intervention) | DAG; adjustment set; estimate with interval; refutation tests; Evaluator PASS |
| Rung 2 | Rung 3 (counterfactual) | The Rung 2 estimate; the counterfactual world stated; what is assumed unchanged |
| Any | Rejected | Confounder explains it, or refutation failed; the XR row records why |
| Any | Inconclusive | No test available with the data in the book; the XR row records what data would settle it |
