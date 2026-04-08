import { Person } from "@/app/types/person";
import PeopleCarousel from "@/app/components/PeopleCarousel";

export const revalidate = 3600; // revalidate at most every hour

const API_KEY = process.env.API_KEY;

async function fetchPeople(endpoint: string): Promise<Person[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&language=en-US&page=1`
  );
  if (!res.ok) throw new Error(`Failed to load people (${res.status})`);
  const data = await res.json();
  return data.results ?? [];
}

export default async function PeoplePage() {
  const [trendingToday, popular, trendingWeek] = await Promise.all([
    fetchPeople("trending/person/day"),
    fetchPeople("person/popular"),
    fetchPeople("trending/person/week"),
  ]);

  return (
    <div className="w-full bg-[#1c1c1c]">
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
            Trending Today
          </h1>
        </div>
        <hr />
        <PeopleCarousel results={trendingToday} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
            Popular People
          </h1>
        </div>
        <hr />
        <PeopleCarousel results={popular} />
      </div>
      <div className="mx-5 md:mx-15 lg:mx-25 my-5">
        <div className="flex flex-row justify-between items-baseline">
          <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
            Trending This Week
          </h1>
        </div>
        <hr />
        <PeopleCarousel results={trendingWeek} />
      </div>
    </div>
  );
}
