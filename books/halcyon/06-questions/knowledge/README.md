# knowledge — answered question cards

Every "why" is answered once, as a graded card, and filed here so the next asker finds it
before asking. This folder is the archive lifecycle: cards are filed when an XR row reaches
Resolved or Closed and are never edited afterwards. A changed answer is a new card that cites
the old one.

## Filing

- Filename: `XR-###-<slug>.md`, where the slug is three to six words from the title sentence.
  The XR id makes it findable from the register; the slug makes it findable by eye.
- The card is the `TEMPLATE-answer-card.md` shape, complete, with its Evaluator pass recorded.
- On filing: set `answer_card_ref` on the register row, append a change-log line, and add a
  line to `INDEX.md` here (created on first filing) under the topic headings below.
- A card is filed only after the human publication gate (`planner-publication` in the run
  state). Agents draft; the register owner approves the filing.

## Finding a card

`INDEX.md` lists cards by topic, then by date. Topics for this book:

- migration (go-live effects, platform bridges)
- handle time (level shifts, learning curves, the two definitions)
- demand drivers (transactions, travelers, re-contacts, seasonality)
- supply (shrinkage, training pulls, vendor delivery)
- events (outages, weather, holidays)
- definitions (any card whose answer was "the two numbers meant different things")

Search order for a new question: the register (is it open?), then `INDEX.md` by topic, then
grep the cards for the region, channel and metric slug. If a filed card answers it, the reply
is a pointer to the card and a check that "what would change the answer" has not been
observed since.

## Superseding

When a later card changes an earlier answer, the new card's lineage cites the old XR and the
old card gets one appended line at the bottom, `Superseded by XR-### on YYYY-MM-DD`. That
line is the only edit ever made to a filed card.
