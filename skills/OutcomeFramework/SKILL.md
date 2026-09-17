---
name: OutcomeFramework
description: Contact center outcome framework for CX/COST/EX analysis. USE WHEN outcome mapping OR measure factors OR outcome scorecard OR tradeoff analysis OR driver identification OR contact center metrics OR CX COST EX. Guides analytical work by mapping findings to Customer Experience, Cost, and Employee Experience domains.
---

# OutcomeFramework

The **North Star** for contact center analytical work. Every insight, factor, and finding maps to one of three outcome domains forming the **Outcome Triangle**.

## The Outcome Triangle

```
        CX (Customer Experience)
           /\
          /  \
         /    \
        /      \
       /________\
    COST ←----→ EX
(Financial)  (Employee)
```

**Core Principle:** All contact center optimization involves tradeoffs between these three domains. Understanding these relationships is essential for recommending balanced improvements.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **DefineOutcomes** | "define outcomes", "set up outcome framework" | `Workflows/DefineOutcomes.md` |
| **MapToOutcome** | "map to outcome", "classify factor", "which outcome" | `Workflows/MapToOutcome.md` |
| **TradeoffAnalysis** | "tradeoff analysis", "outcome tradeoffs", "CX vs COST" | `Workflows/TradeoffAnalysis.md` |
| **OutcomeScorecard** | "outcome scorecard", "generate scorecard", "outcome summary" | `Workflows/OutcomeScorecard.md` |
| **DriverIdentification** | "identify drivers", "what drives", "outcome drivers" | `Workflows/DriverIdentification.md` |

## Context Files

| File | Purpose |
|------|---------|
| `Context/OutcomeDefinitions.md` | Complete taxonomy of CX, COST, EX metrics |
| `Context/OutcomeRelationships.md` | Causal hypotheses between domains |
| `Context/FactorMapping.md` | Common factors → outcome classification |

## Integration Points

| Skill | Integration |
|-------|-------------|
| **ShapleyDecomposition** | Decompose R² by outcome domain |
| **CausalInference** | Build DAGs with outcome nodes |
| **DataAnalysis** | Tag analysis outputs with outcome |
| **Research** | Frame research by outcome impact |

## Examples

**Example 1: Map a factor to outcomes**
```
User: "Which outcome does Average Handle Time affect?"
→ Invokes MapToOutcome workflow
→ Returns: COST (primary), CX (secondary via wait time), EX (secondary via stress)
```

**Example 2: Analyze tradeoffs**
```
User: "What happens if we reduce AHT by 15%?"
→ Invokes TradeoffAnalysis workflow
→ Models impact on all three outcome domains
→ Identifies potential negative effects on CX/EX
```

**Example 3: Generate outcome scorecard**
```
User: "Create an outcome scorecard for this engagement"
→ Invokes OutcomeScorecard workflow
→ Summarizes all findings by CX/COST/EX
→ Highlights key drivers and tradeoffs
```
