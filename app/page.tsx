import MovieCarousel from "@/app/components/MovieCarousel";
import ShowsCarousel from "@/app/components/ShowsCarousel";
import { Movie } from "@/app/types/movie";
import { Shows } from "@/app/types/shows";

const API_KEY = process.env.API_KEY;

/*async function fetchMovies(category: string): Promise<Movie[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await res.json();
  return data.results;
} */

export default async function Home() {
  const popularRes = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );
  const popularData = await popularRes.json();
  const featuredMovies: Movie[] = popularData.results;

  const tvRes = await fetch(
    `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`
  );
  const tvData = await tvRes.json();
  const featuredShows: Shows[] = tvData.results;

  /*const featuredMovies = await fetchMovies("popular");
  const topRatedMovies = await fetchMovies("top_rated");*/

  return (
    <>
      <div className="w-full">
        <div className="mx-5 md:mx-15 lg:mx-25 my-5">
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Featured Movies
              </h1>
              <a
                href=""
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </a>
            </div>
            <hr />
            <MovieCarousel results={featuredMovies} />
          </>
          <>
            <div className="flex flex-row justify-between items-baseline">
              <h1 className="font-roboto-slab text-xl md:text-2xl uppercase">
                Featured TV Shows
              </h1>
              <a
                href=""
                className="font-roboto-serif text-[12px] md:text-sm lg:text-[16px] uppercase"
              >
                Show More
              </a>
            </div>
            <hr />
            <ShowsCarousel results={featuredShows} />
          </>
        </div>
      </div>
    </>
  );
}

/* 
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-roboto dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
*/
