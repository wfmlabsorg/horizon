# Evaluator review — HORIZON phase 1, round 2

**Reviewed:** branch `feat/phase-1-daily-loop`, uncommitted working tree, regenerated from clean
**Against:** the seven must-before-demo items in `docs/REVIEW-phase-1-r1.md`
**Reviewer:** Evaluator (separated; did not produce this work)
**Verdict: PASS.** Overall **4.1 / 5** (was 3.1).

All seven must-fixes are done, and five of them are done better than specified. **No must-fix
remains.** The demo can go in front of the room. What follows in §3 is a challenge list for the
presenter, not a work list for the builder.

---

## 1. The seven, verified by eye

| # | Item | Verdict | What I checked |
|---|---|---|---|
| **1** | Un-freeze the register Description | **Done, better than asked** | `register/2026-09-13.md` XR-002 card now reads "At opening (23 Jul): … cpt 0.87 … Offered +158% vs forecast on voice **on 23 Jul**. Service level holds on every channel · **Latest (13 Sep)**: … cpt **1.77** … Offered **+871%** … **Service level is breached on chat**." That matches `daily/2026-09-13.md` exactly (cpt 1.77, chat SL 79.5%). `weekly/2026-W46.md` now carries "Meridian cpt **1.25** [C]", not 0.87. Zero instances of "today" remain in any frozen field across `register.md` and both register reports. The builder also date-stamped the At-risk fields ("at the volume of 22 Jul", "on 2 Sep"), which I did not ask for and which closes the same hole one layer down. |
| **2** | Day-58 conclusion and XR-005 | **Done** | `daily/2026-09-15.md`: "Service fell to 11%: Crestline lost a third of its productive hours off an unchanged schedule; **transactions ×1.20, so part of the rise may be real demand.**" The string "consistent with retries" appears **nowhere** in `books/` any more. Day 57 correctly keeps the stronger reading ("**on a supply break, not a demand break**") because its test passes at ×1.09. XR-005 is retitled "lost **64** productive hours to unplanned shrinkage **on 14–15 Sep (27.9–29.3% of schedule** vs ≈5% baseline) … and transactions moved ×1.20 same-weekday alongside it [C]" — both days, both figures, and 64 h reconciles (32.8 + 31.2). The self-contradicting cell is gone: H-004's "transactions flat ×1.20" moved to **evidence-against** as "transactions moved ×1.20 same-weekday [M]: part of the rise may be real demand". |
| **3** | Split table and word caps | **Done, and holds across all 357 rows** | Measured every sentence in all 119 notes, not a sample: `what happened` mean **24.3**, max **27**, **zero** over the 30-word hard cap; `ask` mean **4.3**, max **7**, **zero** over 8. Across the ten-note sample requested (22 Jul, 30 Jul, 12 Aug, 25 Aug, 1 Sep, 2 Sep, 14 Sep, 15 Sep, 20 Sep, 16 Nov) the longest is 27 words / 7 words. Rule names, onsets, baselines and slugs are out of the headline and into the evidence tables, with a standing footnote saying so. The three openers pass the two-minute read — see §2. |
| **4** | Register report §3 and §5, and the cards | **Done, better than asked** | §3 leads "5 of 5 decision dates are overdue: no CausalAnalyst in phase 1 delivers the 48-hour readout … **They are the argument for phase 2, not a backlog to clear**", with per-row counts ("**overdue** by 81 business days"). §5 carries "No CausalAnalyst in phase 1; rows are touched only when their series flags again, so **a stale row here means nobody has worked it, not that the loop lost it**." Cards now render every hypothesis with its tag — XR-002 shows H-001 … H-004 (three structural, one transitional, H-004 **supported**), XR-004 shows all five H-001 … H-005. |
| **5** | Absolute personal paths | **Done** | `grep -rlI "/home/tedla"` over the whole tree returns **one** file: `docs/REVIEW-phase-1-r1.md`, my own round-1 review, where the paths are the finding. Run states now carry `"directory": "books/halcyon"`. `InspectExcel.ts` no longer defaults to the job-search portfolio path. |
| **6** | Run-state clock | **Done** | Spot-checked three runs across the range. `daily-2026-07-22-r1.json`: `run_date 2026-07-22`, `started_at **2026-07-23**T06:00`, note "Issued: 2026-07-23 06:30". Same shape on 15 Sep and 16 Nov. D+1 06:00 throughout, matching the note. |
| **7** | Threshold provenance | **Done, better than asked** | `Tools/clock/README.md` now carries a **"Where the sigmas come from"** paragraph naming `sim/generate.ts:103` and the exact parameters, and distinguishing the first-principles arithmetic from the read-off inputs — "that is stated so nobody has to discover it by opening the generator". Reasons now exist for every threshold I listed: materiality floors (one scheduled head on the smallest series; 5 points of unplanned shrinkage = the contracted absence allowance, AS-016), `\|t\| > 4` (autocorrelation on these series inflates the ordinary t-statistic), the 42/21/10-day regime windows (the length of the mechanism each family asks about — an eight-week learning curve, a month-long seasonal or concurrency swing, a fortnightly schedule event), and the 2/5/10/30 staleness ladder (the reporting cadence each severity is owed). `PHASE-1-VERIFICATION.md` row E11 now names the day-58 exception in its own words rather than quoting only day 57. |

---

## 2. Re-grade

| Dimension | r1 | r2 | Movement |
|---|---|---|---|
| **Coherence** | 2 | **4** | All four contradictions closed and verified. The stale-number cascade is gone at the root, not patched downstream. Held off 5 by the referent problem in §3.1 and by the weekly structural table (§3.3). |
| **Distinctiveness** | 4 | **4** | Held, arguably strengthened. "They are the argument for phase 2, not a backlog to clear" and the sigma-provenance paragraph are writing no other demo will have. Still three register rows for one chat-elapsed phenomenon. |
| **Craft** | 3 | **4** | Paths gone, clock right, caps met 357/357, overdue counted in business days, every hypothesis rendered. Residual: XR-008's "At opening" half still says "(WE rule 1 and 2, **level shift**)" under a title that says "**not a level change**". |
| **Utility** | 3 | **4** | The change that matters most: the quiet day now reads "Service met target at 97%, **but the plan under-called the day by 16 hours — about 2.5 heads**", instead of "landed … the buffer absorbed it". Hours are converted to heads everywhere, with the divisor declared (`÷ 6.6 productive hours per shift (8 h at the contracted 18% planned shrinkage)`). Asks are in their own column. |

**4.1 / 5. PASS.**

**The three openers pass the two-minute read.** Day 3: "Crestline's handle time is 60% above plan
from go-live, with no learning curve. Service held at 96% — the buffer is paying for it." → ask
"Confirm Sev 2 on XR-001, 24 Jul". Day 45: "Voice contacts stepped up 46% with transactions flat:
mostly more contacts per transaction, not more travel. Service fell to 37%." → "Confirm Sev 1 on
XR-004, 4 Sep". Day 57: "Service fell to 7% on a supply break, not a demand break: Crestline lost a
third of its productive hours off an unchanged schedule." → "Confirm the training pull with
Crestline". A director reads three lines and a decision and knows what happened and what is wanted.
The README opens on exactly these three.

**Brand and name hygiene — re-run, clean.** Kyodo 0 · WFM Labs 0 · Ted Lango 0 · Amex 0 · GBT 0 ·
Egencia 0 · CWT 0 · Teleperformance 0 · Meta (word, excluding `import.meta` and `.meta.md`) 0 ·
NICE (word, excluding "nice-to-haves") 0. Excludes my own two review files.

---

## 3. What a director is most likely to challenge

No must-fixes. These are the questions to have an answer ready for, ranked by how likely they are to
be asked and how much they cost if fumbled.

### 3.1 "Up 12% against what?" — the one real soft spot

The headline gives a percentage without naming its referent, and three referents exist for the same
metric. `daily/2026-11-16.md` chat: "**Crestline's handle time is up 12% for a day.**" Below it, the
Simpson check on the same page reads Crestline chat **612 s (+61%)** against plan, blended **501 s
(+32%)**. The 12% is against the in-regime SPC baseline — correct, and unstated.

Worse on the opener. `daily/2026-07-22.md`: "**Crestline's handle time is 60% above plan**". The
60% is the **blended** figure from the forecast-vs-actual row (1,844 s vs 1,150 s); **Crestline's
own** is +64% (Simpson check, same note). On day 3 only one cohort is live so the gap is 4 points
and harmless — but the sentence names a cohort and reports a blend. 27 sentences across the run
name a cohort this way.

**Have ready:** "Against its own recent baseline — the plan comparison is the next table down, and
it's 61%." If there is a round 3, the fix is one clause: "…is up 12% against its own recent
baseline" and, on the cohort sentences, use the cohort number.

### 3.2 "The loop never actually changed the plan" — the biggest narrative risk

Every one of 119 notes says "**proposed: blocked — phase 1 has no Forecaster; v000 remains in
force**". An EVP can hear the whole demo as "it watched carefully for four months and never acted".
This is not a defect — it is the phase boundary, stated honestly on every page — but it needs a
sentence before it is asked, not after.

**Have ready:** "Phase 1 is the observation loop; it earns the right to reforecast by showing it can
tell a supply break from a demand break first. The Forecaster and the planner gate are phase 2, and
every note already names the assumption rows it would revise — AS-008, AS-011, AS-012."

### 3.3 "Why is your biggest finding missing from the table that feeds the capacity plan?"

`weekly/2026-W46.md`'s **Structural or transitional** table — the one with an "affects capacity
plan?" column — still leads with "definition change (XR-001 H-003) | structural | testing" and
never lists the Crestline handle-time level shift itself. That shift is the single most
consequential structural driver in the world model. It was phase-2 item 8 in r1 and remains open. A
capacity-planning director will find it, because that column is doing the work they do.

**Have ready:** "The table is built from hypothesis rows today; building it from register row
titles is on the phase-2 list." Better: fix it before the room if there is an hour.

### 3.4 "How did you pick ±15%?"

Now answered properly in `Tools/clock/README.md`, and the honest answer is "the simulator's own
noise parameters". Say it first.

**Have ready:** "Two sigma of the book's day-level noise. In the mock, 'the book's noise' is the
generator's parameters, and we say so in the README with the file and line. On a real book they come
off the Beacon history the same way the control-chart baseline does."

### 3.5 Smaller ones, each with a good answer available

- **"Your register has three rows about the same thing."** XR-003, XR-006 and XR-010 are one
  chat-elapsed phenomenon at three dates. Answer: the 21-day regime window; a register owner would
  merge them, and in phase 2 the CausalAnalyst does.
- **"XR-008 says level shift and its title says it is not a level change."** True — the "At opening"
  half still carries the handle-time template's "(WE rule 1 and 2, level shift)". Answer: template
  wording in the opening snapshot; the title and the Latest half are right.
- **"Occupancy 113.7%?"** `daily/2026-09-15.md`. Answer: flagged by name in the note, not silently
  removed — "either productive hours are under-recorded or handled work is over-recorded; a planner
  decision". That is the behaviour to be proud of.
- **"Day 58 — supply break or real demand?"** Answer is now on the page: the break is supply-side,
  and the transactions test says part of the contact rise may be real. Showing a day where the loop
  declines to over-claim is a strength; lead with it.
- **"Why 6.6 hours a head, not 8?"** Answered in the footnote on every note.
- **"Handle time is labelled demand-side?"** Because `aht-agent-work` lives in `02-demand` and the
  rule is "which ledger does the break live in". Consistent and documented; still counter-intuitive
  to anyone who runs an operation. Answer: the label names the ledger, not the accountability.

---

## 4. Note for the record

The change log in `06-questions/register.md` now appends a `description | superseded (see previous
row) | <full new text>` row on every refresh — nine such rows for XR-008 alone, each several hundred
words. That is the correct append-only behaviour and it is what makes §1 item 1 verifiable, but the
change log is now heavy enough that nobody will read it end to end. Not a defect; worth knowing
before someone opens it on a screen.

The round-1 "also noticed" items not covered by the seven — the `2026-09-16` first row in an
append-only log that then runs back to July, AS-003 ordering in the W36 assumption table, and the
`Tools/clock/README.md` "Side" bullet documenting only the flat-transactions branch of a rule whose
code now has two — remain open and remain minor.
