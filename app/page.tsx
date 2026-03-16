import Link from "next/link";
import MovieCarousel from "@/app/components/MovieCarousel";
import ShowsCarousel from "@/app/components/ShowsCarousel";
import HeroCarousel from "@/app/components/HeroCarousel";
import { Movie } from "@/app/types/movie";
import { Shows } from "@/app/types/shows";

const API_KEY = process.env.API_KEY;

export default async function Home() {
  const [trendingRes, upcomingRes, tvRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`),
    fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`),
  ]);

  const [trendingData, upcomingData, tvData] = await Promise.all([
    trendingRes.json(),
    upcomingRes.json(),
    tvRes.json(),
  ]);

  const trendingMovies: Movie[] = trendingData.results;
  const upcomingMovies: Movie[] = upcomingData.results;
  const featuredShows: Shows[] = tvData.results;

  // Fetch details + trailers for the top 3 trending movies in parallel
  const top3 = trendingMovies.slice(0, 3);
  const heroData = await Promise.all(
    top3.map(async (m) => {
      const [detailsRes, videosRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${m.id}?api_key=${API_KEY}&language=en-US`),
        fetch(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${API_KEY}&language=en-US`),
      ]);
      const [details, videos] = await Promise.all([detailsRes.json(), videosRes.json()]);
      const trailer = videos.results?.find(
        (v: { type: string; site: string; key: string }) =>
          v.type === "Trailer" && v.site === "YouTube"
      );
      return {
        id: details.id,
        title: details.title,
        tagline: details.tagline,
        overview: details.overview,
        backdrop_path: details.backdrop_path,
        vote_average: details.vote_average,
        genres: details.genres ?? [],
        trailerKey: trailer?.key,
      };
    })
  );

  return (
    <div className="w-full bg-[#1c1c1c]">
      {/* Hero Carousel */}
      <HeroCarousel movies={heroData} />

      {/* Carousels */}
      <div className="mx-5 md:mx-10 lg:mx-16 my-8 flex flex-col gap-8">

        {/* Trending Today */}
        <section>
          <div className="flex flex-row justify-between items-baseline mb-1">
            <h2 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
              Trending Today
            </h2>
            <Link href="/films" className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors">
              See All
            </Link>
          </div>
          <hr className="border-white/20" />
          <MovieCarousel results={trendingMovies} />
        </section>

        {/* Coming Soon */}
        <section>
          <div className="flex flex-row justify-between items-baseline mb-1">
            <h2 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
              Coming Soon
            </h2>
            <Link href="/films" className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors">
              See All
            </Link>
          </div>
          <hr className="border-white/20" />
          <MovieCarousel results={upcomingMovies} />
        </section>

        {/* Featured TV Shows */}
        <section>
          <div className="flex flex-row justify-between items-baseline mb-1">
            <h2 className="font-roboto-slab text-xl md:text-2xl uppercase text-white">
              Popular TV Shows
            </h2>
            <Link href="/shows" className="font-roboto-serif text-xs md:text-sm uppercase text-white/50 hover:text-white transition-colors">
              See All
            </Link>
          </div>
          <hr className="border-white/20" />
          <ShowsCarousel results={featuredShows} />
        </section>

      </div>
    </div>
  );
}
