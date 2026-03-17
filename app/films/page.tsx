import Link from "next/link";
import { Movie } from "@/app/types/movie";
import MovieCarousel from "@/app/components/MovieCarousel";

const API_KEY = process.env.API_KEY;

async function fetchMovies(category: string): Promise<Movie[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await res.json();
  return data.results;
}

export default async function FilmsPage() {
  const featuredMovies = await fetchMovies("popular");
  const topRatedMovies = await fetchMovies("top_rated");
  const upcomingMovies = await fetchMovies("upcoming");
  const nowPlayingMovies = await fetchMovies("now_playing");

  return (
    <>
      <div className="w-full bg-[#1c1c1c]">
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Trending Movies
              </h1>
              <Link
                href="/films/category/popular"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <MovieCarousel results={featuredMovies} />
          </>
        </div>
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Now Playing
              </h1>
              <Link
                href="/films/category/now-playing"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <MovieCarousel results={nowPlayingMovies} />
          </>
        </div>
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Top Rated Movies
              </h1>
              <Link
                href="/films/category/top-rated"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <MovieCarousel results={topRatedMovies} />
          </>
        </div>
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Upcoming Movies
              </h1>
              <Link
                href="/films/category/coming-soon"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <MovieCarousel results={upcomingMovies} />
          </>
        </div>
      </div>
    </>
  );
}
