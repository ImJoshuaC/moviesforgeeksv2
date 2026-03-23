import Image from "next/image";
import ReviewSection, { RatingStats } from "@/app/components/ReviewSection";
import { getReviews } from "@/app/actions/reviews";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FaArrowLeft, FaClock } from "react-icons/fa";

const API_KEY = process.env.API_KEY;

export default async function FilmReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const filmId = (await params).id;

  const [res, supabase] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${filmId}?api_key=${API_KEY}&language=en-US`),
    createClient(),
  ]);

  if (!res.ok) throw new Error(`Film not found (${res.status})`);
  const filmData = await res.json();
  const { data: { user } } = await supabase.auth.getUser();
  const reviews = await getReviews(Number(filmId), "movie");

  const year = filmData.release_date?.slice(0, 4);
  const genres: { id: number; name: string }[] = filmData.genres ?? [];
  const runtime: number | null = filmData.runtime ?? null;

  return (
    <div className="relative w-full min-h-screen bg-[#161616]">
      {filmData.backdrop_path && (
        <Image
          src={`https://image.tmdb.org/t/p/w1280${filmData.backdrop_path}`}
          alt={filmData.title ?? "Backdrop"}
          fill
          priority
          className="object-cover z-0"
          quality={85}
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/80 to-[#161616] z-10" />

      <div className="relative z-20 px-4 py-8 max-w-6xl mx-auto flex flex-col gap-8">
        {/* Back link */}
        <Link
          href={`/films/${filmId}`}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-roboto-slab transition-colors w-fit"
        >
          <FaArrowLeft size={12} /> Back to {filmData.title}
        </Link>

        {/* 2-column layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-8 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-6">
            {/* Poster + info card */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {filmData.poster_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${filmData.poster_path}`}
                  alt={filmData.title}
                  width={500}
                  height={750}
                  className="w-full object-cover"
                  priority
                />
              )}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h1 className="text-white font-roboto-slab text-2xl font-black uppercase leading-tight">
                    {filmData.title}
                  </h1>
                  {year && (
                    <p className="text-white/40 text-sm font-roboto-serif mt-0.5">{year}</p>
                  )}
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <span
                        key={g.id}
                        className="px-2.5 py-0.5 rounded-full bg-white/8 border border-white/10 text-white/60 text-xs font-roboto-slab"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Runtime */}
                {runtime && (
                  <div className="flex items-center gap-1.5 text-white/40 text-xs font-roboto-serif">
                    <FaClock size={11} />
                    {Math.floor(runtime / 60)}h {runtime % 60}m
                  </div>
                )}
              </div>
            </div>

            {/* Rating stats */}
            <RatingStats reviews={reviews} />
          </div>

          {/* ── RIGHT COLUMN ── */}
          <ReviewSection
            mediaId={Number(filmId)}
            mediaType="movie"
            initialReviews={reviews}
            currentUserId={user?.id ?? null}
            showAll
            hideStats
          />
        </div>
      </div>
    </div>
  );
}
