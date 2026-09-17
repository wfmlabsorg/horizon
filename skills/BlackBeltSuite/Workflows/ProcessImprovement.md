# Process Improvement Workflow

Structured improvement cycle: Baseline → RCA → DOE → Confirm.

## When to Use

- Process improvement initiative
- DMAIC project execution
- Need to establish causal link between change and outcome
- Want to confirm that an intervention actually works

## Workflow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BASELINE (Measure)                                       │
│    └── ProcessCapability: Current state Cp/Cpk              │
│    └── StatisticalAnalysis: Baseline metrics                │
├─────────────────────────────────────────────────────────────┤
│ 2. ANALYZE ROOT CAUSES                                      │
│    └── RootCauseAnalysis: Generate hypotheses               │
│    └── StatisticalAnalysis: Test hypotheses                 │
│    └── ShapleyDecomposition: Attribute to factors           │
├─────────────────────────────────────────────────────────────┤
│ 3. DESIGN EXPERIMENT (Improve)                              │
│    └── DOEDesigner: Create experiment to test intervention  │
├─────────────────────────────────────────────────────────────┤
│ 4. RUN EXPERIMENT                                           │
│    └── Execute DOE with randomization                       │
│    └── Collect data per protocol                            │
├─────────────────────────────────────────────────────────────┤
│ 5. ANALYZE RESULTS                                          │
│    └── DOEDesigner: Analyze experiment                      │
│    └── StatisticalAnalysis: Effect sizes, significance      │
├─────────────────────────────────────────────────────────────┤
│ 6. CONFIRM & CONTROL                                        │
│    └── Confirmation runs at optimal settings                │
│    └── ProcessCapability: New Cp/Cpk                        │
│    └── Control chart setup for monitoring                   │
└─────────────────────────────────────────────────────────────┘
```

## Phase Details

### Phase 1: Baseline

**Goal:** Establish current state before any changes.

**Actions (ProcessCapability + StatisticalAnalysis):**
- Collect baseline data (minimum 25-30 data points)
- Check process stability (control chart)
- Calculate current Cp/Cpk
- Document current performance metrics

**Output:**
```markdown
### Baseline Assessment

**Data Collection Period:** [dates]
**Sample Size:** [n]

#### Stability Check
- Control Chart: [type]
- Status: [Stable/Unstable]
- Special Causes: [list if any]

#### Current Capability
| Metric | Value | Interpretation |
|--------|-------|----------------|
| Cp | [value] | [capable/not capable] |
| Cpk | [value] | [centered/shifted] |
| % Out of Spec | [%] | [acceptable/not] |
| Sigma Level | [value] | |

#### Baseline Metrics
| KPI | Current | Target | Gap |
|-----|---------|--------|-----|
| [KPI 1] | [value] | [value] | [value] |
| [KPI 2] | [value] | [value] | [value] |

**Baseline Established:** [date]
```

### Phase 2: Analyze Root Causes

**Goal:** Identify factors to test in DOE.

**Actions (RootCauseAnalysis + StatisticalAnalysis + Shapley):**
- Generate potential causes (Ishikawa, 5-Why)
- Test correlations with baseline data
- Attribute variance to factors
- Select top 2-4 factors for DOE

**Output:**
```markdown
### Root Cause Analysis

#### Hypothesis Generation
[Ishikawa diagram or 5-Why results]

#### Statistical Screening
| Factor | Correlation with Y | p-value | Include in DOE? |
|--------|-------------------|---------|-----------------|
| [A] | [r] | [p] | Yes/No |
| [B] | [r] | [p] | Yes/No |
| [C] | [r] | [p] | Yes/No |

#### Shapley Attribution
[Variance decomposition results]

#### Factors Selected for DOE
1. **[Factor A]** — Rationale: [why selected]
2. **[Factor B]** — Rationale: [why selected]
3. **[Factor C]** — Rationale: [why selected]

⚠️ These correlations suggest factors to test, but DOE will establish causation.
```

### Phase 3: Design Experiment

**Goal:** Create rigorous experimental design.

**Actions (DOEDesigner):**
- Select design type based on factor count
- Define factor levels (practical, distinct)
- Calculate required runs
- Plan randomization and replication

**Output:**
```markdown
### Experimental Design

**Design Type:** [Full Factorial / Fractional / etc.]
**Factors:** [k]
**Runs:** [n] (+ [center points] + [replicates])

#### Factor Definitions
| Factor | Low (-1) | High (+1) | Units | Rationale |
|--------|----------|-----------|-------|-----------|
| [A] | [value] | [value] | [unit] | [why these levels] |
| [B] | [value] | [value] | [unit] | [why these levels] |

#### Design Matrix
[Randomized run order table]

#### Execution Protocol
1. [Step-by-step execution instructions]
2. [Measurement protocol]
3. [Documentation requirements]

**Estimated Duration:** [time]
**Resources Required:** [list]
```

### Phase 4: Run Experiment

**Goal:** Execute DOE with fidelity.

**Key requirements:**
- Follow randomized run order exactly
- Document any deviations
- Record response immediately after each run
- Maintain constant conditions for non-experimental factors

**Output:**
```markdown
### Experiment Execution Log

**Start Date:** [date]
**End Date:** [date]
**Executed By:** [name]

#### Completed Runs
| Run | [A] | [B] | [C] | Response | Notes |
|-----|-----|-----|-----|----------|-------|
| 1 | [level] | [level] | [level] | [value] | [any issues] |
| ... | | | | | |

#### Deviations from Protocol
- [List any deviations and how they were handled]

#### Data Quality Check
- Missing data: [n] runs
- Outliers identified: [n]
- Overall quality: [Good/Acceptable/Concerns]
```

### Phase 5: Analyze Results

**Goal:** Determine significant effects and optimal settings.

**Actions (DOEDesigner + StatisticalAnalysis):**
- Calculate main effects and interactions
- Perform ANOVA
- Check for curvature (if center points)
- Find optimal factor settings

**Output:**
```markdown
### DOE Analysis Results

#### ANOVA Summary
| Source | SS | DF | F | p-value | Significant? |
|--------|----|----|---|---------|--------------|
| [A] | [val] | 1 | [val] | [val] | Yes/No |
| [B] | [val] | 1 | [val] | [val] | Yes/No |
| [A×B] | [val] | 1 | [val] | [val] | Yes/No |
| Error | [val] | [df] | | | |

**Model R²:** [value]

#### Effect Estimates
| Effect | Estimate | 95% CI | Practical Significance |
|--------|----------|--------|------------------------|
| [A] | [value] | [range] | [interpretation] |
| [B] | [value] | [range] | [interpretation] |

#### Optimal Settings
| Factor | Optimal Level | Setting |
|--------|---------------|---------|
| [A] | [+1/-1] | [actual value] |
| [B] | [+1/-1] | [actual value] |

**Predicted Response at Optimum:** [value] ± [CI]

**Causal Conclusion:** Because factors were experimentally manipulated with
randomization, the effect of [significant factors] on [response] supports
causal interpretation.
```

### Phase 6: Confirm & Control

**Goal:** Verify improvement and establish control.

**Actions (StatisticalAnalysis + ProcessCapability):**
- Run confirmation trials at optimal settings
- Compare to baseline
- Establish control charts for sustaining gains

**Output:**
```markdown
### Confirmation & Control

#### Confirmation Runs
| Run | Response |
|-----|----------|
| 1 | [value] |
| 2 | [value] |
| 3 | [value] |
| **Mean** | [value] |
| **Std Dev** | [value] |

**Predicted:** [value] ± [CI]
**Actual Mean:** [value]
**Within CI?** Yes/No

#### Before/After Comparison
| Metric | Baseline | After Improvement | Change | % Change |
|--------|----------|-------------------|--------|----------|
| Mean | [value] | [value] | [value] | [%] |
| Std Dev | [value] | [value] | [value] | [%] |
| Cp | [value] | [value] | [value] | |
| Cpk | [value] | [value] | [value] | |

#### Control Plan
- **Control Chart Type:** [I-MR / X-bar R / etc.]
- **Sampling Frequency:** [how often]
- **Control Limits:** UCL = [value], LCL = [value]
- **Response Plan:** [what to do if out of control]

#### Outcome Impact (Confirmed)
| Dimension | Baseline | Improved | Impact |
|-----------|----------|----------|--------|
| CX | [value] | [value] | [quantified] |
| COST | [value] | [value] | [$ savings] |
| EX | [value] | [value] | [quantified] |

**Total Confirmed Benefit:** [$ or metric] per [period]
```

## Process Improvement Output Template

```markdown
## Process Improvement Report: [Project Name]

**DMAIC Phase:** Control (Complete)
**Date:** [date]
**Process Owner:** [name]

### Executive Summary

[2-3 sentence summary of improvement achieved with quantified results]

### Baseline → Improved Comparison

| Metric | Baseline | Target | Achieved | Status |
|--------|----------|--------|----------|--------|
| [Primary KPI] | [value] | [value] | [value] | 🟢/🟡/🔴 |
| Cp | [value] | [value] | [value] | |
| Cpk | [value] | [value] | [value] | |

### Causal Evidence

This improvement is supported by experimental evidence:
- DOE Design: [type], [n] runs
- Significant factors: [list with effect sizes]
- Confirmation runs: [n] runs within predicted CI

**Causal Status:** ✅ Experimentally validated

### Sustained Improvement Plan

[Control chart and response plan summary]

### Business Impact

**Annual Benefit:** [$X]
- CX: [description and value]
- COST: [description and value]
- EX: [description and value]

---
*Improvement validated through controlled experimentation (DOE).*
```

## Key Principle

> This is the one workflow in BlackBeltSuite that can make **causal claims**,
> because DOE involves controlled manipulation with randomization.
>
> The improvement is not just correlated with the changes — we have
> experimental evidence that the changes *caused* the improvement.

---

## Agent Teams Pipeline (Opus 4.6)

When running as an Agent Teams pipeline, this workflow maps to the **ProcessImprovement Task List** in `AgentTeamsTemplate.md` (10 tasks across 5 teammates + human-in-the-loop).

### Agent-to-Phase Mapping

| Agent | Phases | Tasks |
|-------|--------|-------|
| DataScrub Agent | Pre-pipeline gate | Task 1 |
| DataPrep Agent | Data ingest, ETL, QA | Task 2 |
| Analyst Agent | Phase 1: Baseline capability | Task 3 |
| Analyst Agent | Phase 2: Root cause + Shapley | Task 4 |
| Analyst Agent | Phase 3: Design experiment | Task 5 |
| **HUMAN** | **Phase 4: Execute experiment** | **Task 6 (pipeline pauses)** |
| Analyst Agent | Phase 5: Analyze results | Task 7 |
| Analyst Agent | Phase 6: Confirm + control charts | Task 8 |
| Report Agent | Compile improvement report | Task 9 |
| Challenger Agent | Final review | Task 10 |

### Human-in-the-Loop Pattern

This workflow includes a **pipeline pause** at Task 6:

```
Tasks 1-5: Automated (DataScrub → DataPrep → Baseline → RCA → DOE Design)
  |
  v
Task 6: HUMAN EXECUTION (pipeline pauses)
  - Lead agent presents the DOE design to the planner
  - The planner (or client) executes the experiment in the real world
  - When experiment data is available, the planner resumes the pipeline
  - pipeline-state.json status changes: "running" → "paused" → "running"
  |
  v
Tasks 7-10: Automated (Analyze Results → Confirm → Report → Challenge)
```

### Resuming After Experiment

When the planner provides experiment results:
1. Lead reads `pipeline-state.json` and finds status = "paused" at Task 6
2. The planner provides experiment data (Excel, CSV, or manual entry)
3. Lead marks Task 6 completed, updates pipeline-state.json
4. Spawns Analyst Agent for Task 7 (Analyze Results)
5. Pipeline continues through Tasks 8-10

### Pipeline State Tracking

```json
{
  "workflow": "ProcessImprovement",
  "status": "paused",
  "paused_at": "2026-03-15T14:30:00Z",
  "tasks": [
    {"id": 6, "name": "Execute experiment", "agent_role": "HUMAN", "status": "in_progress",
     "notes": "DOE design delivered. Awaiting experiment data from client."}
  ]
}
```

### File Handoff

All agents write to `{project}/02-working/`:
- DataScrub → `scrubbed/`
- DataPrep → `data-prep/`
- Analyst → `analysis/` (baseline.md, rca.md, doe_design.md, doe_results.md, confirmation.md)
- Report → `{project}/03-output/`
- Challenger → `{project}/03-output/challenge_report.md`

See: `AgentTeamsTemplate.md` for full teammate specifications and task list.
