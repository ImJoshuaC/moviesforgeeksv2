-- Add release_year column to watchlist table
ALTER TABLE "watchlist" ADD COLUMN IF NOT EXISTS "release_year" INTEGER;

-- Add release_year column to favorites table
ALTER TABLE "favorites" ADD COLUMN IF NOT EXISTS "release_year" INTEGER;
