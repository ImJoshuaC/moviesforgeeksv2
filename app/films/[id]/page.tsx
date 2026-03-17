import Image from "next/image";
import CastCarousel from "@/app/components/CastCarousel";
import WatchlistButton from "@/app/components/WatchlistButton";
import ReviewSection from "@/app/components/ReviewSection";
import { isInWatchlist } from "@/app/actions/watchlist";
import { getReviews, getUserReview } from "@/app/actions/reviews";
import { createClient } from "@/lib/supabase/server";

const API_KEY = process.env.API_KEY;

export default async function SpecificFilmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const filmId = (await params).id;

  const [res, creditsRes] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/movie/${filmId}?api_key=${API_KEY}&language=en-US`,
    ),
    fetch(
      `https://api.themoviedb.org/3/movie/${filmId}/credits?api_key=${API_KEY}&language=en-US`,
    ),
  ]);

  const filmData = await res.json();
  const creditsData = await creditsRes.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [inWatchlist, reviews, userReview] = await Promise.all([
    isInWatchlist(Number(filmId), "movie"),
    getReviews(Number(filmId), "movie"),
    getUserReview(Number(filmId), "movie"),
  ]);

  const hours = Math.floor(filmData.runtime / 60);
  const minutes = filmData.runtime % 60;
  const runtime = filmData.runtime ? `${hours}h ${minutes}m` : null;

  return (
    <div className="relative w-full min-h-screen">
      {/* Backdrop Image */}
      <Image
        src={`https://image.tmdb.org/t/p/w1280${filmData.backdrop_path}`}
        alt={filmData.title ?? "Film Backdrop"}
        fill
        priority
        className="object-cover z-0"
        quality={90}
        sizes="100vw"
      />
      {/* Gradient overlay — darkens toward bottom for readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-black/90 z-10" />

      {/* Content */}
      <div className="relative z-20 p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Hero row: poster left, info right */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Poster */}
            <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${filmData.poster_path}`}
                alt={filmData.title ?? "Film Poster"}
                width={300}
                height={450}
                quality={90}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 flex-1">
              {/* Title and Rating */}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-roboto-slab font-black uppercase [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                  {filmData.title}
                </h1>
                <div
                  className={`rounded-full px-3 py-1.5 flex items-center justify-center min-w-[50px] ${
                    filmData.vote_average >= 6.5
                      ? "bg-green-600"
                      : filmData.vote_average >= 5.0
                        ? "bg-yellow-500"
                        : "bg-red-600"
                  }`}
                >
                  <p className="text-white text-base md:text-lg font-roboto-slab font-bold [text-shadow:_-1px_-1px_0_rgb(0_0_0_/_80%),_1px_-1px_0_rgb(0_0_0_/_80%),_-1px_1px_0_rgb(0_0_0_/_80%),_1px_1px_0_rgb(0_0_0_/_80%)]">
                    {filmData.vote_average?.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {filmData.release_date && (
                  <p className="text-white/90 text-sm md:text-base font-roboto-serif">
                    <span className="font-bold">Release Date:</span>{" "}
                    {filmData.release_date}
                  </p>
                )}
                {runtime && (
                  <p className="text-white/90 text-sm md:text-base font-roboto-serif">
                    <span className="font-bold">Runtime:</span> {runtime}
                  </p>
                )}
                {filmData.genres?.length > 0 && (
                  <p className="text-white/90 text-sm md:text-base font-roboto-serif">
                    <span className="font-bold">Genre:</span>{" "}
                    {filmData.genres
                      .map((g: { id: number; name: string }) => g.name)
                      .join(", ")}
                  </p>
                )}
              </div>

              {/* Synopsis */}
              <div className="mt-2">
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-roboto-slab font-bold mb-2 md:mb-3 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
                  Synopsis
                </h2>
                <p className="text-white text-sm md:text-base lg:text-lg font-roboto-serif leading-relaxed [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
                  {filmData.overview || "No synopsis available."}
                </p>
              </div>

              <WatchlistButton
                mediaId={Number(filmId)}
                mediaType="movie"
                title={filmData.title}
                posterPath={filmData.poster_path}
                initialIsInWatchlist={inWatchlist}
                isLoggedIn={!!user}
              />
            </div>
          </div>

          {/* Cast Section */}
          <div className="mt-10">
            <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
              Cast
            </h2>
            <hr className="border-white/30 my-1" />
            <CastCarousel
              cast={
                creditsData.cast?.filter(
                  (m: { character?: string }) => (m?.character?.trim().length ?? 0) > 0,
                ) ?? []
              }
            />
          </div>

          <ReviewSection
            mediaId={Number(filmId)}
            mediaType="movie"
            initialReviews={reviews}
            userReview={userReview}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </div>
  );
}
