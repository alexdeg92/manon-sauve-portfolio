-- Turns an enquiry into a conversation, now that Resend receiving is enabled on
-- manonsauve.art: a visitor's reply comes back as an inbound webhook and has to
-- land somewhere.
--
--   node --env-file=.env.local scripts/apply-migration.mjs migrations/003_enquiry_threads.sql
--
-- enquiries.message stays as the first message so nothing that reads it breaks;
-- everything after it lives here.

CREATE TABLE IF NOT EXISTS enquiry_messages (
  id          text PRIMARY KEY,
  enquiry_id  text NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  -- 'inbound'  = from the visitor
  -- 'outbound' = Manon's reply, sent through the portal
  direction   text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body        text NOT NULL,
  -- Resend's message id. Webhooks are retried on failure, so this is how a
  -- redelivery is recognised instead of duplicating the message.
  provider_id text UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiry_messages_thread_idx
  ON enquiry_messages (enquiry_id, created_at);

-- Backfills each existing enquiry's opening message so the thread view is not
-- missing its first entry.
INSERT INTO enquiry_messages (id, enquiry_id, direction, body, created_at)
SELECT 'msg-' || e.id, e.id, 'inbound', e.message, e.created_at
FROM enquiries e
WHERE NOT EXISTS (
  SELECT 1 FROM enquiry_messages m WHERE m.enquiry_id = e.id
);
