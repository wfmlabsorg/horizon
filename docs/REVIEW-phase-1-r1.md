# Evaluator review — HORIZON phase 1, round 1

**Reviewed:** branch `feat/phase-1-daily-loop`, uncommitted working tree, 2026-09-17
**Scope:** the scripted demo as a thing to put in front of a VP's directors and their EVP
**Reviewer:** Evaluator (separated; did not produce this work)
**Verdict: REVISE.** Overall **3.1 / 5**.

The engine is real and the analysis is genuinely good. What is not ready is the layer between the
engine and the room: a register row that never refreshes and is quoted as current in twenty
downstream artifacts, one title sentence that states a conclusion its own test refuted, and a
one-line table that is 63% boilerplate. Every must-fix below is small. None of them require
re-running the world.

---

## 1. Scores

| Dimension | Score | One-line rationale |
|---|---|---|
| **Coherence** | **2 / 5** | Inside a single note the numbers agree. Across artifacts they do not: the register Description is frozen at the row's opening day and reproduced as "today" in both register reports and all 17 weekly reviews; XR-005's graded [C] title is contradicted by its own evidence cell; every run state is stamped 24 h before the note it produced. |
| **Distinctiveness** | **4 / 5** | Could not be swapped into another company's deck. The composition trap read off Beacon history, the two-definitions AHT handling with concurrency divided out, the supply-vs-demand separation, "the buffer absorbed it", and `PHASE-1-VERIFICATION.md`'s "Where the rules fell short" section are all specific and all earned. Held off 5 by template leakage in the register and the 28-word boilerplate. |
| **Craft** | **3 / 5** | Disciplined, consistent, graded, definitions cited by slug. Against that: 139 files carry absolute `/home/tedla/...` paths, the append-only change log opens with a row dated after the rows below it, decision dates render four months overdue unmarked, and rule names and metric slugs are carried into the answer line. |
| **Utility** | **3 / 5** | For a planner, high. For this room, incomplete: no note converts the miss into heads, 226 of 357 title sentences say "landed … the buffer absorbed it", the weekly's structural table omits the single most consequential structural driver in the world, and the register report would tell an EVP "service level holds on every channel" on a day it had collapsed. |

Weighting Coherence and Utility as the two that decide whether this survives the room: **3.1 / 5**.

---

## 2. The two-minute director read

### 2.1 The premise, corrected

Title sentences do not run 40–60 words. Measured across all 119 notes (357 sentences):

| sentence class | n | share | mean words | max |
|---|---|---|---|---|
| "landed … the buffer absorbed it" | 226 | 63% | 28.0 | 28 |
| "SL missed by N points because …" | 66 | 18% | 29.5 | 35 |
| regime flag (stepped/trended/moved) | 56 | 16% | 31.8 | 55 |
| "the day is supply-side …" | 9 | 3% | 46.7 | 50 |

So the length problem is real but narrow: it lives in the 65 sentences (18%) that carry the
findings worth showing. The larger problem is the other 63%, which are one sentence repeated with
different numbers and which teach a director nothing.

**Can a director read the table and the decision line in two minutes and know what happened and
what is asked?** On a quiet day, no — they learn "fine" and miss that the plan is wrong by 2.5×.
On a flag day, no — the sentence front-loads `aht-agent-work`, `WE rule 1`, `onset 2026-07-21`,
`in-regime baseline` and `vs v000` before it reaches anything a director can act on, and on 226 of
357 rows the decision line reads "none — for information".

### 2.2 The pattern to adopt

Split the column. Rule names, onsets, baselines, WE rule numbers and metric slugs move to the
evidence tables, where they already appear.

| channel | what happened (≤ 25 words, hard cap 30) | ask (≤ 8 words) | grade |
|---|---|---|---|

Four slots inside the sentence, in this order:

1. **Subject** — the channel, and the outcome a director cares about (service, or the plan).
2. **What moved** — one number, in the unit the room thinks in.
3. **The driver, in plain words** — no slug, no rule name, no onset date.
4. **The ask** — in its own column, or "no ask" explicitly.

### 2.3 Two rewrites from actual notes

**`books/halcyon/08-reports/daily/2026-07-22.md`, voice** — today (24 words):

> Voice aht-agent-work stepped up +64% against its carried Beacon baseline (WE rule 1, onset
> 2026-07-21) for Crestline Services; SL 96.3% met the 80% target

Rewritten (what happened 23 words; ask 7):

> **what happened:** Crestline's handle time is 64% above plan from go-live, with no learning
> curve. Service held at 96% — the buffer is paying for it.
> **ask:** Confirm Sev 2 on XR-001, 24 Jul

**`books/halcyon/08-reports/daily/2026-09-14.md`, voice** — today (48 words):

> Voice SL missed by 73.3 points (6.7% vs 80%); the day is supply-side: Crestline Services
> unplanned shrinkage left control (WE rule 1) with the schedule unchanged, and transactions are
> flat (×1.09 same-weekday), so the offered rise (+743% vs v000) is consistent with retries, not
> new demand

Rewritten (what happened 24 words; ask 6):

> **what happened:** Service fell to 7% on a supply break, not a demand break: Crestline lost a
> third of its productive hours off an unchanged schedule.
> **ask:** Confirm the training pull with Crestline

The 226 "landed" rows need the same treatment, and they need to stop sounding fine:

> **what happened:** Service met target at 97%, but the plan under-called the day by 16 hours —
> about two heads. The buffer is absorbing a structural error.
> **ask:** none — see XR-002

---

## 3. Honesty of the demo

`docs/PHASE-1-VERIFICATION.md` is the most credible document in the repository. The "Where the
rules fell short" section — transient noise, onset dating two days early, the same-weekday mean
lagging a ramp, the learning curve found three weeks late, occupancy above 100% as a generator
artifact — is the kind of self-reporting most demos do not do at all. It is close to honest. Three
places overstate.

### Claim 1 — the day-2/3 handle-time flag: **holds, and is understated**

`2026-07-21.md` (day 2), voice: "Voice aht-agent-work moved (one point beyond limits) up +53%
against its carried Beacon baseline (WE rule 1, onset 2026-07-21) for Crestline Services; SL 96.2%
met the 80% target". Day 3 confirms it as a level shift and opens XR-001, with a real ask:
"**Decision requested:** confirm severity on XR-001 (Sev 2 proposed) · Halcyon planning lead · by
2026-07-24". README and DESIGN §8 both say "day 3"; the flag is actually on day 2. Fix the claim
upward, not down.

### Claim 2 — the day-45 growth-without-population flag: **holds, with a wording gap**

`2026-09-02.md` opens XR-004: "Offered contacts on voice stepped up from 2026-09-01 (voice +46%
against the forecast-attainment baseline) with book transactions ×1.10 same-weekday and no new
migrated population: the move is in contacts per transaction, not in travel activity; three
mechanisms fit and each has a test [C]". XR-004 carries five hypotheses plus a residual, each with
a structural/transitional tag and a settling test. Verification says so.

Two gaps. First, the XR title says "**not** in travel activity" while the same day's note title
says "a minority of the move (**22%**) is travel activity and the rest is contacts per
transaction". Both are defensible; side by side in front of an EVP they are not. Second — see §5 —
the register report card for XR-004 renders **one** hypothesis, so the reader of the third
recommended file sees one, not three.

### Claim 3 — the day-57/58 supply-side call: **day 57 holds; day 58 does not, and verification does not say so**

Day 57 is clean. `2026-09-14.md`: "transactions are flat (×1.09 same-weekday), so the offered rise
(+743% vs v000) is consistent with retries, not new demand", with `Transactions same-weekday: North
×1.00 (flat), East ×1.17 (moved), book ×1.09 (flat) [M]` backing it.

Day 58 is not. `2026-09-15.md`, all three channels: "…with the schedule unchanged, and
**transactions moved too**, so the offered rise (+846% vs v000) is **consistent with retries, not
new demand**." The note's own line four paragraphs down reads `book ×1.20 (moved)`. The rule in
`Tools/clock/README.md` says the retries clause is written "A supply-side flag **with flat
transactions** and a same-day offered rise" — on day 58 the precondition failed and the conclusion
was printed anyway. This is the only place in 119 notes where the loop states a conclusion its own
stated test refuted.

It propagates. `books/halcyon/06-questions/XR-005.md`:

- title: "…the break is supply-side, in 04-supply, and **the demand side did not move** [C]"
- H-004 evidence-for cell: "**transactions flat ×1.20** [M]; abandons up [M]"
- register.md Description: "Transactions ×1.20 same-weekday [M]"

"Flat ×1.20" is a self-contradiction in a single cell, under a [C] grade. Verification's row E11
and the storyline row "Days 57–58 are called supply-side — **Yes**" quote only the day-57 sentence
and do not mention it. That is the one genuine overstatement in the document.

### Was anything tuned to the ground truth?

No rule was tuned to make a row pass — I take that claim as sound. But "set from first principles"
is doing more work than it can carry. `Tools/clock/README.md` derives the tolerances as "offered
±15% (≈2σ of the day-level contact noise: **6% contacts ⊕ 5% transactions**), handle time ±10%
(≈2.5σ of **4%** day-level handle-time noise)". Those three figures are the generator's own
parameters — `sim/generate.ts:103`: `noise: { tx: 0.05, contacts: 0.06, aht: 0.04, … }`. The
arithmetic on top of them is first-principles; the inputs are the world's answers read off the
simulator, not estimated from the book's history. That is defensible and cheap to state. It is not
defensible to leave unstated when a director asks "how did you pick ±15%".

Thresholds in `Tools/clock/README.md` that carry **no** reason at all: the materiality floors
(10% / 5% / 10% / 5 points / 10%), the regime windows (42 days cohort handle time, 21 offered and
chat elapsed, 10 supply), the trend test's `|t| > 4`, and the staleness ladder (2/5/10/30 business
days). Each needs one clause.

Smaller: verification says occupancy above 100% occurs "on the training-pull **days**" — only
2026-09-15 breaches (113.7% / 103.0%, flagged by name in the note). 2026-09-14 reads 95.0% / 98.7%.

---

## 4. Consistency across artifacts

### Day 44/45 — **passes, and is the strongest chain in the demo**

`2026-09-02.md` title (voice +46%, transactions ×1.10) → XR-004 title → `register.md` row XR-004 →
register report front sheet and item card: all four carry the identical sentence and the identical
numbers. The card's `cpt 1.29 [C], contacts per traveler-day 1.20 [C]` match the note's line
exactly. This is what the rest of the artifact set should look like.

One readability trap on day 44: the voice title says **+25%** (against the in-regime baseline) while
the register-movement line at the foot of the same note says **+324%** (against v000). Both are
correct. Neither says which baseline in words a director will parse.

### Day 56 — **fails, in the third file the README tells a reader to open**

`books/halcyon/08-reports/register/2026-09-13.md`, XR-002 item card:

> Contacts per transaction on Meridian **0.87** [C] vs plan 0.35 [A]; … Offered **+158%** vs
> forecast on voice **today**. **Service level holds on every channel** (phase-1 buffer).
> … *last update 13 Sep*

`books/halcyon/08-reports/daily/2026-09-13.md`, the same day:

> Voice landed: SL 94.0% … (volume (offered **+871%**) …) · Chat **SL missed by 0.5 points**
> … *Register movements today — XR-002 touched: … cpt **1.77***

The card's numbers are the values from **2026-07-23**, the day the row opened (that note reads cpt
0.87, voice offered +158%). The card says "today" and stamps itself "last update 13 Sep". So the
register report hands an EVP a cpt that is half the truth, an offered variance that is a fifth of
it, and the sentence "service level holds on every channel" on a day chat missed — one week after
chat SL had been at 4.9%.

Root cause: the `Description` field in `books/halcyon/06-questions/register.md` is written once at
open and never re-rendered, while `last_update` advances on every touch. XR-001's card is frozen at
day 3 the same way ("Values today: voice 1,881 s" = the day-3 Simpson-check figure).

It propagates further than the two register reports. Every weekly review's **Structural or
transitional** table quotes it: `2026-W46.md`, the final week of the run, still reads "composition
trap in contacts-per-transaction (XR-002 H-001) … Meridian cpt **0.87** [C] — testing" — a July
number in a late-November review. That is one root cause visible in roughly twenty artifacts.

### Day 57 — **partly fails**

The break is flagged on day 57 (`shrinkage, unplanned … onset 2026-09-14`, DataEngineer flag
"Crestline Services unplanned shrinkage 29.3%"), but XR-005 opens on day 58 and dates the loss to
"**on 2026-09-15** (27.9% of schedule …)" while carrying `onset=2026-09-14` in its own Notes field.
Day 57's own figures — 60.2 productive hours, 29.3% unplanned — appear nowhere in the register. A
director who asks "when did this start?" gets 15 Sep from the row title and 14 Sep from the flag
inside it. The two-day pull is recorded as one day.

The opening delay itself is correct and defensible (a single transient does not open a question;
the second consecutive point does) — but the row title should say "on 14–15 September".

---

## 5. Register quality

**Are XR titles answer sentences with grades?** Yes — all ten. This is done well, and XR-004 and
XR-009 in particular are the kind of sentence a planning lead can act on. Two defects:

- **Template leakage.** XR-008's title says "the shape is a **learning curve, not a level change**
  [C]" while its own Description says "left control on 2026-10-18 (WE rule 1 and 2, **level
  shift**)" and its would-change-the-answer test reads "…would **refute the level shift**". The
  handle-time template was applied to a row that exists to say it is not that shape.
- **Three rows for one phenomenon.** XR-003, XR-006 and XR-010 are the same sentence about chat
  `aht-elapsed` with different signs and dates. The 21-day regime window permits it; a register
  owner reading ten rows of which three are one story will discount the register.

**Are hypotheses tagged structural/transitional?** Yes, and properly. Every row in XR-004 and
XR-005 carries a tag; `unknown` is used only for the residual and is explicitly declared to block
any plan that cites it; evidence-for and evidence-against are separate columns; each row names the
test that settles it and the data needed. XR-005 H-002 is marked **refuted** with the reason
("staffed 107.7 h vs scheduled 112.0 h: absence is normal [M]"). This is the strongest single
artifact in the repository.

**But the register report renders only one hypothesis per card.** XR-004's card shows "Hypotheses:
H-001 open — Seasonal transaction growth…". The claim in the room is "three hypotheses and their
tests"; the file a director opens shows one. The five rows exist one file away and are not surfaced.

**Are the six stale rows at day 120 an honest artifact, stated as such?** Honest — yes. Stated —
**no, not where it matters.** `register/2026-11-16.md` §5 lists XR-001, 003, 004, 005, 006, 010 with
business-day counts and a "line-of-sight contact to ask", and says nothing about why. The weekly
reviews do say it, plainly and well: "48-hour readouts due or overdue: XR-001 due 2026-07-24
(**overdue: phase 1 has no CausalAnalyst to deliver it**)". That sentence needs to be in the
register report, because the register report is what the EVP will open. Untreated, six stale rows
and a front sheet reading "DECISION by 4 Sep" on 16 November read as a system that nags and is
ignored. Treated, they are the argument for phase 2.

---

## 6. Brand and name hygiene

Clean on every requested term. Case-insensitive, whole-word, whole tree excluding `.git`:

| term | hits |
|---|---|
| Kyodo | 0 |
| WFM Labs | 0 |
| Ted Lango | 0 |
| Amex | 0 |
| GBT | 0 |
| Egencia | 0 |
| CWT | 0 |
| Teleperformance | 0 |
| Meta (word) | 0 as a brand — 8 hits are `import.meta.dir` / `import.meta.path` in TypeScript, plus `agents/Adapters.md:60` `.meta.md` sidecar. No action. |
| NICE (word) | 0 as a brand — 1 hit, `skills/Research/Agents/GapAnalyzer.md:58` "nice-to-haves". No action. |

**Two hygiene problems the term list does not cover, both must-fix:**

1. **139 files carry absolute local paths.** 138 run states under
   `books/halcyon/08-reports/runs/*.json` embed `"directory":
   "/home/tedla/projects/horizon/books/halcyon"`. In a Codespace on a shared screen these are wrong
   as well as revealing.
2. **`skills/ShapleyDecomposition/Tools/InspectExcel.ts:8`** defaults to
   `/home/tedla/cloud/projects/job-search/portfolio/analytical-methodology/tools/Shapley.xlsx`. A
   path naming the author's job-search portfolio, in a repo about to be opened in front of an EVP.

Real third-party product names appear deliberately and are fine in this room: **IEX** (418 hits)
and **Anaplan** (57) are named as the integration points the mock mimics, which is the point. One
stray `Verint`, one `Genesys`, one `BCD` and two `aspect` (lower-case, the English word) appear in
skill documentation, not in the book.

---

## 7. The three files to open first

Currently: `daily/2026-08-12.md` (quiet day) → `daily/2026-09-01.md` (day 44) → `register/2026-09-13.md`.

**Wrong order and one wrong file for a mixed room.** Reasons:

- **2026-08-12 as the opener asks the room to be impressed by "nothing happened."** All three title
  sentences are the same 28-word boilerplate ending "the buffer absorbed it"; the decision line is
  "none — for information". The composition trap and the two chat handle times are genuinely there,
  but they are below the fold in the tables. A director who reads only the one-line table on this
  day learns that the book is fine. The quiet day is a great *second* beat — the contrast after a
  finding — not a first impression.
- **2026-09-01 is one day short of its own story.** The README sentence already concedes it: "the
  **next day's** note opens XR-004 with the three hypotheses". Send the reader to the day the
  register row opens.
- **The register report is the right third file only after §5's fixes.** Today it is the file that
  most damages the demo (see §4).

**Proposed three:**

1. **`books/halcyon/08-reports/daily/2026-07-22.md` (day 3).** The system names a structural
   handle-time shift on day 3 that the humans in the real case found on day 56, tags it as a level
   shift with no curve, opens XR-001 and asks a named human for a decision inside 48 hours. It is
   the whole value proposition in one page, and the only one of the three current picks with a real
   ask on it.
2. **`books/halcyon/08-reports/daily/2026-09-02.md` (day 45).** Growth without population, five
   hypotheses each tagged structural or transitional with the test that settles it, and the three
   refutation conditions in the "what would change the answer" line. This is where an EVP sees the
   loop reasoning rather than reporting.
3. **`books/halcyon/08-reports/daily/2026-09-14.md` (day 57).** "The day is supply-side." For a
   workforce audience this is the most persuasive single artifact in the run — a day that reads as
   a demand spike on every dashboard in the building, separated from demand by productive hours and
   a transaction check. It currently sits in a "then read" afterthought line.

Then, as the "and then" list: `register/2026-09-13.md` (once fixed), `daily/2026-08-12.md` as the
quiet-day contrast, `weekly/2026-W36.md`, and `06-questions/register.md`.

---

## 8. Ranked revisions

### Must before the demo

| # | File(s) | Change | Why it matters in the room |
|---|---|---|---|
| **1** | `Tools/clock/librarian.ts`; `books/halcyon/06-questions/register.md`; regenerate `08-reports/register/*` and `08-reports/weekly/*` | Re-render the register row `Description` on every touch, or relabel it "At opening (23 Jul)" and add a "Latest" line. Remove the word "today" from any frozen field. | The third file the README opens tells an EVP "service level holds on every channel" with cpt 0.87 on a day the note says 1.77 and chat missed SL. One root cause, ~20 artifacts, including the final weekly review. It is the single fastest way to lose the room. |
| **2** | `Tools/clock/reporter.ts`; `Tools/clock/librarian.ts`; `books/halcyon/06-questions/XR-005.md` | Gate the "consistent with retries, not new demand" clause on the flat-transactions test actually passing; when it fails, say so ("transactions moved ×1.20, so part of the rise may be real demand"). Fix XR-005's "transactions flat ×1.20" cell and retitle to "14–15 September". | Day 58 is the only place in 119 notes where the loop prints a conclusion its own stated test refuted — and it sits on the beat the demo is built around. One director noticing it discredits every other graded claim on the page. |
| **3** | `Tools/clock/reporter.ts` | Split "the day in one line" into `what happened` (≤ 25 words, plain language, no rule names, no slugs, no onset dates) and `ask` (≤ 8 words). Move WE rule, onset and baseline into the evidence tables where they already appear. | The two-minute read. 63% of sentences currently say the same thing and the informative ones open with `aht-agent-work … WE rule 1 … onset`. Directors will read the first table and nothing else. |
| **4** | `Tools/clock/reporter.ts` (register report template) | In §5 add the weekly's own sentence — "no CausalAnalyst in phase 1; rows are touched only when their series flags again" — mark overdue decision dates as overdue with the count, and render **every** hypothesis in the item card, not the first. | Turns six stale rows and a "DECISION by 4 Sep" dated 16 November from an embarrassment into the argument for phase 2. And makes the "three hypotheses with tests" claim true of the file the reader actually opens. |
| **5** | `books/halcyon/08-reports/runs/*.json` (138 files); `skills/ShapleyDecomposition/Tools/InspectExcel.ts:8` | Write the book directory as a repo-relative path. Replace the hard-coded `/home/tedla/cloud/projects/job-search/portfolio/…` default with a required argument. | A Codespace demo on a shared screen, with the author's job-search portfolio path in it. |
| **6** | `Tools/clock/coordinator.ts` | Stamp the run at D+1 06:00, matching the note's "Issued" line. | Every run state says the day was scored at 06:00 **on** the day it scores, while the note says it was issued 06:30 the next morning. An operations director reads that as scoring a day before it ended. One line. |
| **7** | `Tools/clock/README.md`; `docs/PHASE-1-VERIFICATION.md` | State that the tolerance sigmas are the book's observed day-level noise (in phase 1, the simulator's parameters at `sim/generate.ts:103`), and add one clause of reasoning for the materiality floors, the 42/21/10-day regime windows, `\|t\| > 4`, and the 2/5/10/30 staleness ladder. Add the day-58 exception to the E11 row. | "How did you pick ±15%?" is the first methodology question in this room, and "nothing was tuned" has to survive someone opening the generator. Saying it first is free; being caught is not. |

### Phase 2

| # | File(s) | Change | Why |
|---|---|---|---|
| **8** | `Tools/clock/reporter.ts` (weekly template); daily note decision line | Build the weekly's **Structural or transitional** table from the register row titles, not only from hypothesis rows — the Crestline handle-time level shift, the largest structural driver in the world, is absent from every weekly including W46, which instead leads with "definition change (XR-001 H-003)". And express the miss in heads as well as hours (`+75 h/day ≈ 9 heads against a plan holding 20`). | The weekly is what feeds the capacity plan, and the table that decides steady-state staffing omits the driver that decides steady-state staffing. Hours do not land in an EVP room; heads do. |

### Also noticed (not in the ranked eight)

- `06-questions/register.md` change log opens with a row dated **2026-09-16** ("register opened,
  empty") above rows dated 2026-07-22 onward. An append-only ledger whose first line breaks
  chronology is an own-goal in a demo about ledgers.
- XR-008's Description and settling test contradict its own title (level shift vs learning curve);
  XR-009's "would change the answer" is XR-004's, copied onto a down-step.
- XR-003 / XR-006 / XR-010 are one phenomenon in three rows.
- Handle-time flags are labeled **demand-side** because `aht-agent-work` lives in `02-demand`. The
  ledger rule is stated and consistent, but "the vendor's handle time is up 64% — demand-side" will
  be challenged by anyone in the room who runs an operation.
- `weekly/2026-W36.md` assumption table lists AS-003 out of order after AS-015.
- `PHASE-1-VERIFICATION.md` E2 quotes email "+10%" (the generator parameter); the day-4 note says
  "+8%". Harmless, but this document's value is that it never does that.

---

## 9. What is working, so it is not lost in revision

- The **grade discipline** is real and survives 119 days: `[E]` on the carried Beacon baseline, `[A]`
  on the plan's 0.35, `[M]` on the ledger reads, `[C]` on everything computed, with "nothing carried
  across a platform change is presented as measured" actually honored.
- The **two-definitions handling** — `aht-elapsed` shown beside `aht-agent-work` with effective
  concurrency, every day, plus "the staffing number is the agent-work one" — is the best piece of
  writing in the run.
- **Rung discipline** holds: "This is association" appears in every decomposition, and the register
  says in its own rules that a rung-1 row reaches `supported` only as "associated with".
- The hypothesis tables' **evidence-against** column and the explicitly refuted XR-005 H-002 are the
  detail that separates this from a demo that only confirms itself.
- `PHASE-1-VERIFICATION.md`'s **"Where the rules fell short"** section should be shown, not hidden.
  Read it aloud in the room. It is the most persuasive page in the repository.
