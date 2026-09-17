# sim/ — the synthetic world generator

All data in `books/halcyon/02-demand/`, `04-supply/`, `05-events/` and `03-forecast/v000-plan-of-record/forecast-daily.csv` is **synthetic**. It is produced by one seeded script with a recorded ground-truth causal model (`sim/GROUND-TRUTH.md`), so the demo can show the agent chain recovering effects that are known to be there. No row describes a real client, vendor, platform, person or event; every name in the book is fictitious.

## Regenerate

```bash
bun run sim/generate.ts        # from the repository root
```

Seed: `20260720` (`P.seed` at the top of `generate.ts`). The generator is deterministic: the same seed reproduces every file byte for byte. Every planted effect is a named parameter in the `P` object; change one, re-run, and the *observed* values in `GROUND-TRUTH.md` will drift while the parameter table stays true.

The script prints a weekly summary table and a list of planted-signature checks (PASS/FAIL). All checks pass for the committed seed. The same table is written to `sim/weekly-summary.md`.

## Files written

Phase 1 decision (docs/PHASE-1-BACKLOG.md item 1): the ledger conventions win. Files are named `<what>-<period>-v<nnn>.csv` with one file per calendar month and a `.md` sidecar each (source, pull, definition and grade per column); columns follow `/schemas/demand-daily.schema.json` and `/schemas/supply-daily.schema.json`. Everything above the output section of `generate.ts` is unchanged, so the seed reproduces the phase-0 numbers exactly.

| Path | Rows | What |
|---|---|---|
| `books/halcyon/02-demand/demand-daily-<YYYY-MM>-v001.csv` | 609 | Daily actuals by region × channel on Meridian (North from day 2, East from day 37); region split by traveler-profile weight, handle time at skill level |
| `books/halcyon/02-demand/demand-interval-<YYYY-MM>-v001.csv` | 11,520 | 30-minute intervals, chat and voice, skill level; sums exactly to the channel-day |
| `books/halcyon/02-demand/demand-cohort-<YYYY-MM>-v001.csv` | 570 | Handled and handle time by cohort × channel |
| `books/halcyon/02-demand/transactions-daily-<YYYY-MM>-v001.csv` | 360 | Transactions by region (whole book), platform tagged |
| `books/halcyon/02-demand/travelers-daily-<YYYY-MM>-v001.csv` | 120 | Active travelers, contacts per traveler-day, contacts per transaction (Meridian) |
| `books/halcyon/02-demand/beacon-daily-<YYYY-MM>-v001.csv` | 325 | Beacon history: 56 days before day 1 for all regions, then each region while still on Beacon |
| `books/halcyon/04-supply/supply-daily-<YYYY-MM>-v001.csv` | 240 | Scheduled, staffed, productive hours; planned and unplanned shrinkage; occupancy; effective concurrency; heads; by cohort (region and channel `all`: blended pools) |
| `books/halcyon/05-events/events.csv` | 12 | The intelligence ledger, planned items and surprises with true dates (accepted ledger; the Scout's proposals go to `proposed/`) |
| `books/halcyon/03-forecast/v000-plan-of-record/forecast-daily.csv` | 609 | The original plan by region × channel, built on the wrong assumptions; handle-time column `aht_agent_work_fc_s` states its definition |
| `sim/ground-truth-daily.csv` | 120 | Day-level latents (season factor, overflow, spillover, ρ, cohort multipliers). Not part of the book |
| `sim/weekly-summary.md` | — | The verification table |

Hand-written READMEs in each book folder are not overwritten by the generator. The generator does not delete files: if you rename a ledger, remove the old file yourself and record it in the CHANGELOG.

## Design notes

- Service level is a logistic function of load ρ (workload ÷ capacity in reference-AHT hours) with a floor, per channel; abandons and ASA are functions of service level. There is no queueing simulation; the shapes are chosen to look like a small 24/7 group.
- Cohort capacity is productive hours ÷ the cohort's workload-weighted AHT multiplier, so a cohort at 1.5× AHT contributes two-thirds of the contacts per hour.
- Feedbacks (voice overflow, re-contact spillover, contacts per traveler-day) run off the previous days' chat abandon rate (an EWMA), so they lag the break by one to three weeks and unwind after recovery.
- Interval rows are allocated from the daily integers by largest remainder, so every daily figure reconciles exactly to its 48 intervals, and cohort rows reconcile exactly to daily handled.
- North and East share one time zone in this world; interval times are planning-org local time.
