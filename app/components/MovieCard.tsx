import { Movie } from "@/app/types/movie";
import Image from "next/image";

type MovieCardProps = {
  results: Movie;
};

export default function MovieCard({ results }: MovieCardProps) {
  return (
    <div className="flex flex-col items-center mt-3 w-37.5">
      <Image
        src={`https://image.tmdb.org/t/p/w500${results.poster_path}`}
        alt={results.title ?? "Movie Poster"}
        width={300}
        height={450}
        className="w-full h-auto"
      />

      <p className="font-roboto-serif text-lg text-center mt-1 wrap-break-word leading-tight">
        {results.title}
      </p>
    </div>
  );
}
