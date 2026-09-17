# Anaplan adapter — file spec

UTF-8 CSV, comma-separated, header row first, `\n` line endings. One file per signed plan
version; one row per book × region × channel × cohort × month across the plan horizon.

## `plan-export-<period>-v<nnn>.csv`

| # | Column | Type | Definition cited | Notes |
|---|---|---|---|---|
| 1 | `book` | string | — | book slug, `halcyon` |
| 2 | `region` | North/East/West | — | |
| 3 | `channel` | voice/chat/email | — | |
| 4 | `cohort` | home-team/vendor | — | FTE conversion differs by cohort; never blended |
| 5 | `month` | YYYY-MM | — | |
| 6 | `req_hours` | number ≥ 0 | `requirement-hours` | monthly requirement, agent-work basis |
| 7 | `productive_hours_planned` | number ≥ 0 | `productive-hours` | supply side of the gap |
| 8 | `fte_required` | number ≥ 0 | `fte` | monthly average |
| 9 | `fte_on_roster` | number ≥ 0 | `fte` | headcount at contract hours, monthly average |
| 10 | `gap_fte` | number | `fte` | `fte_on_roster − fte_required`; negative = short |
| 11 | `plan_version` | `v###` | — | the `07-plans` version signed |
| 12 | `scenario` | string | — | `base` on the signed export; scenario packs use their label |
| 13 | `grade` | M/C/E/A | — | grade of `fte_required` for the row |
| 14 | `assumptions_ref` | path | — | the plan's assumption register |
| 15 | `signed_by` | `human:<role>` | — | the same on every row; agent actors rejected |

Rules: no duplicate (book, region, channel, cohort, month); `gap_fte = fte_on_roster −
fte_required` to two decimals; one `plan_version`, one `signed_by`, one `assumptions_ref`
per file; `signed_by` must start with `human:`; `grade` never `M` on `fte_required` (a
required FTE is a computation on a forecast).
