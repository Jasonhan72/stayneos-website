-- StayNeos D1 Database Schema
-- 创建用户表

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'GUEST',
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- 创建预订表
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_number TEXT UNIQUE NOT NULL,
    property_id TEXT NOT NULL,
    property_title TEXT NOT NULL,
    user_id TEXT,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    nights INTEGER NOT NULL,
    guests INTEGER NOT NULL,
    base_price REAL NOT NULL,
    discount_rate REAL,
    discount_amount REAL,
    service_fee REAL,
    total_price REAL NOT NULL,
    currency TEXT DEFAULT 'CAD',
    special_requests TEXT,
    status TEXT DEFAULT 'PENDING',
    payment_status TEXT DEFAULT 'PENDING',
    created_at TEXT NOT NULL,
    updated_at TEXT,
    confirmed_at TEXT,
    cancelled_at TEXT,
    cancel_reason TEXT
);

-- 创建邮件发送记录表
CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    booking_id TEXT,
    recipient TEXT NOT NULL,
    recipient_type TEXT NOT NULL, -- 'GUEST' or 'ADMIN'
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    status TEXT DEFAULT 'SENT',
    sent_at TEXT NOT NULL,
    error_message TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
