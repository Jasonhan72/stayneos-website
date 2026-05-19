-- Add rate_limits table for D1-backed rate limiting
-- Replaces in-memory Map (ineffective across Workers isolates)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL
);

-- Periodic cleanup index
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);
