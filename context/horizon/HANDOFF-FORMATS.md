# Handoff Format Standard

**Purpose:** Every agent-to-agent handoff uses one shape, so the receiving agent knows what was written, at which version, with which grades, and what is being asked.

---

## The Shape

```markdown
## Handoff: <From> → <To>

**Book:** <client>
**Clock:** daily | weekly | monthly | intake
**Date:** <date>

### Written
| Ledger | Version | Rows / items | Definitions cited |
|--------|---------|--------------|-------------------|

### Key numbers
<each with grade and definition>

### Flags
- <anything the receiving agent must know: a reconciliation note, a definition conflict, a carried assumption>

### Request
<what the receiving agent is asked to do>

### Rung
<the highest rung any claim in this handoff makes>

---
**Handoff complete. Awaiting <To> acknowledgment.**
```

---

## Specific Handoffs

| From → To | Carries |
|-----------|---------|
| DataEngineer → PostAnalyst | New demand and supply versions; reconciliation status; definition citations |
| PostAnalyst → Scout | The miss by channel and interval; decomposition; SPC flags; Rung 1 only |
| PostAnalyst → CausalAnalyst | Drivers needing a causal test; correlation screens; Rung 1 only |
| Scout → CausalAnalyst | Events matched to the miss; proposed events with effect windows and grades |
| CausalAnalyst → Forecaster | Updated hypothesis tables; structural vs transitional tags; what would change the answer |
| Forecaster → Evaluator | Proposed reforecast version; assumption register with carried labels |
| Evaluator → Coordinator | PASS or BLOCK with the failing rule and the step to return to |
| Coordinator → Planner | Gate request (see HUMAN-GATES.md) |
| Planner → Reporter (via Coordinator) | Approved version; verdict line |
| Reporter → Adapters | Approved forecast or plan version to export |
| Librarian → any | Intake row; pinned definitions; route |
