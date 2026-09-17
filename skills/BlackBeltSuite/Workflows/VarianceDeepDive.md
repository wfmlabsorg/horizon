# Variance Deep Dive Workflow

When variance is detected: Decompose → Attribute → Hypothesize → Test.

## When to Use

- Budget vs actual variance investigation
- Period-over-period change analysis
- "Why did we miss the target?" questions
- Multi-factor attribution needed

## Workflow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ 1. QUANTIFY VARIANCE                                        │
│    └── VarianceAnalysis: Total variance, components         │
├─────────────────────────────────────────────────────────────┤
│ 2. DECOMPOSE                                                │
│    └── ShapleyDecomposition: Attribution to factors         │
├─────────────────────────────────────────────────────────────┤
│ 3. HYPOTHESIZE DRIVERS                                      │
│    └── RootCauseAnalysis: Why did each factor vary?         │
├─────────────────────────────────────────────────────────────┤
│ 4. TEST HYPOTHESES                                          │
│    └── StatisticalAnalysis: Validate driver hypotheses      │
├─────────────────────────────────────────────────────────────┤
│ 5. MAP TO OUTCOMES                                          │
│    └── OutcomeFramework: CX/COST/EX impact of variance      │
└─────────────────────────────────────────────────────────────┘
```

## Phase Details

### Phase 1: Quantify Variance (VarianceAnalysis)

**Actions:**
- Calculate total variance (Actual - Target or Period 2 - Period 1)
- Break into volume vs rate components if applicable
- Identify the magnitude of the problem

**Output:**
```markdown
### Variance Quantification

**Analysis Period:** [dates]
**Comparison:** [Actual vs Budget / P2 vs P1]

| Metric | Target/Prior | Actual/Current | Variance | % Variance |
|--------|--------------|----------------|----------|------------|
| [Primary] | [value] | [value] | [value] | [%] |

**Variance Type:**
- Volume component: [value] ([%])
- Rate/Mix component: [value] ([%])
- Interaction: [value] ([%])
```

### Phase 2: Decompose (ShapleyDecomposition)

**Actions:**
- Identify all contributing factors
- Calculate Shapley values for fair attribution
- Rank factors by contribution

**Output:**
```markdown
### Shapley Decomposition

| Factor | Contribution | % of Total | Cumulative % |
|--------|--------------|------------|--------------|
| [Factor A] | [value] | [%] | [%] |
| [Factor B] | [value] | [%] | [%] |
| [Factor C] | [value] | [%] | [%] |
| [Residual] | [value] | [%] | 100% |

**Vital Few (80% rule):** [Factor A], [Factor B]

**Interpretation:** [Factor A] accounts for [%] of the total variance,
making it the primary driver to investigate.
```

### Phase 3: Hypothesize Drivers (RootCauseAnalysis)

**Actions:**
- For each vital few factor, ask "why did this vary?"
- Generate hypotheses using 5-Why or Ishikawa
- Prioritize by testability

**Output:**
```markdown
### Driver Hypotheses

#### Factor A: [name] — [variance contribution]

**5-Why Chain:**
1. Why did [Factor A] increase? → [Hypothesis 1]
2. Why [Hypothesis 1]? → [Hypothesis 2]
3. Why [Hypothesis 2]? → [Hypothesis 3]

**Testable Hypotheses:**
- H1: [specific, testable statement]
- H2: [specific, testable statement]

#### Factor B: [name] — [variance contribution]

[Same structure]

⚠️ These are hypotheses about why variance occurred, not confirmed causes.
```

### Phase 4: Test Hypotheses (StatisticalAnalysis)

**Actions:**
- Test each hypothesis with appropriate statistical method
- Report effect sizes and confidence intervals
- Distinguish supported vs unsupported hypotheses

**Output:**
```markdown
### Hypothesis Testing

#### H1: [statement]

| Test | Result | Effect Size | 95% CI | Verdict |
|------|--------|-------------|--------|---------|
| [test] | [stat, p] | [value] | [range] | Supported/Not |

**Interpretation:** [what this means for the variance]

#### H2: [statement]

[Same structure]

### Summary of Tested Hypotheses

| Hypothesis | Supported? | Explains (%) |
|------------|------------|--------------|
| H1 | Yes/No | [% of variance] |
| H2 | Yes/No | [% of variance] |
| Unexplained | — | [%] |
```

### Phase 5: Map to Outcomes (OutcomeFramework)

**Actions:**
- Translate variance findings to CX/COST/EX impact
- Quantify business impact
- Prioritize remediation

**Output:**
```markdown
### Outcome Impact

| Dimension | Variance Impact | $ Impact | Priority |
|-----------|-----------------|----------|----------|
| CX | [description] | [$ or metric] | [H/M/L] |
| COST | [description] | [$ or metric] | [H/M/L] |
| EX | [description] | [$ or metric] | [H/M/L] |

**Total Variance Cost:** [$ estimate]
**Addressable Portion:** [% that can be controlled]
```

## Variance Deep Dive Output Template

```markdown
## Variance Deep Dive: [Topic]

**Analysis Period:** [dates]
**Total Variance:** [value] ([% of target])

### Executive Summary

The variance of [amount] is primarily driven by [Factor A] ([%]) and
[Factor B] ([%]). Testing confirms that [supported hypothesis].
The business impact is estimated at [$X] in [CX/COST/EX dimension].

### Decomposition

[Shapley table]

### Root Cause Investigation

[Hypothesis generation and testing results]

### Business Impact

[Outcome mapping table]

### Recommendations

1. **Address [Factor A]:** [action] — Expected recovery: [%]
2. **Address [Factor B]:** [action] — Expected recovery: [%]
3. **Causal Confirmation:** If implementing changes, design DOE to confirm

### Causal Status

⚠️ **This is attribution analysis (Rung 1).**

The Shapley decomposition shows which factors are associated with variance,
but does not prove that changing these factors will eliminate the variance.

**To confirm causation:**
- Build DAG for variance drivers (CausalInference)
- Design experiment to test intervention (DOEDesigner)

---
*Variance analysis performed using BlackBeltSuite.*
```

## Common Variance Types

| Variance Type | Decomposition Approach |
|---------------|------------------------|
| Budget vs Actual | Volume × Rate analysis |
| Period over Period | Change decomposition |
| Forecast vs Actual | Forecast error analysis |
| Benchmark vs Actual | Gap analysis |

## Agent Teams Pipeline (Opus 4.6)

When running as an Agent Teams pipeline, this workflow maps to the **VarianceDeepDive Task List** in `AgentTeamsTemplate.md` (7 tasks across 5 teammates).

### Agent-to-Phase Mapping

| Agent | Phases | Tasks |
|-------|--------|-------|
| DataScrub Agent | Pre-pipeline gate | Task 1 |
| DataPrep Agent | Data ingest, ETL, QA | Task 2 |
| Analyst Agent | Phases 1-5 | Tasks 3-5 |
| Report Agent | Compile variance report | Task 6 |
| Challenger Agent | Review methodology + conclusions | Task 7 |

### Parallelism Within This Workflow

```
Phase 1 (Quantify) ─┐
                     ├──→ Phase 3 → Phase 4 → Phase 5
Phase 2 (Decompose) ─┘
```

- **Phases 1 + 2** (Quantify Variance + Shapley Decompose): Can run in parallel if Shapley factors are pre-configured, since the total variance quantification and factor attribution are independent calculations

### Pipeline State

The lead agent initializes `pipeline-state.json` (see `Schemas/pipeline-state.schema.json`) with:
- `workflow`: `"VarianceDeepDive"`
- `skills_invoked`: populated as each skill is used (VarianceAnalysis, ShapleyDecomposition, RootCauseAnalysis, StatisticalAnalysis, OutcomeFramework)
- `causal_escalation`: set to `true` if escalation triggers fire (see below)

### File Handoff

Each agent writes to its designated directory under `{project}/02-working/`:
- DataScrub → `scrubbed/`
- DataPrep → `data-prep/`
- Analyst → `analysis/` (variance_quantification.md, shapley_decomposition.md, driver_hypotheses.md, hypothesis_tests.md, outcome_mapping.md + findings.json)
- Report → `{project}/03-output/`
- Challenger → `{project}/03-output/challenge_report.md`

See: `AgentTeamsTemplate.md` for full teammate specifications and task list.

---

## Causal Escalation Triggers

Escalate to CausalInference if:
- User wants to know "why" the factor varied
- Planning intervention based on findings
- Multiple confounders possible
- Need counterfactual ("what if we had...")
