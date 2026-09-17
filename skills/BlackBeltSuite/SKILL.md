---
name: BlackBeltSuite
description: Unified analytical capability coordinating StatisticalAnalysis, ProcessCapability, VarianceAnalysis, RootCauseAnalysis, and DOEDesigner. USE WHEN user mentions analyze data, full analysis, DMAIC, Six Sigma, diagnose problem, bb analyze, comprehensive analysis, data-driven investigation.
---

# BlackBeltSuite - Unified Analytical Capability

Coordinates the 5 BlackBelt skills into cohesive analytical workflows for contact center operations.

> **CRITICAL CONSTRAINT:** This suite operates at Rung 1 (Association). All findings must note:
> "This is correlation. For causal interpretation, validate with CausalInference skill."

## Component Skills

| Skill | Purpose | Rung |
|-------|---------|------|
| StatisticalAnalysis | Hypothesis testing, correlation, regression | 1 |
| ProcessCapability | SPC, control charts, Cp/Cpk | 1 |
| VarianceAnalysis | Budget vs actual, decomposition | 1 |
| RootCauseAnalysis | Ishikawa, 5-Why, Pareto, FMEA | 1 (hypotheses) |
| DOEDesigner | Experimental design for causal claims | 2* |

*DOE enables causal claims through controlled manipulation

## Supporting Skills

| Skill | Purpose |
|-------|---------|
| OutcomeFramework | Map findings to CX/COST/EX |
| ShapleyDecomposition | Variance attribution |
| CausalInference | Escalation for causal claims |

## Workflow Routing

| Intent | Workflow | Skills Used |
|--------|----------|-------------|
| Comprehensive investigation | `FullAnalysis.md` | RCA → Stats → Variance → Capability → DOE |
| Quick health check | `QuickDiagnostics.md` | Describe → Correlate → Stability → Outcome |
| Variance deep dive | `VarianceDeepDive.md` | Variance → Shapley → Hypothesize → Test |
| Process improvement | `ProcessImprovement.md` | Baseline → RCA → DOE → Confirm |

## DMAIC Phase Mapping

| Phase | Primary Skill | Supporting |
|-------|---------------|------------|
| **Define** | OutcomeFramework | — |
| **Measure** | StatisticalAnalysis, ProcessCapability | VarianceAnalysis |
| **Analyze** | RootCauseAnalysis, ShapleyDecomposition | StatisticalAnalysis |
| **Improve** | DOEDesigner | StatisticalAnalysis |
| **Control** | ProcessCapability | StatisticalAnalysis |

## Quick Commands

```
bb analyze [data]           → Full diagnostic (FullAnalysis workflow)
bb quick [data]             → Quick diagnostics
bb dmaic [phase] [data]     → Phase-specific analysis
bb stats [command]          → Route to StatisticalAnalysis
bb spc [command]            → Route to ProcessCapability
bb variance [command]       → Route to VarianceAnalysis
bb rca [command]            → Route to RootCauseAnalysis
bb doe [command]            → Route to DOEDesigner
```

## Standard Output Requirements

Every BlackBelt analysis output MUST include:

### 1. Finding Statement
Clear, specific statement of what was observed.

### 2. Effect Size
Quantified magnitude (not just significance):
- Cohen's d for group comparisons
- R² for regression
- Percentage change for variance
- Cp/Cpk for capability

### 3. Uncertainty Bounds
- Confidence intervals
- Standard errors
- Prediction intervals where applicable

### 4. Outcome Mapping
Via OutcomeFramework:
- **CX Impact:** [Customer Experience effect]
- **COST Impact:** [Cost/efficiency effect]
- **EX Impact:** [Employee Experience effect]

### 5. Causal Caveat
> ⚠️ **Causal Note:** This finding represents [correlation/association].
> For causal interpretation, [specify what validation is needed].
> To establish causation, consider [DOE design / CausalInference analysis].

## Analysis Escalation

When to escalate to CausalInference:
- User asks "why" or "what caused"
- Need to make intervention recommendations
- Policy decisions depend on analysis
- Multiple confounders suspected
- Want counterfactual estimates

## Output Template

```markdown
## BlackBelt Analysis: [Title]

**Analysis Type:** [workflow used]
**Date:** [date]
**Data:** [source description]

### Executive Summary

[1-2 sentence key finding with effect size]

### Findings

#### Finding 1: [Title]
**Observation:** [what was found]
**Effect Size:** [quantified magnitude]
**Confidence:** [interval or uncertainty]
**Statistical Test:** [test used, p-value]

**Outcome Impact:**
| Dimension | Impact | Confidence |
|-----------|--------|------------|
| CX | [effect] | [high/medium/low] |
| COST | [effect] | [high/medium/low] |
| EX | [effect] | [high/medium/low] |

⚠️ **Causal Status:** Association only. [Caveat details]

### Recommendations

1. [Recommendation with expected impact]
2. [Recommendation with expected impact]

### Next Steps

- [ ] [Validation step if needed]
- [ ] [CausalInference escalation if warranted]
- [ ] [DOE design if causal confirmation needed]

---
*Analysis performed using BlackBeltSuite. Findings are correlational unless DOE-validated.*
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    BlackBeltSuite                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │  Stats  │ │   SPC   │ │Variance │ │   RCA   │ │  DOE  │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └───┬───┘ │
│       │           │           │           │          │      │
│       └───────────┴─────┬─────┴───────────┴──────────┘      │
│                         │                                    │
│              ┌──────────▼──────────┐                        │
│              │  OutcomeFramework   │                        │
│              │    (CX/COST/EX)     │                        │
│              └──────────┬──────────┘                        │
│                         │                                    │
│              ┌──────────▼──────────┐                        │
│              │  Causal Caveat      │                        │
│              │  (Rung 1 Warning)   │                        │
│              └──────────┬──────────┘                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼ Escalation if causal claims needed
              ┌──────────────────────┐
              │   CausalInference    │
              │   (Rung 2 & 3)       │
              └──────────────────────┘
```
