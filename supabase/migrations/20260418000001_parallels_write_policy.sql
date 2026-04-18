-- Phase 2.5: Allow authenticated users to manage (insert/update/delete) parallels.
-- The init migration only added a SELECT policy for parallels; the import pipeline
-- and checklist UI need write access.

create policy "Authenticated users can manage reference parallels" on wnba_cards.parallels
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
