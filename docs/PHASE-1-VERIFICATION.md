# Phase 1 verification — what the daily loop found against the ground truth

The rules in `Tools/clock/README.md` were set from first principles and frozen; this document was
written afterwards by reading the generated notes against `sim/GROUND-TRUTH.md`. Nothing was
tuned to make a row pass. One honesty note up front: the tolerance sigmas the rules are built on
(offered 6% ⊕ 5%, handle time 4%) are the book's day-level noise, and in phase 1 the book is
synthetic, so they are the simulator's own parameters (`sim/generate.ts:103`). The 2σ / 2.5σ
arithmetic is first principles; the inputs are read off the world. On a real book they would be
estimated from the Beacon history. Run: `bun run Tools/run-clock.ts demo --book halcyon` on seed 20260720
(119 daily notes 2026-07-21 → 2026-11-16, 17 weekly reviews, register reports 2026-09-13 and
2026-11-16). Quotes are the `what happened` sentences, register movements or XR titles as written; day numbers
count from 2026-07-20 = day 1.

## Planted effects

| # | Planted effect (ground truth) | First flagged | What the note said | Verdict |
|---|---|---|---|---|
| E1 | Phase 1 go-live, North, day 2; contacts per migrated transaction ≈1.0 not 0.35 | Day 2 note (miss); XR-002 on day 4 | "Offered contacts on Meridian run 2.5× the plan of record on voice, chat, email for three consecutive days because the plan carried the whole-book Beacon ratio 0.35 while the migrated regions' own Beacon ratio was North 0.93: a composition error in the plan, not a demand change [C]" | Found; the composition trap is named from the Beacon history |
| E2 | Crestline handle-time level shift from day 2, no curve (voice ×1.70, chat ×1.45, email ×1.10) | Day 2 (rule 1 vs carried Beacon baseline); level shift confirmed and XR-001 opened day 3 | Day 2: "Crestline's handle time is up 53% for a day. Service held at 96% — the buffer is paying for it." Day 3: "Crestline's handle time is 60% above plan from go-live, with no learning curve. Service held at 96% — the buffer is paying for it." · ask "Confirm Sev 2 on XR-001, 24 Jul". XR-001: "…level shift up on voice and chat from 2026-07-21 … with no learning curve visible; service level is unaffected so far [C]" | Found on day 2, confirmed on day 3 (the design said day 3; the flag is earlier). Email (+8% on day 4, the generator's 1.10× under noise) reached rule 2 on day 4 and was appended to XR-001 |
| E3 | Phase-1 buffer hides the shift (SL ≥ 90% for 35 days) | Every note days 2–36 | "Service met target at 97%, but the plan under-called the day by 16 hours — about 2.5 heads, mostly volume. The buffer is absorbing a structural error." · ask "none — see XR-002" (2026-08-12) | Found: the notes say the miss is real and absorbed, not that the day was fine |
| E4 | Home-team classroom training days 36–49 | Not a flag (planned, [M], EV-003; productive 0 is in the supply table) | Supply table rows show `classroom training`, productive 0 | Correct behaviour: nothing to flag |
| E5 | Phase 2 go-live, East, day 37; contacts ×1.85; SL lands | Day 37 note | "Service met target at 91%; Crestline delivered +18% productive hours against its schedule — capacity moved, not demand." (voice); chat "Service met target at 84%"; the forecast-vs-actual table carries the +215% offered miss | Found: "lands on plan" for service, not for volume, exactly the ground-truth reading. The heads step 16 → 20 is explained by the plan itself (no supply XR) |
| E6 | Seasonal ramp +40% over days 37–65, West rises too | XR-004 hypothesis H-001 (day 45); assumption AS-003 in every weekly review from W36 | H-001: "Seasonal transaction growth lifts contacts in proportion, in every region including West on Beacon — test: West (Beacon) transactions rise in step with North/East" | Hypothesised with its test; not settled (phase 1 runs no tests) |
| E7 | Chat service break ≈ day 44 | Day 44 note (SL miss); day 45 regime flags and XR-004 | Day 44: "Service missed at 48% (target 80%): the plan under-called the day by 21 hours — about 3 heads, mostly volume." Day 45: "Chat contacts stepped up 27% with transactions flat: mostly more contacts per transaction, not more travel. Service fell to 21%." · ask "Confirm Sev 1 on XR-004, 4 Sep" | Found on day 44 (miss) and day 45 (regime, XR) |
| E8 | Voice overflow: calls per transaction double from day 44 | XR-004 H-003 (day 45); voice attainment level shift day 45 and trend day 64 | H-003: "Channel overflow: chat abandons turn into voice calls… evidence: voice share of offered 31% vs 25% plan mix" | Hypothesised with its test (voice share vs lagged chat abandon) |
| E9 | Re-contact spillover, cpt 1.05 → 1.73 | XR-004 H-002 (day 45); composition line in every note | H-002: "Re-contact spillover… contacts per traveler-day 1.20 [C] vs ≈1.1 in phase 1" | Hypothesised with its test |
| E10 | Nesting days 50–70 | Not a flag (planned, [M], EV-006); home-team series starts at nesting | Supply rows `nesting`; home-team AHT rows appear at ≈1,700 s | Correct: nothing to flag, and the nesting AHT is not mistaken for a shift because the home-team series has no carried baseline |
| E11 | Training pull days 57–58: supply, not demand | Day 57 note; XR-005 day 58 | Day 57: "Service fell to 7% on a supply break, not a demand break: Crestline lost a third of its productive hours off an unchanged schedule." · ask "Confirm the training pull with Crestline". Day 58: "Service fell to 11%: Crestline lost a third of its productive hours off an unchanged schedule; transactions ×1.20, so part of the rise may be real demand." XR-005: "Crestline Services lost 64 productive hours to unplanned shrinkage on 14–15 Sep (27.9–29.3% of schedule vs ≈5% baseline) with the schedule unchanged: the break is supply-side, in 04-supply, and transactions moved ×1.20 same-weekday alongside it [C]" | Day 57 holds cleanly. **Day 58 is the exception:** the supply break is still called, but the same-weekday transactions test reads ×1.20 (moved, not flat), so the note and XR-005 no longer claim "not new demand" for that day — the retries clause is written only when the flat test passes. The ×1.20 is the ramp lag described below, not real demand in the ground truth, but the loop cannot know that and says so. EV-007 (the late vendor notice, [A]) is cited as co-occurring, not as the explanation |
| E12 | Outage day 63 (Sunday): contacts ×2.3, transactions flat | Day 63 note | "Chat contacts jumped 60% on the platform outage. Service fell to 4%." · ask "none — matched to EV-008"; the evidence table carries the flag (WE rule 1, provisional limits, onset 2026-09-20) | Matched to the ledger; no XR opened. The transactions check read ×1.23, not ×1.09: the three-week same-weekday mean lags a ramp, so the email line (outside EV-008's stated channel scope) attributes the move to travel activity. Honest limitation, recorded in the backlog |
| E13 | Home-team learning curve from day 71 (1.50× → 1.05×) | Day 91 (level shift down, rule 1 and 2); trend flags from day 111; XR-008 | Day 91: "Larkspur's handle time is down 14% (now 65% above plan). Service held at 96% — the buffer is paying for it."; day 111: "Larkspur's handle time is falling on a learning curve (now 46% above plan)…". XR-008: "Larkspur home team handle time is trending down on voice and email from 2026-10-18 (voice −14%, email −9% over 14 days) while Crestline Services' level does not move; the shape is a learning curve, not a level change [C]" | Found, three weeks after go-live: the 21-point trend test needs three weeks of live data by construction |
| E14 | Crestline surge add day 78 (+8 heads, not in the plan) | Day 78 note; XR-007 | XR-007: "Crestline Services productive hours stepped up from 2026-10-03 (+44% vs baseline) with no change in the plan of record: capacity moved, not demand [C]"; EV-010 (change request, [A]) cited in H-001 | Found; onset dated two days early because rule 2 takes the first of three points beyond 2σ |
| E15 | Weather in East days 80–82 | Day 80 note | "Voice contacts jumped 59% on the East weather event. Service fell to 12%." · ask "none — matched to EV-011"; East rows in the forecast-vs-actual table carry the miss | Matched to the ledger on all three days; no XR |
| E16 | Recovery from day 85 | Days 91–121 notes; XR-009 (day 94) | Day 94: "Voice contacts stepped down 39% with transactions ×1.04: contacts per transaction is unwinding. Service held at 98%." XR-009: "…the fall is in contacts per transaction, not in travel activity, which is what an unwinding re-contact or overflow loop looks like [C]" | Found and read correctly as the loops unwinding |
| E17 | Two definitions of chat AHT (elapsed 1,080 → 1,730 s, agent-work flat) | Every note (both figures shown); XR-003 day 38 | Day 37: "Chat session time moved +22% but agent work time did not: concurrency, not work content. Service met target at 84%." XR-003: "Chat `aht-elapsed` left control up from 2026-08-25 (+31%) while `aht-agent-work` did not: the movement is concurrency or timeout, not work content [C]"; every note: "`aht-elapsed` 1,539 s [M] is +305% against the plan's 380 s, but the plan cites `aht-agent-work`, so the comparable actual is 559 s [C] (+47%…)" | Surfaced from day 2 and flagged as a regime on day 38 and again on the way down (XR-006, XR-010) |
| E18 | Bot off: the 0.20 benchmark is wrong by construction | XR-002 H-004 (day 4) | H-004 "The 0.20 benchmark cross-check (AS-009) does not apply: it is a post-bot ratio and Halcyon's bot is off (EV-002)" — status supported, grade [M] | Found from the ledger (EV-002 [M] contradicts AS-009) |
| E19 | Beacon composition: N/E 0.90, W 0.25, book 0.36 | Day 2 note (composition line); XR-002 | "…the regions' own Beacon ratios were North 0.93 [M] (`contacts-per-transaction`, composition trap)" | Found from `beacon-daily` |

## Storyline claims (docs/DESIGN.md §8)

| Claim | Holds? | Evidence |
|---|---|---|
| The handle-time shift is flagged by day 3 | **Yes, on day 2** | Day 2 note flags it ("up 53% for a day", rule 1 against the carried Beacon baseline); day 3 confirms the level shift, opens XR-001 and asks for a decision by 24 Jul. The humans in the real case saw it on day 56. README and DESIGN §8 now say day 2 / day 3 |
| Phase 2 lands on plan on day 37 and the note says so | **Yes, for service** | Day-37 titles: voice and chat SL met; requirement hours were +29 h over v000 and the note says the buffer absorbed it. The note does not say "on plan" for volume, because it was not |
| Growth without population is flagged on day 45 with three hypotheses and their tests | **Yes** | Day 44: SL misses on all channels; day 45: offered regime flags on voice and chat, XR-004 opened with seasonal / re-contact spillover / chat→voice overflow (plus incident-or-retries and definition change), each with a settling test. DESIGN §8 now says day 45 |
| Days 57–58 are called supply-side | **Yes, with a stated exception on day 58** | Day 57: "on a supply break, not a demand break"; day 58 keeps the supply call but its transactions test reads ×1.20 (moved), so the note says "part of the rise may be real demand" instead of "not new demand". XR-005 opens on day 58 and is titled to 14–15 Sep with both days' figures |
| The day-63 outage is matched | **Yes** | EV-008 explains the day-63 flags; no question opened. The transactions-flat test under-performs inside a ramp (×1.23 vs the true ×1.09) |
| The weather days are matched | **Yes** | EV-011 explains the East misses on days 80–82; no question opened |
| The two-definitions trap surfaces | **Yes** | Every note carries both chat figures with the concurrency that links them; XR-003 names the elapsed movement as concurrency, not work content |
| The composition trap surfaces from the Beacon history | **Yes** | XR-002 on day 4 quotes North's Beacon ratio 0.93 against the plan's 0.35 |
| "A leader asks why service broke on day 38 and gets a graded card within the hour" | **Not in phase 1** | The intake door and answer cards are phases 2 and 5; the register rows exist but no card is filed |
| The monthly plan proposes phase 3 sizing | **Not in phase 1** | Phase 4 |

## Where the rules fell short (kept, not tuned)

- **Day 58.** The only day where a stated test failed under a supply call: transactions read ×1.20
  against the same-weekday mean because the mean lags the ramp. The rule now gates the retries clause
  on the flat test and prints the contrary reading when it fails; the ground truth (transactions
  flat, retries real) is not used to override it.

- **Transient noise.** Single-point excursions (WE rule 1) fire about once a week on the vendor
  handle-time series and during the ramp; they are reported in the note and screened by the Scout
  (39 candidate events proposed over 119 days) but open no question. The materiality floor keeps
  them out of the register; a planner reviewing `05-events/proposed/` would reject most.
- **Onset dating.** Rule 2 dates a shift at the first of the three points beyond 2σ, so the surge
  add (day 78) reads as onset day 76 and the day-44 chat step as onset day 43.
- **Same-weekday transactions inside a ramp.** The three-week same-weekday mean lags a +1.4%/day
  ramp by about two weeks, so the outage day reads as ×1.23 rather than ×1.09 and the notes
  attribute part of contact spikes to travel activity. A seasonally adjusted comparison would fix it;
  it is a phase-2 item.
- **The learning curve is found three weeks after go-live**, because the trend test needs 21 live
  points. A cusum would find it sooner; the individuals chart is the phase-1 rule.
- **Staleness.** With no CausalAnalyst, rows are touched only when their series flags again, so the
  2026-11-16 register report lists six stale rows. That is the correct reading of a register nobody
  is working.
- **Occupancy above 100%** on 2026-09-15 (113.7% for Crestline; 2026-09-14 reads 95.0%) is a
  generator artefact (handled work is not capped by delivered hours); the DataEngineer flags it as an
  outlier rather than removing it.
