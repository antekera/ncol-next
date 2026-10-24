-- Apply only during the reviewed Home V2 cache rollout, to the existing Turso
-- views database. Application startup never creates or migrates remote tables.
-- Published editorial data only; production, preview and local use distinct keys.
CREATE TABLE IF NOT EXISTS home_v2_snapshots (
  cache_key TEXT PRIMARY KEY NOT NULL,
  payload TEXT,
  fetched_at INTEGER,
  requested_revision INTEGER NOT NULL DEFAULT 0,
  applied_revision INTEGER NOT NULL DEFAULT 0,
  snapshot_revision INTEGER NOT NULL DEFAULT 0,
  invalidated_revision INTEGER NOT NULL DEFAULT 0,
  due_at INTEGER,
  lease_token TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0,
  claimed_revision INTEGER NOT NULL DEFAULT 0,
  last_attempt_at INTEGER NOT NULL DEFAULT 0
);
