import Link from "next/link";
import { Movie } from "@/app/types/movie";
import MovieCarousel from "@/app/components/MovieCarousel";
import Top10Hero, { Top10Item } from "@/app/components/Top10Hero";

const API_KEY = process.env.API_KEY;

async function fetchMovies(category: string): Promise<Movie[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await res.json();
  return data.results;
}

export default async function FilmsPage() {
  const [featuredMovies, topRatedMovies, upcomingMovies, nowPlayingMovies, trendingRes] =
    await Promise.all([
      fetchMovies("popular"),
      fetchMovies("top_rated"),
      fetchMovies("upcoming"),
      fetchMovies("now_playing"),
      fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=en-US`).then((r) => r.json()),
    ]);

  const trendingMovies: Movie[] = trendingRes.results ?? [];
  const top10Movies = trendingMovies.slice(0, 10);

  const trailerKeys = await Promise.all(
    top10Movies.map((m) =>
      fetch(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${API_KEY}&language=en-US`)
        .then((r) => r.json())
        .then((data) => {
          const t = (data.results ?? []).find(
            (v: { site: string; type: string; key: string }) =>
              v.site === "YouTube" && v.type === "Trailer"
          );
          return t?.key ?? null;
        })
    )
  );

  const top10: Top10Item[] = top10Movies.map((m, i) => ({
    id: String(m.id),
    title: m.title,
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    overview: m.overview,
    vote_average: m.vote_average,
    href: `/films/${m.id}`,
    trailerKey: trailerKeys[i] ?? undefined,
  }));

  return (
    <div className="w-full bg-[#1c1c1c]">
      {/* Top 10 hero */}
      <Top10Hero items={top10} />

      {/* Carousels */}
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
            Trending Movies
          </h1>
          <Link
            href="/films/category/popular"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <MovieCarousel results={featuredMovies} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
            Now Playing
          </h1>
          <Link
            href="/films/category/now-playing"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <MovieCarousel results={nowPlayingMovies} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
            Top Rated Movies
          </h1>
          <Link
            href="/films/category/top-rated"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <MovieCarousel results={topRatedMovies} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
            Upcoming Movies
          </h1>
          <Link
            href="/films/category/coming-soon"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <MovieCarousel results={upcomingMovies} />
      </div>
    </div>
  );
}
