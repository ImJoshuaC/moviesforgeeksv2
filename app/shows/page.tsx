import Link from "next/link";
import { Shows } from "@/app/types/shows";
import ShowsCarousel from "@/app/components/ShowsCarousel";

const API_KEY = process.env.API_KEY;

async function fetchShows(category: string): Promise<Shows[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${category}?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await res.json();
  return data.results;
}

export default async function ShowsPage() {
  const featuredShows = await fetchShows("popular");
  const topRatedShows = await fetchShows("top_rated");
  const airingShows = await fetchShows("airing_today");
  const onTheAirShows = await fetchShows("on_the_air");

  return (
    <>
      <div className="w-full bg-[#1c1c1c]">
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Trending Shows
              </h1>
              <Link
                href="/shows/category/popular"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <ShowsCarousel results={featuredShows} />
          </>
        </div>
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Airing Today
              </h1>
              <Link
                href="/shows/category/airing-today"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <ShowsCarousel results={airingShows} />
          </>
        </div>
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                On The Air
              </h1>
              <Link
                href="/shows/category/on-the-air"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <ShowsCarousel results={onTheAirShows} />
          </>
        </div>
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Top Rated Shows
              </h1>
              <Link
                href="/shows/category/top-rated"
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </Link>
            </div>
            <hr />
            <ShowsCarousel results={topRatedShows} />
          </>
        </div>
      </div>
    </>
  );
}
