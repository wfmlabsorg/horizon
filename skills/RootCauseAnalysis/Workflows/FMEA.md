# FMEA (Failure Mode and Effects Analysis) Workflow

Risk-based prioritization of potential failure modes.

---

## Prerequisites

- [ ] Process steps or components defined
- [ ] Cross-functional team for assessment
- [ ] Historical failure data (if available)

---

## Workflow Steps

### Step 1: Define Scope

**Specify analysis boundaries:**
```markdown
**Process/System:** [What we're analyzing]
**Scope:** [Start point] to [End point]
**Objective:** [What we want to prevent/improve]
**Team:** [Who's involved in assessment]
```

**Example:**
```markdown
**Process:** Customer onboarding workflow
**Scope:** Application submission to account activation
**Objective:** Reduce onboarding failures and customer churn
**Team:** Operations, IT, Training, Quality
```

---

### Step 2: List Process Steps/Components

**Decompose the scope into analyzable units:**

```markdown
| Step # | Process Step | Function |
|--------|--------------|----------|
| 1 | Application submission | Capture customer information |
| 2 | Identity verification | Validate customer identity |
| 3 | Credit check | Assess credit worthiness |
| 4 | Account creation | Set up system records |
| 5 | Welcome communication | Inform customer of activation |
```

---

### Step 3: Identify Failure Modes

**For each step, ask:**
- "What could go wrong?"
- "How might this step fail to perform its function?"
- "What variations from expected could occur?"

**Common failure mode patterns:**
- Complete failure (doesn't happen)
- Partial failure (happens incompletely)
- Erratic failure (happens inconsistently)
- Degraded failure (happens but poorly)
- Unintended operation (happens when shouldn't)

---

### Step 4: Assess Each Failure Mode

**Rate three dimensions (1-10 scale):**

| Dimension | Question | Scale |
|-----------|----------|-------|
| **Severity (S)** | How bad if it occurs? | 1=Minor → 10=Catastrophic |
| **Occurrence (O)** | How likely to occur? | 1=Rare → 10=Certain |
| **Detection (D)** | How likely to catch before impact? | 1=Always detect → 10=Never detect |

**Severity scale (contact center context):**
| Score | Description | Example |
|-------|-------------|---------|
| 1-2 | Minor inconvenience | Typo in email |
| 3-4 | Customer effort required | Must call back once |
| 5-6 | Significant impact | Delayed service activation |
| 7-8 | Major impact | Incorrect billing, service outage |
| 9-10 | Critical | Data breach, regulatory violation, churn |

**Occurrence scale:**
| Score | Description | Frequency |
|-------|-------------|-----------|
| 1-2 | Rare | <1% of cases |
| 3-4 | Occasional | 1-5% of cases |
| 5-6 | Moderate | 5-15% of cases |
| 7-8 | Frequent | 15-30% of cases |
| 9-10 | Highly likely | >30% of cases |

**Detection scale:**
| Score | Description | Control |
|-------|-------------|---------|
| 1-2 | Almost certain | Automated check with alert |
| 3-4 | High | Manual review catches most |
| 5-6 | Moderate | Periodic audit finds some |
| 7-8 | Low | Only caught by customer complaint |
| 9-10 | None | No detection mechanism |

---

### Step 5: Calculate Risk Priority Number (RPN)

**Formula:**
```
RPN = Severity × Occurrence × Detection
```

**Range:** 1 to 1,000

**Priority thresholds (customizable):**
| RPN | Priority | Action |
|-----|----------|--------|
| >200 | Critical | Immediate action required |
| 100-200 | High | Plan mitigation within 30 days |
| 50-100 | Medium | Include in next improvement cycle |
| <50 | Low | Monitor, no immediate action |

---

### Step 6: Build FMEA Table

**Using root_cause_tools:**
```python
from root_cause_tools import fmea_template

steps = [
    "Application submission",
    "Identity verification",
    "Credit check",
    "Account creation",
    "Welcome communication"
]

fmea = fmea_template(steps)
# Returns empty template for manual completion
```

**Complete the table:**

| Step | Failure Mode | Effect | S | Cause | O | Control | D | RPN | Priority |
|------|--------------|--------|---|-------|---|---------|---|-----|----------|
| Identity verification | System timeout | Customer abandons | 8 | High traffic | 5 | Manual retry | 6 | 240 | Critical |
| Credit check | Wrong score returned | Incorrect decision | 9 | API error | 2 | Audit sample | 7 | 126 | High |
| Account creation | Duplicate account | Billing errors | 7 | No dupe check | 4 | Customer reports | 9 | 252 | Critical |
| Welcome email | Not delivered | Customer confused | 4 | Spam filter | 6 | Bounce tracking | 4 | 96 | Medium |

---

### Step 7: Prioritize and Plan Actions

**Sort by RPN descending:**
```python
from root_cause_tools import prioritize_fmea

prioritized = prioritize_fmea(fmea_df, threshold=100)
# Returns critical and high priority items
```

**For high-priority items, document:**
```markdown
### Action Plan: [Failure Mode]

**Current state:**
- RPN: [value]
- S/O/D: [x/x/x]

**Recommended action:**
- Type: [Reduce S / Reduce O / Improve D]
- Action: [Specific action]
- Owner: [Who]
- Target date: [When]

**Expected improvement:**
- Target S/O/D: [x/x/x]
- Target RPN: [value]
```

---

### Step 8: Map to Outcomes

**Link failure modes to CX/COST/EX:**

| Failure Mode | RPN | CX Impact | COST Impact | EX Impact |
|--------------|-----|-----------|-------------|-----------|
| System timeout | 240 | Abandonment | Lost customer | Escalations |
| Duplicate account | 252 | Billing disputes | Manual fixes | Rework |

---

## Output Template

```markdown
## FMEA: [Process/System Name]

### Scope Definition
**Process:** [What we analyzed]
**Boundaries:** [Start] to [End]
**Analysis date:** [Date]
**Team:** [Participants]

### FMEA Table

| # | Step | Failure Mode | Effect | S | Cause | O | Current Control | D | RPN | Priority |
|---|------|--------------|--------|---|-------|---|-----------------|---|-----|----------|
| 1 | [Step] | [Mode] | [Effect] | [1-10] | [Cause] | [1-10] | [Control] | [1-10] | [RPN] | [C/H/M/L] |
| 2 | | | | | | | | | | |
| ... | | | | | | | | | | |

### Priority Summary

**Critical (RPN > 200):** [n] failure modes
**High (RPN 100-200):** [n] failure modes
**Medium (RPN 50-100):** [n] failure modes
**Low (RPN < 50):** [n] failure modes

### Top Risks (Sorted by RPN)

1. **[Failure Mode 1]** — RPN: [value]
   - Effect: [What happens]
   - Root cause: [Why it happens]
   - Current gap: [Why not caught]

2. **[Failure Mode 2]** — RPN: [value]
   - Effect: [What happens]
   - Root cause: [Why it happens]
   - Current gap: [Why not caught]

### Action Plan

| Failure Mode | Current RPN | Action | Owner | Target Date | Target RPN |
|--------------|-------------|--------|-------|-------------|------------|
| [Mode 1] | [RPN] | [Action] | [Who] | [When] | [Target] |
| [Mode 2] | [RPN] | [Action] | [Who] | [When] | [Target] |

### Outcome Impact

| Failure Mode | CX | COST | EX |
|--------------|-----|------|-----|
| [Mode 1] | [impact] | [impact] | [impact] |
| [Mode 2] | [impact] | [impact] | [impact] |

**Total risk exposure:** [Sum of RPNs] → Target: [Reduced sum]

---

⚠️ **HYPOTHESIS NOTE:** FMEA identifies potential failures based on expert judgment. Validate occurrence and detection ratings with actual data where possible.
```

---

## Example: Contact Center Agent Desktop

```markdown
## FMEA: Agent Desktop System

| # | Component | Failure Mode | Effect | S | Cause | O | Control | D | RPN |
|---|-----------|--------------|--------|---|-------|---|---------|---|-----|
| 1 | CRM | Screen freeze | AHT increase | 6 | Memory leak | 7 | User reports | 8 | 336 |
| 2 | CTI | Pop-up delay | Greeting delay | 5 | Network latency | 6 | Log monitoring | 5 | 150 |
| 3 | KB | Search no results | Transfer/escalation | 7 | Index stale | 4 | Content audit | 6 | 168 |
| 4 | Script | Wrong display | Compliance risk | 9 | Version mismatch | 3 | QA review | 4 | 108 |
| 5 | Timer | Incorrect AHT | Reporting error | 5 | Clock sync | 2 | Audit reports | 7 | 70 |

**Top priority:** CRM screen freeze (RPN 336) — Implement memory management fix
```

---

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Inconsistent scoring | Calibrate with team before starting |
| Missing failure modes | Use diverse team, review historical incidents |
| Severity inflation | Focus on actual effect, not worst case |
| Ignoring detection | D score often most improvable dimension |
| One-time exercise | FMEA should be living document, updated regularly |
| Analysis without action | Always create action plan for high RPN items |
