import { Shows } from "@/app/types/shows";
import Image from "next/image";

type ShowsCardProps = {
  results: Shows;
};

export default function ShowsCard({ results }: ShowsCardProps) {
  return (
    <div className="flex flex-col items-center mt-3 w-37.5">
      <Image
        src={`https://image.tmdb.org/t/p/w500${results.poster_path}`}
        alt={results.name ?? "Movie Poster"}
        width={300}
        height={450}
        className="w-full h-auto"
      />

      <p className="font-roboto-serif text-lg text-center mt-1 wrap-break-word leading-tight line-clamp-2">
        {results.name}
      </p>
    </div>
  );
}
