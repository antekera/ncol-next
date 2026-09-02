-- Reactions (BuzzFeed-style sentiment voting per post).
-- Shares the Turso "views" DB (TURSO_DB_URL) alongside the `visits` table.
-- Long-format schema (one row per (slug, reaction)) so adding/removing
-- reactions never requires a migration.

CREATE TABLE IF NOT EXISTS reactions (
  post_slug   TEXT NOT NULL,
  reaction    TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL,
  post_date   TEXT,
  PRIMARY KEY (post_slug, reaction)
);

CREATE INDEX IF NOT EXISTS reactions_slug_idx ON reactions (post_slug);

-- Supports "top posts by reaction in the last N days" queries:
--   SELECT post_slug, count FROM reactions
--   WHERE reaction = ? AND post_date >= date('now', '-7 days')
--   ORDER BY count DESC LIMIT ?;
CREATE INDEX IF NOT EXISTS reactions_reaction_date_idx
  ON reactions (reaction, post_date);
