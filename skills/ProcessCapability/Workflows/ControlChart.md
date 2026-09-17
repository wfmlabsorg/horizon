# Control Chart Workflow

Build and interpret statistical process control charts.

## Chart Selection Decision Tree

```
What type of data do you have?

├─► CONTINUOUS (measured values: time, length, weight, etc.)
│   │
│   └─► How is data collected?
│       │
│       ├─► Individual measurements (no subgroups)
│       │   └─► Use I-MR Chart
│       │
│       ├─► Subgroups of 2-10 items
│       │   └─► Use X-bar R Chart
│       │
│       └─► Subgroups > 10 items
│           └─► Use X-bar S Chart
│
└─► ATTRIBUTE (counts: defects, pass/fail, errors)
    │
    ├─► Counting DEFECTIVES (bad units)
    │   │
    │   ├─► Constant sample size each period
    │   │   └─► Use np Chart
    │   │
    │   └─► Variable sample size
    │       └─► Use p Chart
    │
    └─► Counting DEFECTS (flaws per unit)
        │
        ├─► Constant inspection opportunity
        │   └─► Use c Chart
        │
        └─► Variable inspection opportunity
            └─► Use u Chart
```

## Workflow Steps

### Step 1: Understand the Data

Ask:
- What is being measured?
- How are samples collected (subgroup size)?
- Is sample size constant or variable?
- What time period does each point represent?

### Step 2: Select Chart Type

Use decision tree above. Document reasoning.

### Step 3: Calculate Control Limits

```python
from control_charts import (
    individuals_chart, xbar_r_chart, xbar_s_chart,
    p_chart, np_chart, c_chart, u_chart
)

# Example: I-MR chart
i_result, mr_result = individuals_chart(data)
```

### Step 4: Plot and Analyze

1. Plot data points in time order
2. Add center line and control limits
3. Identify out-of-control points
4. Check run rules

### Step 5: Interpret Results

Use standard output format below.

## Output Template

```markdown
## Control Chart Analysis

**Chart Type:** [I-MR / X-bar R / X-bar S / p / np / c / u]
**Data Points:** [n]
**Period:** [date range if applicable]
**Data Description:** [what is being measured]

### Chart Statistics

| Statistic | Value |
|-----------|-------|
| Center Line | [value] |
| UCL | [value] |
| LCL | [value] |
| σ estimate | [value] |

### Stability Assessment

**Out of Control Points:** [list indices or "None"]

**Run Rules Violations:**
- Rule 1 (beyond 3σ): [points or "None"]
- Rule 2 (9 same side): [points or "None"]
- Rule 3 (6 trending): [points or "None"]
- Rule 5 (2 of 3 beyond 2σ): [points or "None"]
- Rule 6 (4 of 5 beyond 1σ): [points or "None"]

**Process Status:** [Stable / Not Stable]

### Recommendations

[Based on findings - investigate special causes, continue monitoring, etc.]

### Outcome Impact

**Domain:** [CX / COST / EX]
**Impact:** [How this affects customer experience, costs, or employee experience]
```

## Chart-Specific Guidance

### I-MR Chart
- Use for individual measurements with no natural subgrouping
- Common in continuous processes, single-item production
- Both I and MR charts must be stable
- Moving range estimates short-term variation

### X-bar R Chart
- Use for subgroups of 2-10
- Range (R) efficiently estimates variation for small n
- Center line on X-bar chart = grand mean (X̿)

### X-bar S Chart
- Use for subgroups > 10
- Standard deviation more efficient than range for large n
- Better for detecting small shifts

### p Chart
- Plots proportion defective
- Control limits vary if sample sizes vary
- Use average limits for plotting, exact for OOC detection

### np Chart
- Plots count of defectives
- Only valid with constant sample size
- Easier to interpret than p chart

### c Chart
- Plots count of defects per inspection unit
- Assumes constant opportunity (same area, time, etc.)
- Based on Poisson distribution

### u Chart
- Plots defects per unit with varying opportunity
- Use when inspection area/time varies
- Control limits vary with inspection unit size

## Common Patterns and Causes

| Pattern | Possible Causes |
|---------|-----------------|
| Point beyond limits | Measurement error, process upset, material change |
| Run above/below center | Process shift, tool wear, environmental change |
| Trending | Tool wear, fatigue, temperature drift |
| Cycles | Rotation of operators, environmental cycles |
| Hugging center line | Stratified sampling, incorrect subgrouping |
| Hugging limits | Mixture of two processes |

## Dependencies

- Load `control_charts.py` from Tools/
- Reference `ControlConstants.md` for formulas
- Use `OutcomeFramework` to map findings to CX/COST/EX
