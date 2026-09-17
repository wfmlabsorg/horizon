# v000 plan of record — assumption register

**Forecast:** `forecast-daily.csv`, days 1–120 (2026-07-20 to 2026-11-16), by channel.
**Status:** plan of record at migration start. Frozen. Superseded only by a new version in `03-forecast/`; never edited.
**Author:** human:planning lead (Larkspur Travel), 2026-07-13.
**Grades:** [A] asserted, one source · [C] computed, formula stated · [E] estimated, range and assumption · [M] measured. "Carried from Beacon" = the number was measured on the Beacon platform and applied to Meridian without a bridge.

| ID | Assumption | Value used | Grade | Carried from Beacon | Source | Note in the register |
|---|---|---|---|---|---|---|
| A01 | Whole-book transactions, weekday base | 1,250 per weekday | [A] | yes | Booking-platform monthly report, June 2026 | Flat for the whole window |
| A02 | Weekday shape on transactions | Mon 1.08 · Tue 1.12 · Wed 1.08 · Thu 1.02 · Fri 0.90 · Sat 0.38 · Sun 0.42 | [C] | yes | Beacon, last 8 weeks | Shape only; no seasonality applied |
| A03 | Seasonality | none | [A] | — | Planning lead | "Autumn peak is a West phenomenon; migrated regions are flat" |
| A04 | Regional shares of transactions | North 8% · East 7% · West 85% | [C] | yes | Booking platform, June 2026 | Used to scope phase lines |
| A05 | Phase 1 scope and date | North, day 2 (2026-07-21) | [A] | — | Migration programme calendar | |
| A06 | Phase 2 scope and date | East, day 37 (2026-08-25) | [A] | — | Migration programme calendar | |
| A07 | Phase 3 scope and date | West, day 135 (2026-12-01) | [A] | — | Migration programme calendar | Outside this forecast's window |
| A08 | **Contacts per transaction** | **0.35** | [C] | **yes** | Whole-book Beacon, June 2026: contacts ÷ transactions | Applied to the migrated regions as if the book ratio were the regional ratio. Cites `contacts-per-transaction` — the definition file says per region per platform; this plan did not do that |
| A09 | Benchmark cross-check on A08 | 0.20 contacts per transaction | [A] | — | Another Larkspur book already on Meridian | "Meridian books run lower than Beacon; 0.35 is therefore conservative." The benchmark book runs a chat bot; Halcyon's bot is off (see `00-profile/profile.md`) |
| A10 | Channel mix | voice 25% · chat 58% · email 17% | [C] | yes | Beacon channel split, messaging mapped to chat | |
| A11 | **Voice AHT** | **1,150 s** | [M] on Beacon → [E] on Meridian | **yes** | Beacon ACD, 8-week mean | Carried without a bridge; labelled as if measured. Cites `aht-agent-work` |
| A12 | **Chat AHT** | **380 s** | [M] on Beacon → [E] on Meridian | **yes** | Beacon messaging, agent work time per conversation | Beacon messaging is asynchronous; there is no elapsed-time comparator. Cites `aht-agent-work`. Any comparison to Meridian `aht_sec` (elapsed) is a different definition |
| A13 | Email AHT | 420 s | [M] on Beacon → [E] on Meridian | yes | Beacon, 8-week mean | |
| A14 | Learning curve | none for either cohort | [A] | — | Crestline Services onboarding statement: "agents are Meridian-certified" | The home team plan assumed nesting handles the curve before go-live |
| A15 | Occupancy for requirement | 85% | [A] | — | Larkspur planning standard | Requirement hours = workload ÷ 0.85. Cites `requirement-hours` |
| A16 | Shrinkage | 18% in-day, 5% absence | [A] | — | Crestline contract schedule | Not used in the daily forecast; used to translate requirement to heads |
| A17 | Crestline heads, phase 1 | 16 | [A] | — | Hypercare agreement | Deliberately above requirement for go-live stability |
| A18 | Crestline heads, phase 2 | 20 | [C] | — | A08 × A11–A13: phase 2 requirement ≈14 productive hours per weekday, "covered by the phase 1 buffer" plus 4 heads for East time-zone coverage | The number that breaks |
| A19 | Home team | 10 heads, training day 36, nesting day 50, live day 71 | [A] | — | Larkspur L&D calendar | |
| A20 | Service targets | voice 80% in 20 s · chat 80% in 3 min · email 90% in 2 h | [A] | — | Halcyon contract | |
| A21 | Chat bot | off for Halcyon | [A] | — | Contract clause (human-first) | Recorded, but not connected to A09 |
| A22 | Meridian chat timeout | 10 minutes | [A] | — | Platform configuration | Not connected to A08 or A12 |
| A23 | Re-contact | not modelled | — | — | — | |

## What the register would have caught

Four rows carry a Beacon measurement across a platform change and present it at Meridian without an [E] grade or a bridge: A08, A11, A12, A13. One row (A09) cites a benchmark whose condition (bot on) contradicts a stated fact of the book (A21). One row (A18) is computed from the four carried rows and inherits their grade, which makes the phase 2 staffing an [E] presented as a [C]. Nothing in the register is wrong as a Beacon measurement; everything is wrong as a Meridian forecast.

## Formulae (for the [C] rows)

- `fc_transactions = 1250 × regional share of the migrated regions × weekday factor`
- `fc_offered = fc_transactions × 0.35 × channel mix`
- `fc_workload_hours = fc_offered × fc_aht_sec ÷ 3600`
- `fc_required_productive_hours = fc_workload_hours ÷ 0.85`
