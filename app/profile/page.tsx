import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import { getWatchlist } from "@/app/actions/watchlist";
import { getFavorites } from "@/app/actions/favorites";
import { getTopFilms } from "@/app/actions/topFilms";
import ProfileEditForm from "./ProfileEditForm";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [result, watchlist, favorites, topFilms, topShows] = await Promise.all([
    getProfile(),
    getWatchlist(),
    getFavorites(),
    getTopFilms("movie"),
    getTopFilms("show"),
  ]);

  const profile = result?.profile ?? null;
  const displayName = profile?.display_name || profile?.username || user.email?.split("@")[0] || "User";
  const initial = displayName[0].toUpperCase();

  const favoriteFilms = favorites.filter((f) => f.media_type === "movie");
  const favoriteShows = favorites.filter((f) => f.media_type === "show");
  const watchlistFilms = watchlist.filter((w) => w.media_type === "movie");
  const watchlistShows = watchlist.filter((w) => w.media_type === "show");

  return (
    <div className="min-h-screen bg-[#161616]">
    <div className="px-5 md:px-10 lg:px-16 py-10 max-w-5xl mx-auto">

      {/* ── PROFILE HEADER ── */}
      <div className="flex gap-8 mb-10 items-start">

        {/* Left: avatar + edit button */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={120}
              height={120}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#4ade80] flex items-center justify-center">
              <span className="text-black text-4xl font-bold font-roboto-slab">
                {initial}
              </span>
            </div>
          )}
          <ProfileEditForm
            initialDisplayName={profile?.display_name ?? null}
            initialUsername={profile?.username ?? null}
            initialBio={profile?.bio ?? null}
            initialAvatarUrl={profile?.avatar_url ?? null}
          />
        </div>

        {/* Right: name, username, bio, stats */}
        <div className="flex flex-col min-w-0 pt-1 flex-1">
          <h1 className="text-white text-3xl md:text-4xl font-roboto-slab font-bold uppercase leading-tight">
            {displayName}
          </h1>

          {profile?.username && (
            <p className="text-white/40 font-roboto-serif text-sm mt-1">
              @{profile.username}
            </p>
          )}

          <p className="text-white/70 font-roboto-serif text-base mt-3 leading-relaxed">
            {profile?.bio || (
              <span className="text-white/30 italic">No bio yet.</span>
            )}
          </p>

          {/* Stats bar */}
          <div className="flex mt-6 border border-white/20 rounded-lg divide-x divide-white/20 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-3 flex-1">
              <span className="text-white font-roboto-slab font-bold text-xl">{watchlist.length}</span>
              <span className="text-white/50 font-roboto-serif text-xs uppercase tracking-wide mt-0.5">Watchlisted</span>
            </div>
            <div className="flex flex-col items-center justify-center py-3 flex-1">
              <span className="text-white font-roboto-slab font-bold text-xl">0</span>
              <span className="text-white/50 font-roboto-serif text-xs uppercase tracking-wide mt-0.5">Lists</span>
            </div>
            <div className="flex flex-col items-center justify-center py-3 flex-1">
              <span className="text-white font-roboto-slab font-bold text-xl">0</span>
              <span className="text-white/50 font-roboto-serif text-xs uppercase tracking-wide mt-0.5">Followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABBED CONTENT ── */}
      <ProfileContent
        topFilms={topFilms}
        topShows={topShows}
        favoriteFilms={favoriteFilms}
        favoriteShows={favoriteShows}
        watchlistFilms={watchlistFilms}
        watchlistShows={watchlistShows}
      />

    </div>
    </div>
  );
}
