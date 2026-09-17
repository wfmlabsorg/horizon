# Email adapter — file spec

## `intake-<period>-v<nnn>.jsonl`

UTF-8, one JSON object per line, no blank lines, no trailing commas. Messages are in
date order, oldest first, so precedence ("later message wins") applies naturally when a
thread is processed.

### Message record

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Message id from the mailbox; permanent |
| `thread_id` | string | no | Groups a thread; forwarded threads are split into one record per message |
| `from` | `{name, role}` | yes | Name as signed; role as known to the book (`client`, `vendor`, `home-team`, `leadership`, `planning`, `unknown`) |
| `to` | string[] | no | |
| `date` | ISO 8601 date-time | yes | The message's own date. A record with no date is rejected; the session date is never a proxy |
| `subject` | string | yes | `[XR-014] …` if it addresses an existing row; `[NEW] …` if it proposes one |
| `body` | string | yes | Plain text |
| `classification` | enum | yes | `planning-request` · `performance-question` · `data-pull` · `event` · `update` · `noise` |
| `xr_ref` | `XR-###` | no | Existing register row addressed |
| `event_type` | enum | when classification = event | same enum as `schemas/event.schema.json` |
| `extracted_asks` | ExtractedAsk[] | yes (may be empty) | The six intake fields per ask |
| `figures` | Figure[] | no | Every number in the body, as written, with unit and period or `[unit?]` |
| `severity_proposed` | 1–4 | no | Recorded only; never applied |
| `grade` | `"A"` | yes | Always A at this boundary |
| `attachments` | string[] | no | Names only; a named artifact the book can produce may raise the grade later |

### ExtractedAsk (the six intake fields)

| Field | Type | Notes |
|---|---|---|
| `question` | string | One sentence |
| `decision_it_feeds` | string or null | **null means the requester could not state it → route as data-pull** |
| `who_decides` | string or null | |
| `when_needed` | ISO date or null | Relative dates resolved against the message date |
| `what_data_exists` | string or null | |
| `what_done_looks_like` | string or null | |
| `route` | enum | `planning-request` · `performance-question` · `data-pull` · `event`; must be `data-pull` when `decision_it_feeds` is null |
| `supporting_quote` | string | The clause in the body that carries the ask; nothing applies without it |

### Figure

`{ "text": "1,200 calls/day", "value": 1200, "unit": "calls/day", "period": "day" }` or, if
the unit or period cannot be read, `{ "text": "about 30%", "value": 30, "unit": "[unit?]", "period": null }`.

Rules: `grade` must be `"A"`; `classification = event` requires `event_type`; every ask
with `decision_it_feeds: null` must have `route: "data-pull"`; `xr_ref`, when present, must
match the `[XR-###]` in the subject if there is one; `date` must parse.
