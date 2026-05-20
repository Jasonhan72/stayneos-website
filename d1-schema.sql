-- D1 Database Schema for StayNeos
-- Run this with: wrangler d1 execute stayneos-db --file=./d1-schema.sql

-- User table (simplified from Prisma schema)
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    emailVerified TEXT,
    name TEXT,
    phone TEXT,
    avatar TEXT,
    password TEXT,
    role TEXT DEFAULT 'GUEST' CHECK (role IN ('GUEST', 'HOST', 'ADMIN', 'SUPER_ADMIN')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    resetToken TEXT,
    resetTokenExpiry TEXT,
);

-- Session table for NextAuth
CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expires TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Account table for OAuth (future use)
CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- VerificationToken table for email verification
CREATE TABLE IF NOT EXISTS VerificationToken (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TEXT NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Booking table (simplified)
CREATE TABLE IF NOT EXISTS Booking (
    id TEXT PRIMARY KEY,
    bookingNumber TEXT UNIQUE NOT NULL,
    propertyId TEXT NOT NULL,
    userId TEXT NOT NULL,
    checkIn TEXT NOT NULL,
    checkOut TEXT NOT NULL,
    nights INTEGER NOT NULL,
    stayType TEXT NOT NULL DEFAULT 'NIGHTLY' CHECK (stayType IN ('NIGHTLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
    unitCount INTEGER,
    unitRate REAL,
    guests INTEGER NOT NULL,
    guestName TEXT,
    guestEmail TEXT,
    guestPhone TEXT,
    basePrice REAL NOT NULL,
    cleaningFee REAL,
    serviceFee REAL,
    discount REAL,
    discountRate REAL,
    tax REAL,
    totalPrice REAL NOT NULL,
    currency TEXT DEFAULT 'CAD',
    specialRequests TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW')),
    paymentStatus TEXT DEFAULT 'PENDING' CHECK (paymentStatus IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    stripePaymentIntentId TEXT,
    cancelledAt TEXT,
    cancelReason TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    resetToken TEXT,
    resetTokenExpiry TEXT,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Payment table
CREATE TABLE IF NOT EXISTS Payment (
    id TEXT PRIMARY KEY,
    bookingId TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'CAD',
    stripePaymentIntentId TEXT UNIQUE,
    stripeChargeId TEXT UNIQUE,
    stripeCustomerId TEXT,
    paymentMethod TEXT DEFAULT 'CREDIT_CARD',
    cardBrand TEXT,
    cardLast4 TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'DISPUTED')),
    paidAt TEXT,
    failedAt TEXT,
    refundedAt TEXT,
    refundAmount REAL,
    refundReason TEXT,
    errorMessage TEXT,
    metadata TEXT, -- JSON string
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    resetToken TEXT,
    resetTokenExpiry TEXT,
    FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE
);

-- Inquiry / lead capture table for public forms
CREATE TABLE IF NOT EXISTS Inquiry (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('agents', 'hosts', 'business', 'students', 'long_term', 'contact', 'market_insights')),
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED')),
    metadata TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    resetToken TEXT,
    resetTokenExpiry TEXT,
);

-- Property table (matches production D1 schema — 2026-05-19)
CREATE TABLE IF NOT EXISTS Property (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON Session(sessionToken);
CREATE INDEX IF NOT EXISTS idx_session_user ON Session(userId);
CREATE INDEX IF NOT EXISTS idx_account_provider ON Account(provider, providerAccountId);
CREATE INDEX IF NOT EXISTS idx_booking_user ON Booking(userId);
CREATE INDEX IF NOT EXISTS idx_booking_number ON Booking(bookingNumber);
CREATE INDEX IF NOT EXISTS idx_booking_status ON Booking(status);
CREATE INDEX IF NOT EXISTS idx_payment_booking ON Payment(bookingId);
CREATE INDEX IF NOT EXISTS idx_payment_intent ON Payment(stripePaymentIntentId);
CREATE INDEX IF NOT EXISTS idx_inquiry_type ON Inquiry(type);
CREATE INDEX IF NOT EXISTS idx_inquiry_email ON Inquiry(email);
CREATE INDEX IF NOT EXISTS idx_inquiry_status ON Inquiry(status);
CREATE INDEX IF NOT EXISTS idx_property_slug ON Property(slug);
CREATE INDEX IF NOT EXISTS idx_property_city ON Property(city);
CREATE INDEX IF NOT EXISTS idx_property_status ON Property(status);

-- OAuth State (CSRF protection, replaces cookies)
CREATE TABLE IF NOT EXISTS OAuthState (
    id TEXT PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_state ON OAuthState(state);
