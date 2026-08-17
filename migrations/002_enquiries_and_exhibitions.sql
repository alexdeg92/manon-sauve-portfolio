-- Replaces the two blocks of placeholder data the redesign shipped with:
--
--   enquiries    every contact/commission/studio-visit/newsletter submission,
--                so the Demandes panel shows real messages instead of the five
--                invented ones in demo-data.ts
--   exhibitions  the show + press list the public site used to hard-code, now
--                editable from the admin
--
--   node --env-file=.env.local scripts/apply-migration.mjs migrations/002_enquiries_and_exhibitions.sql

CREATE TABLE IF NOT EXISTS enquiries (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  message     text NOT NULL,
  -- The form's `painting` field: an artwork title, or a label such as
  -- "Commande" / "Infolettre" / "Visite d'atelier".
  subject     text,
  -- Set when `subject` matched a catalogue title, so the panel can show the
  -- thumbnail. Intentionally not a foreign key: deleting a work must not
  -- delete the enquiry that asked about it.
  painting_id text,
  status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  replied_at  timestamptz
);

-- The panel lists newest first and filters by status.
CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries (status);

CREATE TABLE IF NOT EXISTS exhibitions (
  id            text PRIMARY KEY,
  year          text NOT NULL,
  title         text NOT NULL,
  venue_fr      text NOT NULL,
  venue_en      text,
  kind_fr       text NOT NULL,
  kind_en       text,
  display_order integer
);

CREATE INDEX IF NOT EXISTS exhibitions_display_order_idx ON exhibitions (display_order);
