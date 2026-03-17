import { Movie } from "@/app/types/movie";
import Image from "next/image";
import Link from "next/link";

type MovieCardProps = {
  results: Movie;
};

export default function MovieCard({ results }: MovieCardProps) {
  return (
    <Link href={`/films/${results.id}`}>
      <div className="flex flex-col items-center mt-3 mb-2 w-full transform transition-transform duration-300 hover:scale-105">
        <Image
          src={results.poster_path ? `https://image.tmdb.org/t/p/w500${results.poster_path}` : "/poster-placeholder.svg"}
          alt={results.title ?? "Movie Poster"}
          width={300}
          height={450}
          className="w-full h-auto rounded-lg"
        />

        <p className="font-roboto-serif text-lg text-center mt-1 wrap-break-word leading-tight line-clamp-2">
          {results.title}
        </p>
      </div>
    </Link>
  );
}
