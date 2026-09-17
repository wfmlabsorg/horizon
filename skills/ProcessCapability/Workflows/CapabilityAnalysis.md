# Capability Analysis Workflow

Calculate and interpret process capability indices (Cp, Cpk, Pp, Ppk).

## Prerequisites

**CRITICAL:** Verify process stability BEFORE calculating capability.

A process must be in statistical control for capability metrics to be meaningful. If the process is unstable:
1. First run `StabilityAssessment.md` workflow
2. Identify and remove special causes
3. Then calculate capability

## Workflow Steps

### Step 1: Verify Prerequisites

- [ ] Process stability confirmed (control chart shows no OOC points)
- [ ] Specification limits defined (USL and/or LSL)
- [ ] Sufficient data (minimum 30 points recommended, 100+ preferred)
- [ ] Data normality checked (or transformation applied)

### Step 2: Gather Specifications

| Parameter | Value | Source |
|-----------|-------|--------|
| USL | | |
| LSL | | |
| Target | | (defaults to midpoint if bilateral) |

### Step 3: Check Normality

```python
from capability_analysis import assess_normality

normality = assess_normality(data)
print(f"Normal: {normality['is_normal']}, p-value: {normality['p_value']:.4f}")
```

If not normal:
- Consider transformation (log, Box-Cox)
- Use non-parametric methods
- Document deviation from assumption

### Step 4: Calculate Capability

```python
from capability_analysis import calculate_capability

result = calculate_capability(
    data=data,
    usl=upper_spec,
    lsl=lower_spec,
    target=target_value  # optional
)
```

### Step 5: Interpret Results

Use interpretation scale:

| Cpk | Sigma | DPMO | Rating |
|-----|-------|------|--------|
| < 0.67 | < 2.0 | > 308,537 | Not capable |
| 0.67 | 2.0 | 45,500 | Poor |
| 1.00 | 3.0 | 2,700 | Marginally capable |
| 1.33 | 4.0 | 63 | Capable |
| 1.67 | 5.0 | 0.57 | Highly capable |
| 2.00 | 6.0 | 0.002 | World-class |

## Output Template

```markdown
## Process Capability Analysis

**Process:** [name/description]
**Specification Limits:** LSL = [value], USL = [value]
**Target:** [value or "Not specified"]
**Sample Size:** [n]
**Stability:** [Confirmed/Pending]

### Capability Indices

| Metric | Value | Interpretation |
|--------|-------|----------------|
| Cp | [value] | Potential capability (if centered) |
| Cpk | [value] | Actual capability |
| Pp | [value] | Long-term potential |
| Ppk | [value] | Long-term actual |

### One-Sided Indices

| Index | Value | Spec |
|-------|-------|------|
| CPU | [value] | Distance to USL |
| CPL | [value] | Distance to LSL |

### Process Statistics

| Statistic | Value |
|-----------|-------|
| Mean (μ) | [value] |
| σ within | [value] |
| σ overall | [value] |

### Performance Metrics

**Sigma Level:** [value]
**Expected DPMO:** [value]
**Expected PPM:** [value]

### Assessment

**Overall Rating:** [Not Capable / Poor / Marginally Capable / Capable / Highly Capable]

**Process Capable:** [Yes/No] (Cpk ≥ 1.33)
**Process Centered:** [Yes/No] (Cpk/Cp ≥ 0.9)

### Recommendations

[Based on findings]

### Outcome Impact

**Domain:** [CX / COST / EX]
**Impact:** [Explanation of business impact]
```

## Understanding the Indices

### Cp vs Cpk

- **Cp** = Potential capability (ignores centering)
- **Cpk** = Actual capability (accounts for centering)
- If Cp >> Cpk: Process is off-center, centering improvement possible
- If Cp ≈ Cpk: Process is well-centered

### Pp vs Cpk

- **Cpk** uses within-subgroup σ (short-term)
- **Ppk** uses overall σ (long-term)
- If Cpk >> Ppk: Special causes present between subgroups
- If Cpk ≈ Ppk: Process variation is consistent

### One-Sided Specifications

- Only USL: Calculate CPU only
- Only LSL: Calculate CPL only
- Cpk = the one-sided index

## Common Issues

### Cpk < 0
Process mean is outside specification limits. Critical situation.

**Actions:**
1. Verify data and specs are correct
2. Immediate process adjustment needed
3. 100% inspection may be required

### Cp good but Cpk poor
Process has capability but is off-center.

**Actions:**
1. Adjust process mean toward target
2. Investigate source of bias
3. Quick win for improvement

### Cpk good but Ppk poor
Short-term capability exists but long-term is worse.

**Actions:**
1. Look for special causes between subgroups
2. Investigate shift-to-shift or day-to-day variation
3. May indicate process drift over time

### Non-normal data
Capability indices assume normality.

**Options:**
1. Transform data (Box-Cox, log)
2. Use non-parametric percentile method
3. Report with caveat about assumption

## Dependencies

- Load `capability_analysis.py` from Tools/
- Run `StabilityAssessment.md` first
- Use `StatisticalAnalysis` skill for normality testing
- Map to `OutcomeFramework` for business impact
