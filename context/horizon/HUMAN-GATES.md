# Human Gate Standard

**Purpose:** Define where a planner must engage. Agents propose; planners approve. This is not optional and it is not a formality: the gate is where the planner's knowledge of the client enters the record.

---

## Core Principle

Agents work autonomously within a clock step. Humans gate anything that changes a plan.

---

## Gate Types

| Type | Description | Blocking |
|------|-------------|----------|
| **Approval** | Planner must approve to proceed | Yes — work stops |
| **Review** | Planner reviews, can request changes | Yes — but can delegate |
| **Notification** | Planner informed, no action required | No — work continues |

---

## Mandatory Gates

| Trigger | Gate | What the planner does |
|---------|------|-----------------------|
| Daily reforecast proposed | **Approval** | Approve, change or reject; verdict to CHANGELOG |
| Capacity plan proposed | **Approval (sign-off)** | Sign, or return with reasons |
| Severity change on an open question | **Approval** | Confirm the severity |
| Publication of any report outside the planning team | **Approval** | Approve the send |
| Weekly register report | **Review** | Close, escalate or re-prioritize open questions |
| New event proposed by Scout with grade [A] | **Review** | Confirm or reject the event |
| Definition change proposed by Librarian | **Approval** | Approve the new definition version |
| Evaluator BLOCK on the same step twice | **Notification** | Informed; may intervene |
| Reconciliation will not close | **Notification** | Informed; may escalate to the source owner |

---

## Gate Request Format

```markdown
## Gate Request

**Book:** <client>
**Clock:** daily | weekly | monthly | intake
**Date:** <date>
**Type:** Approval | Review | Notification
**Requested by:** <agent>

### What is proposed
<one paragraph; every number graded>

### What changed since the last approved version
<bullets>

### Evaluator verdict
PASS — <date, run log line>

### Decision requested
<one line>

### If no decision by
<date> → <what happens: carry the prior version, hold the note, etc.>
```

---

## Verdict Format (CHANGELOG line)

```
| 2026-03-15 | 08:40 | 03-forecast | 2026-03-15.v1 | planner:JR | approved daily reforecast; changed chat AHT assumption from 280s [E] to 300s [E] per vendor call |
```
