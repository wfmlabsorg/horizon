# Pareto Analysis Workflow

Identify the "vital few" causes that drive most of the impact.

---

## Prerequisites

- [ ] Quantifiable data on causes and impacts
- [ ] Clear definition of "impact" metric
- [ ] Minimum 5-10 causes to analyze (Pareto less useful with fewer)

---

## Workflow Steps

### Step 1: Define the Analysis

**Specify:**
```markdown
**Problem:** [What we're analyzing]
**Causes:** [What categories/items we're counting]
**Impact metric:** [How we measure severity]
**Data source:** [Where data comes from]
**Period:** [Time range]
```

**Example:**
```markdown
**Problem:** Repeat calls driving up cost and hurting CX
**Causes:** Reason codes for repeat contacts
**Impact metric:** Number of repeat calls
**Data source:** CRM disposition codes
**Period:** January 2026
```

---

### Step 2: Gather and Prepare Data

**Required columns:**
- Cause/category identifier
- Impact value (count, cost, time, etc.)

**Data format:**
```python
import pandas as pd

df = pd.DataFrame({
    'cause': ['Billing issue', 'Order status', 'Technical support',
              'Account change', 'Returns', 'Shipping', 'Other'],
    'repeat_calls': [1250, 890, 650, 420, 280, 180, 130]
})
```

---

### Step 3: Run Pareto Analysis

**Using root_cause_tools:**
```python
from root_cause_tools import pareto_analysis

result = pareto_analysis(
    df=df,
    cause_col='cause',
    impact_col='repeat_calls',
    threshold=0.80  # 80% cutoff for "vital few"
)

print(result['pareto_table'])
print(f"\nVital few: {result['vital_few']}")
print(f"Vital few account for: {result['vital_few_pct']:.1%} of impact")
```

**Output:**
```
| Rank | Cause | Impact | % | Cumulative % |
|------|-------|--------|---|--------------|
| 1 | Billing issue | 1,250 | 32.9% | 32.9% |
| 2 | Order status | 890 | 23.4% | 56.3% |
| 3 | Technical support | 650 | 17.1% | 73.4% |
| 4 | Account change | 420 | 11.1% | 84.5% | ← 80% threshold
| 5 | Returns | 280 | 7.4% | 91.8% |
| 6 | Shipping | 180 | 4.7% | 96.6% |
| 7 | Other | 130 | 3.4% | 100.0% |

Vital few: ['Billing issue', 'Order status', 'Technical support']
Vital few account for: 73.4% of impact
```

---

### Step 4: Generate Visualization

**Pareto chart (bar + line):**
```python
import matplotlib.pyplot as plt

fig, ax1 = plt.subplots(figsize=(10, 6))

# Bar chart (impact)
bars = ax1.bar(result['pareto_table']['cause'],
               result['pareto_table']['impact'],
               color='steelblue')
ax1.set_ylabel('Repeat Calls', color='steelblue')
ax1.tick_params(axis='y', labelcolor='steelblue')
plt.xticks(rotation=45, ha='right')

# Line chart (cumulative %)
ax2 = ax1.twinx()
ax2.plot(result['pareto_table']['cause'],
         result['pareto_table']['cumulative_pct'],
         color='orange', marker='o', linewidth=2)
ax2.axhline(y=0.80, color='red', linestyle='--', alpha=0.7)
ax2.set_ylabel('Cumulative %', color='orange')
ax2.set_ylim(0, 1.05)

plt.title('Pareto Analysis: Repeat Call Reasons')
plt.tight_layout()
plt.savefig('pareto_chart.png', dpi=150)
```

---

### Step 5: Interpret Results

**Vital few analysis:**
```markdown
### Vital Few (80% of Impact)

**Top 3 causes account for 73.4% of all repeat calls:**

1. **Billing issue** (1,250 calls, 32.9%)
   - Hypothesis: Billing statements unclear or incorrect
   - Investigation: Analyze billing-related repeat call transcripts

2. **Order status** (890 calls, 23.4%)
   - Hypothesis: Proactive updates missing or unreliable
   - Investigation: Check notification delivery rates

3. **Technical support** (650 calls, 17.1%)
   - Hypothesis: First call resolution low for tech issues
   - Investigation: Review tech support FCR by issue type
```

---

### Step 6: Map to Outcomes

**Link vital few to CX/COST/EX:**

| Vital Few Cause | CX Impact | COST Impact | EX Impact |
|-----------------|-----------|-------------|-----------|
| Billing issue | Frustration, trust | $15.50/repeat call | Difficult conversations |
| Order status | Anxiety, uncertainty | $15.50/repeat call | Repetitive queries |
| Technical support | Service disruption | $15.50/repeat call | Complex problem-solving |

---

### Step 7: Recommend Investigation

**Prioritization framework:**
```markdown
### Investigation Priority

| Cause | Impact Rank | Improvability | Data Available | Priority |
|-------|-------------|---------------|----------------|----------|
| Billing issue | 1 | High | Yes | ★★★ |
| Order status | 2 | High | Partial | ★★☆ |
| Technical support | 3 | Medium | Yes | ★★☆ |

**Recommendation:**
Focus on Billing issue first - highest impact with high improvability
and available data for deeper analysis.
```

---

## Output Template

```markdown
## Pareto Analysis: [Subject]

### Analysis Definition
**Problem:** [What we analyzed]
**Impact metric:** [How measured]
**Data source:** [Where from]
**Period:** [Time range]
**Total impact:** [Sum]

### Pareto Table

| Rank | Cause | Impact | % | Cumulative % |
|------|-------|--------|---|--------------|
| 1 | [cause] | [value] | [%] | [%] |
| 2 | [cause] | [value] | [%] | [%] |
| ... | | | | |

### Pareto Chart
[Insert visualization]

### Vital Few (80% of Impact)

**Top [n] causes account for [x]% of total impact:**

1. **[Cause 1]** — [impact] ([%])
   - Hypothesis: [What might be driving this]
   - Investigation: [How to validate]

2. **[Cause 2]** — [impact] ([%])
   - Hypothesis: [What might be driving this]
   - Investigation: [How to validate]

3. **[Cause 3]** — [impact] ([%])
   - Hypothesis: [What might be driving this]
   - Investigation: [How to validate]

### Useful Many (Remaining 20%)

[Brief note on remaining causes - may address later or accept as noise]

### Outcome Impact

| Vital Few Cause | CX | COST | EX |
|-----------------|-----|------|-----|
| [Cause 1] | [impact] | [impact] | [impact] |
| [Cause 2] | [impact] | [impact] | [impact] |

### Recommendation

Focus improvement efforts on vital few. Addressing top [n] causes
could reduce [problem] by up to [x]%.

**Next steps:**
1. [Investigation action for cause 1]
2. [Investigation action for cause 2]
3. [Investigation action for cause 3]

---

⚠️ **HYPOTHESIS NOTE:** Pareto identifies where to focus investigation, not what to fix. Validate each vital few cause with StatisticalAnalysis before implementing changes.
```

---

## Advanced: Multi-Dimensional Pareto

When single dimension isn't enough:

```python
# Pareto by frequency AND severity
df['weighted_impact'] = df['frequency'] * df['severity_score']
result = pareto_analysis(df, 'cause', 'weighted_impact')
```

```python
# Pareto by cost
df['cost_impact'] = df['occurrence'] * df['cost_per_occurrence']
result = pareto_analysis(df, 'cause', 'cost_impact')
```

---

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Wrong impact metric | Ensure metric aligns with business priority |
| Too few categories | Need 5+ causes for meaningful Pareto |
| Overlapping categories | Ensure mutually exclusive cause definitions |
| Static analysis | Re-run periodically - vital few may shift |
| Action without validation | Pareto shows WHERE to look, not WHAT to fix |
| Ignoring useful many | Small causes may indicate emerging issues |
