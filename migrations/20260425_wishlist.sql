-- Wishlist: (userId, propertyId) pairs, unique per user.
-- Keep it simple: we don't need per-item metadata beyond addedAt for now.
-- Both FK columns are TEXT to match User.id and Property.id (also TEXT) and
-- Property.slug-style identifiers that the frontend currently uses
-- (propertyId may be either a DB id or a slug like "prop-55-cooper").

CREATE TABLE IF NOT EXISTS Wishlist (
    userId     TEXT NOT NULL,
    propertyId TEXT NOT NULL,
    addedAt    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (userId, propertyId)
);

CREATE INDEX IF NOT EXISTS Wishlist_userId_idx     ON Wishlist(userId);
CREATE INDEX IF NOT EXISTS Wishlist_propertyId_idx ON Wishlist(propertyId);
