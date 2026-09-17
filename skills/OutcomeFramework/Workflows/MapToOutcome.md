# MapToOutcome Workflow

Classify factors, findings, or metrics to their outcome domain(s).

---

## Purpose

When analyzing data or generating insights, map each factor to the Outcome Triangle. This ensures all work connects to CX, COST, or EX.

---

## Quick Classification

### Step 1: Identify the Factor

What are you classifying?
- A metric (e.g., AHT, FCR)
- A finding (e.g., "high absenteeism correlates with quality drops")
- An intervention (e.g., "implement new scheduling tool")
- A root cause (e.g., "outdated desktop systems")

### Step 2: Apply Decision Tree

```
┌─ Does it directly affect customer experience?
│  └─ Yes → Primary: CX
│  └─ No ↓
│
├─ Does it directly affect operational cost/efficiency?
│  └─ Yes → Primary: COST
│  └─ No ↓
│
├─ Does it directly affect agent wellbeing/retention?
│  └─ Yes → Primary: EX
│  └─ No → Mixed/Context-dependent
│
└─ Identify secondary effects:
   ├─ Creates wait time? → Secondary: CX
   ├─ Affects staffing needs? → Secondary: COST
   └─ Creates stress/pressure? → Secondary: EX
```

### Step 3: Check Reference Table

Consult `Context/FactorMapping.md` for pre-classified factors.

### Step 4: Document Classification

```markdown
## Factor Classification

**Factor:** [Name]
**Primary Domain:** [CX/COST/EX]
**Secondary Domain(s):** [If applicable]
**Direction:** [Positive/Negative effect on domain]
**Mechanism:** [How does it affect the domain?]
**Confidence:** [High/Medium/Low]
```

---

## Classification Examples

### Example 1: Simple Metric

**Factor:** Service Level (% calls answered in 20 seconds)

| Attribute | Value |
|-----------|-------|
| Primary | CX |
| Secondary | COST (staffing), EX (pressure) |
| Direction | Higher SL = Better CX, Higher COST, Variable EX |
| Mechanism | Direct customer wait experience |
| Confidence | High |

### Example 2: Operational Finding

**Factor:** "Agents spending 40% of time on hold waiting for systems"

| Attribute | Value |
|-----------|-------|
| Primary | COST (wasted productive time) |
| Secondary | CX (longer handle time), EX (frustration) |
| Direction | Negative for all domains |
| Mechanism | System inefficiency driving AHT and frustration |
| Confidence | High |

### Example 3: Proposed Intervention

**Factor:** "Implement agent empowerment program"

| Attribute | Value |
|-----------|-------|
| Primary | EX (autonomy, satisfaction) |
| Secondary | CX (better resolution), COST (variable) |
| Direction | Positive EX, Positive CX, Uncertain COST |
| Mechanism | Agent authority to resolve issues without escalation |
| Confidence | Medium |

---

## Handling Ambiguous Cases

### When Primary is Unclear

If a factor affects multiple domains roughly equally:
1. Consider the **immediate** effect vs downstream effects
2. Ask: "If I had to optimize ONE thing, which domain moves first?"
3. Document the ambiguity

### When Direction is Context-Dependent

Some factors change meaning based on context:

| Factor | Context A | Context B |
|--------|-----------|-----------|
| AHT reduction | Via efficiency tools → Positive | Via pressure → Negative |
| Overtime | Voluntary → EX neutral | Mandatory → EX negative |
| Occupancy | 80% → Healthy | 95% → EX risk |

Always document the context that determines direction.

### When Confidence is Low

If you're uncertain about classification:
1. State the uncertainty explicitly
2. List competing hypotheses
3. Identify what data would resolve ambiguity
4. Use "provisional" classification pending validation

---

## Batch Classification Template

When classifying multiple factors at once:

```markdown
## Factor Classification Summary

| Factor | Primary | Secondary | Direction | Confidence |
|--------|---------|-----------|-----------|------------|
| AHT | COST | CX, EX | Context | High |
| CSAT | CX | — | Positive | High |
| Turnover | EX | COST, CX | Negative | High |
| ... | ... | ... | ... | ... |
```

---

## Integration Points

After classifying factors:
- **For analysis:** Group findings by outcome domain
- **For recommendations:** Ensure balanced coverage of all three domains
- **For reporting:** Use outcome framing in executive summaries
- **For Shapley decomposition:** Tag variables with outcome domain
