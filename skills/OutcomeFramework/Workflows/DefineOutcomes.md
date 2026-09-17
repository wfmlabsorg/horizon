# DefineOutcomes Workflow

Set up the outcome framework for a new contact center engagement.

---

## Purpose

Establish the outcome taxonomy and success criteria at the start of an engagement. This ensures all subsequent analysis maps to the Outcome Triangle.

---

## Steps

### 1. Understand Engagement Scope

Ask or determine:
- What is the primary business objective?
- Which outcome domain is the client most focused on? (CX, COST, or EX)
- Are there explicit constraints on any domain?
- What metrics are currently tracked?

### 2. Map Available Metrics

Create a table of metrics the client tracks:

```markdown
| Metric | Available | Quality | Domain |
|--------|-----------|---------|--------|
| AHT | Yes | High | COST |
| CSAT | Yes | Medium | CX |
| Turnover | Yes | High | EX |
| FCR | No | — | CX |
```

### 3. Identify Measurement Gaps

Compare available metrics against `Context/OutcomeDefinitions.md`:
- Which domains are well-measured?
- Which domains lack visibility?
- What proxies exist for unmeasured outcomes?

### 4. Define Success Criteria

For each domain, establish:

```markdown
## Engagement Success Criteria

### CX Outcomes
- Primary metric: [e.g., CSAT]
- Target: [e.g., +5 points]
- Constraint: [e.g., SL cannot drop below 75%]

### COST Outcomes
- Primary metric: [e.g., Cost per Contact]
- Target: [e.g., -10%]
- Constraint: [e.g., No FTE reductions in Q1]

### EX Outcomes
- Primary metric: [e.g., Turnover]
- Target: [e.g., -15% annually]
- Constraint: [e.g., Maintain current schedule flexibility]
```

### 5. Document Tradeoff Boundaries

Explicitly state which tradeoffs are acceptable:

```markdown
## Tradeoff Boundaries

| If we improve... | We accept impact on... | Limit |
|------------------|------------------------|-------|
| COST | CX | SL no lower than 70% |
| CX | COST | Max 5% cost increase |
| EX | COST | ROI within 12 months |
```

---

## Output Template

```markdown
# Outcome Framework: [Client/Engagement Name]

## Engagement Objective
[One sentence describing the primary goal]

## Outcome Priorities
1. [Primary domain]
2. [Secondary domain]
3. [Tertiary domain]

## Metrics Inventory

| Metric | Domain | Available | Quality | Target |
|--------|--------|-----------|---------|--------|
| ... | ... | ... | ... | ... |

## Measurement Gaps
- [Domain]: [Gap description]

## Tradeoff Boundaries
| Improving | May impact | Limit |
|-----------|------------|-------|
| ... | ... | ... |

## Success Definition
[What does success look like at engagement close?]
```

---

## Integration

After completing this workflow:
1. Save output to project `02-working/` folder
2. Reference this document in all subsequent analysis
3. Use MapToOutcome workflow to classify findings
4. Use OutcomeScorecard to track progress
