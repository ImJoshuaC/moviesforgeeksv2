import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PublicProfileContent from "./PublicProfileContent";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [profile, favorites, watchlist, topFilms, topShows, reviewCount] =
    await Promise.all([
      prisma.profile.findUnique({ where: { id } }),
      prisma.favorite.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
      }),
      prisma.watchlist.findMany({
        where: { user_id: id },
        orderBy: { created_at: "desc" },
      }),
      prisma.topFilm.findMany({
        where: { user_id: id, media_type: "movie" },
        orderBy: { position: "asc" },
      }),
      prisma.topFilm.findMany({
        where: { user_id: id, media_type: "show" },
        orderBy: { position: "asc" },
      }),
      prisma.review.count({ where: { user_id: id } }),
    ]);

  if (!profile) notFound();

  const displayName = profile.display_name ?? profile.username ?? "User";
  const initial = displayName[0].toUpperCase();

  const favoriteFilms = favorites.filter((f) => f.media_type === "movie");
  const favoriteShows = favorites.filter((f) => f.media_type === "show");
  const watchlistFilms = watchlist.filter((w) => w.media_type === "movie");
  const watchlistShows = watchlist.filter((w) => w.media_type === "show");

  return (
    <div className="min-h-screen bg-[#161616]">

      {/* ── COVER BANNER ── */}
      <div className="h-44 bg-linear-to-br from-[#4ade80]/15 via-[#232323] to-[#161616] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_100%,rgba(74,222,128,0.12)_0%,transparent_60%)]" />
      </div>

      <div className="px-5 md:px-10 lg:px-16 pb-10 max-w-5xl mx-auto -mt-12 relative">

        {/* ── PROFILE HEADER ── */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-10 items-center sm:items-start">

          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatar_url ? (
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
          </div>

          {/* Name, username, bio, stats */}
          <div className="flex flex-col min-w-0 pt-1 flex-1 items-center sm:items-start text-center sm:text-left">
            <h1 className="text-white text-3xl md:text-4xl font-roboto-slab font-bold uppercase leading-tight">
              {displayName}
            </h1>

            {profile.username && (
              <p className="text-white/40 font-roboto-serif text-sm mt-1">
                @{profile.username}
              </p>
            )}

            <p className="text-white/70 font-roboto-serif text-base mt-3 leading-relaxed">
              {profile.bio || (
                <span className="text-white/30 italic">No bio yet.</span>
              )}
            </p>

            {/* Stats bar */}
            <div className="flex mt-6 w-full border border-white/20 rounded-lg divide-x divide-white/20 overflow-hidden">
              <div className="flex flex-col items-center justify-center py-3 px-4 flex-1">
                <span className="text-white font-roboto-slab font-bold text-xl">{watchlist.length}</span>
                <span className="text-white/50 font-roboto-serif text-xs uppercase tracking-normal mt-0.5">Watchlisted</span>
              </div>
              <div className="flex flex-col items-center justify-center py-3 px-4 flex-1">
                <span className="text-white font-roboto-slab font-bold text-xl">{favorites.length}</span>
                <span className="text-white/50 font-roboto-serif text-xs uppercase tracking-normal mt-0.5">Favorites</span>
              </div>
              <div className="flex flex-col items-center justify-center py-3 px-4 flex-1">
                <span className="text-white font-roboto-slab font-bold text-xl">{reviewCount}</span>
                <span className="text-white/50 font-roboto-serif text-xs uppercase tracking-normal mt-0.5">Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABBED CONTENT ── */}
        <PublicProfileContent
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
