CREATE TABLE Property_new (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  titleZh TEXT,
  titleFr TEXT,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'ARCHIVED')),
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT DEFAULT 'Toronto',
  latitude REAL,
  longitude REAL,
  propertyType TEXT DEFAULT 'APARTMENT',
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  sqft INTEGER,
  floor INTEGER,
  facing TEXT,
  balconySqft INTEGER,
  buildingYear INTEGER,
  developer TEXT,
  description TEXT,
  descriptionZh TEXT,
  descriptionFr TEXT,
  priceMonthly INTEGER,
  priceQuarterly INTEGER,
  priceAnnual INTEGER,
  currency TEXT DEFAULT 'CAD',
  includedAmenities TEXT,
  buildingAmenities TEXT,
  nearestSubway TEXT,
  subwayWalkMinutes INTEGER,
  nearbyLandmarks TEXT,
  minStayDays INTEGER DEFAULT 30,
  checkInTime TEXT DEFAULT '15:00',
  checkOutTime TEXT DEFAULT '11:00',
  selfCheckIn INTEGER DEFAULT 1,
  images TEXT,
  heroImage TEXT,
  idealFor TEXT,
  metaTitle TEXT,
  metaDescription TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  createdBy TEXT REFERENCES User(id),
  maxGuests INTEGER
);

INSERT INTO Property_new SELECT * FROM Property;

DROP TABLE Property;

ALTER TABLE Property_new RENAME TO Property;

CREATE INDEX IF NOT EXISTS idx_property_status ON Property(status);
CREATE INDEX IF NOT EXISTS idx_property_slug ON Property(slug);
CREATE INDEX IF NOT EXISTS idx_property_city ON Property(city);
CREATE INDEX IF NOT EXISTS idx_property_createdBy ON Property(createdBy);
