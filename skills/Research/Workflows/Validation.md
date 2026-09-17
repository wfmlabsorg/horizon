# Research Validation Workflow

## Purpose
Check each objective against findings, determine coverage, present to user.

## Trigger
- After Synthesis completion
- User says "research validate" or "check objectives"

## Process

### Step 1: Spawn GapAnalyzer
Via Agents skill, dispatch GapAnalyzer with:
- Original objectives from brief
- Synthesized findings
- Source inventory

### Step 2: Assess Each Objective
For each objective, determine:
- **Coverage %:** How much of the question is answered?
- **Rating:** Met (90%+), Partial (70-89%), Gap (50-69%), Major Gap (<50%)
- **Confidence:** High/Medium/Low based on source quality
- **Evidence:** Which sources contributed?

### Step 3: Generate Validation Report
Create `validation.md` with:
- Overall coverage score
- Per-objective assessment
- Gaps identified
- Recommended next steps

### Step 4: Present to User
Show validation summary:
```
## Research Validation Summary

**Overall Coverage:** X%

| Objective | Coverage | Status |
|-----------|----------|--------|
| 1. [Title] | X% | ✅ Met |
| 2. [Title] | X% | 🟡 Partial |
| 3. [Title] | X% | 🔴 Gap |

**Gaps Requiring Attention:**
- Objective 3: [Specific missing info]

**Recommendation:** [Proceed to output / Additional research needed]
```

### Step 5: User Decision Point
Ask user:
- "Are you satisfied with this coverage?"
- "Should we proceed to final output?"
- "Or would you like to add sources and continue research?"

## Output
- `validation.md`
- Project status: Validating → Complete OR → Iterating

## Next
- If satisfied → Proceed to Output (compile)
- If gaps → Proceed to Iteration workflow
