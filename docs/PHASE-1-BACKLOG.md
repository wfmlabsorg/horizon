# Phase 1 backlog — reconciliation items from the phase 0 build

Recorded 2026-09-16 at merge. Each is a decision for phase 1, not a defect to hide.

1. **Column and file naming.** The generator writes `02-demand/daily-channel.csv` with `aht_sec` / `aht_agent_sec`; the schemas expect `demand-daily-<period>-v<nnn>.csv` with `aht_elapsed_s` / `aht_agent_work_s`, split shrinkage (planned/unplanned) and occupancy and concurrency columns. `01-definitions/INDEX.md` carries the crosswalk. Decision: the generator adopts the schema names and versioned file names in phase 1 (the DataEngineer's first job in the daily loop is to reconcile and version, so the ledger conventions should win).
2. **Plan-of-record assumptions.** `v000-plan-of-record/forecast-daily.csv` carries `fc_aht_sec` with no statement of which handle-time definition it is, and a book-level `fc_contacts_per_transaction`. Both are planted traps (see sim/GROUND-TRUTH.md) and stay; `assumptions.md` should adopt `TEMPLATE-assumption-register.md` columns.
3. **Chat inactivity timeout.** Profile and generator use 600 s (10 minutes); the definitions ledger was corrected to match at merge.
4. **Surge event EV-010.** The generator added a reactive vendor surge (+8 heads, day 78) so the story has a recovery; it lands one week after the home-team go-live and two days before the weather event, so the recovery is confounded on purpose. Keep unless the demo storyline needs a cleaner recovery.
5. **Predecessor references.** The phase 0 design was drafted against an earlier engine; docs/DESIGN.md is the scrubbed copy and the only design file in the repo.
