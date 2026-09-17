# 5 Why Analysis Workflow

Drill down through causal chains to identify root causes.

---

## Prerequisites

- [ ] Specific problem or incident defined
- [ ] Domain expert available for each "Why" answer
- [ ] Data sources identified for evidence

---

## Workflow Steps

### Step 1: Define the Problem Statement

**Format:**
```
On [date/period], [what happened] causing [impact].
```

**Example:**
```
On January 15th, abandonment rate spiked to 12% (vs 4% target),
causing 450 lost customer interactions.
```

**Checklist:**
- [ ] Problem is specific (not general performance issue)
- [ ] Problem is observable (happened or is happening)
- [ ] Impact is quantified

---

### Step 2: Ask "Why?" Iteratively

**For each level:**
1. State the problem/previous answer
2. Ask "Why did this happen?"
3. Require evidence or acknowledge gap
4. Continue until reaching actionable root cause

**Rules:**
- Each answer must be factual, not speculation
- Mark "Evidence: [source]" or "Evidence: NEEDS VALIDATION"
- Stop when you reach something within your control
- Branch if multiple valid answers exist

---

### Step 3: Document the Chain

**Template:**

```markdown
## 5 Why Analysis: [Problem Statement]

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Problem | What happened? | [Initial problem] | [Data source] |
| Why 1 | Why [problem]? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 2 | Why [answer 1]? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 3 | Why [answer 2]? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 4 | Why [answer 3]? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 5 | Why [answer 4]? | **[Root Cause]** | [Data source or "NEEDS VALIDATION"] |
```

---

### Step 4: Verify Root Cause

**Root cause checklist:**
- [ ] Is this within our control to address?
- [ ] Would fixing this prevent recurrence?
- [ ] Is there evidence supporting this as the cause?
- [ ] Does this pass the "Therefore" test (reading chain backwards)?

**"Therefore" test example:**
```
Root cause: Training didn't cover new system
Therefore → Agents didn't know how to use new workflow
Therefore → Agents took longer to handle calls
Therefore → Queue backed up
Therefore → Customers waited longer
Therefore → Abandonment rate spiked
✓ Chain is logical
```

---

### Step 5: Handle Branching

When multiple valid answers exist at any level:

```markdown
### Why 2: Why were agents unavailable?

**Branch A:** High unplanned absences (8% vs 3% norm)
  → Why 3A: Flu outbreak in team
  → Why 4A: No contingency staffing plan

**Branch B:** Longer handle times than forecasted
  → Why 3B: New system slowed agents down
  → Why 4B: Training didn't cover new workflow
```

**Prioritize branches by:**
- Impact magnitude
- Controllability
- Evidence strength

---

### Step 6: Link to Outcomes

**Map root cause to CX/COST/EX:**

| Root Cause | Outcome Impact | Mechanism |
|------------|----------------|-----------|
| No contingency plan | COST (overtime) | Emergency overstaffing |
| No contingency plan | CX (abandons) | Customer loss |
| Training gap | EX (stress) | Agent frustration with new system |

---

### Step 7: Define Countermeasures

**For validated root causes only:**

```markdown
### Countermeasure Plan

**Root Cause:** [Validated root cause]

**Short-term fix:**
- Action: [What to do immediately]
- Owner: [Who]
- Target: [When]

**Long-term prevention:**
- Action: [Systemic change]
- Owner: [Who]
- Target: [When]

**Verification:**
- Metric: [How to measure success]
- Target: [What success looks like]
- Review: [When to check]
```

---

## Output Template

```markdown
## 5 Why Analysis: [Problem Statement]

### Problem Definition
**What happened:** [Description]
**When:** [Date/period]
**Impact:** [Quantified impact]
**Outcome domain:** [CX/COST/EX]

### Causal Chain

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Problem | What happened? | [Initial problem] | [Source] |
| Why 1 | Why [problem]? | [Answer] | [Source] |
| Why 2 | Why [answer 1]? | [Answer] | [Source] |
| Why 3 | Why [answer 2]? | [Answer] | [Source] |
| Why 4 | Why [answer 3]? | [Answer] | [Source] |
| Why 5 | Why [answer 4]? | **[Root Cause]** | [Source] |

### "Therefore" Verification
[Read chain backwards to verify logic]

### Root Cause Statement
**[Root cause in one sentence]**

### Validation Status

| Evidence Point | Status | Source |
|----------------|--------|--------|
| [Link in chain] | ✓ Validated / ⚠️ Assumed / ❌ Unverified | [Source] |
| ... | | |

### Validation Checklist

- [ ] Does addressing root cause prevent recurrence?
- [ ] Is root cause within our control?
- [ ] Do we have evidence supporting each "because"?
- [ ] Have we validated with data (StatisticalAnalysis)?
- [ ] Have we confirmed causation (CausalInference)?

### Outcome Linkage

**Root cause impacts:**
- **CX:** [Impact description]
- **COST:** [Impact description]
- **EX:** [Impact description]

---

⚠️ **HYPOTHESIS NOTE:** This causal chain represents a hypothesis. Each link should be validated with data before implementing countermeasures. Use StatisticalAnalysis to test correlations, CausalInference to confirm causation.
```

---

## Example: Complete 5 Why

```markdown
## 5 Why Analysis: January 15th Abandonment Spike

### Problem Definition
**What happened:** Abandonment rate hit 12% (vs 4% target)
**When:** January 15, 2026, 10am-2pm
**Impact:** 450 lost interactions, estimated $22,500 revenue risk
**Outcome domain:** CX (primary), COST (secondary)

### Causal Chain

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Problem | What happened? | Abandonment spiked to 12% | Real-time dashboard |
| Why 1 | Why did customers abandon? | Wait times exceeded 8 minutes | Queue reports |
| Why 2 | Why were wait times high? | Not enough agents available | Staffing report |
| Why 3 | Why weren't agents available? | 6 unplanned absences (8% rate) | Attendance system |
| Why 4 | Why so many absences? | Flu outbreak in Tier 1 team | HR sick call log |
| Why 5 | Why no coverage? | **No contingency staffing plan** | Policy gap (confirmed) |

### "Therefore" Verification
No contingency plan → No backup when flu hit → 6 agents out →
Wait times soared → Customers abandoned ✓

### Root Cause Statement
**Lack of contingency staffing protocol to handle unplanned absence spikes**

### Countermeasure

**Short-term:** Cross-train 5 Tier 2 agents for Tier 1 backup (Owner: Training, Due: Feb 1)
**Long-term:** Create absence contingency playbook with triggers (Owner: WFM, Due: Mar 1)
**Verification:** Next flu-level event maintains <6% abandonment
```

---

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Stopping too early | Keep asking until you reach something controllable |
| Accepting assumptions | Mark every answer with evidence status |
| Single path bias | Consider branching when multiple valid answers exist |
| Blame focus | Ask "Why did the system allow this?" not "Who messed up?" |
| Skipping validation | Never implement fixes for unvalidated root causes |
| Jumping to solutions | Complete the chain before discussing countermeasures |
