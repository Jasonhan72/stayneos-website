-- Migration: Add Host Support
-- Created: 2025-02-26
-- Description: Add hosts table, host_applications table, host_documents table, and update properties table

-- ============================================
-- Step 1: Create Host enum types first
-- ============================================

-- Create HostStatus enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HostStatus') THEN
        CREATE TYPE "HostStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
    END IF;
END$$;

-- Create HostLevel enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HostLevel') THEN
        CREATE TYPE "HostLevel" AS ENUM ('NEW', 'RISING', 'ESTABLISHED', 'SUPERHOST');
    END IF;
END$$;

-- Create ApplicationStatus enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationStatus') THEN
        CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED');
    END IF;
END$$;

-- Create DocumentStatus enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DocumentStatus') THEN
        CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
    END IF;
END$$;

-- ============================================
-- Step 2: Create hosts table
-- ============================================

CREATE TABLE IF NOT EXISTS "hosts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "display_name" TEXT NOT NULL,
    "tagline" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "status" "HostStatus" NOT NULL DEFAULT 'PENDING',
    "is_verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "verification_date" TIMESTAMP(3),
    "business_email" TEXT,
    "business_phone" TEXT,
    "total_properties" INTEGER NOT NULL DEFAULT 0,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "response_rate" INTEGER NOT NULL DEFAULT 0,
    "response_time_minutes" INTEGER,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 5.0,
    "host_level" "HostLevel" NOT NULL DEFAULT 'NEW',
    "superhost_since" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',
    "preferred_languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hosts_pkey" PRIMARY KEY ("id")
);

-- Create unique index on user_id (one user can only be one host)
CREATE UNIQUE INDEX IF NOT EXISTS "hosts_user_id_key" ON "hosts"("user_id");

-- Create indexes for hosts table
CREATE INDEX IF NOT EXISTS "idx_hosts_status" ON "hosts"("status");
CREATE INDEX IF NOT EXISTS "idx_hosts_host_level" ON "hosts"("host_level");

-- Add foreign key constraint
ALTER TABLE "hosts" 
    DROP CONSTRAINT IF EXISTS "hosts_user_id_fkey",
    ADD CONSTRAINT "hosts_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- Step 3: Create host_applications table
-- ============================================

CREATE TABLE IF NOT EXISTS "host_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expected_properties" INTEGER NOT NULL DEFAULT 1,
    "property_location" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "host_applications_pkey" PRIMARY KEY ("id")
);

-- Create indexes for host_applications table
CREATE INDEX IF NOT EXISTS "idx_host_applications_user_id" ON "host_applications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_host_applications_status" ON "host_applications"("status");

-- Add foreign key constraints
ALTER TABLE "host_applications"
    DROP CONSTRAINT IF EXISTS "host_applications_user_id_fkey",
    ADD CONSTRAINT "host_applications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "host_applications"
    DROP CONSTRAINT IF EXISTS "host_applications_reviewed_by_fkey",
    ADD CONSTRAINT "host_applications_reviewed_by_fkey"
    FOREIGN KEY ("reviewed_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- Step 4: Create host_documents table
-- ============================================

CREATE TABLE IF NOT EXISTS "host_documents" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_number" TEXT,
    "document_url" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "host_documents_pkey" PRIMARY KEY ("id")
);

-- Create index for host_documents table
CREATE INDEX IF NOT EXISTS "idx_host_documents_host_id" ON "host_documents"("host_id");

-- Add foreign key constraint
ALTER TABLE "host_documents"
    DROP CONSTRAINT IF EXISTS "host_documents_host_id_fkey",
    ADD CONSTRAINT "host_documents_host_id_fkey"
    FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- Step 5: Update properties table
-- ============================================

-- Add host_id column
ALTER TABLE "Property" 
    ADD COLUMN IF NOT EXISTS "host_id" TEXT;

-- Add admin_created column
ALTER TABLE "Property"
    ADD COLUMN IF NOT EXISTS "admin_created" BOOLEAN NOT NULL DEFAULT FALSE;

-- Create indexes for properties table
CREATE INDEX IF NOT EXISTS "idx_properties_host_id" ON "Property"("host_id");
CREATE INDEX IF NOT EXISTS "idx_properties_admin_created" ON "Property"("admin_created");

-- Add foreign key constraint for host_id
ALTER TABLE "Property"
    DROP CONSTRAINT IF EXISTS "Property_host_id_fkey",
    ADD CONSTRAINT "Property_host_id_fkey"
    FOREIGN KEY ("host_id") REFERENCES "hosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- Step 6: Update User table to add Host relation
-- ============================================

-- Note: The relation is defined in the Host table with user_id unique constraint

-- ============================================
-- Step 7: Create system Host account
-- ============================================

-- Insert default system host (StayNeos Team)
INSERT INTO "hosts" (
    "id",
    "display_name",
    "business_email",
    "status",
    "is_verified",
    "host_level",
    "timezone",
    "preferred_languages"
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'StayNeos Team',
    'hello.stayneos@gmail.com',
    'ACTIVE',
    true,
    'ESTABLISHED',
    'America/Toronto',
    ARRAY['en', 'zh']
) ON CONFLICT ("id") DO UPDATE SET
    "display_name" = EXCLUDED."display_name",
    "business_email" = EXCLUDED."business_email",
    "status" = EXCLUDED."status",
    "is_verified" = EXCLUDED."is_verified",
    "host_level" = EXCLUDED."host_level";

-- ============================================
-- Step 8: Enable RLS (Row Level Security)
-- ============================================

-- Enable RLS on hosts table
ALTER TABLE "hosts" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hosts are viewable by everyone" ON "hosts";
DROP POLICY IF EXISTS "Users can manage own host profile" ON "hosts";
DROP POLICY IF EXISTS "Admin can manage all hosts" ON "hosts";

-- Create RLS policies for hosts
CREATE POLICY "Hosts are viewable by everyone"
    ON "hosts"
    FOR SELECT
    USING (true);

-- Note: Admin checks are handled in application layer due to Prisma limitations with RLS

-- Enable RLS on host_applications table
ALTER TABLE "host_applications" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON "host_applications";
DROP POLICY IF EXISTS "Users can create own application" ON "host_applications";

-- Create RLS policies for host_applications
CREATE POLICY "Users can view own applications"
    ON "host_applications"
    FOR SELECT
    USING (true); -- Simplified, actual check in application layer

CREATE POLICY "Users can create own application"
    ON "host_applications"
    FOR INSERT
    WITH CHECK (true); -- Simplified, actual check in application layer

-- Enable RLS on host_documents table
ALTER TABLE "host_documents" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 9: Update existing properties to link to system host
-- ============================================

-- Update existing properties without host_id to link to system host
UPDATE "Property"
SET 
    "host_id" = '00000000-0000-0000-0000-000000000001',
    "admin_created" = true
WHERE "host_id" IS NULL;

-- Update system host property count
UPDATE "hosts"
SET "total_properties" = (
    SELECT COUNT(*) FROM "Property" WHERE "host_id" = '00000000-0000-0000-0000-000000000001'
)
WHERE "id" = '00000000-0000-0000-0000-000000000001';

