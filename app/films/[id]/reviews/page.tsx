import Image from "next/image";
import ReviewSection from "@/app/components/ReviewSection";
import { getReviews } from "@/app/actions/reviews";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

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

  const filmData = await res.json();
  const { data: { user } } = await supabase.auth.getUser();
  const reviews = await getReviews(Number(filmId), "movie");

  const year = filmData.release_date?.slice(0, 4);

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
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/75 to-[#161616] z-10" />

      <div className="relative z-20 px-2 py-6 md:px-4 md:py-8 max-w-3xl mx-auto flex flex-col gap-8">
        {/* Back link */}
        <Link
          href={`/films/${filmId}`}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-roboto-slab transition-colors w-fit"
        >
          <FaArrowLeft size={12} /> Back to {filmData.title}
        </Link>

        {/* Mini header */}
        <div className="flex items-center gap-4">
          {filmData.poster_path && (
            <Image
              src={`https://image.tmdb.org/t/p/w185${filmData.poster_path}`}
              alt={filmData.title}
              width={56}
              height={84}
              className="rounded-lg shrink-0"
            />
          )}
          <div>
            <h1 className="text-white font-roboto-slab text-2xl font-bold uppercase">
              {filmData.title}
            </h1>
            {year && <p className="text-white/50 text-sm font-roboto-serif">{year}</p>}
          </div>
        </div>

        {/* All reviews */}
        <ReviewSection
          mediaId={Number(filmId)}
          mediaType="movie"
          initialReviews={reviews}
          currentUserId={user?.id ?? null}
          showAll
        />
      </div>
    </div>
  );
}
