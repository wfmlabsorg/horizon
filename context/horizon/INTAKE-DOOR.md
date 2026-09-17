# Intake Door Standard

**Purpose:** Anything that arrives by email or ask goes to the Librarian and is classified before it is worked. The classification decides the route; the route decides the clock.

---

## The Six Fields

Every ask is reduced to these before routing. The Librarian fills what the ask states and asks the requester for the rest.

| # | Field | If missing |
|---|-------|------------|
| 1 | The question in one sentence | Ask back; do not guess |
| 2 | The decision it feeds | **If the requester cannot state it, it is a data pull** |
| 3 | Who decides | Ask back |
| 4 | When it is needed | Default: 48 hours for a performance question; next monthly clock for a planning request |
| 5 | What data exists | Librarian checks the book's ledgers and says what is there |
| 6 | What done looks like | Default: an answer card in answer-first shape |

---

## The Four Routes

| Route | Signal | Goes to | Ledger | Clock |
|-------|--------|---------|--------|-------|
| **Planning request** | "How many / when / what if" about future staffing | CapacityPlanner (Forecaster if it is only a forecast) | 07-plans (03-forecast) | Monthly, or ad hoc scenario |
| **Performance question** | "Why did X happen" with a decision behind it | XR row opened in 06-questions; CausalAnalyst; 48-hour readout | 06-questions | Ad hoc, readout in 48h |
| **Data pull** | A number wanted, no decision stated | Definitions ledger check, then the queue | 01-definitions | Weekly backlog |
| **Event** | Something happened or will happen with an effect window | Scout | 05-events | Daily |

---

## What the Librarian Does on Every Arrival

1. Log the arrival in `06-questions/INTAKE-LOG.md` with the six fields as filled
2. **Pin the definitions** the ask depends on: for each metric named, cite the file in `01-definitions/`. If a metric has no definition, or two, that is the first finding.
3. Route per the table
4. If it is a performance question, open the XR row with an empty hypothesis table and the 48-hour readout date
5. Record the write in `CHANGELOG.md`

---

## Intake Row Format

```markdown
| Date | ID | Question (one sentence) | Decision | Decider | Needed by | Data exists | Done looks like | Route | Definitions pinned |
```
