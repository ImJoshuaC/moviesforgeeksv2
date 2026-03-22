import { Shows } from "@/app/types/shows";
import Image from "next/image";
import Link from "next/link";

type ShowsCardProps = {
  results: Shows;
};

export default function ShowsCard({ results }: ShowsCardProps) {
  const year = results.first_air_date?.slice(0, 4);

  return (
    <Link href={`/shows/${results.id}`}>
      <div className="flex flex-col items-center mt-3 mb-2 w-full transform transition-transform duration-300 hover:scale-105">
        <div className="relative w-full">
          <Image
            src={results.poster_path ? `https://image.tmdb.org/t/p/w500${results.poster_path}` : "/poster-placeholder.svg"}
            alt={results.name ?? "Show Poster"}
            width={300}
            height={450}
            className="w-full h-auto rounded-lg"
          />
        </div>

        <p className="font-roboto-serif text-sm text-center mt-1.5 wrap-break-word leading-tight line-clamp-2 text-white">
          {results.name}
        </p>
        {year && (
          <p className="font-roboto-serif text-xs text-white/40 mt-0.5">{year}</p>
        )}
      </div>
    </Link>
  );
}
