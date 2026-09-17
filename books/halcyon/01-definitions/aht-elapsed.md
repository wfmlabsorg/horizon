# aht-elapsed

**Name:** Average handle time, elapsed
**Formula:** `aht_elapsed = Σ(answer-to-close elapsed time + after-contact work) / handled`,
per channel. Elapsed time is wall-clock from agent acceptance to session close.
**Unit:** seconds
**Source system:** Contact router (ACD) contact records; mock: `02-demand/demand-daily-*.csv`
column `aht_elapsed_s`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [M]

## The two-definitions trap (read before using this number)

This book has had **two different numbers both called "AHT"** in circulation. They are not
interchangeable and the difference is not small on chat.

| | `aht-elapsed` (this file) | `aht-agent-work` |
|---|---|---|
| What it measures | Wall-clock duration of the contact from acceptance to close | Agent time actually consumed by the contact |
| Chat | **Includes** the customer's silent wait up to the inactivity timeout (Meridian: 600 s, a 10-minute inactivity timeout) and the time the agent spent on other concurrent chats | Elapsed time **divided by effective concurrency**, with the timeout wait removed |
| Voice | Same as agent-work (concurrency = 1, no timeout) | Same as elapsed |
| Email | Session open-to-send, which includes interruptions | Focused work time |
| Used for | Customer experience, chat session sizing, timeout tuning | **Staffing.** Requirement hours use this and only this |
| Grade | [M] | [C] |

On chat, `aht-elapsed` can run two to three times `aht-agent-work`. A staffing model fed with
the elapsed number over-staffs chat; a staffing model fed with the agent-work number and then
"validated" against an elapsed report looks wrong when it is right.

Rules:

1. No ledger column, note, card or plan says "AHT". It says `aht-elapsed` or `aht-agent-work`.
2. Requirement hours cite `aht-agent-work`. An `[A]` handle-time figure that arrives by email
   with no definition attached is recorded as `aht-unspecified [A]` in the intake extract and
   is not used until the sender confirms which one it is.
3. A handle-time shift at a platform go-live is tested on both definitions. A shift in elapsed
   with no shift in agent-work is a timeout or concurrency change, not a work-content change.

## Other known traps

- Timeout policy is part of the elapsed definition. Changing the chat inactivity timeout
  changes `aht-elapsed` with no change in work. Log timeout changes in `05-events/` as
  `product-change`.
- After-contact work is included; a vendor export that reports talk time only is a different
  definition.
- Beacon-era and Meridian-era elapsed times are not comparable without the bridge assumption
  in the forecast's assumption register (the go-live shift is the thing under study, not a
  data error).

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition; two-definitions trap recorded |
