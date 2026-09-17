---
name: ShapleyDecomposition
description: Shapley value decomposition for variance attribution. USE WHEN user wants to decompose variance, attribute contributions, analyze factor importance, R² decomposition, FTE variance analysis, or understand "how much did each factor contribute". Based on cooperative game theory.
---

# ShapleyDecomposition

Shapley value decomposition for **any** variance attribution problem where an outcome depends on multiple contributing factors. Decomposes total variance into fair, additive contributions that sum exactly to the total.

> **Core Insight:** Treat variance attribution as a cooperative game. Each factor's contribution is its average marginal impact across all possible orderings.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Analyze** | "decompose variance", "attribute contributions", "what drove the variance" | `Workflows/Analyze.md` |
| **BuildTool** | "create a template", "build Excel", "automate this analysis" | `Workflows/BuildTool.md` |
| **Explain** | "explain Shapley", "teach me", "how does this work" | `Workflows/Explain.md` |
| **Compare** | "compare periods", "variance bridge", "month over month" | `Workflows/Compare.md` |

## Quick Commands

```
shapley analyze [data]         → Decompose variance in dataset
shapley build [model]          → Generate reusable tool (Excel/Python)
shapley explain [domain]       → Teach methodology with domain examples
shapley compare [period1] [period2] → Compare decompositions across time
```

## Core Formula

For factors F = {1, 2, ..., n}, the Shapley value for factor i:

```
φᵢ = Σ [|S|!(n-|S|-1)!/n!] × [v(S∪{i}) - v(S)]
    S⊆F\{i}
```

**Key Property:** Σφᵢ = v(F) - v(∅) = Total variance explained

## Examples

**Example 1: WFM Staffing Variance**
```
User: "Our FTE requirement was 120 but we forecasted 100. Volume was up 10%,
       AHT up 10%, and shrinkage went from 30% to 35%. What drove the variance?"
→ Invokes Analyze workflow
→ Computes 8 coalition values (2³ combinations)
→ Returns: Volume contributed X FTE, AHT contributed Y FTE, Shrinkage contributed Z FTE
→ Contributions sum exactly to 20 FTE variance
```

**Example 2: Build Reusable Tool**
```
User: "Create an Excel template for monthly staffing variance analysis"
→ Invokes BuildTool workflow
→ Generates Excel with input cells, coalition calculations, Shapley formulas
→ Outputs ready-to-use template with documentation
```

**Example 3: Explain for Finance**
```
User: "Explain Shapley decomposition for revenue variance (price × quantity)"
→ Invokes Explain workflow
→ Walks through 2-factor example with Price and Quantity
→ Shows why naive methods fail (order dependence)
→ Demonstrates Shapley solution with their specific numbers
```

**Example 4: Compare Periods**
```
User: "Compare Q1 vs Q2 variance drivers"
→ Invokes Compare workflow
→ Runs decomposition for each period
→ Shows which factors became more/less important
→ Highlights shifts in variance attribution
```

## Supported Model Types

| Model Type | Formula | Factors |
|------------|---------|---------|
| **Multiplicative** | Y = A × B × C | Any product of terms |
| **Additive** | Y = A + B + C | Any sum of terms |
| **Mixed** | Y = (A × B) / C | Combinations |
| **Regression R²** | R² = f(X₁, ..., Xₚ) | Regressor importance |
| **Custom** | Y = f(factors) | Any defined function |

## Application Domains

- **WFM:** FTE = (Volume × AHT) / (WorkHours × Occupancy × (1-Shrinkage))
- **Finance:** Revenue = Price × Quantity; Profit = Revenue - Cost
- **Manufacturing:** Yield = f(temperature, pressure, time)
- **Marketing:** Conversions = Impressions × CTR × ConversionRate
- **Regression:** R² decomposition by regressor (LMG method)

## Hierarchy Analysis

| Capability | Layer | Implementation |
|------------|-------|----------------|
| Compute Shapley weights | CODE | `Tools/ShapleyCompute.ts` |
| Generate coalition values | CODE | `Tools/ShapleyCompute.ts` |
| Create Excel template | CODE | `Tools/ShapleyExcel.ts` |
| Analyze variance | PROMPT | `Workflows/Analyze.md` |
| Build custom tools | PROMPT | `Workflows/BuildTool.md` |
| Explain methodology | PROMPT | `Workflows/Explain.md` |
| Compare periods | PROMPT | `Workflows/Compare.md` |

## Output Format

```markdown
## Shapley Variance Decomposition

**Model:** [formula]
**Period:** [if applicable]
**Total Variance:** [value] [units]

| Factor | Attribution | % of Total | Direction |
|--------|-------------|------------|-----------|
| [name] | [value]     | [%]        | [+/-]     |

**Verification:** Sum = [total] ✓

**Interpretation:** [1-2 sentences on what drives the variance]
```

## Key Axioms (Why Shapley?)

From cooperative game theory, the Shapley value is the **unique** decomposition satisfying:

1. **Efficiency:** Contributions sum exactly to total
2. **Symmetry:** Interchangeable factors get equal shares
3. **Null Player:** Factor contributing nothing gets zero
4. **Additivity:** Decomposition is additive across games

**For grouped factors:** Use the **Owen value** (two-stage Shapley) to ensure consistency.

## Context Files

| File | Contents |
|------|----------|
| `Context/ShapleyTheory.md` | Synthesized theory from research papers |
| `Templates/WFM_Staffing.md` | WFM-specific template with formulas |
