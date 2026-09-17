# Ledgers Standard

**Purpose:** Every planning object is a versioned file with a change log and a definitions block. Nothing is overwritten.

---

## Three Lifecycles

| Lifecycle | Behavior | Lives in |
|-----------|----------|----------|
| **Ledger** | Append only. A re-pull is a new version. Old versions stay. | 01-definitions, 02-demand, 04-supply, 05-events, 06-questions, 03-forecast (versions) |
| **Dispatch** | Derived from ledgers; regenerated, never edited by hand | 08-reports, 03-forecast/iex/, 07-plans/anaplan/ |
| **Archive** | Frozen at a date | Signed plans in 07-plans, superseded forecast versions |

---

## File Shape

Ledgers are CSV or JSON with a markdown header. Reports are markdown.

```
---
ledger: demand
book: halcyon
version: 2026-03-14.v2
supersedes: 2026-03-14.v1
written_by: DataEngineer
reason: re-pull after Beacon export corrected abandoned counts
definitions:
  offered: 01-definitions/offered.md@v3
  handled: 01-definitions/handled.md@v2
  aht: 01-definitions/aht.md@v4
---
date,channel,cohort,offered,handled,abandoned,aht_s,sl_pct,asa_s
...
```

---

## Versioning Rules

- Version = `YYYY-MM-DD.vN` where the date is the data date and N increments per re-pull
- `supersedes` names the previous version; the previous version is never deleted
- Every version's header names the definition file and version for each metric it carries
- A definition change bumps the definition file's version and is recorded in its change history; ledgers written before the change keep citing the old version

---

## CHANGELOG.md

One line per write, newest first:

```
| Date | Time | Ledger | Version | By | Why |
```

`By` is an agent name or a planner's initials. A planner gate verdict is a CHANGELOG line.

---

## Never

- Edit `01-source/` (read only, never committed)
- Overwrite a ledger version
- Write a number without a definition citation
- Regenerate a dispatch by hand
