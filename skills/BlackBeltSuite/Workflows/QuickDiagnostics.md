# Quick Diagnostics Workflow

Rapid health check: Describe → Correlate → Stability check → Outcome map.

## When to Use

- Quick assessment needed
- Initial triage before deep dive
- Regular operational health check
- Limited time for analysis

## Workflow Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DESCRIBE (5 min)                                         │
│    └── StatisticalAnalysis: Key metrics summary             │
├─────────────────────────────────────────────────────────────┤
│ 2. CORRELATE (5 min)                                        │
│    └── StatisticalAnalysis: Top correlations                │
├─────────────────────────────────────────────────────────────┤
│ 3. STABILITY CHECK (5 min)                                  │
│    └── ProcessCapability: Control chart, red flags          │
├─────────────────────────────────────────────────────────────┤
│ 4. OUTCOME MAP (5 min)                                      │
│    └── OutcomeFramework: CX/COST/EX quick assessment        │
└─────────────────────────────────────────────────────────────┘
```

## Phase Details

### Phase 1: Describe

**Quick stats to calculate:**
- N, Mean, Std Dev, Min, Max
- % missing data
- Recent trend (up/down/stable)

**Output:**
```markdown
### Quick Stats

| Metric | Current | Prior Period | Change |
|--------|---------|--------------|--------|
| [KPI 1] | [value] | [value] | [%] |
| [KPI 2] | [value] | [value] | [%] |
| [KPI 3] | [value] | [value] | [%] |

**Data Quality:** [OK / Issues: list]
```

### Phase 2: Correlate

**Quick correlation scan:**
- Calculate correlation matrix for key metrics
- Flag correlations > 0.5 or < -0.5
- Note any surprising relationships

**Output:**
```markdown
### Key Correlations

| Pair | r | Strength |
|------|---|----------|
| [A] ↔ [B] | [value] | [strong/moderate] |
| [C] ↔ [D] | [value] | [strong/moderate] |

**Notable:** [any surprising correlations]

⚠️ Correlation only — not causal
```

### Phase 3: Stability Check

**Quick SPC assessment:**
- Run I-MR or X-bar chart on key metric
- Check for out-of-control signals
- Note any special causes

**Output:**
```markdown
### Stability Assessment

| Metric | Status | Signals |
|--------|--------|---------|
| [KPI 1] | 🟢 Stable / 🔴 Unstable | [list if any] |
| [KPI 2] | 🟢 Stable / 🔴 Unstable | [list if any] |

**Red Flags:** [list any concerns]
```

### Phase 4: Outcome Map

**Quick CX/COST/EX assessment:**
- Which dimension is most affected?
- Rough magnitude estimate
- Priority recommendation

**Output:**
```markdown
### Outcome Quick Assessment

| Dimension | Status | Priority |
|-----------|--------|----------|
| CX | 🟢 OK / 🟡 Watch / 🔴 Issue | [H/M/L] |
| COST | 🟢 OK / 🟡 Watch / 🔴 Issue | [H/M/L] |
| EX | 🟢 OK / 🟡 Watch / 🔴 Issue | [H/M/L] |

**Recommended Action:** [immediate step if any]
```

## Quick Diagnostics Output Template

```markdown
## Quick Diagnostics: [Topic]

**Date:** [date]
**Scope:** [what was assessed]

### Summary

🟢/🟡/🔴 **Overall Status:** [one-line assessment]

### Key Findings

| Area | Status | Finding |
|------|--------|---------|
| Performance | [🟢🟡🔴] | [brief] |
| Stability | [🟢🟡🔴] | [brief] |
| Trends | [🟢🟡🔴] | [brief] |

### Top Correlations

- [A] ↔ [B]: r = [value] ⚠️ correlation only

### Recommended Actions

1. **Immediate:** [if any red flags]
2. **Watch:** [if any yellow flags]
3. **Deep Dive Needed:** [Yes/No] — [reason]

---
⚠️ Quick assessment only. For causal analysis, run FullAnalysis workflow.
```

## When to Escalate

Escalate to FullAnalysis if:
- Any red flags found
- User asks "why"
- Unexpected correlations need investigation
- Stability issues detected
- Decision requires higher confidence
