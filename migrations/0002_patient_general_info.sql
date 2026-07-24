-- Migration 0002: Add new general info columns to patients table

ALTER TABLE "patients"
  ADD COLUMN IF NOT EXISTS "photo_url" text,
  ADD COLUMN IF NOT EXISTS "secondary_phone" text,
  ADD COLUMN IF NOT EXISTS "city" text,
  ADD COLUMN IF NOT EXISTS "state" text,
  ADD COLUMN IF NOT EXISTS "postal_code" text,
  ADD COLUMN IF NOT EXISTS "country" text,
  ADD COLUMN IF NOT EXISTS "preferred_language" text,
  ADD COLUMN IF NOT EXISTS "preferred_communication" text,
  ADD COLUMN IF NOT EXISTS "profession" text;
