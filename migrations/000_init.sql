-- Schema for the Neon database that replaced Supabase.
--
-- Run first, against an empty Neon branch:
--   node --env-file=.env.local scripts/apply-migration.mjs migrations/000_init.sql
--
-- 001_add_collection_and_note.sql is only needed for a database created before
-- collection/note existed; the columns are already included below.
--
-- Images are not stored here; they live in Vercel Blob and paintings.image holds
-- the public blob URL.

CREATE TABLE IF NOT EXISTS paintings (
  id            text PRIMARY KEY,
  title         text NOT NULL,
  medium        text,
  dimensions    text,
  price         numeric(10, 2),
  image         text,
  year          integer,
  sold          boolean NOT NULL DEFAULT false,
  collection    text,
  note          text,
  display_order integer,
  created_at    timestamptz DEFAULT now()
);

-- getPaintings() orders by this on every public page load.
CREATE INDEX IF NOT EXISTS paintings_display_order_idx ON paintings (display_order);

CREATE TABLE IF NOT EXISTS settings (
  key   text PRIMARY KEY,
  value text
);
