# IEX adapter (mock)

**What the real integration is.** IEX is the WFM platform that turns a short-term forecast
into interval requirements and schedules. The planning organization loads a forecast into it
(contacts and handle time by interval and skill, typically 1–6 weeks out) and pulls interval
actuals back from it (offered, handled, service level, staffing). Both directions are file-
or API-based in practice; the file shapes here are the ones a planner would recognize.

**What the mock does.** File exchange in the real shape, nothing else.

| Direction | File | Written by | Read by |
|---|---|---|---|
| Book → IEX | `forecast-import-<period>-v<nnn>.csv` | Adapter-IEX, from an **approved** `03-forecast/v<nnn>-*/` | the mock IEX (the synthetic world) |
| IEX → Book | `actuals-export-<period>-v<nnn>.csv` | the mock IEX (the synthetic generator) | DataEngineer, into `02-demand/` and `04-supply/` |

The adapter never exports a forecast whose `version.json` status is not `approved`. That is
the planner gate, enforced at the file boundary.

## Files

- `SPEC.md` — column layout for both files, with the definition each column cites.
- `iex.ts` — typed interfaces and a `--dry-run` validator. `bun adapters/iex/iex.ts --dry-run <file>`
  detects which of the two shapes the file is from its header and validates it.
- `samples/forecast-import-sample.csv`, `samples/actuals-export-sample.csv`.

## Grades at the boundary

Forecast import rows are `[E]` at best (they are forecasts). Actuals export rows are `[M]` for
counts and elapsed times, and the adapter writes the definition references into the book-side
header when the DataEngineer ingests them. IEX's own "AHT" column is **elapsed** time; the
adapter maps it to `aht_elapsed_s` and never to `aht_agent_work_s`.
