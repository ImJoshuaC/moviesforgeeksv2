import Image from "next/image";
import MovieCarousel from "@/app/components/MovieCarousel";
import ShowsCarousel from "@/app/components/ShowsCarousel";
import BiographyText from "@/app/components/BiographyText";
import { Movie } from "@/app/types/movie";
import { Shows } from "@/app/types/shows";

const API_KEY = process.env.API_KEY;

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const personId = (await params).id;

  const [personRes, creditsRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${API_KEY}&language=en-US`),
    fetch(`https://api.themoviedb.org/3/person/${personId}/combined_credits?api_key=${API_KEY}&language=en-US`),
  ]);

  const person = await personRes.json();
  const credits = await creditsRes.json();

  type CreditItem = {
    id: number;
    media_type: string;
    poster_path: string | null;
    title?: string;
    name?: string;
    backdrop_path?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    runtime?: number;
    genres?: { id: number; name: string }[];
  };

  const movies: Movie[] = (credits.cast ?? [])
    .filter((c: CreditItem) => c.media_type === "movie" && c.poster_path)
    .filter((c: CreditItem, i: number, arr: CreditItem[]) => arr.findIndex(x => x.id === c.id) === i)
    .sort((a: CreditItem, b: CreditItem) =>
      (b.release_date ?? "").localeCompare(a.release_date ?? "")
    )
    .map((c: CreditItem) => ({
      id: String(c.id),
      title: c.title ?? "",
      poster_path: c.poster_path ?? "",
      backdrop_path: c.backdrop_path ?? "",
      overview: c.overview ?? "",
      release_date: c.release_date ?? "",
      vote_average: c.vote_average ?? 0,
      runtime: c.runtime ?? 0,
      genres: c.genres ?? [],
    }));

  const tvShows: Shows[] = (credits.cast ?? [])
    .filter((c: CreditItem) => c.media_type === "tv" && c.poster_path)
    .filter((c: CreditItem, i: number, arr: CreditItem[]) => arr.findIndex(x => x.id === c.id) === i)
    .sort((a: CreditItem, b: CreditItem) =>
      (b.first_air_date ?? "").localeCompare(a.first_air_date ?? "")
    )
    .map((c: CreditItem) => ({
      id: String(c.id),
      name: c.name ?? "",
      poster_path: c.poster_path ?? "",
      backdrop_path: c.backdrop_path ?? "",
      overview: c.overview ?? "",
      first_air_date: c.first_air_date ?? "",
    }));

  return (
    <div className="w-full min-h-screen bg-[#1c1c1c]">
      {/* Gradient header band */}
      <div className="bg-linear-to-b from-black/60 to-[#1c1c1c]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-8 pb-10">

          {/* Hero row: photo left, info right */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">

            {/* Profile photo */}
            <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <Image
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                    : "/poster-placeholder.svg"
                }
                alt={person.name ?? "Person"}
                width={300}
                height={450}
                quality={90}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4 flex-1">
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-roboto-slab font-black uppercase [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                {person.name}
              </h1>

              {/* Personal details */}
              <div className="flex flex-col gap-2">
                {person.known_for_department && (
                  <p className="text-white/90 text-sm md:text-base font-roboto-serif">
                    <span className="font-bold">Known For:</span>{" "}
                    {person.known_for_department}
                  </p>
                )}
                {person.birthday && (
                  <p className="text-white/90 text-sm md:text-base font-roboto-serif">
                    <span className="font-bold">Born:</span>{" "}
                    {person.birthday}
                    {person.place_of_birth ? ` · ${person.place_of_birth}` : ""}
                  </p>
                )}
                {person.deathday && (
                  <p className="text-white/90 text-sm md:text-base font-roboto-serif">
                    <span className="font-bold">Died:</span> {person.deathday}
                  </p>
                )}
              </div>

              {/* Biography */}
              <div className="mt-2">
                <h2 className="text-white text-lg md:text-xl font-roboto-slab font-bold mb-2 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
                  Biography
                </h2>
                <BiographyText text={person.biography || "No biography available."} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filmography */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pb-12 flex flex-col gap-8">

        {movies.length > 0 && (
          <div>
            <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase">
              Movies
            </h2>
            <hr className="border-white/20 my-1" />
            <MovieCarousel results={movies} />
          </div>
        )}

        {tvShows.length > 0 && (
          <div>
            <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase">
              TV Shows
            </h2>
            <hr className="border-white/20 my-1" />
            <ShowsCarousel results={tvShows} />
          </div>
        )}

      </div>
    </div>
  );
}
