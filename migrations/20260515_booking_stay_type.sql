-- BOOK-004: distinguish short/monthly/quarterly/yearly stays end-to-end.
-- D1 / SQLite stores decimals as REAL.

ALTER TABLE Booking ADD COLUMN stayType TEXT NOT NULL DEFAULT 'NIGHTLY' CHECK (stayType IN ('NIGHTLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));
ALTER TABLE Booking ADD COLUMN unitCount INTEGER;
ALTER TABLE Booking ADD COLUMN unitRate REAL;

UPDATE Booking
SET
  stayType = COALESCE(stayType, 'NIGHTLY'),
  unitCount = COALESCE(unitCount, nights),
  unitRate = COALESCE(unitRate, CASE WHEN nights > 0 THEN ROUND(totalPrice / nights, 2) ELSE basePrice END)
WHERE unitCount IS NULL OR unitRate IS NULL;

ALTER TABLE Property ADD COLUMN defaultStayType TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (defaultStayType IN ('NIGHTLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));
ALTER TABLE Property ADD COLUMN nightlyRate REAL;
ALTER TABLE Property ADD COLUMN monthlyRate REAL;
ALTER TABLE Property ADD COLUMN quarterlyRate REAL;
ALTER TABLE Property ADD COLUMN yearlyRate REAL;

UPDATE Property
SET
  monthlyRate = COALESCE(monthlyRate, priceMonthly),
  quarterlyRate = COALESCE(quarterlyRate, priceQuarterly, ROUND(priceMonthly * 0.92, 2)),
  yearlyRate = COALESCE(yearlyRate, priceAnnual, ROUND(priceMonthly * 0.85, 2)),
  nightlyRate = COALESCE(nightlyRate, ROUND(priceMonthly / 30, 2)),
  defaultStayType = CASE WHEN COALESCE(minStayDays, 30) < 28 THEN 'NIGHTLY' ELSE 'MONTHLY' END;

CREATE INDEX IF NOT EXISTS idx_booking_stay_type ON Booking(stayType);
CREATE INDEX IF NOT EXISTS idx_property_default_stay_type ON Property(defaultStayType);
