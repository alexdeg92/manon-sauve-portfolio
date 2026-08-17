-- Adds the two fields the admin portal edits but the catalogue could not store:
--   collection  the series a work belongs to (Figures, Mouvement, …)
--   note        the studio note shown on a work's detail view
--
-- Both are nullable. Only needed for a database created before these columns
-- existed; 000_init.sql already includes them.
--
-- Run against Neon:
--   node --env-file=.env.local scripts/apply-migration.mjs migrations/001_add_collection_and_note.sql

ALTER TABLE paintings ADD COLUMN IF NOT EXISTS collection text;
ALTER TABLE paintings ADD COLUMN IF NOT EXISTS note text;

-- NOTE: an earlier version of this file backfilled `collection` by keyword-matching
-- id and title. That was removed because the ids are stale slugs from the original
-- 2024 seed data and no longer describe the current works: `abstrait-feu` holds
-- "Jambes dansantes", `cite-bleue` holds "La forêt", `robe-rouge` holds "Scarlett".
-- The backfill therefore wrote guesses into the admin as if Manon had entered them.
--
-- Leave the column NULL. collectionOf() in src/lib/mobile.ts already derives a
-- display group for unset works, so the gallery never shows blank, and a stored
-- value keeps meaning "a human chose this".
