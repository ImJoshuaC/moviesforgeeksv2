import Image from "next/image";
import CastCarousel from "@/app/components/CastCarousel";
import WatchlistButton from "@/app/components/WatchlistButton";
import ReviewSection from "@/app/components/ReviewSection";
import { isInWatchlist } from "@/app/actions/watchlist";
import { getReviews, getUserReview } from "@/app/actions/reviews";
import { createClient } from "@/lib/supabase/server";

const API_KEY = process.env.API_KEY;

export default async function SpecificShowsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const showId = (await params).id;

  const [res, creditsRes] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}&language=en-US`,
    ),
    fetch(
      `https://api.themoviedb.org/3/tv/${showId}/credits?api_key=${API_KEY}&language=en-US`,
    ),
  ]);
  const showData = await res.json();
  const creditsData = await creditsRes.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [inWatchlist, reviews, userReview] = await Promise.all([
    isInWatchlist(Number(showId), "show"),
    getReviews(Number(showId), "show"),
    getUserReview(Number(showId), "show"),
  ]);

  return (
    <div className="relative w-full min-h-screen">
      {/* Backdrop Image */}
      <Image
        src={`https://image.tmdb.org/t/p/w1280${showData.backdrop_path}`}
        alt={showData.name ?? "Show Poster"}
        fill
        priority
        className="object-cover z-0"
        quality={90}
        sizes="100vw"
      />
      {/* Gradient overlay — darkens toward bottom for readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/80 to-black/95 z-10" />
      {/* Content goes on top of backdrop but below navbar */}
      <div className="relative z-20 p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Poster Image */}
            <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${showData.poster_path}`}
                alt={showData.name ?? "Show Poster"}
                width={300}
                height={450}
                quality={90}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 flex-1">
              {/* Title and Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-roboto-slab font-black uppercase [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                  {showData.name}
                </h1>
                {showData.vote_count > 0 ? (
                  <div
                    className={`rounded-full px-2 py-0.5 flex items-center justify-center min-w-[40px] sm:self-auto ${
                      showData.vote_average >= 6.5
                        ? "bg-green-600"
                        : showData.vote_average >= 5.0
                          ? "bg-yellow-500"
                          : "bg-red-600"
                    }`}
                  >
                    <p className="text-white text-sm font-roboto-slab font-bold [text-shadow:_-1px_-1px_0_rgb(0_0_0_/_80%),_1px_-1px_0_rgb(0_0_0_/_80%),_-1px_1px_0_rgb(0_0_0_/_80%),_1px_1px_0_rgb(0_0_0_/_80%)]">
                      {showData.vote_average.toFixed(1)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-full px-2 py-0.5 flex items-center justify-center border border-white/60">
                    <p className="text-white/80 text-sm font-roboto-slab font-bold">
                      Coming Soon
                    </p>
                  </div>
                )}
              </div>

              {/* Show Info */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4">
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">First Air Date:</span>{" "}
                  {showData.first_air_date || "N/A"}
                </p>
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">Last Air Date:</span>{" "}
                  {showData.last_air_date || "N/A"}
                </p>
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">Seasons:</span>{" "}
                  {showData.number_of_seasons || "N/A"}
                </p>
                <p className="text-white text-sm md:text-base font-roboto-serif">
                  <span className="font-bold">Genre:</span>{" "}
                  {showData.genres
                    .map((g: { id: number; name: string }) => g.name)
                    .join(", ")}
                </p>
              </div>

              {/* Synopsis */}
              <div className="mt-2">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-roboto-slab font-bold mb-2 md:mb-3 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
                  Synopsis
                </h2>
                <p className="text-white text-sm md:text-base lg:text-lg font-roboto-serif font-normal leading-relaxed [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
                  {showData.overview || "No synopsis available."}
                </p>
              </div>

              <WatchlistButton
                mediaId={Number(showId)}
                mediaType="show"
                title={showData.name}
                posterPath={showData.poster_path}
                initialIsInWatchlist={inWatchlist}
                isLoggedIn={!!user}
              />
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase [text-shadow:1px_1px_2px_rgb(0_0_0/80%)]">
              Cast
            </h2>
            <hr className="border-white/30 my-1" />
            <CastCarousel
              cast={
                creditsData.cast?.filter(
                  (m: { character?: string }) =>
                    (m?.character?.trim().length ?? 0) > 0,
                ) ?? []
              }
            />
          </div>

          <ReviewSection
            mediaId={Number(showId)}
            mediaType="show"
            initialReviews={reviews}
            userReview={userReview}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </div>
  );
}
