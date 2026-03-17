import { Shows } from "@/app/types/shows";
import Image from "next/image";
import Link from "next/link";

type ShowsCardProps = {
  results: Shows;
};

export default function ShowsCard({ results }: ShowsCardProps) {
  return (
    <Link href={`/shows/${results.id}`}>
      <div className="flex flex-col items-center mt-3 mb-2 w-full transform transition-transform duration-300 hover:scale-105">
        <Image
          src={results.poster_path ? `https://image.tmdb.org/t/p/w500${results.poster_path}` : "/poster-placeholder.svg"}
          alt={results.name ?? "Show Poster"}
          width={300}
          height={450}
          className="w-full h-auto rounded-lg"
        />

        <p className="font-roboto-serif text-lg text-center mt-1 wrap-break-word leading-tight line-clamp-2">
          {results.name}
        </p>
      </div>
    </Link>
  );
}
