# MEMORY System
## HORIZON's Persistent Learning Architecture

*What the clocks teach, kept where the next run finds it.*

---

## Architecture

```
MEMORY/
├── Learning/       # SYNTHESIS (Warm) - Learnings by clock and by Algorithm phase
├── Signals/        # Pattern detection - failures, loopbacks, patterns, ratings
└── State/          # Operational counters - sessions, runs, questions answered
```

The books themselves are not memory. Each book's `06-questions/` register is its own knowledge
base and its `CHANGELOG.md` is its own history. MEMORY holds what transfers *between* books and
between runs: the method lessons, the recurring failure shapes, the counters.

---

## Learning/ — SYNTHESIS (Warm)

Curated learnings. Raw experience turned into something the next run can apply.

**Structure:**
```
Learning/
├── daily/        # What the daily loop taught (reconcile → score → match → reforecast → gate → publish)
├── weekly/       # What the weekly review taught (assumption refresh, register report, staleness)
├── monthly/      # What the monthly cycle taught (capacity plan, scenarios, sign-off)
├── intake/       # What the intake door taught (classification, the six fields, misrouted asks)
├── evaluator/    # What the Evaluator caught (unlabeled carried assumptions, rung breaches, missing grades)
└── ALGORITHM/    # Process-level learnings about The Algorithm itself
```

**Each learning file contains:**
- What happened (book, clock, date)
- What was learned
- How to apply it
- When it applies (which clock, which agent)

**Rule:** a learning that names a specific number carries that number's grade. A learning that
names a method change says which agent file or context standard it changed.

---

## Signals/ — Pattern Detection

| File | Records |
|------|---------|
| `failures.jsonl` | Things that did not work: a blocked reforecast, a definition mismatch, a reconciliation that would not close |
| `loopbacks.jsonl` | Repeated mistakes: the same Evaluator block twice, the same carried assumption relabeled twice |
| `patterns.jsonl` | Detected planning patterns: a miss shape that recurs, an event type that keeps needing a wider window |
| `ratings.jsonl` | Planner ratings of daily notes, answer cards and plans (the human gate's verdicts) |

One JSON object per line. Every line carries `date`, `book`, `clock`, `agent`, and a one-sentence
`what`.

---

## State/ — Counters

`stats.json`: `sessions`, `daily_runs`, `weekly_runs`, `monthly_runs`, `questions_answered`.
Maintained by the session hook and the Coordinator. Never hand-edited.

---

## Usage Patterns

### After a daily run
```
1. Coordinator reads the run log
2. Anything the Evaluator blocked → Signals/failures.jsonl
3. Anything blocked for the second time → Signals/loopbacks.jsonl
4. Planner verdict at the gate → Signals/ratings.jsonl
```

### After a weekly review
```
1. Extract at least one learning (what the week's misses had in common)
2. Write to Learning/weekly/
3. If a method changed, say which agent or standard it changed
```

### After a monthly sign-off
```
1. Extract learnings across the month by clock
2. Write to Learning/monthly/ and Learning/ALGORITHM/
3. Update State/stats.json
```

### Before any run
```
1. Check Learning/<clock>/ for lessons that apply
2. Check Signals/loopbacks.jsonl for mistakes about to be made a third time
```

---

*The goal: every run makes the next one better, and no lesson lives only in a chat.*
