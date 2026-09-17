# transaction

**Name:** Transaction
**Formula:** One booking-platform action with a PNR or order effect: a new booking, a change or
a cancellation, counted once at commit. Searches, holds and failed commits are not transactions.
**Unit:** count per period
**Source system:** Booking platform transaction feed (Beacon; Meridian after go-live per
region); mock: `02-demand/transactions-daily-*.csv` column `transactions`
**Owner:** Halcyon account lead (Larkspur Travel), with the planning lead as consumer
**Highest attainable grade:** [M]

## Known traps

- Beacon and Meridian count differently at the edges: Meridian records a multi-segment change
  as one transaction; Beacon recorded one per segment. Transaction counts across the migration
  boundary are not comparable without the bridge assumption. This changes the denominator of
  `contacts-per-transaction` by construction, before any real behaviour change.
- Online (self-service) and offline (agent-assisted) transactions are both transactions. The
  ratio that matters for demand is contacts to **all** transactions, with the online share as a
  separate driver; do not silently switch to offline-only.
- Transactions attach to the region of the traveler's profile, not the region of the agent who
  handled the contact.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition |
