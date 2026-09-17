# IEX adapter — file spec

Both files are UTF-8 CSV, comma-separated, header row first, no quoting unless a field
contains a comma, `\n` line endings, ISO dates, 24-hour `HH:MM` interval starts, 30-minute
intervals. A leading comment block is **not** allowed in the file itself; descriptive fields go
in the book-side `.md` sidecar.

## Skill codes

`<BOOK>_<CHANNEL>_<REGION>` in upper case, e.g. `HALCYON_CHAT_EAST`. Channel ∈ VOICE, CHAT,
EMAIL. Region ∈ NORTH, EAST, WEST. Cohort is not in the skill code (IEX schedules both cohorts
against one skill requirement).

## 1. Forecast import — `forecast-import-<period>-v<nnn>.csv`

One row per date × interval × skill for the forecast period.

| # | Column | Type | Definition cited | Notes |
|---|---|---|---|---|
| 1 | `date` | YYYY-MM-DD | — | |
| 2 | `interval_start` | HH:MM | — | 00:00 … 23:30 |
| 3 | `skill` | code | — | see above |
| 4 | `contacts` | number ≥ 0 | `offered` | forecast offered contacts for the interval |
| 5 | `aht_s` | number ≥ 0 | `aht-agent-work` | **agent-work** seconds; IEX sizes staffing from this |
| 6 | `forecast_version` | `v###` | — | the `03-forecast` version exported |
| 7 | `grade` | M/C/E/A | — | grade of the row; forecasts are E or C |

Rules: contiguous intervals (48 per skill per date), no duplicate (date, interval, skill),
one `forecast_version` per file, `grade` never `M`.

## 2. Actuals export — `actuals-export-<period>-v<nnn>.csv`

One row per date × interval × skill, as IEX reports it.

| # | Column | Type | Definition cited on ingest | Notes |
|---|---|---|---|---|
| 1 | `date` | YYYY-MM-DD | — | |
| 2 | `interval_start` | HH:MM | — | |
| 3 | `skill` | code | — | |
| 4 | `offered` | integer ≥ 0 | `offered` | |
| 5 | `handled` | integer ≥ 0 | `handled` | counted at answer |
| 6 | `handled_in_sl` | integer ≥ 0 | `handled-in-sl` | ≤ handled |
| 7 | `abandoned` | integer ≥ 0 | `abandoned` | 0 on EMAIL skills |
| 8 | `asa_s` | number ≥ 0 | `asa` | |
| 9 | `aht_s` | number ≥ 0 | `aht-elapsed` | **elapsed**; mapped to `aht_elapsed_s`, never to agent-work |
| 10 | `staffed_agents` | number ≥ 0 | `staffed-hours` | mean logged-in agents in the interval; × 0.5 = staffed hours |
| 11 | `export_id` | string | — | IEX pull identifier; goes into the book row `source.ref` |

Rules: `handled_in_sl ≤ handled ≤ offered`; on VOICE and CHAT `handled + abandoned ≤ offered`
(the remainder carried); `abandoned = 0` on EMAIL; one `export_id` per file. Rows that fail are
reported with their line number; the file is rejected as a whole (a re-pull is a new version).
