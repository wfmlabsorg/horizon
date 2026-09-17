# Clocks Standard

**Purpose:** The three loops step by step, with the agent, the ledger written, and the gate at each step. The Coordinator runs these; no agent starts a step before the previous step's write is in the CHANGELOG.

---

## Daily (the core loop)

| Step | Agent | Reads | Writes | Stops if |
|------|-------|-------|--------|----------|
| 1 | DataEngineer | 01-source (new actuals), 01-definitions | 02-demand (new version), 04-supply (new version) | Sums do not reconcile; a metric lacks a definition |
| 2 | PostAnalyst | 02, 03 (yesterday's forecast), 04 | 03-forecast/variance (scored, decomposed), SPC flags | — |
| 3 | Scout | 05-events, the miss from step 2, external and internal sources | 05-events (matched, proposed with effect windows and grades) | — |
| 4 | CausalAnalyst | 06-questions (open XR rows), 02, 04, 05 | 06-questions (hypothesis tables updated where a test now has data) | — |
| 5 | Forecaster | 02, 03, 04, 05, 06 | 03-forecast (proposed reforecast, new version, assumption register) | — |
| 6 | Evaluator | Everything written in steps 1–5 | run log: PASS or BLOCK with reasons | **BLOCK → back to the failing step** |
| 7 | **Planner gate** | The proposed reforecast and the Evaluator's pass | CHANGELOG: approved / changed / rejected | **Rejected → Forecaster** |
| 8 | Reporter | Everything approved | 08-reports (daily note, answer-first) | — |
| 9 | Adapters | 03-forecast (approved version) | 03-forecast/iex/ (forecast CSV in IEX shape) | — |

## Weekly

| Step | Agent | Writes |
|------|-------|--------|
| 1 | PostAnalyst | Variance review across the week: what the misses had in common |
| 2 | Forecaster | Assumption register refresh: each assumption re-graded, carried ones relabeled |
| 3 | Librarian | Backlog of open questions with staleness flags (days since last evidence) |
| 4 | Reporter | Register report in answer-first form |
| 5 | Evaluator | PASS or BLOCK |
| 6 | **Planner review** | Which assumptions to refresh; which questions to close, escalate or re-prioritize |

## Monthly

| Step | Agent | Writes |
|------|-------|--------|
| 1 | Forecaster | Mid-term (3–18 mo, weekly) and long-term (AOP, monthly) reforecast, assumption register |
| 2 | CapacityPlanner | Requirement hours → FTE → roster shape → gap, by channel; scenario pack |
| 3 | Evaluator | PASS or BLOCK |
| 4 | **Planner sign-off** | Signature recorded in CHANGELOG |
| 5 | Adapters | 07-plans/anaplan/ (monthly plan export in Anaplan shape) |
| 6 | Coordinator | Learnings to MEMORY; stats updated |

## Ad hoc (the intake door)

Not a clock. See INTAKE-DOOR.md. A performance question has its own 48-hour readout date, which the Coordinator tracks in the backlog.

---

## Run Log

Every clock run writes `books/<client>/08-reports/runs/YYYY-MM-DD-<clock>.md` with one line per step: agent, started, finished, wrote, PASS/BLOCK, gate verdict.
