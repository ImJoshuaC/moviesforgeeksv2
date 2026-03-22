import Image from "next/image";
import CastCarousel from "@/app/components/CastCarousel";
import WatchlistButton from "@/app/components/WatchlistButton";
import ReviewSection from "@/app/components/ReviewSection";
import TrailerModal from "@/app/components/TrailerModal";
import RecommendedCarousel from "@/app/components/RecommendedCarousel";
import FavoriteButton from "@/app/components/FavoriteButton";
import { isInWatchlist } from "@/app/actions/watchlist";
import { isFavorite } from "@/app/actions/favorites";
import { getReviews } from "@/app/actions/reviews";
import { createClient } from "@/lib/supabase/server";

const API_KEY = process.env.API_KEY;

type CrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
};

export default async function SpecificFilmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const filmId = (await params).id;

  const [res, creditsRes, videosRes, recommendedRes, providersRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${filmId}?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/movie/${filmId}/credits?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/movie/${filmId}/videos?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/movie/${filmId}/recommendations?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/movie/${filmId}/watch/providers?api_key=${API_KEY}`),
  ]);

  const filmData = await res.json();
  const creditsData = await creditsRes.json();
  const videosData = await videosRes.json();
  const recommendedData = await recommendedRes.json();
  const providersData = await providersRes.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [inWatchlist, inFavorites, reviews] = await Promise.all([
    isInWatchlist(Number(filmId), "movie"),
    isFavorite(Number(filmId), "movie"),
    getReviews(Number(filmId), "movie"),
  ]);

  const hours = Math.floor(filmData.runtime / 60);
  const minutes = filmData.runtime % 60;
  const runtime = filmData.runtime ? `${hours}h ${minutes}m` : null;

  // Trailer
  const trailer = (videosData.results ?? []).find(
    (v: { site: string; type: string; key: string }) =>
      v.site === "YouTube" && v.type === "Trailer"
  );

  // Recommendations (up to 15)
  const recommendations = (recommendedData.results ?? []).slice(0, 15);

  // Crew — key roles only, deduplicated by person+job
  const KEY_JOBS = ["Director", "Screenplay", "Writer", "Story", "Executive Producer"];
  const crew: CrewMember[] = creditsData.crew ?? [];
  const keyCrew = crew.filter((c) => KEY_JOBS.includes(c.job));

  const crewByRole: Record<string, string[]> = {};
  for (const member of keyCrew) {
    if (!crewByRole[member.job]) crewByRole[member.job] = [];
    if (!crewByRole[member.job].includes(member.name)) {
      crewByRole[member.job].push(member.name);
    }
  }

  // Merge Writer + Screenplay + Story under "Written by"
  const writtenBy = [
    ...(crewByRole["Screenplay"] ?? []),
    ...(crewByRole["Writer"] ?? []),
    ...(crewByRole["Story"] ?? []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const crewDisplay: { label: string; names: string[] }[] = [];
  if (crewByRole["Director"]?.length) crewDisplay.push({ label: "Directed by", names: crewByRole["Director"] });
  if (writtenBy.length) crewDisplay.push({ label: "Written by", names: writtenBy });
  if (crewByRole["Executive Producer"]?.length) crewDisplay.push({ label: "Produced by", names: crewByRole["Executive Producer"] });

  // Watch providers (US streaming only)
  type WatchProvider = { provider_id: number; provider_name: string; logo_path: string };
  const watchProviders: WatchProvider[] = providersData.results?.US?.flatrate ?? [];
  const watchProvidersLink: string | null = providersData.results?.US?.link ?? null;

  // MovieForGeeks rating
  let mfgRating: number | null = null;
  if (reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    mfgRating = Math.round((avg / 6) * 100) / 10; // 0–10 scale, 1 decimal
  }

  return (
    <div className="relative w-full min-h-screen bg-[#161616]">
      {/* Backdrop Image */}
      {filmData.backdrop_path && (
        <Image
          src={`https://image.tmdb.org/t/p/w1280${filmData.backdrop_path}`}
          alt={filmData.title ?? "Film Backdrop"}
          fill
          priority
          className="object-cover z-0"
          quality={90}
          sizes="100vw"
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/75 to-[#161616] z-10" />

      {/* Content */}
      <div className="relative z-20 px-2 py-4 md:px-3 md:py-6 lg:px-4 lg:py-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">

          {/* 2-column grid: left=info+cast+providers, right=reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* LEFT column */}
            <div className="flex flex-col gap-10 min-w-0">
              {/* Hero row: poster + info */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Poster */}
                <div className="shrink-0 w-56 md:w-72 mx-auto md:mx-0">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${filmData.poster_path}`}
                    alt={filmData.title ?? "Film Poster"}
                    width={400}
                    height={600}
                    quality={95}
                    className="w-full h-auto rounded-xl shadow-2xl"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-4 flex-1">
                  {/* Title */}
                  <h1 className="text-white text-3xl md:text-4xl font-roboto-slab font-black uppercase [text-shadow:2px_2px_4px_rgb(0_0_0/80%)]">
                    {filmData.title}
                  </h1>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-white/75 text-sm font-roboto-serif">
                    {filmData.release_date && <span>{filmData.release_date.slice(0, 4)}</span>}
                    {runtime && <><span>·</span><span>{runtime}</span></>}
                    {crewByRole["Director"]?.length > 0 && (
                      <><span>·</span><span>{crewByRole["Director"][0]}</span></>
                    )}
                  </div>

                  {/* Ratings row */}
                  <div className="flex items-center gap-5 py-1">
                    {filmData.vote_count > 0 ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-white/55 text-[10px] font-roboto-slab uppercase tracking-widest">TMDB</span>
                        <span className={`text-2xl font-roboto-slab font-black ${filmData.vote_average >= 6.5 ? "text-green-400" : filmData.vote_average >= 5.0 ? "text-yellow-400" : "text-red-400"}`}>
                          {filmData.vote_average?.toFixed(1)}
                        </span>
                        <span className="text-white/30 text-xs font-roboto-serif">/10</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-white/55 text-[10px] font-roboto-slab uppercase tracking-widest">TMDB</span>
                        <span className="text-white/30 text-xs font-roboto-serif">Coming Soon</span>
                      </div>
                    )}
                    <div className="w-px h-6 bg-white/20 shrink-0" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-white/55 text-[10px] font-roboto-slab uppercase tracking-widest">MFG</span>
                      {mfgRating !== null ? (
                        <>
                          <span className={`text-2xl font-roboto-slab font-black ${mfgRating >= 6.5 ? "text-green-400" : mfgRating >= 5.0 ? "text-yellow-400" : "text-red-400"}`}>{mfgRating.toFixed(1)}</span>
                          <span className="text-white/50 text-xs font-roboto-serif">/10</span>
                        </>
                      ) : (
                        <span className="text-white/50 text-xs font-roboto-serif">No ratings</span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    <WatchlistButton
                      mediaId={Number(filmId)}
                      mediaType="movie"
                      title={filmData.title}
                      posterPath={filmData.poster_path}
                      releaseYear={filmData.release_date ? Number(filmData.release_date.split("-")[0]) : undefined}
                      initialIsInWatchlist={inWatchlist}
                      isLoggedIn={!!user}
                    />
                    <FavoriteButton
                      mediaId={Number(filmId)}
                      mediaType="movie"
                      title={filmData.title}
                      posterPath={filmData.poster_path}
                      releaseYear={filmData.release_date ? Number(filmData.release_date.split("-")[0]) : undefined}
                      initialIsFavorite={inFavorites}
                      isLoggedIn={!!user}
                    />
                    {trailer && (
                      <TrailerModal trailerKey={trailer.key} title={filmData.title} />
                    )}
                  </div>

                  {/* Genres */}
                  {filmData.genres?.length > 0 && (
                    <p className="text-white/75 text-sm font-roboto-serif">
                      <span className="text-white/55 font-bold font-roboto-slab">Genre:</span>{" "}
                      {filmData.genres.map((g: { id: number; name: string }) => g.name).join(", ")}
                    </p>
                  )}

                  {/* Synopsis */}
                  <div>
                    <h2 className="text-white text-base font-roboto-slab font-bold mb-1.5">Synopsis</h2>
                    <p className="text-white/90 text-sm font-roboto-serif leading-relaxed">
                      {filmData.overview || "No synopsis available."}
                    </p>
                  </div>

                  {/* Crew */}
                  {crewDisplay.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {crewDisplay.map(({ label, names }) => (
                        <p key={label} className="text-sm font-roboto-serif text-white/90">
                          <span className="text-white/55 font-bold">{label}</span>{" "}
                          {names.join(" · ")}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cast */}
              <div>
                <h2 className="text-white font-roboto-slab text-xl uppercase [text-shadow:1px_1px_2px_rgb(0_0_0/80%)]">Cast</h2>
                <hr className="border-white/30 my-1" />
                <CastCarousel
                  cast={creditsData.cast?.filter((m: { character?: string }) => (m?.character?.trim().length ?? 0) > 0) ?? []}
                />
              </div>

              {/* Where to Watch */}
              {watchProviders.length > 0 && (
                <div>
                  <h2 className="text-white font-roboto-slab text-xl uppercase [text-shadow:1px_1px_2px_rgb(0_0_0/80%)]">Where to Watch</h2>
                  <hr className="border-white/30 my-1" />
                  <div className="flex flex-wrap gap-3 py-3">
                    {watchProviders.map((p) => (
                      <a
                        key={p.provider_id}
                        href={watchProvidersLink ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w185${p.logo_path}`}
                          alt={p.provider_name}
                          title={p.provider_name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-md"
                        />
                        <span className="text-white/50 text-xs font-roboto-slab text-center max-w-[80px] leading-tight">
                          {p.provider_name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT column: ratings distribution + reviews */}
            <ReviewSection
              mediaId={Number(filmId)}
              mediaType="movie"
              initialReviews={reviews}
              currentUserId={user?.id ?? null}
              initialCount={watchProviders.length > 0 ? 3 : 2}
            />
          </div>

          {/* More Like This — full width */}
          {recommendations.length > 0 && (
            <div>
              <h2 className="text-white font-roboto-slab text-xl uppercase [text-shadow:1px_1px_2px_rgb(0_0_0/80%)]">More Like This</h2>
              <hr className="border-white/30 my-1" />
              <RecommendedCarousel items={recommendations} mediaType="movie" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
