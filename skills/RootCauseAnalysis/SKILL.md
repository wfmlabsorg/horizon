---
name: RootCauseAnalysis
description: Structured problem decomposition methods. USE WHEN fishbone diagram, ishikawa, 5 why, root cause, pareto analysis, vital few, fault tree, FMEA, failure mode, cause analysis, problem decomposition. Generates HYPOTHESES about causes — NOT validated causal claims.
dependencies:
  - OutcomeFramework
  - Art
---

# RootCauseAnalysis - Structured Problem Decomposition

**Purpose:** Generate structured hypotheses about potential causes using proven analytical frameworks.

> ⚠️ **CRITICAL CONSTRAINT:** Ishikawa diagrams, 5 Why, and Pareto analysis identify **potential causes to investigate**. They do NOT prove causation. Every output must note: "These are hypotheses. Validate with data via StatisticalAnalysis, then confirm causation via CausalInference."

---

## Architecture: Hypothesis Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│              ROOT CAUSE ANALYSIS PIPELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PROBLEM STATEMENT                                               │
│        │                                                         │
│        ▼                                                         │
│  ┌─────────────────────┐                                        │
│  │ BRAINSTORM CAUSES   │  Ishikawa / 5 Why / Fault Tree         │
│  │ (Divergent)         │  → Generates hypothesis set            │
│  └─────────┬───────────┘                                        │
│            │                                                     │
│            ▼                                                     │
│  ┌─────────────────────┐                                        │
│  │ PRIORITIZE CAUSES   │  Pareto / FMEA / Multi-criteria        │
│  │ (Convergent)        │  → Ranks by impact × likelihood        │
│  └─────────┬───────────┘                                        │
│            │                                                     │
│            ▼                                                     │
│  ┌─────────────────────┐                                        │
│  │ VALIDATE CAUSES     │  StatisticalAnalysis → CausalInference │
│  │ (Verification)      │  → Confirms or rejects hypotheses      │
│  └─────────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Task | Workflow | Output |
|------|----------|--------|
| Brainstorm causes by category | `Ishikawa` | Fishbone diagram + categorized causes |
| Drill to root cause | `FiveWhy` | Causal chain with evidence gaps |
| Identify vital few | `ParetoAnalysis` | 80/20 ranking with visual |
| Top-down failure decomposition | `FaultTree` | Boolean logic tree |
| Risk-based prioritization | `FMEA` | RPN-ranked failure modes |

---

## Workflow Routing

| Trigger Phrases | Workflow | File |
|-----------------|----------|------|
| "fishbone", "ishikawa", "cause and effect diagram", "6M analysis" | Ishikawa | `Workflows/Ishikawa.md` |
| "5 why", "five why", "drill down", "root cause chain" | FiveWhy | `Workflows/FiveWhy.md` |
| "pareto", "vital few", "80/20", "prioritize causes" | ParetoAnalysis | `Workflows/ParetoAnalysis.md` |
| "fault tree", "FTA", "boolean failure", "top-down failure" | FaultTree | `Workflows/FaultTree.md` |
| "FMEA", "failure mode", "RPN", "risk priority" | FMEA | `Workflows/FMEA.md` |

---

## Tools

| Tool | Purpose |
|------|---------|
| `Tools/root_cause_tools.py` | Python functions for Pareto, FMEA, Ishikawa generation |

### Key Functions
```python
pareto_analysis(causes_df, cause_col, impact_col)  # Pareto with vital few
generate_ishikawa_mermaid(problem, categories)      # Mermaid fishbone
five_why_template(problem)                          # 5 Why worksheet
fmea_template(process_steps)                        # FMEA with RPN
prioritize_causes(causes, criteria)                 # Multi-criteria ranking
```

---

## Context Files

| File | Purpose |
|------|---------|
| `Context/IshikawaCategories.md` | 6M framework + contact center adaptation |

---

## Ishikawa Categories

### Standard 6M Framework
- **M**anpower (People)
- **M**achine (Equipment/Technology)
- **M**ethod (Process)
- **M**aterial (Inputs)
- **M**easurement (Data/Metrics)
- **M**other Nature (Environment)

### Contact Center Adaptation
- **People:** Agents, supervisors, training, tenure, skills, engagement
- **Technology:** ACD, CRM, WFM, telephony, desktop, integrations
- **Process:** Scripts, procedures, escalation, QA, workflows
- **Information:** Knowledge base, data quality, reporting, documentation
- **Management:** Scheduling, coaching, policies, incentives, staffing
- **Environment:** Facilities, remote work setup, noise, ergonomics

---

## Integration with Other Skills

| Skill | Integration |
|-------|-------------|
| **OutcomeFramework** | Link causes to CX/COST/EX outcomes |
| **Art** | Generate fishbone diagram visuals |
| **StatisticalAnalysis** | Test hypotheses with correlation/regression |
| **CausalInference** | Validate causal relationships with DAGs |
| **ShapleyDecomposition** | Quantify variance attribution |

---

## FMEA Risk Priority Number

```
RPN = Severity × Occurrence × Detection

Scale (1-10 each):
- Severity: Impact if failure occurs
- Occurrence: Likelihood of failure
- Detection: Likelihood of catching before impact

RPN > 100: High priority
RPN 50-100: Medium priority
RPN < 50: Lower priority
```

---

## Quick Commands

```
rca fishbone [problem]          → Generate Ishikawa diagram
rca 5why [problem]              → Start 5 Why analysis
rca pareto [data]               → Pareto analysis
rca fmea [process]              → FMEA worksheet
rca prioritize [causes]         → Multi-criteria prioritization
```

---

## Example Session

```
User: "Why is our FCR dropping?"

HORIZON: Let me help you identify potential root causes.

1. CLASSIFY PROBLEM
   → Impact: CX (primary), COST (secondary via repeat calls)
   → Method: Start with Ishikawa to brainstorm, then Pareto to prioritize

2. GENERATE HYPOTHESES (Ishikawa)
   People: Tenure drop, training gaps, attrition
   Technology: CRM latency, KB search failures
   Process: Escalation unclear, script outdated
   Information: KB stale, no FCR feedback loop
   Management: Quality focus shifted to AHT
   Environment: Remote work distractions

3. PRIORITIZE (Pareto)
   [Analyze repeat call reasons by volume]
   Top 3 causes = 72% of FCR failures

4. RECOMMEND INVESTIGATION
   "Validate top 3 hypotheses with StatisticalAnalysis,
    then confirm causation with CausalInference before acting"

⚠️ HYPOTHESIS NOTE: These are potential causes. Do not implement
   countermeasures until validated with data.
```

---

## Guardrails

### Before Analysis
- [ ] Problem statement is specific and measurable
- [ ] Stakeholders available for domain knowledge
- [ ] Data sources identified for validation

### During Analysis
- [ ] Using appropriate framework for problem type
- [ ] Including all relevant categories (no blind spots)
- [ ] Distinguishing symptoms from causes

### After Analysis
- [ ] Hypotheses clearly labeled as unvalidated
- [ ] Validation path specified (which data, which tests)
- [ ] Outcome linkage documented (CX/COST/EX)
- [ ] Not recommending actions before validation
