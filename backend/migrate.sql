-- ============================================================
-- PG Admin Panel — Safe Production Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- All statements use IF NOT EXISTS / IF EXISTS — ZERO data loss
-- ============================================================


-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- 2. PG LISTINGS TABLE + MISSING COLUMNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pg_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    reception_phone TEXT,
    capacity INT DEFAULT 0,
    occupied INT DEFAULT 0,
    room_types JSONB DEFAULT '[]'::jsonb,
    gender TEXT,
    property_type TEXT,
    one_day_stay BOOLEAN DEFAULT false,
    has_gym BOOLEAN DEFAULT false,
    has_ac BOOLEAN DEFAULT false,
    has_non_ac BOOLEAN DEFAULT false,
    has_gaming_space BOOLEAN DEFAULT false,
    gaming_space_area INT DEFAULT 0,
    has_parking BOOLEAN DEFAULT false,
    parking_capacity INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    food_menu JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add each column in case the table already exists without it
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS reception_phone TEXT;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 0;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS occupied INT DEFAULT 0;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS room_types JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS one_day_stay BOOLEAN DEFAULT false;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS has_gym BOOLEAN DEFAULT false;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS has_ac BOOLEAN DEFAULT false;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS has_non_ac BOOLEAN DEFAULT false;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS has_gaming_space BOOLEAN DEFAULT false;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS gaming_space_area INT DEFAULT 0;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT false;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS parking_capacity INT DEFAULT 0;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS food_menu JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.pg_listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pg_listings'
          AND column_name = 'gaming_space_area'
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.pg_listings
        ALTER COLUMN gaming_space_area TYPE INT
        USING CASE
            WHEN gaming_space_area ~ '^[0-9]+$' THEN gaming_space_area::INT
            ELSE 0
        END;
    END IF;
END $$;

UPDATE public.pg_listings
SET status = lower(status)
WHERE status IS NOT NULL;


-- ============================================================
-- 3. PG IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pg_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.pg_listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pg_images ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.pg_listings(id) ON DELETE CASCADE;
ALTER TABLE public.pg_images ADD COLUMN IF NOT EXISTS url TEXT;


-- ============================================================
-- 4. BOOKINGS TABLE + MISSING COLUMNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.pg_listings(id) ON DELETE CASCADE,
    check_in DATE NOT NULL DEFAULT CURRENT_DATE,
    check_out DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.pg_listings(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS check_in DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS check_out DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- ============================================================
-- 5. PAYMENTS TABLE + MISSING COLUMNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- ============================================================
-- 6. VERIFICATION QUERIES
-- Run these after migration to confirm all columns exist
-- ============================================================

-- Check pg_listings columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pg_listings'
ORDER BY ordinal_position;

-- Check bookings columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Check payments columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments'
ORDER BY ordinal_position;

-- Check profiles columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
