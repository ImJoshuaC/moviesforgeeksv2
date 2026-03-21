import Image from "next/image";
import CastCarousel from "@/app/components/CastCarousel";
import WatchlistButton from "@/app/components/WatchlistButton";
import ReviewSection from "@/app/components/ReviewSection";
import TrailerModal from "@/app/components/TrailerModal";
import RecommendedCarousel from "@/app/components/RecommendedCarousel";
import { isInWatchlist } from "@/app/actions/watchlist";
import { getReviews } from "@/app/actions/reviews";
import { createClient } from "@/lib/supabase/server";

const API_KEY = process.env.API_KEY;

type CrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
};

export default async function SpecificShowsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const showId = (await params).id;

  const [res, creditsRes, videosRes, recommendedRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/tv/${showId}/aggregate_credits?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/tv/${showId}/videos?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/tv/${showId}/recommendations?api_key=${API_KEY}&language=en-US`),
  ]);

  const showData = await res.json();
  const creditsData = await creditsRes.json();
  const videosData = await videosRes.json();
  const recommendedData = await recommendedRes.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [inWatchlist, reviews] = await Promise.all([
    isInWatchlist(Number(showId), "show"),
    getReviews(Number(showId), "show"),
  ]);

  // Trailer
  const trailer = (videosData.results ?? []).find(
    (v: { site: string; type: string; key: string }) =>
      v.site === "YouTube" && v.type === "Trailer"
  );

  // Recommendations (up to 15)
  const recommendations = (recommendedData.results ?? []).slice(0, 15);

  // Crew — key roles only
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

  const writtenBy = [
    ...(crewByRole["Screenplay"] ?? []),
    ...(crewByRole["Writer"] ?? []),
    ...(crewByRole["Story"] ?? []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const crewDisplay: { label: string; names: string[] }[] = [];
  if (crewByRole["Director"]?.length) crewDisplay.push({ label: "Directed by", names: crewByRole["Director"] });
  if (writtenBy.length) crewDisplay.push({ label: "Written by", names: writtenBy });
  if (crewByRole["Executive Producer"]?.length) crewDisplay.push({ label: "Produced by", names: crewByRole["Executive Producer"] });

  // MovieForGeeks rating
  let mfgRating: number | null = null;
  if (reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    mfgRating = Math.round((avg / 6) * 100) / 10;
  }

  return (
    <div className="relative w-full min-h-screen bg-[#161616]">
      {/* Backdrop Image */}
      {showData.backdrop_path && (
        <Image
          src={`https://image.tmdb.org/t/p/w1280${showData.backdrop_path}`}
          alt={showData.name ?? "Show Backdrop"}
          fill
          priority
          className="object-cover z-0"
          quality={90}
          sizes="100vw"
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/80 to-black/95 z-10" />

      {/* Content */}
      <div className="relative z-20 p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Hero row */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Poster */}
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${showData.poster_path}`}
                alt={showData.name ?? "Show Poster"}
                width={300}
                height={450}
                quality={90}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4 md:gap-5 flex-1">
              {/* Title */}
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-roboto-slab font-black uppercase [text-shadow:2px_2px_4px_rgb(0_0_0/80%)]">
                {showData.name}
              </h1>

              {/* Ratings row */}
              <div className="flex flex-wrap gap-3">
                {/* TMDB */}
                {showData.vote_count > 0 ? (
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 min-w-[80px]">
                    <span className="text-white/50 text-[10px] uppercase tracking-widest font-roboto-slab mb-0.5">TMDB</span>
                    <span
                      className={`text-xl font-roboto-slab font-black ${
                        showData.vote_average >= 6.5
                          ? "text-green-400"
                          : showData.vote_average >= 5.0
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {showData.vote_average?.toFixed(1)}
                    </span>
                    <span className="text-white/30 text-[10px] font-roboto-serif">/ 10</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 min-w-[80px]">
                    <span className="text-white/50 text-[10px] uppercase tracking-widest font-roboto-slab mb-0.5">TMDB</span>
                    <span className="text-white/30 text-xs font-roboto-serif">Coming Soon</span>
                  </div>
                )}

                {/* MovieForGeeks */}
                <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 min-w-[80px]">
                  <span className="text-white/50 text-[10px] uppercase tracking-widest font-roboto-slab mb-0.5">MFG</span>
                  {mfgRating !== null ? (
                    <>
                      <span className="text-xl font-roboto-slab font-black text-[#4ade80]">
                        {mfgRating.toFixed(1)}
                      </span>
                      <span className="text-white/30 text-[10px] font-roboto-serif">/ 10</span>
                    </>
                  ) : (
                    <span className="text-white/30 text-xs font-roboto-serif">No ratings</span>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <p className="text-white/80 text-sm font-roboto-serif">
                  <span className="font-bold text-white/60">First Air Date</span>{" "}
                  {showData.first_air_date || "N/A"}
                </p>
                <p className="text-white/80 text-sm font-roboto-serif">
                  <span className="font-bold text-white/60">Last Air Date</span>{" "}
                  {showData.last_air_date || "N/A"}
                </p>
                <p className="text-white/80 text-sm font-roboto-serif">
                  <span className="font-bold text-white/60">Seasons</span>{" "}
                  {showData.number_of_seasons || "N/A"}
                </p>
                {showData.genres?.length > 0 && (
                  <p className="text-white/80 text-sm font-roboto-serif">
                    <span className="font-bold text-white/60">Genre</span>{" "}
                    {showData.genres.map((g: { id: number; name: string }) => g.name).join(", ")}
                  </p>
                )}
              </div>

              {/* Synopsis */}
              <div>
                <h2 className="text-white text-lg font-roboto-slab font-bold mb-1.5 [text-shadow:1px_1px_2px_rgb(0_0_0/80%)]">
                  Synopsis
                </h2>
                <p className="text-white/85 text-sm md:text-base font-roboto-serif font-normal leading-relaxed">
                  {showData.overview || "No synopsis available."}
                </p>
              </div>

              {/* Crew */}
              {crewDisplay.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {crewDisplay.map(({ label, names }) => (
                    <p key={label} className="text-sm font-roboto-serif text-white/80">
                      <span className="text-white/45 font-bold">{label}</span>{" "}
                      {names.join(" · ")}
                    </p>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-1">
                <WatchlistButton
                  mediaId={Number(showId)}
                  mediaType="show"
                  title={showData.name}
                  posterPath={showData.poster_path}
                  initialIsInWatchlist={inWatchlist}
                  isLoggedIn={!!user}
                />
                {trailer && (
                  <TrailerModal trailerKey={trailer.key} title={showData.name} />
                )}
              </div>
            </div>
          </div>

          {/* Cast */}
          <div className="mt-10">
            <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase [text-shadow:1px_1px_2px_rgb(0_0_0/80%)]">
              Cast
            </h2>
            <hr className="border-white/30 my-1" />
            <CastCarousel
              cast={
                (creditsData.cast ?? [])
                  .map((m: { character?: string; roles?: { character: string }[] }) => ({
                    ...m,
                    character: m.roles?.[0]?.character ?? m.character ?? "",
                  }))
                  .filter((m: { character: string }) => m.character.trim().length > 0)
              }
            />
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-10">
              <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase [text-shadow:1px_1px_2px_rgb(0_0_0/80%)]">
                More Like This
              </h2>
              <hr className="border-white/30 my-1" />
              <RecommendedCarousel items={recommendations} mediaType="show" />
            </div>
          )}

          <ReviewSection
            mediaId={Number(showId)}
            mediaType="show"
            initialReviews={reviews}
            currentUserId={user?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}
