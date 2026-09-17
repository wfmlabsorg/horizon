# Full Analysis Workflow

Comprehensive investigation through all analytical phases: RCA → Stats → Variance → Capability → DOE recommendation.

## When to Use

- Initial investigation of a problem
- User asks "analyze this" without specific direction
- Need comprehensive understanding before action
- Complex problem with multiple potential causes

## Workflow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEFINE                                                   │
│    └── OutcomeFramework: What CX/COST/EX outcome matters?   │
├─────────────────────────────────────────────────────────────┤
│ 2. DESCRIBE                                                 │
│    └── StatisticalAnalysis: Summary stats, distributions    │
├─────────────────────────────────────────────────────────────┤
│ 3. HYPOTHESIZE                                              │
│    └── RootCauseAnalysis: Generate candidate causes         │
├─────────────────────────────────────────────────────────────┤
│ 4. DECOMPOSE                                                │
│    └── VarianceAnalysis + Shapley: Attribute variance       │
├─────────────────────────────────────────────────────────────┤
│ 5. TEST                                                     │
│    └── StatisticalAnalysis: Test hypotheses                 │
├─────────────────────────────────────────────────────────────┤
│ 6. ASSESS STABILITY                                         │
│    └── ProcessCapability: Is process stable/capable?        │
├─────────────────────────────────────────────────────────────┤
│ 7. QUANTIFY IMPACT                                          │
│    └── Effect sizes, CIs, outcome mapping                   │
├─────────────────────────────────────────────────────────────┤
│ 8. RECOMMEND                                                │
│    └── Actions with DOE plan if causal confirmation needed  │
└─────────────────────────────────────────────────────────────┘
```

## Phase Details

### Phase 1: Define (OutcomeFramework)

**Questions to answer:**
- What problem are we solving?
- Which outcome dimension matters most? (CX/COST/EX)
- What would success look like?
- What decisions depend on this analysis?

**Output:**
```markdown
### Problem Definition

**Problem Statement:** [clear, specific statement]
**Primary Outcome:** [CX/COST/EX]
**Success Metric:** [quantified target]
**Decision Context:** [what action depends on this]
```

### Phase 2: Describe (StatisticalAnalysis)

**Actions:**
- Calculate summary statistics (mean, std, quartiles)
- Visualize distributions
- Check for outliers
- Assess data quality

**Output:**
```markdown
### Descriptive Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| N | [count] | [completeness] |
| Mean | [value] | |
| Std Dev | [value] | |
| Median | [value] | |
| IQR | [value] | |
| Outliers | [count] | [% of data] |

**Distribution:** [normal/skewed/bimodal/etc.]
**Data Quality:** [issues if any]
```

### Phase 3: Hypothesize (RootCauseAnalysis)

**Actions:**
- Generate Ishikawa diagram for potential causes
- Prioritize hypotheses using domain knowledge
- Identify testable predictions

**Output:**
```markdown
### Root Cause Hypotheses

**Method:** Ishikawa (6P framework)

**Top Hypotheses:**
1. [Hypothesis] — Testable via: [approach]
2. [Hypothesis] — Testable via: [approach]
3. [Hypothesis] — Testable via: [approach]

⚠️ **Note:** These are hypotheses, not confirmed causes.
```

### Phase 4: Decompose (VarianceAnalysis + Shapley)

**Actions:**
- Decompose total variance into components
- Attribute variance to factors using Shapley values
- Identify "vital few" contributors

**Output:**
```markdown
### Variance Decomposition

| Factor | Variance Contribution | % of Total |
|--------|----------------------|------------|
| [Factor A] | [value] | [%] |
| [Factor B] | [value] | [%] |
| [Unexplained] | [value] | [%] |

**Vital Few:** [top 2-3 factors explaining 80%+ of variance]
```

### Phase 5: Test (StatisticalAnalysis)

**Actions:**
- Test each top hypothesis statistically
- Use appropriate tests (t-test, ANOVA, regression, etc.)
- Report effect sizes, not just p-values

**Output:**
```markdown
### Hypothesis Tests

#### Hypothesis 1: [statement]

| Test | Statistic | p-value | Effect Size | 95% CI |
|------|-----------|---------|-------------|--------|
| [test] | [value] | [value] | [Cohen's d/r²/etc.] | [low, high] |

**Conclusion:** [Supported/Not supported] — [interpretation]
```

### Phase 6: Assess Stability (ProcessCapability)

**Actions:**
- Run control chart analysis
- Check for special cause variation
- Calculate Cp/Cpk if stable

**Output:**
```markdown
### Process Stability Assessment

**Control Chart:** [type used]
**Stability:** [Stable/Unstable]
**Special Causes:** [list if any]

[If stable:]
**Capability:**
- Cp: [value] ([interpretation])
- Cpk: [value] ([interpretation])
- % Out of Spec: [value]
```

### Phase 7: Quantify Impact (OutcomeFramework)

**Actions:**
- Translate statistical findings to business impact
- Map to CX/COST/EX dimensions
- Quantify with uncertainty

**Output:**
```markdown
### Outcome Impact Assessment

| Dimension | Finding | Quantified Impact | Confidence |
|-----------|---------|-------------------|------------|
| CX | [specific] | [$ or metric] | [H/M/L] |
| COST | [specific] | [$ or metric] | [H/M/L] |
| EX | [specific] | [$ or metric] | [H/M/L] |

**Total Addressable Impact:** [estimate with range]
```

### Phase 8: Recommend (with DOE plan)

**Actions:**
- Prioritize actions by impact and feasibility
- Flag what requires causal confirmation
- Propose DOE design if needed

**Output:**
```markdown
### Recommendations

#### Immediate Actions (Correlation-Based)
1. [Action] — Expected: [impact], Risk: [level]

#### Require Causal Confirmation
1. [Action] — To confirm, design: [DOE type]

### Proposed DOE

If causal confirmation needed for top factor:
- **Design:** [Full factorial / Fractional / etc.]
- **Factors:** [list]
- **Runs:** [count]
- **Expected Duration:** [time]
```

## Causal Caveat (Required)

```markdown
---

## Causal Status

⚠️ **This analysis is observational (Rung 1).**

Findings represent correlation/association, not proven causation.

**To establish causation:**
- [ ] Build causal DAG (CausalInference skill)
- [ ] Check identifiability and confounders
- [ ] Consider DOE for experimental confirmation

**Recommended next step:** [specific recommendation based on findings]
```

## Agent Teams Pipeline (Opus 4.6)

When running as an Agent Teams pipeline, this workflow maps to the **FullAnalysis Task List** in `AgentTeamsTemplate.md` (9 tasks across 6 teammates).

### Agent-to-Phase Mapping

| Agent | Phases | Tasks |
|-------|--------|-------|
| DataScrub Agent | Pre-pipeline gate | Task 1 |
| DataPrep Agent | Data ingest, ETL, QA | Task 2 |
| Analyst Agent | Phases 1-8 | Tasks 3-6 |
| Causal Agent | DAG + effects (if escalated) | Task 7 |
| Report Agent | Compile deliverable | Task 8 |
| Challenger Agent | Adversarial review | Task 9 |

### Parallelism Within This Workflow

The 8-phase sequence has two parallelism opportunities:

```
Phase 1 → Phase 2 → Phase 3 ─┐
                               ├──→ Phase 5 → Phase 6
                    Phase 4 ──┘              ↓
                                      Phase 7 → Phase 8
```

- **Phases 3 + 4** (Hypothesize + Decompose): Independent — neither requires the other's output
- **Phase 7** (Quantify Impact): Can start after Phase 5 completes, without waiting for Phase 6

The Analyst Agent handles all 8 phases. When running as an agent teammate, it should exploit these parallelism opportunities by launching sub-tasks for independent phases.

### Pipeline State

The lead agent initializes `pipeline-state.json` (see `Schemas/pipeline-state.schema.json`) with:
- `workflow`: `"FullAnalysis"`
- `skills_invoked`: populated as each skill is used
- `causal_escalation`: set to `true` if Phase 8 recommends causal confirmation

### File Handoff

Each agent writes to its designated directory under `{project}/02-working/`:
- DataScrub → `scrubbed/`
- DataPrep → `data-prep/`
- Analyst → `analysis/` (phase_1 through phase_8 .md files + findings.json)
- Causal → `causal/` (if spawned)
- Report → `{project}/03-output/`
- Challenger → `{project}/03-output/challenge_report.md`

See: `AgentTeamsTemplate.md` for full teammate specifications and task list.

---

## Output Template

See SKILL.md for complete output template.
