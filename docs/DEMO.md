# Walking the room through HORIZON

Ten minutes, three browser tabs, no terminal. Everything below is a file in this repository; open it on GitHub and read the top of the page. Times are a guide.

## 0. Before you start (2 minutes, once)

Open these in tabs, in this order, and leave them open:

1. `README.md`
2. `books/halcyon/08-reports/daily/2026-07-22.md`
3. `books/halcyon/08-reports/daily/2026-09-02.md`
4. `books/halcyon/08-reports/daily/2026-09-14.md`
5. `books/halcyon/08-reports/register/2026-09-13.md`
6. `sim/GROUND-TRUTH.md`

## 1. What it is (2 minutes) — tab 1

Read the first paragraph and the three numbered items under "What It Does". Then scroll to the agent table. The sentence to say: *every planner runs a book in a spreadsheet; this is the same work done by specialist agents, with the planner approving instead of typing.* Point out that nothing in the repo is real: one fictitious client, synthetic data with a recorded answer key.

## 2. Day 3 of the migration (2 minutes) — tab 2

Read the table under "The day in one line per channel". Voice: the vendor's handle time is 64% above plan from go-live, with no learning curve; service holds because the buffer is paying for it. The ask is one line: confirm severity on the register row. The sentence to say: *this was flagged on the third day. In the case that inspired this, people saw it in week eight.* If asked how, scroll to "Variance decomposition": the miss is split into volume, handle time, mix and supply, and the residual is stated, not absorbed.

## 3. Day 45: growth with no new population (2 minutes) — tab 3

Read the table. Contacts kept rising after everyone in phase 2 was already live. Scroll to "Open hypotheses touched today": three or more hypotheses, each tagged structural or transitional, each with the test that settles it and the data it needs. The sentence to say: *it does not claim a cause. It says what would settle the question and what data it needs, and it files that so nobody asks twice.*

## 4. Day 57: a supply break that looks like a demand spike (1 minute) — tab 4

Read the table. Service fell to 7% on a supply break, not a demand break: the vendor lost a third of its productive hours off an unchanged schedule. The ask: confirm the training pull with the vendor. The sentence to say: *this is the day a room would have blamed volume.*

## 5. The register (1 minute) — tab 5

Read the front sheet only: one graded sentence per open item, the decision requested, overdue dates marked as overdue. The sentence to say: *every "why" that arrives becomes one row, answered once, with a grade and a date. This page is what replaces the email thread.* If asked why rows are stale: phase 1 has no causal analyst; the page says so, and that is the argument for phase 2.

## 6. The answer key (1 minute) — tab 6

Scroll to the table of planted effects. The sentence to say: *every one of these was planted in the data before the rules were written, and the rules were not tuned to them. The verification file says which ones it caught, on which day, and which it caught late.*

## 7. What is being asked (1 minute) — no tab

Say it, do not read it. A sandbox, a repository and the planners who already do this work. One book, one planner, one quarter, with the same human gates. Then measure what a planner-hour covers before anyone plans on it.

## If the room challenges you

| They say | You say |
|---|---|
| "Up 64% against what?" | Against plan; the sentence names its referent, and the comparison table is next on the page. |
| "The loop never changed the plan." | Phase 1 earns the right to reforecast by proving it can tell a supply break from a demand break. Every note already names the assumption rows it would revise. |
| "How did you pick 15%?" | It is the book's own day-to-day noise. In the mock that means the generator's parameters, and the runbook says so first. |
| "Occupancy over 100% on one day?" | Flagged by name on 15 September, not removed. That is the supply break, and the note calls it. |
| "Who signs?" | A human, every time. An agent cannot sign a forecast or a plan; the file formats reject it. |

## If they want to see it run

Open a Codespace, type `bun run Tools/run-clock.ts daily --book halcyon --date 2026-09-14`, and open the note it names. Under two seconds. Do this only if a director asks; the files are the demo.
