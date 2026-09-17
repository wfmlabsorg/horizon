# contacts-per-transaction

**Name:** Contacts per transaction
**Formula:** `cpt = contacts / transactions`, computed **per region, per platform, per period**
(day or month). Contacts by originating region; transactions by traveler-profile region. A
book-level figure, if ever shown, is the transaction-weighted mean of the per-region figures
and is labelled as such.
**Unit:** ratio
**Source system:** Computed from `contact` (ACD) and `transaction` (booking platform); mock:
`02-demand/` derived column `cpt`
**Owner:** Halcyon planning lead (Larkspur Travel)
**Highest attainable grade:** [C] (inputs [M]); [E] across the migration boundary

## The composition trap (read before quoting any ratio)

This is the metric that this book has most often got wrong, and it was got wrong by using a
correct number in the wrong place. Two forms:

**1. A whole-book ratio is not a migrated-region ratio.**
Contacts per transaction for the whole Halcyon book blends Beacon regions and Meridian regions
in whatever proportion has migrated so far. If the migrated region runs a higher ratio, the
whole-book ratio drifts up as migration proceeds with no change in any region's behaviour, and
a forecast built on the book ratio will under-forecast the next region to migrate. Phase 0's
synthetic ground truth builds exactly this: the plan-of-record used a book-level ratio; the
migrated regions ran a different one. Always compute and forecast per region and platform, and
carry the mix as a separate, explicit driver.

**2. A post-bot benchmark is not a no-bot benchmark.**
A ratio carried from another book, or from this book's own future state, where a bot deflects
some share of contacts before they reach a human, is a ratio net of deflection. Halcyon in
phase 0 has no bot. Applying a post-bot ratio here under-states demand by the deflection share
by construction, and no amount of forecasting skill recovers it. Any ratio that arrives from
outside this book is `[A]` until its bot state, platform, channel mix and re-contact rule are
known, and then at best `[E]` with those stated as assumptions.

General rule: a ratio is only comparable to another ratio when numerator definition,
denominator definition, population and period all match. Write the four down before comparing.

## Other known traps

- Re-contacts sit in the numerator. When service level breaks, the ratio rises through spillover
  with no change in underlying need. Report first-contact and repeat-contact ratios separately
  in any variance investigation.
- Transaction counting changed at the Beacon→Meridian boundary (see `transaction`). The ratio
  moves at go-live for that reason alone; separate it from the real behaviour change with the
  bridge assumption.
- Seasonal transaction growth lifts contacts proportionally; it is growth in the ratio's
  denominator, not in the ratio. "Growth with no new population" is a demand question, not a
  ratio question, until the ratio is shown to have moved.

## Change history

| Date | Actor | Change |
|---|---|---|
| 2026-09-16 | agent:Librarian | Initial definition; composition trap recorded |
