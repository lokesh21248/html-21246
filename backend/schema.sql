-- ============================================================
-- PG Admin Panel — Canonical Database Schema
-- Last updated: 2026-04-01 (aligned with backend codebase)
-- Run this in the Supabase SQL Editor to set up a fresh environment
-- For an existing DB, run individual ALTER TABLE statements only
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (extends auth.users)
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

-- Auto-create profile row when a new Supabase user signs up
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
-- 2. PG LISTINGS TABLE
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


-- ============================================================
-- 3. PG IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pg_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.pg_listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 4. BOOKINGS TABLE
-- NOTE: Uses pg_id (not listing_id) as FK to pg_listings.
-- This matches the backend bookings.service.js queries.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    pg_id UUID REFERENCES public.pg_listings(id) ON DELETE CASCADE,
    check_in DATE NOT NULL DEFAULT CURRENT_DATE,
    check_out DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 5. PAYMENTS TABLE
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


-- ============================================================
-- 6. VERIFICATION QUERIES
-- Run these after migration to confirm schema is correct
-- ============================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;
