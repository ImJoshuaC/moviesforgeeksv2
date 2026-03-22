-- Drop old unique constraint (one slot per user)
DROP INDEX IF EXISTS "top_films_user_id_position_key";

-- Add new unique constraint (one slot per user per media type)
CREATE UNIQUE INDEX "top_films_user_id_media_type_position_key" ON "top_films"("user_id", "media_type", "position");
