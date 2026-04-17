-- Phase 2: Add back-of-card image support to scan_sessions
-- Also rename image_url to store storage path (not public URL) for reliable signed-URL access

alter table wnba_cards.scan_sessions
  add column if not exists back_image_path text;

-- Rename image_url to front_image_path to clarify it stores a storage path.
-- We keep image_url as an alias column so existing data isn't broken mid-session.
-- New code writes to front_image_path; image_url kept for backwards compat during migration.
alter table wnba_cards.scan_sessions
  add column if not exists front_image_path text;
