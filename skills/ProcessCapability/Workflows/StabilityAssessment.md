# Stability Assessment Workflow

Evaluate whether a process is in statistical control (stable).

## Why Stability Matters

A stable process:
- Has only **common cause** variation (inherent randomness)
- Is predictable within control limits
- Can be meaningfully measured for capability

An unstable process:
- Has **special cause** variation (assignable causes)
- Is unpredictable
- Capability metrics are meaningless until stabilized

**Key Principle:** Fix stability first, then assess capability.

## Workflow Steps

### Step 1: Select Appropriate Control Chart

Use `ControlChart.md` decision tree to select:
- I-MR for individual measurements
- X-bar R for subgroups 2-10
- X-bar S for subgroups > 10
- Attribute charts for count data

### Step 2: Build Control Chart

```python
from control_charts import individuals_chart, format_chart_results

i_result, mr_result = individuals_chart(data)
```

### Step 3: Check for Out-of-Control Points

A point is out of control if it exceeds the control limits:
- Above UCL
- Below LCL

### Step 4: Apply Run Rules

Check Western Electric rules for patterns indicating special causes:

| Rule | Pattern | Meaning |
|------|---------|---------|
| 1 | 1 point > 3σ | Extreme value |
| 2 | 9 points same side of CL | Process shift |
| 3 | 6 points trending | Drift |
| 4 | 14 points alternating | Overcontrol |
| 5 | 2 of 3 > 2σ | Increased variation |
| 6 | 4 of 5 > 1σ | Small shift |

```python
from control_charts import apply_run_rules

violations = apply_run_rules(data, center_line, ucl, lcl)
```

### Step 5: Determine Stability

**Process is STABLE if:**
- No points beyond control limits
- No run rule violations
- No obvious patterns

**Process is NOT STABLE if:**
- Any point beyond 3σ limits
- Run rule violations detected
- Visible patterns (trends, cycles, shifts)

### Step 6: Investigate Special Causes (if unstable)

For each out-of-control signal:
1. Note the time/date
2. What changed? (5M1E analysis)
   - **M**achine
   - **M**aterial
   - **M**ethod
   - **M**easurement
   - **M**an (operator)
   - **E**nvironment
3. Document root cause
4. Implement corrective action

## Output Template

```markdown
## Process Stability Assessment

**Process:** [name/description]
**Chart Type:** [I-MR / X-bar R / etc.]
**Data Points:** [n]
**Period:** [date range]

### Control Chart Summary

| Chart | CL | UCL | LCL |
|-------|-----|-----|-----|
| [Primary] | [value] | [value] | [value] |
| [Secondary] | [value] | [value] | [value] |

### Stability Indicators

| Indicator | Result | Status |
|-----------|--------|--------|
| Points beyond limits | [count] | [Pass/Fail] |
| Rule 1 (beyond 3σ) | [points] | [Pass/Fail] |
| Rule 2 (9 same side) | [points] | [Pass/Fail] |
| Rule 3 (6 trending) | [points] | [Pass/Fail] |
| Rule 5 (2 of 3 beyond 2σ) | [points] | [Pass/Fail] |
| Rule 6 (4 of 5 beyond 1σ) | [points] | [Pass/Fail] |

### Assessment

**Process Status:** [STABLE / NOT STABLE]

### Special Cause Analysis (if applicable)

| Signal | Point(s) | Possible Cause | Action |
|--------|----------|----------------|--------|
| [type] | [indices] | [investigation notes] | [corrective action] |

### Recommendations

[Next steps based on findings]

### Outcome Impact

**Domain:** [CX / COST / EX]
**Impact:** [Business impact of instability]
```

## Interpreting Patterns

### Shift (Sudden Change)
**Pattern:** Points suddenly move to new level
**Causes:** New operator, new material lot, equipment adjustment
**Action:** Investigate what changed at that time

### Trend (Gradual Change)
**Pattern:** Points steadily increase or decrease
**Causes:** Tool wear, drift, temperature change
**Action:** Identify time-dependent factor

### Cycles
**Pattern:** Repeating up-down pattern
**Causes:** Shift changes, ambient conditions, batch effects
**Action:** Correlate with potential periodic factors

### Stratification (Hugging Centerline)
**Pattern:** Points unusually close to center
**Causes:** Incorrect subgrouping, mixed sources
**Action:** Review sampling strategy

### Mixture (Hugging Limits)
**Pattern:** Points cluster near UCL and LCL, few near center
**Causes:** Two processes mixed, bimodal distribution
**Action:** Separate and analyze sources

## Handling Unstable Processes

### Option 1: Remove Special Causes
1. Identify root cause for each signal
2. Implement corrective action
3. Recalculate limits excluding affected points
4. Monitor with new limits

### Option 2: Document and Monitor
If special cause is known but not removable:
1. Document the cause
2. Adjust process to new level
3. Recalculate limits from stable period
4. Continue monitoring

### Option 3: Stratify Analysis
If multiple sources contribute:
1. Separate data by source (shift, machine, etc.)
2. Create separate control charts
3. Analyze each independently

## Do NOT

- Calculate capability for unstable processes
- Remove points without documented reason
- Ignore patterns just because no points exceed limits
- Use too few data points (need 20-30 minimum for limits)

## Dependencies

- Use `ControlChart.md` for chart selection
- Load `control_charts.py` from Tools/
- Document findings for `CapabilityAnalysis.md` prerequisite
- Map to `OutcomeFramework` for business context
