# Signals

One JSON object per line. Fields: `date`, `book`, `clock` (daily | weekly | monthly | intake), `agent`, `what`, and for ratings `verdict` (approved | changed | blocked).

| File | Records |
|------|---------|
| `failures.jsonl` | Things that did not work |
| `loopbacks.jsonl` | Repeated mistakes |
| `patterns.jsonl` | Detected planning patterns |
| `ratings.jsonl` | Planner verdicts at the gate |
