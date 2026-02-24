import Image from "next/image";
import Link from "next/link";

const API_KEY = process.env.API_KEY;

type SearchResult = {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (!q) {
    return (
      <div className="mx-5 md:mx-15 lg:mx-25 my-10 text-white">
        <h1 className="font-roboto-slab text-2xl uppercase mb-2">Search</h1>
        <hr />
        <p className="font-roboto-serif text-white/60 mt-8 text-center">
          Enter a search term to get started.
        </p>
      </div>
    );
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(q)}&page=1&include_adult=false`
  );
  const data = await res.json();

  const results: SearchResult[] = (data.results ?? []).filter(
    (item: SearchResult) =>
      (item.media_type === "movie" || item.media_type === "tv") &&
      item.poster_path
  );

  return (
    <div className="mx-5 md:mx-15 lg:mx-25 my-10 text-white">
      <h1 className="font-roboto-slab text-xl md:text-2xl uppercase mb-2">
        Search results for &ldquo;{q}&rdquo;
      </h1>
      <hr />

      {results.length === 0 ? (
        <p className="font-roboto-serif text-white/60 mt-8 text-center">
          No results found for &ldquo;{q}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 mt-5">
          {results.map((item) => {
            const title = item.media_type === "movie" ? item.title : item.name;
            const year = (
              item.media_type === "movie" ? item.release_date : item.first_air_date
            )?.slice(0, 4);
            const href =
              item.media_type === "movie"
                ? `/films/${item.id}`
                : `/shows/${item.id}`;

            return (
              <Link key={`${item.media_type}-${item.id}`} href={href}>
                <div className="flex flex-col items-center transform transition-transform duration-300 hover:scale-105">
                  <div className="relative w-full">
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={title ?? "Poster"}
                      width={300}
                      height={450}
                      className="w-full h-auto rounded-lg"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-roboto-slab uppercase px-2 py-0.5 rounded bg-black/60 text-white/80">
                      {item.media_type === "movie" ? "Movie" : "TV Show"}
                    </span>
                  </div>
                  <p className="font-roboto-serif text-sm text-center mt-1 leading-tight line-clamp-2">
                    {title}
                    {year && (
                      <span className="text-white/50"> ({year})</span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
