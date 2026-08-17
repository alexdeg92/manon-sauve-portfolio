-- Adds the two fields the admin portal edits but the catalogue could not store:
--   collection  the series a work belongs to (Figures, Mouvement, …)
--   note        the studio note shown on a work's detail view
--
-- Both are nullable. Until this runs, savePaintings() strips them and warns,
-- so the app keeps working on an unmigrated database.
--
-- Run against Postgres (Supabase today, Neon after the move):
--   psql "$DATABASE_URL" -f migrations/001_add_collection_and_note.sql

ALTER TABLE paintings ADD COLUMN IF NOT EXISTS collection text;
ALTER TABLE paintings ADD COLUMN IF NOT EXISTS note text;

-- Optional backfill: seed each work's collection from the same keyword rule the
-- site uses to derive one, so existing rows are not blank on first load.
UPDATE paintings SET collection = 'Danse'
  WHERE collection IS NULL
    AND (id ILIKE '%ballet%' OR id ILIKE '%pointes%' OR id ILIKE '%flamenco%'
         OR title ILIKE '%dansant%' OR title ILIKE '%danse%');

UPDATE paintings SET collection = 'Abstrait'
  WHERE collection IS NULL
    AND (id ILIKE '%abstrait%' OR id ILIKE '%cite%'
         OR title ILIKE '%forêt%' OR title ILIKE '%lys%');

UPDATE paintings SET collection = 'Silhouettes'
  WHERE collection IS NULL
    AND (id ILIKE '%silhouette%' OR id ILIKE '%robe%' OR id ILIKE '%talons%'
         OR title ILIKE '%legs%' OR title ILIKE '%body%');

UPDATE paintings SET collection = 'Portraits'
  WHERE collection IS NULL
    AND (id ILIKE '%portrait%' OR id ILIKE '%cheveux%' OR id ILIKE '%femme%'
         OR title ILIKE '%tête%' OR title ILIKE '%regard%');
