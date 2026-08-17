-- Read state has to be separate from conversation status.
--
-- status answers "where is this conversation" (new / replied / closed).
-- read_at answers "has Manon looked at it".
--
-- Swiping a row to mark it read cannot reuse status: setting 'replied' would
-- claim an answer was sent, and 'closed' would archive it. So the swipe toggles
-- this column and leaves the conversation alone.
--
--   node --env-file=.env.local scripts/apply-migration.mjs migrations/004_enquiry_read_state.sql

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Anything already answered or closed has obviously been seen; anything still
-- 'new' has not.
UPDATE enquiries
SET read_at = COALESCE(replied_at, now())
WHERE read_at IS NULL AND status IN ('replied', 'closed');

-- Unread count reads this on every portal load.
CREATE INDEX IF NOT EXISTS enquiries_read_at_idx ON enquiries (read_at);
