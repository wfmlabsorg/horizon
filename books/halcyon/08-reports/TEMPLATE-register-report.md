# Register report — Halcyon — YYYY-MM-DD

Register as of: YYYY-MM-DD · Previous report: YYYY-MM-DD · Open: Sev1 n · Sev2 n · Sev3 n · Sev4 n
Derived from `06-questions/register.md` and its change log only. Issued by agent:Reporter;
publication gate: human:<role> | not needed.

<If Sev 1–2 open items exceed ten, this is the first line: "The register holds n Sev 1–2
items; the report cannot fit two pages until that is reduced.">

## 1. Front sheet

One line per open Sev 1 and Sev 2 item. Order: Sev, then Trend (Worsening first), then age
(oldest first). Nothing else on this page.

```
XR-###  Sev n  Trend      <Title sentence>  [Grade]  Close DD Mon confidence  DECISION by DD Mon
```

## 2. What changed since YYYY-MM-DD

Grouped, one line each with from → to: Opened · Closed · Re-rated · Trend moved · Expected
close moved · Owner changed. From the change log, rows dated after the previous report. If the
change log is missing or truncated, say so and fall back to rows whose last update is after
the previous report date.

## 3. Decisions requested

Items with Decision needed = Yes, in date order.

| XR | decision (one sentence) | by | if not taken by then (from Business risk) | who acts |
|---|---|---|---|---|

## 4. Item cards (Sev 1 and 2)

```
XR-### — <Title sentence>  [Grade]
Sev n · <Status> · <Trend> · opened DD Mon · last update DD Mon (<channel>, <sender>)
What:        <Description, verbatim>
At risk:     <Business risk> [grade]
Owner:       <name>          Line of sight: <name(s)>
Close:       <date> <confidence> — assuming <assumption>
Next:        <action> — <name> — <date>
Would change the answer:  <verbatim; if `open`, derive from risk + next action, mark [inferred], raise>
Hypotheses:  <leading H-### and status, or none>
Notes:       <SLIP×n, Sev proposals pending, artifact that would raise the grade>
```

## 5. Stale items

Every item whose last update is older than its severity's limit (2/5/10/30 business days).
Appears even when empty, with "none".

| XR | Sev | days since update | line-of-sight contact to ask |
|---|---|---|---|

## 6. Watch list (Sev 3 and 4)

| XR | Sev | Status | Title | last update |
|---|---|---|---|---|

---

### Sev 1 flash (issued on any Sev 1 change, outside the weekly cycle)

```
XR-### — <Title sentence> [Grade]
Changed: <what, with the supporting quote or ledger row>
Next:    <action> — <name> — <date>
```
