-- Add token_version to User table for session invalidation on password change / revoke-all.
-- Incrementing this value invalidates all existing JWTs for the user.
ALTER TABLE User ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
