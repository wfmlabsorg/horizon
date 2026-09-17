# Schemas

JSON Schema (draft 2020-12) for every row type in a HORIZON book. Ledgers are CSV with a
markdown header or JSON; either way the row shape is one of these. Adapters validate against
them on the way in and out.

| Schema | Row of | Written by |
|---|---|---|
| `ledger-row.schema.json` | The common envelope: value, definition_ref, grade, source, version, actor. Every graded number in every other schema embeds it. Also holds the shared enums (region, channel, cohort, platform, grade, actor) | everyone |
| `demand-daily.schema.json` | `02-demand/demand-daily-*.csv` — date × region × channel × platform | DataEngineer |
| `supply-daily.schema.json` | `04-supply/supply-daily-*.csv` — date × region × channel × cohort | DataEngineer |
| `event.schema.json` | `05-events/` — typed, dated, effect window, grade, status | Scout, Librarian |
| `forecast-version.schema.json` | `03-forecast/v<nnn>-<label>/version.json` — horizon, grain, assumptions, lineage, status, approver | Forecaster; approver is human |
| `assumption.schema.json` | One row of an assumption register (forecast or plan) | Forecaster, CapacityPlanner |
| `question.schema.json` | One XR row in `06-questions/register.md` | Librarian; severity by the register owner |
| `hypothesis.schema.json` | One row of a hypothesis table attached to an XR row | CausalAnalyst |
| `run-state.schema.json` | One run of one clock, with stages and gates | Coordinator |

## Conventions that hold across all of them

- **Grade** is one of `M`, `C`, `E`, `A`. In prose it is written in brackets, `[C]`; in data
  it is the bare letter. A `C` row must carry its formula; an `E` row must carry a range and
  an assumption. The envelope enforces both.
- **definition_ref** is the slug of a file in `books/<client>/01-definitions/`. There is no
  free-text metric name anywhere.
- **actor** is `agent:<Name>` or `human:<role>`. Human gates (`forecast-version.approver`,
  human gates in `run-state`) reject agent actors by pattern.
- **Identifiers** are permanent: `XR-###` questions, `H-###` hypotheses, `EV-###` events,
  `AS-###` assumptions, `v###` versions. Never reused, never renumbered.
- **structural_or_transitional** is required on every driver, assumption and accepted event
  before it can be cited by a capacity plan. `unknown` is a legal value that blocks the plan
  gate, not a way around it.
- **Dates** are ISO `YYYY-MM-DD`; timestamps are ISO 8601 with offset.

## Enums in one place

| Enum | Values | Defined in |
|---|---|---|
| region | North · East · West | ledger-row `$defs/region` |
| channel | voice · chat · email | ledger-row `$defs/channel` |
| cohort | home-team · vendor | ledger-row `$defs/cohort` |
| platform | Beacon · Meridian | ledger-row `$defs/platform` |
| event type | go-live · outage · weather · holiday · client-event · product-change · business-ask · other | event |
| horizon | short · mid · long | forecast-version |
| forecast status | proposed · approved · superseded | forecast-version |
| XR status | New · Assessing · Mitigating · Monitoring · Resolved · Closed | question |
| XR trend | Improving · Stable · Worsening | question |
| hypothesis status | open · testing · supported · refuted · inconclusive · superseded | hypothesis |
| clock | daily · weekly · monthly · adhoc | run-state |
| gate | evaluator · planner-reforecast · planner-capacity-plan · planner-severity · planner-publication · planner-monthly-signoff | run-state |

## Validating

The adapter stubs in `/adapters/*/` each carry a `--dry-run` that validates a sample file
against their SPEC. A general validator over these schemas is a phase-1 item; until then,
`bun x ajv-cli validate -s schemas/<name>.schema.json -d <file.json>` works for JSON rows
(add `-r schemas/ledger-row.schema.json` for the shared `$ref`s).
