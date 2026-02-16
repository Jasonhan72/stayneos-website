-- ===========================================
-- 数据库迁移: 初始 Schema
-- 创建时间: 2026-02-09
-- 创建者: Logic (后端工程师)
-- ===========================================

-- 注意: 此文件由 Prisma 自动生成
-- 使用命令: npx prisma migrate dev --name init

-- 如需手动执行，请参考以下核心表结构:

/*
-- Users 表
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  name TEXT,
  phone TEXT,
  avatar TEXT,
  password TEXT,
  role TEXT DEFAULT 'GUEST',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Properties 表
CREATE TABLE "Property" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  "shortDesc" TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'Canada',
  "postalCode" TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  "propertyType" TEXT DEFAULT 'APARTMENT',
  bedrooms INTEGER NOT NULL,
  bathrooms FLOAT NOT NULL,
  "maxGuests" INTEGER NOT NULL,
  area INTEGER NOT NULL,
  floor INTEGER,
  "basePrice" DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  "cleaningFee" DECIMAL(10,2),
  "serviceFee" DECIMAL(10,2),
  "monthlyDiscount" DECIMAL(5,2),
  "weeklyDiscount" DECIMAL(5,2),
  "minNights" INTEGER DEFAULT 28,
  "maxNights" INTEGER,
  status TEXT DEFAULT 'DRAFT',
  "isFeatured" BOOLEAN DEFAULT false,
  "isInstantBook" BOOLEAN DEFAULT false,
  "viewCount" INTEGER DEFAULT 0,
  "bookingCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Bookings 表
CREATE TABLE "Booking" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingNumber" TEXT UNIQUE DEFAULT gen_random_uuid(),
  "propertyId" TEXT NOT NULL REFERENCES "Property"(id),
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  "checkIn" TIMESTAMP NOT NULL,
  "checkOut" TIMESTAMP NOT NULL,
  nights INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  "guestName" TEXT,
  "guestEmail" TEXT,
  "guestPhone" TEXT,
  "basePrice" DECIMAL(10,2) NOT NULL,
  "cleaningFee" DECIMAL(10,2),
  "serviceFee" DECIMAL(10,2),
  discount DECIMAL(10,2),
  "discountRate" DECIMAL(5,2),
  tax DECIMAL(10,2),
  "totalPrice" DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  status TEXT DEFAULT 'PENDING',
  "paymentStatus" TEXT DEFAULT 'PENDING',
  "specialRequests" TEXT,
  "cancelledAt" TIMESTAMP,
  "cancelReason" TEXT,
  "stripePaymentIntentId" TEXT UNIQUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- CleaningTasks 表
CREATE TABLE "CleaningTask" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId" TEXT UNIQUE NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'CHECKOUT_CLEANING',
  status TEXT DEFAULT 'SCHEDULED',
  "scheduledAt" TIMESTAMP NOT NULL,
  "completedAt" TIMESTAMP,
  "cleanerId" TEXT,
  "cleanerName" TEXT,
  notes TEXT,
  "beforePhotos" TEXT[] DEFAULT '{}',
  "afterPhotos" TEXT[] DEFAULT '{}',
  checklist JSONB DEFAULT '{}',
  cost DECIMAL(10,2),
  priority TEXT DEFAULT 'NORMAL',
  "notifiedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
*/
