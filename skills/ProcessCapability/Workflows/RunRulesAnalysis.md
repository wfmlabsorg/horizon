# Run Rules Analysis Workflow

Detect non-random patterns in control chart data using Western Electric rules.

## Purpose

Run rules help detect special causes before points exceed control limits. They identify:
- Shifts in process mean
- Trends and drift
- Increased variation
- Mixing or stratification

## The Western Electric Rules

### Rule 1: Single Point Beyond 3σ

```
         UCL ─────────X─────────
                      ↑
              SIGNAL: Extreme value

         CL  ─────────────────────

         LCL ─────────────────────
```

**Meaning:** Rare event (0.27% probability if in control)
**Causes:** Measurement error, equipment malfunction, material defect
**Action:** Investigate immediately

### Rule 2: Nine Points Same Side of Centerline

```
         UCL ─────────────────────

              • • • • • • • • •
         CL  ─────────────────────
              ← 9 consecutive points above

         LCL ─────────────────────
```

**Meaning:** Process mean has shifted
**Causes:** New material, adjustment, environmental change
**Action:** Find what changed, recenter or adjust limits

### Rule 3: Six Points Trending

```
         UCL ─────────────────────
                          •
                        •
                      •
         CL  ───────•───────────────
                  •
                •
         LCL ─────────────────────
              ← 6 points steadily increasing
```

**Meaning:** Process is drifting
**Causes:** Tool wear, temperature drift, fatigue
**Action:** Identify time-dependent factor

### Rule 4: Fourteen Points Alternating

```
         UCL ─────────────────────
              •   •   •   •   •
         CL  ───────────────────────
                •   •   •   •   •
         LCL ─────────────────────
              ← Points alternate up/down
```

**Meaning:** Over-adjustment or two alternating processes
**Causes:** Operator over-correction, two batches alternating
**Action:** Review adjustment practice, verify single source

### Rule 5: Two of Three Points Beyond 2σ

```
         UCL ─────────────────────
         +2σ ─────•───•─────────── ← Zone A

         CL  ─────────────────────

         LCL ─────────────────────
```

**Meaning:** Increased variation or small shift
**Causes:** Process upset, sampling from different population
**Action:** Investigate recent changes

### Rule 6: Four of Five Points Beyond 1σ

```
         UCL ─────────────────────
         +2σ ─────────────────────
         +1σ ───•─•─•───•───────── ← Zone B
         CL  ─────────────────────

         LCL ─────────────────────
```

**Meaning:** Small but persistent shift
**Causes:** Subtle process change, measurement drift
**Action:** Look for gradual changes

## Zone Definitions

Control charts are divided into zones:

```
UCL  ──────────────────
      Zone A (+2σ to +3σ)
+2σ  ──────────────────
      Zone B (+1σ to +2σ)
+1σ  ──────────────────
      Zone C (0 to +1σ)
CL   ──────────────────
      Zone C (0 to -1σ)
-1σ  ──────────────────
      Zone B (-1σ to -2σ)
-2σ  ──────────────────
      Zone A (-2σ to -3σ)
LCL  ──────────────────
```

## Implementation

```python
from control_charts import apply_run_rules

# After creating control chart
violations = apply_run_rules(
    data=chart_data,
    cl=center_line,
    ucl=upper_control_limit,
    lcl=lower_control_limit
)

# Check results
for rule, points in violations.items():
    if points:
        print(f"{rule}: Points {points}")
```

## Output Template

```markdown
## Run Rules Analysis

**Process:** [name]
**Data Points:** [n]
**Analysis Date:** [date]

### Zone Boundaries

| Zone | Upper Bound | Lower Bound |
|------|-------------|-------------|
| Beyond UCL | - | UCL = [value] |
| A (upper) | UCL | +2σ = [value] |
| B (upper) | +2σ | +1σ = [value] |
| C (upper) | +1σ | CL = [value] |
| C (lower) | CL | -1σ = [value] |
| B (lower) | -1σ | -2σ = [value] |
| A (lower) | -2σ | LCL = [value] |
| Beyond LCL | LCL = [value] | - |

### Rule Violations

| Rule | Description | Violations | Points |
|------|-------------|------------|--------|
| 1 | Point beyond 3σ | [Yes/No] | [indices] |
| 2 | 9 same side of CL | [Yes/No] | [indices] |
| 3 | 6 trending | [Yes/No] | [indices] |
| 4 | 14 alternating | [Yes/No] | [indices] |
| 5 | 2 of 3 beyond 2σ | [Yes/No] | [indices] |
| 6 | 4 of 5 beyond 1σ | [Yes/No] | [indices] |

### Interpretation

**Patterns Detected:**
- [List patterns found with point indices]

**Likely Causes:**
- [Based on pattern type]

### Investigation Log

| Violation | Time/Point | Investigation | Root Cause | Action |
|-----------|------------|---------------|------------|--------|
| [rule] | [index] | [notes] | [finding] | [corrective action] |

### Overall Assessment

**Process Exhibits:** [Random variation only / Non-random patterns]
**Stability Status:** [Stable / Not Stable]
**Recommended Action:** [Continue monitoring / Investigate / Adjust process]
```

## Rule Selection Guidelines

### When to Use All Rules
- Initial process characterization
- High-volume, critical processes
- When any special cause is costly

### Minimal Rule Set (Rules 1, 2, 3)
- Low-volume processes
- When simplicity is needed
- Attribute charts (rules 5, 6 less applicable)

### Skip Rule 4 When
- Autocorrelated data
- Batch processes with known alternation

## False Alarm Rates

| Rule | Probability per point | Expected false alarms per 100 points |
|------|----------------------|--------------------------------------|
| 1 | 0.27% | 0.27 |
| 2 | 0.39% | 0.39 |
| 3 | 0.14% | 0.14 |
| 4 | 0.02% | 0.02 |
| 5 | 1.12% | 1.12 |
| 6 | 1.40% | 1.40 |

Combined false alarm rate is higher. Balance sensitivity vs. investigation cost.

## Dependencies

- Requires control chart with calculated limits
- Uses `control_charts.py` for `apply_run_rules()` function
- Feed findings to `StabilityAssessment.md`
