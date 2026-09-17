# TradeoffAnalysis Workflow

Analyze tradeoffs between outcome domains for proposed interventions.

---

## Purpose

Before recommending changes, model the impact across all three outcome domains. Identify potential negative consequences and quantify tradeoffs where possible.

---

## Tradeoff Analysis Process

### Step 1: Define the Intervention

```markdown
## Proposed Intervention
**Action:** [What change is being proposed?]
**Target Outcome:** [Which domain is this intended to improve?]
**Expected Magnitude:** [How much improvement is expected?]
```

### Step 2: Map Primary Effects

Using `Context/OutcomeRelationships.md`, trace the direct impact:

```markdown
## Primary Effects

### Target Domain: [CX/COST/EX]
- Mechanism: [How does intervention improve this domain?]
- Expected Impact: [Quantified if possible]
- Confidence: [High/Medium/Low]
- Time to Impact: [Immediate/Weeks/Months]
```

### Step 3: Trace Secondary Effects

Follow the Outcome Triangle to identify spillovers:

```markdown
## Secondary Effects

### [Second Domain]
- Mechanism: [How does primary change affect this domain?]
- Direction: [Positive/Negative/Neutral]
- Magnitude: [Large/Moderate/Small]
- Time Lag: [How long until effect manifests?]

### [Third Domain]
- Mechanism: [...]
- Direction: [...]
- Magnitude: [...]
- Time Lag: [...]
```

### Step 4: Identify Feedback Loops

Check for self-reinforcing dynamics:

```markdown
## Feedback Loop Analysis

### Potential Positive Loops
- [Description of virtuous cycle]

### Potential Negative Loops
- [Description of death spiral risk]

### Stabilizing Factors
- [What prevents runaway effects?]
```

### Step 5: Quantify the Tradeoff

Where possible, estimate the exchange rate:

```markdown
## Tradeoff Quantification

| Gain | Cost | Exchange Rate |
|------|------|---------------|
| COST -10% | CX (SL) -5 pts | 2% cost reduction per SL point |
| EX (Turnover) -10% | COST +3% | 3.3% cost per turnover point |
```

### Step 6: Risk Assessment

```markdown
## Risk Assessment

### Downside Scenarios
| Scenario | Probability | Impact | Mitigation |
|----------|-------------|--------|------------|
| [What could go wrong] | [%] | [Which domains] | [Prevention/response] |

### Reversibility
- Can the intervention be reversed? [Yes/No/Partially]
- What would reversal cost?
- How quickly could we reverse?

### Early Warning Indicators
| Metric | Threshold | Response |
|--------|-----------|----------|
| [What to monitor] | [Alert level] | [Action to take] |
```

---

## Common Tradeoff Patterns

### COST vs CX Tradeoffs

| Action | COST Impact | CX Impact | When Acceptable |
|--------|-------------|-----------|-----------------|
| Reduce staffing | ↓ | ↓ (SL/ASA) | If SL buffer exists |
| Shorten training | ↓ | ↓ (Quality) | If attrition low |
| Offshore/outsource | ↓↓ | ↓ (Variable) | If quality managed |
| Automate simple calls | ↓↓ | ↑↓ (Depends) | If well-designed |

### COST vs EX Tradeoffs

| Action | COST Impact | EX Impact | When Acceptable |
|--------|-------------|-----------|-----------------|
| Increase occupancy | ↓ | ↓ (Burnout) | If below 85% target |
| Reduce shrinkage | ↓ | ↓ (Flexibility) | If shrinkage excessive |
| Cut training time | ↓ | ↓ (Development) | If capability sufficient |
| Mandatory overtime | ↓ | ↓↓ | Rarely acceptable |

### CX vs EX Tradeoffs

| Action | CX Impact | EX Impact | When Acceptable |
|--------|-----------|-----------|-----------------|
| Stricter QA | ↑ | ↓ (Pressure) | If coaching-focused |
| Extended hours | ↑ | ↓ (Work-life) | If voluntary/compensated |
| Scope expansion | ↑ | ↓ (Complexity) | If training provided |
| Higher expectations | ↑ | ↓ (Stress) | If resources match |

---

## Output Template

```markdown
# Tradeoff Analysis: [Intervention Name]

## Summary
**Proposed Action:** [Brief description]
**Primary Benefit:** [Domain: expected improvement]
**Key Tradeoff:** [What is sacrificed]
**Net Assessment:** [Recommended / Not Recommended / Conditional]

## Impact Matrix

| Domain | Direction | Magnitude | Timing | Confidence |
|--------|-----------|-----------|--------|------------|
| CX | [↑/↓/→] | [High/Med/Low] | [Immediate/Delayed] | [H/M/L] |
| COST | [↑/↓/→] | [High/Med/Low] | [Immediate/Delayed] | [H/M/L] |
| EX | [↑/↓/→] | [High/Med/Low] | [Immediate/Delayed] | [H/M/L] |

## Tradeoff Visualization

```
Before:  CX [====    ] COST [======  ] EX [=====   ]
After:   CX [======  ] COST [====    ] EX [====    ]
         ↑ +20%       ↓ -15%          ↓ -10%
```

## Recommendation
[Accept/Reject/Modify the intervention]

## Conditions for Acceptance
- [Condition 1]
- [Condition 2]

## Monitoring Plan
| Metric | Baseline | Target | Alert Threshold |
|--------|----------|--------|-----------------|
| ... | ... | ... | ... |
```

---

## Integration

- Use with **CausalInference** skill to build DAGs for complex tradeoffs
- Use with **ShapleyDecomposition** to quantify contribution magnitudes
- Document in engagement **OutcomeScorecard** for tracking
