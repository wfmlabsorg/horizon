# OutcomeScorecard Workflow

Generate a summary scorecard of engagement findings organized by outcome domain.

---

## Purpose

At any point in an engagement, produce a structured view of:
- What we've learned about each outcome domain
- Key drivers identified
- Tradeoffs discovered
- Recommendations by domain

---

## Scorecard Generation Process

### Step 1: Gather Inputs

Collect all analysis outputs from the engagement:
- Data analysis results
- Research findings
- Interview insights
- Shapley decompositions
- Causal models

### Step 2: Classify by Domain

For each finding, apply the MapToOutcome workflow to assign to CX, COST, or EX.

### Step 3: Synthesize Domain Summaries

For each domain, answer:
- What is the current state?
- What drives performance?
- What are the key opportunities?
- What constraints exist?

### Step 4: Identify Cross-Domain Themes

Look for patterns that span domains:
- Feedback loops
- Root causes affecting multiple domains
- Tensions/tradeoffs

### Step 5: Prioritize Recommendations

Rank opportunities by:
- Impact magnitude
- Implementation feasibility
- Risk level
- Strategic alignment

---

## Scorecard Template

```markdown
# Outcome Scorecard: [Engagement Name]
**Date:** [YYYY-MM-DD]
**Phase:** [Discovery/Analysis/Recommendations]

---

## Executive Summary

[2-3 sentences capturing the overall state and top priorities]

---

## CX — Customer Experience

### Current State
| Metric | Current | Benchmark | Gap |
|--------|---------|-----------|-----|
| CSAT | X | Y | Z |
| FCR | X | Y | Z |
| SL | X | Y | Z |

### Key Drivers
1. **[Driver 1]** — [Shapley contribution %] of explained variance
2. **[Driver 2]** — [Description]
3. **[Driver 3]** — [Description]

### Opportunities
- [ ] [Opportunity 1] — Est. impact: [+X% CX metric]
- [ ] [Opportunity 2] — Est. impact: [+X% CX metric]

### Constraints
- [Constraint 1]
- [Constraint 2]

---

## COST — Financial Outcomes

### Current State
| Metric | Current | Benchmark | Gap |
|--------|---------|-----------|-----|
| Cost/Contact | $X | $Y | $Z |
| AHT | X sec | Y sec | Z sec |
| Occupancy | X% | Y% | Z% |

### Key Drivers
1. **[Driver 1]** — [Shapley contribution %] of cost variance
2. **[Driver 2]** — [Description]
3. **[Driver 3]** — [Description]

### Opportunities
- [ ] [Opportunity 1] — Est. impact: [-$X or -X%]
- [ ] [Opportunity 2] — Est. impact: [-$X or -X%]

### Constraints
- [Constraint 1]
- [Constraint 2]

---

## EX — Employee Experience

### Current State
| Metric | Current | Benchmark | Gap |
|--------|---------|-----------|-----|
| Turnover | X% | Y% | Z% |
| eNPS | X | Y | Z |
| Absenteeism | X% | Y% | Z% |

### Key Drivers
1. **[Driver 1]** — [Contribution to turnover/engagement]
2. **[Driver 2]** — [Description]
3. **[Driver 3]** — [Description]

### Opportunities
- [ ] [Opportunity 1] — Est. impact: [-X% turnover]
- [ ] [Opportunity 2] — Est. impact: [+X eNPS]

### Constraints
- [Constraint 1]
- [Constraint 2]

---

## Cross-Domain Analysis

### The Outcome Triangle for [Client]

```
         CX: [State]
            /\
           /  \
          /    \
         /______\
    COST:        EX:
   [State]     [State]
```

### Key Tradeoffs Identified

| Tradeoff | Domains | Current Balance | Recommendation |
|----------|---------|-----------------|----------------|
| [Tradeoff 1] | CX ↔ COST | [Favors X] | [Rebalance toward Y] |
| [Tradeoff 2] | COST ↔ EX | [Favors X] | [Maintain/Adjust] |

### Feedback Loops Discovered

**Positive:**
- [Virtuous cycle description]

**Negative:**
- [Death spiral risk description]

### Root Causes Affecting Multiple Domains

| Root Cause | CX Impact | COST Impact | EX Impact |
|------------|-----------|-------------|-----------|
| [Cause 1] | [Effect] | [Effect] | [Effect] |
| [Cause 2] | [Effect] | [Effect] | [Effect] |

---

## Prioritized Recommendations

| Priority | Recommendation | Primary Domain | Est. Impact | Risk |
|----------|----------------|----------------|-------------|------|
| 1 | [Action] | [CX/COST/EX] | [Quantified] | [H/M/L] |
| 2 | [Action] | [CX/COST/EX] | [Quantified] | [H/M/L] |
| 3 | [Action] | [CX/COST/EX] | [Quantified] | [H/M/L] |

---

## Data Confidence

| Domain | Data Quality | Measurement Gaps |
|--------|--------------|------------------|
| CX | [High/Med/Low] | [What's missing] |
| COST | [High/Med/Low] | [What's missing] |
| EX | [High/Med/Low] | [What's missing] |

---

## Next Steps

1. [Next step 1]
2. [Next step 2]
3. [Next step 3]
```

---

## Scorecard Variants

### Quick Scorecard (1-page)

For status updates or informal check-ins:

```markdown
# Quick Scorecard: [Engagement] — [Date]

| Domain | State | Top Driver | Top Opportunity |
|--------|-------|------------|-----------------|
| CX | [Good/Fair/Poor] | [Driver] | [Opportunity] |
| COST | [Good/Fair/Poor] | [Driver] | [Opportunity] |
| EX | [Good/Fair/Poor] | [Driver] | [Opportunity] |

**Key Insight:** [One sentence]
**Top Priority:** [One recommendation]
```

### Deep-Dive Scorecard (by domain)

For domain-specific analysis, expand one section with:
- Detailed metric breakdowns
- Sub-driver analysis
- Implementation roadmap
- Success criteria

---

## Integration

- Save scorecards to `03-output/` for deliverables
- Reference in client presentations
- Update as engagement progresses
- Use as input for ReportCompiler skill
