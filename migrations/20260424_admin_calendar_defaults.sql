CREATE TABLE IF NOT EXISTS property_pricing_defaults (
  property_id TEXT PRIMARY KEY,
  nightly_price REAL,
  weekend_price REAL,
  weekly_discount_pct REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS property_availability_defaults (
  property_id TEXT PRIMARY KEY,
  min_nights INTEGER,
  max_nights INTEGER,
  advance_notice_days INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_property_pricing_defaults_property_id ON property_pricing_defaults(property_id);
CREATE INDEX IF NOT EXISTS idx_property_availability_defaults_property_id ON property_availability_defaults(property_id);
