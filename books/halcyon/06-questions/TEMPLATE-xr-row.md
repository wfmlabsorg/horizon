# XR row template

Fill every field. `open` is a legal value only where the rules say so. Then append the row to
`register.md` and a change-log line, and open `hypotheses/XR-###-hypotheses.md` if the route
is performance-question.

```
ID:                      XR-###            (next free number; never reused)
Title:                   <one sentence that answers the question; a reader with no context could act on it>
Description:             <2–4 sentences: what, since when, where, to whom>
Opened:                  YYYY-MM-DD        (date it entered; never changes)
Sev:                     1 | 2 | 3 | 4     (register owner only; a proposal goes in Notes)
Status:                  New               (until Sev is set)
Trend:                   Improving | Stable | Worsening
Business risk:           <what is exposed and by how much, with unit and period> [M|C|E|A]
Decision needed:         No | Yes — <the decision in one sentence>; by YYYY-MM-DD; decider <name>
Owner:                   <one name or role; never a team>
Line of sight:           <one or two names>
Expected close:          YYYY-MM-DD · firm | likely | indicative · assuming <assumption>
Next action:             <step> — <who> — YYYY-MM-DD
Last update:             YYYY-MM-DD · <sender> · email | chat | meeting | ledger | agent
Grade:                   A                 (email default; rises only with a measure or artifact named)
Source:                  <thread subject and date, message id, or ledger file>
Would change the answer: <one observation with its threshold>   (required Sev 1–2; `open` allowed Sev 3–4)
Hypotheses:              hypotheses/XR-###-hypotheses.md | none
Route:                   performance-question | planning-request | data-pull | event
Notes:                   <sender Sev proposal; SLIP×n; artifact that would raise the grade; precedence overrides>
```

Change-log line: `| YYYY-MM-DD | XR-### | opened | — | Sev n proposed, Status New | <source> | agent:Librarian |`
