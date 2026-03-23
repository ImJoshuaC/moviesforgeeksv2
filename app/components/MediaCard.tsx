import { Movie } from "@/app/types/movie";
import { Shows } from "@/app/types/shows";
import Image from "next/image";
import Link from "next/link";

type MediaCardProps =
  | { type: "movie"; results: Movie }
  | { type: "show"; results: Shows };

export default function MediaCard(props: MediaCardProps) {
  const { type, results } = props;
  const title = type === "movie" ? results.title : results.name;
  const year =
    type === "movie"
      ? results.release_date?.slice(0, 4)
      : results.first_air_date?.slice(0, 4);
  const href = type === "movie" ? `/films/${results.id}` : `/shows/${results.id}`;

  return (
    <Link href={href}>
      <div className="flex flex-col items-center mt-3 mb-2 w-full transform transition-transform duration-300 hover:scale-105">
        <div className="relative w-full">
          <Image
            src={
              results.poster_path
                ? `https://image.tmdb.org/t/p/w500${results.poster_path}`
                : "/poster-placeholder.svg"
            }
            alt={title ?? "Poster"}
            width={300}
            height={450}
            className="w-full h-auto rounded-lg"
          />
        </div>
        <p className="font-roboto-serif text-sm text-center mt-1.5 wrap-break-word leading-tight line-clamp-2 text-white">
          {title}
        </p>
        {year && (
          <p className="font-roboto-serif text-xs text-white/40 mt-0.5">{year}</p>
        )}
      </div>
    </Link>
  );
}
