# The Algorithm
## PAI's Universal Problem-Solving Framework

*Current State → Ideal State via Verifiable Iteration*

---

## The Core Insight

All progress — personal, professional, civilizational — follows the same pattern:

```
┌─────────────────┐                      ┌─────────────────┐
│  CURRENT STATE  │ ════════════════════>│   IDEAL STATE   │
│  (Where I am)   │    via iteration     │ (Where I want)  │
└─────────────────┘                      └─────────────────┘
```

This pattern works at every scale:

| Scale | Current State | Ideal State |
|-------|---------------|-------------|
| Micro | Wrong word | Correct word |
| Task | Bug in code | Working feature |
| Project | Idea | Shipped product |
| Career | Analyst | Head of Planning |
| Life | Where you are | Best version of yourself |

**The pattern doesn't change. Only the scale does.**

---

## The Two Loops

### Outer Loop: What You're Pursuing

```
CURRENT ════════════════════════════════════> IDEAL
         Gap = what needs to change
```

Before doing anything:
1. **Define current state clearly** — Where am I actually?
2. **Define ideal state specifically** — Where do I want to be?
3. **Identify the gap** — What needs to change?

### Inner Loop: How You Pursue It

The scientific method — the most reliable process for making progress:

```
    ┌──────────────────────────────────────────────────────┐
    │                                                      │
    ▼                                                      │
OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN ─┘
                                              │
                                              ▼
                                         [Complete]
```

---

## The Seven Phases

### 1. OBSERVE
**Purpose:** Gather context. Understand where you actually are.

**Actions:**
- Look around. What's the actual situation?
- Gather relevant information
- Check existing work, history, learnings
- Identify constraints and resources

**Questions:**
- What do I actually know vs. assume?
- What information am I missing?
- What has been tried before?

**Output:** Clear understanding of current state

---

### 2. THINK
**Purpose:** Generate ideas. What might work?

**Actions:**
- Brainstorm options (diverge)
- Consider multiple approaches
- Apply relevant mental models
- Generate hypotheses

**Questions:**
- What are all the ways this could be solved?
- What would an expert do?
- What's the unconventional approach?

**Output:** Multiple candidate approaches

---

### 3. PLAN
**Purpose:** Pick an approach. Design the experiment.

**Actions:**
- Evaluate options against constraints
- Select the most promising approach
- Sequence the work
- Identify dependencies and risks

**Questions:**
- Which option has the best effort/impact ratio?
- What's the minimum viable first step?
- What could go wrong?

**Output:** Selected approach with sequenced steps

---

### 4. BUILD
**Purpose:** Define success criteria. How will you know if it worked?

**Actions:**
- Define what "done" looks like
- Create measurable success criteria
- Specify verification methods
- Document expected outcomes

**Questions:**
- What specifically indicates success?
- How will I measure it?
- What's the minimum bar for "good enough"?

**Critical:** This phase happens BEFORE execution, not after.

**Output:** Clear, measurable success criteria

---

### 5. EXECUTE
**Purpose:** Do the work. Run the plan.

**Actions:**
- Implement the plan
- Track progress
- Note deviations and surprises
- Adapt if necessary (but track why)

**Questions:**
- Am I following the plan?
- What's different than expected?
- Should I continue or pivot?

**Output:** Completed work

---

### 6. VERIFY
**Purpose:** Check results against criteria. Did it work?

**Actions:**
- Test against success criteria defined in BUILD
- Measure actual outcomes
- Compare expected vs. actual
- Be honest about results

**Questions:**
- Did it meet the success criteria?
- What worked? What didn't?
- Is this "done" or does it need iteration?

**Critical:** Most people skip this phase. Don't.

**Output:** Verified result (pass/fail/partial)

---

### 7. LEARN
**Purpose:** Harvest insights. Iterate or complete.

**Actions:**
- Extract learnings regardless of outcome
- Categorize by phase (what failed in PLAN? EXECUTE?)
- Document for future reference
- Decide: iterate or complete?

**Questions:**
- What did I learn?
- What would I do differently?
- Should this go in MEMORY/Learning/?

**Output:** Captured learnings + decision to iterate or complete

---

## Verifiability: The Critical Element

**The Algorithm's power comes from verification.**

Most people:
1. Have vague goals
2. Do stuff
3. Sort of check if it worked
4. Move on

The Algorithm requires:
1. **Specific success criteria** (BUILD phase)
2. **Honest verification** (VERIFY phase)
3. **Learning extraction** (LEARN phase)

**If you can't tell whether you succeeded, you can't improve.**

---

## Practical Application

### Starting Any Task

```markdown
## OBSERVE: Current State
- [What is the situation?]
- [What do I know?]
- [What constraints exist?]

## THINK: Options
- Option A: [description]
- Option B: [description]
- Option C: [description]

## PLAN: Selected Approach
- [Which option and why]
- Step 1: [action]
- Step 2: [action]

## BUILD: Success Criteria
- [ ] [Specific, measurable criterion]
- [ ] [Specific, measurable criterion]

## EXECUTE
[Do the work, track progress]

## VERIFY
- [Criterion 1]: Pass/Fail
- [Criterion 2]: Pass/Fail

## LEARN
- [What worked]
- [What didn't]
- [What to do differently]
```

### Quick Version (For Small Tasks)

```
Current: [state]
Ideal: [state]
Success = [criteria]
Plan: [steps]
Result: [pass/fail]
Learning: [insight]
```

---

## Integration with MEMORY

After completing work:
1. Extract learnings from LEARN phase
2. Categorize by which phase the learning applies to
3. Write to `~/pai/MEMORY/Learning/[PHASE]/`
4. If failure, log to `~/pai/MEMORY/Signals/failures.jsonl`

Before starting similar work:
1. Check `~/pai/MEMORY/Learning/` for relevant phase learnings
2. Check `~/pai/MEMORY/Signals/` for patterns to avoid
3. Apply learnings to current iteration

---

## When to Use Full Algorithm vs. Quick

**Full Algorithm (all 7 phases documented):**
- Novel problems
- High-stakes decisions
- Multi-step projects
- When you want to learn from the process

**Quick Version:**
- Routine tasks
- Small fixes
- Well-understood problems
- Time-critical situations

**Always do BUILD and VERIFY** — even for quick tasks, know what success looks like.

---

## Common Failure Modes

### Skipping OBSERVE
**Symptom:** Solving the wrong problem
**Fix:** Force yourself to state current situation before generating solutions

### Rushing THINK
**Symptom:** Only considering one approach
**Fix:** Generate at least 3 options before choosing

### Vague BUILD
**Symptom:** Can't tell if you succeeded
**Fix:** Write success criteria as checkboxes that are clearly pass/fail

### Skipping VERIFY
**Symptom:** "I think it worked" without checking
**Fix:** Actually test against your criteria

### Skipping LEARN
**Symptom:** Making the same mistakes repeatedly
**Fix:** Spend 2 minutes extracting insights after every task

---

## The Algorithm Applied to HORIZON's Objectives

### Objective 1: The Daily Loop

```
CURRENT: Actuals reconciled by hand in a spreadsheet, reforecast typed in, miss explained in a meeting
IDEAL: Actuals versioned, miss decomposed, reforecast proposed with its assumption register, planner approves

OBSERVE: Which ledgers changed overnight; which definitions they cite
THINK: Volume, handle time, mix or supply — which decomposition fits the miss
PLAN: DataEngineer → PostAnalyst → Scout → CausalAnalyst → Forecaster → Evaluator → gate → Reporter
BUILD: Success = a daily note in answer-first shape, every number graded, before the planner's first meeting
EXECUTE: Run the clock
VERIFY: Did the Evaluator pass? Did the planner approve without changes?
LEARN: Which assumption was carried unlabeled? Which step blocked twice?
```

### Objective 2: A Performance Question

```
CURRENT: "Why did service break on day 38?" answered from memory in a hallway
IDEAL: A graded answer card in the register within 48 hours, with what would change the answer

OBSERVE: The six intake fields; the definitions pinned; what is already in 05-events
THINK: Three hypotheses with tests, not one story
PLAN: Librarian opens the XR row → CausalAnalyst draws the DAG → tests run where data exists → Evaluator
BUILD: Success = a card whose title sentence carries a grade and whose residual is labeled
EXECUTE: Run the tests that have data; label the rest
VERIFY: Does the card say what would change the answer?
LEARN: Which confounder was missed on first draft?
```

---

*"The goal isn't prediction accuracy — it's decision quality under uncertainty."*

*The Algorithm is how you make good decisions systematically.*
