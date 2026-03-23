import Link from "next/link";
import { Shows } from "@/app/types/shows";
import ShowsCarousel from "@/app/components/ShowsCarousel";
import Top10Hero, { Top10Item } from "@/app/components/Top10Hero";

const API_KEY = process.env.API_KEY;

async function fetchShows(category: string): Promise<Shows[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${category}?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await res.json();
  return data.results;
}

export default async function ShowsPage() {
  const [featuredShows, topRatedShows, airingShows, onTheAirShows, trendingRes] =
    await Promise.all([
      fetchShows("popular"),
      fetchShows("top_rated"),
      fetchShows("airing_today"),
      fetchShows("on_the_air"),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=en-US`).then((r) => r.json()),
    ]);

  const trendingShows: Shows[] = trendingRes.results ?? [];
  const top10Shows = trendingShows.slice(0, 10);

  const trailerKeys = await Promise.all(
    top10Shows.map((s) =>
      fetch(`https://api.themoviedb.org/3/tv/${s.id}/videos?api_key=${API_KEY}&language=en-US`)
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

  const top10: Top10Item[] = top10Shows.map((s, i) => ({
    id: String(s.id),
    title: s.name,
    poster_path: s.poster_path,
    backdrop_path: s.backdrop_path,
    overview: s.overview,
    vote_average: s.vote_average,
    href: `/shows/${s.id}`,
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
            Trending Shows
          </h1>
          <Link
            href="/shows/category/popular"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <ShowsCarousel results={featuredShows} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
            Airing Today
          </h1>
          <Link
            href="/shows/category/airing-today"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <ShowsCarousel results={airingShows} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
            On The Air
          </h1>
          <Link
            href="/shows/category/on-the-air"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <ShowsCarousel results={onTheAirShows} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
            Top Rated Shows
          </h1>
          <Link
            href="/shows/category/top-rated"
            className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors"
          >
            Show More
          </Link>
        </div>
        <hr className="border-white/20 my-1" />
        <ShowsCarousel results={topRatedShows} />
      </div>
    </div>
  );
}
