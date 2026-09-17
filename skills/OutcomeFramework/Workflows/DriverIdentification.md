# DriverIdentification Workflow

Identify and prioritize the key drivers of outcome metrics.

---

## Purpose

Systematically determine what factors most strongly influence CX, COST, and EX outcomes. This workflow guides data collection, analysis design, and hypothesis testing.

---

## Driver Identification Process

### Step 1: Define the Outcome Variable

```markdown
## Target Outcome
**Domain:** [CX/COST/EX]
**Specific Metric:** [e.g., CSAT, Cost per Contact, Turnover]
**Unit of Analysis:** [Agent, Team, Site, Day, Contact]
**Time Period:** [Data range available]
**Measurement Quality:** [High/Medium/Low]
```

### Step 2: Generate Candidate Drivers

Use theory and domain knowledge to list potential drivers:

#### Theory-Based Candidates

From `Context/OutcomeRelationships.md`, list factors with hypothesized relationships to the target outcome.

#### Data-Driven Candidates

List available variables in the dataset that could explain variance.

#### Stakeholder-Identified Candidates

Factors mentioned in interviews or identified by client as important.

```markdown
## Candidate Drivers

| Source | Factor | Hypothesized Direction | Data Available |
|--------|--------|------------------------|----------------|
| Theory | AHT | Negative (for CSAT) | Yes |
| Data | Agent tenure | Positive | Yes |
| Stakeholder | System outages | Negative | Partial |
```

### Step 3: Assess Measurement

For each candidate driver:

| Factor | How Measured | Quality | Temporal Alignment |
|--------|--------------|---------|-------------------|
| [Factor] | [Description] | [H/M/L] | [Same period as outcome?] |

### Step 4: Build Analytical Model

Choose approach based on goal:

#### For Variance Decomposition
→ Use **ShapleyDecomposition** skill
- Decomposes R² among drivers
- Handles multicollinearity
- Returns contribution percentages

#### For Causal Attribution
→ Use **CausalInference** skill
- Build DAG with outcome as target
- Check identification
- Estimate causal effects

#### For Simple Ranking
→ Standardized regression coefficients
- Quick but doesn't handle correlation well
- Use as initial screen only

### Step 5: Interpret Results

```markdown
## Driver Analysis Results

### Top Drivers by Contribution

| Rank | Driver | Contribution | Direction | Actionable? |
|------|--------|--------------|-----------|-------------|
| 1 | [Factor] | [X%] | [+/-] | [Yes/No] |
| 2 | [Factor] | [X%] | [+/-] | [Yes/No] |
| 3 | [Factor] | [X%] | [+/-] | [Yes/No] |

### Interpretation
- [Factor 1] accounts for [X%] of variation in [outcome]
- Combined, top 3 drivers explain [Y%] of variance
- [Z%] remains unexplained (measurement error, missing factors)

### Surprises
- [What was expected to matter but didn't?]
- [What wasn't expected but emerged as important?]
```

### Step 6: Validate Findings

Before treating results as final:

```markdown
## Validation Checks

| Check | Status | Notes |
|-------|--------|-------|
| Sample size adequate | [Pass/Fail] | n = [X] |
| No obvious confounders | [Pass/Fail] | [Controlled for Y] |
| Results stable across subgroups | [Pass/Fail] | [Tested A, B, C] |
| Direction matches theory | [Pass/Fail] | [Anomalies noted] |
| Stakeholder face validity | [Pass/Fail] | [Feedback] |
```

---

## Driver Identification Templates

### By Outcome Domain

#### CX Drivers (Common Candidates)

| Category | Candidate Drivers |
|----------|-------------------|
| Wait Experience | ASA, SL, Abandon rate |
| Resolution | FCR, Transfer rate, Callback rate |
| Quality | QA score, Error rate, Compliance |
| Agent Factors | Tenure, Training, Engagement |
| Process | AHT, Hold time, System availability |

#### COST Drivers (Common Candidates)

| Category | Candidate Drivers |
|----------|-------------------|
| Labor | FTE count, Wage rate, Benefits |
| Productivity | AHT, ACW, Occupancy, Shrinkage |
| Volume | Contact volume, Channel mix |
| Infrastructure | Technology cost, Facilities |
| Quality Cost | Rework, Escalations, Errors |

#### EX Drivers (Common Candidates)

| Category | Candidate Drivers |
|----------|-------------------|
| Compensation | Pay competitiveness, Benefits |
| Workload | Occupancy, Overtime, Complexity |
| Development | Training, Coaching, Career path |
| Management | Span of control, Leadership quality |
| Environment | Schedule flexibility, Tools, Culture |

---

## Common Pitfalls

### Multicollinearity

**Problem:** Correlated drivers make individual contributions unclear.

**Solution:**
- Use Shapley decomposition (handles this explicitly)
- Report joint contribution of correlated factors
- Consider grouping with Owen value

### Omitted Variables

**Problem:** Missing factors can bias estimates of included factors.

**Solution:**
- Include all theoretically relevant controls
- Acknowledge limitations
- Use causal DAG to identify missing confounders

### Reverse Causality

**Problem:** Outcome may drive factor, not vice versa.

**Solution:**
- Use time-lagged analysis (driver precedes outcome)
- Apply causal inference techniques
- Consider theoretical direction

### Measurement Error

**Problem:** Poor quality data attenuates relationships.

**Solution:**
- Document measurement quality
- Use multiple indicators where possible
- Acknowledge uncertainty in conclusions

---

## Output Template

```markdown
# Driver Analysis: [Outcome Metric]

## Summary
**Target:** [Metric name]
**Data:** [N observations, time period]
**Method:** [Shapley/Regression/Other]
**Explained Variance:** [R² or equivalent]

## Key Findings

### Driver Rankings

| Rank | Driver | % Contribution | 95% CI | Direction |
|------|--------|----------------|--------|-----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Visualization

```
[Factor 1] ████████████████████ 35%
[Factor 2] ████████████         22%
[Factor 3] ████████             15%
[Factor 4] █████                10%
[Other]    █████████            18%
```

### Implications

1. **[Driver 1]** — [What this means for action]
2. **[Driver 2]** — [What this means for action]
3. **[Driver 3]** — [What this means for action]

## Limitations
- [Limitation 1]
- [Limitation 2]

## Recommended Next Steps
1. [Action]
2. [Action]
```

---

## Integration

- Results feed into **OutcomeScorecard**
- Use **ShapleyDecomposition** for variance decomposition
- Use **CausalInference** for causal claims
- Document in engagement deliverables
