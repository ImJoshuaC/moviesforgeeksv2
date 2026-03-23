-- Create top_films table
CREATE TABLE "top_films" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "poster_path" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "top_films_pkey" PRIMARY KEY ("id")
);

-- Unique index: one film per slot per user
CREATE UNIQUE INDEX "top_films_user_id_position_key" ON "top_films"("user_id", "position");

-- Foreign key to profiles with cascade delete
ALTER TABLE "top_films" ADD CONSTRAINT "top_films_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
