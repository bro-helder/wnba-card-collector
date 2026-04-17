-- Phase 2: Flag auto-created checklist entries for later cleanup
-- When a scan confirms a card not already in the checklist, we auto-create
-- minimal set + card rows. needs_review = true marks them for batch cleanup.

alter table wnba_cards.sets
  add column if not exists needs_review boolean default false;

alter table wnba_cards.cards
  add column if not exists needs_review boolean default false;

-- Helpful index for the "review queue" UI (Phase 3+)
create index if not exists idx_cards_needs_review
  on wnba_cards.cards (needs_review)
  where needs_review = true;
