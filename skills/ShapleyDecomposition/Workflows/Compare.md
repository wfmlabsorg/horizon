# Compare Workflow

## Purpose

Compare Shapley decompositions across time periods, scenarios, or segments to understand how variance drivers shift.

---

## When to Use

- "Compare Q1 vs Q2 variance drivers"
- "How did the mix change month over month?"
- "Variance bridge between periods"
- "Which factors became more important?"

---

## Input

User provides:
1. **Period 1** - First period's baseline and actual values
2. **Period 2** - Second period's baseline and actual values
3. **Model** - Same model for both periods
4. **Comparison focus** - What shift they want to understand

---

## Process

### Step 1: Run Decomposition for Each Period

Apply the Analyze workflow to each period separately:

**Period 1:**
- Baseline: [P1 baseline values]
- Actual: [P1 actual values]
- Result: φ₁ for each factor

**Period 2:**
- Baseline: [P2 baseline values]
- Actual: [P2 actual values]
- Result: φ₂ for each factor

### Step 2: Compute Period-over-Period Changes

For each factor:
```
Δφ = φ₂ - φ₁
```

For percentage contribution:
```
% contribution P1 = φ₁ / Total₁
% contribution P2 = φ₂ / Total₂
Δ% = % contribution P2 - % contribution P1
```

### Step 3: Analyze Shifts

**Questions to answer:**
- Which factors increased in importance?
- Which factors decreased?
- Did any factor change sign (positive → negative or vice versa)?
- Is the total variance growing or shrinking?

### Step 4: Interpret Patterns

Common patterns:
- **Concentration:** One factor becoming dominant
- **Dispersion:** Contributions spreading more evenly
- **Reversal:** Factor flipping from positive to negative
- **Stability:** Same pattern across periods

---

## Output Format

```markdown
## Shapley Comparison: [Period 1] vs [Period 2]

**Model:** [formula]

### Summary

| Metric | Period 1 | Period 2 | Change |
|--------|----------|----------|--------|
| Total Variance | [T1] | [T2] | [ΔT] |

### Factor Contributions

| Factor | P1 Value | P1 % | P2 Value | P2 % | Δ Value | Δ % |
|--------|----------|------|----------|------|---------|-----|
| A | [φ₁ᴬ] | [%] | [φ₂ᴬ] | [%] | [Δφᴬ] | [Δ%] |
| B | [φ₁ᴮ] | [%] | [φ₂ᴮ] | [%] | [Δφᴮ] | [Δ%] |
| C | [φ₁ᶜ] | [%] | [φ₂ᶜ] | [%] | [Δφᶜ] | [Δ%] |

### Key Shifts

1. **[Factor X]** increased from [%] to [%] of variance
2. **[Factor Y]** decreased from [%] to [%] of variance
3. **[Factor Z]** remained stable at [%]

### Interpretation

[2-3 sentences on what's driving the shift]

### Variance Bridge

```
Period 1 Total:     [T1]
  + Δ Factor A:     [Δφᴬ]
  + Δ Factor B:     [Δφᴮ]
  + Δ Factor C:     [Δφᶜ]
  ─────────────────────
Period 2 Total:     [T2]
```
```

---

## Advanced: Multi-Period Trend

For 3+ periods, track factor contributions over time:

```markdown
### Trend Analysis

| Factor | P1 | P2 | P3 | P4 | Trend |
|--------|----|----|----|----|-------|
| A | 35% | 40% | 45% | 50% | ↑ Growing |
| B | 40% | 35% | 30% | 28% | ↓ Declining |
| C | 25% | 25% | 25% | 22% | → Stable |
```

---

## Example: WFM Q1 vs Q2

**Period 1 (Q1):**
- Forecast FTE: 100
- Actual FTE: 115
- Variance: +15 FTE
- Volume contribution: +6 FTE (40%)
- AHT contribution: +5 FTE (33%)
- Shrinkage contribution: +4 FTE (27%)

**Period 2 (Q2):**
- Forecast FTE: 105
- Actual FTE: 130
- Variance: +25 FTE
- Volume contribution: +5 FTE (20%)
- AHT contribution: +8 FTE (32%)
- Shrinkage contribution: +12 FTE (48%)

**Comparison:**

| Factor | Q1 % | Q2 % | Shift |
|--------|------|------|-------|
| Volume | 40% | 20% | -20pp |
| AHT | 33% | 32% | -1pp |
| Shrinkage | 27% | 48% | +21pp |

**Interpretation:** Shrinkage became the dominant driver in Q2, shifting from 27% to 48% of variance. This suggests absenteeism or other shrinkage factors need investigation. Volume became relatively less important despite total variance increasing.

---

## Segment Comparison

Compare decompositions across segments (e.g., business units, regions):

```markdown
### Segment Analysis

| Factor | BU1 | BU2 | BU3 | Overall |
|--------|-----|-----|-----|---------|
| Volume | 45% | 30% | 25% | 35% |
| AHT | 30% | 45% | 35% | 37% |
| Shrinkage | 25% | 25% | 40% | 28% |

**Insights:**
- BU1: Volume-driven variance
- BU2: AHT-driven variance
- BU3: Shrinkage-driven variance
```

---

## Visualization Suggestions

1. **Stacked bar chart:** Factor contributions by period
2. **Line chart:** Factor % over time
3. **Waterfall:** Variance bridge from P1 to P2
4. **Heatmap:** Factor importance across segments
