ALTER TABLE User ADD COLUMN deletionRequestedAt TEXT;
ALTER TABLE User ADD COLUMN deletionScheduledAt TEXT;
ALTER TABLE User ADD COLUMN deletionStatus TEXT NOT NULL DEFAULT 'active';
CREATE INDEX IF NOT EXISTS idx_user_deletion_status ON User(deletionStatus);
