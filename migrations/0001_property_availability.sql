CREATE TABLE IF NOT EXISTS property_availability (
  property_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  price_cents INTEGER,
  min_nights INTEGER,
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT,
  PRIMARY KEY (property_id, date)
);

CREATE INDEX IF NOT EXISTS idx_property_availability_date
  ON property_availability(date);
CREATE INDEX IF NOT EXISTS idx_property_availability_property
  ON property_availability(property_id);
