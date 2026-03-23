import { Person } from "@/app/types/person";
import Image from "next/image";
import Link from "next/link";

type PersonCardProps = {
  results: Person;
};

export default function PersonCard({ results }: PersonCardProps) {
  return (
    <Link href={`/people/${results.id}`}>
      <div className="flex flex-col items-center mt-3 mb-2 w-full transform transition-transform duration-300 hover:scale-105">
        <Image
          src={results.profile_path ? `https://image.tmdb.org/t/p/w500${results.profile_path}` : "/poster-placeholder.svg"}
          alt={results.name ?? "Person"}
          width={300}
          height={450}
          className="w-full h-auto rounded-lg"
        />
        <p className="font-roboto-serif text-lg text-center mt-1 wrap-break-word leading-tight line-clamp-2">
          {results.name}
        </p>
        {results.known_for_department && (
          <p className="font-roboto-slab text-xs text-white/40 text-center mt-0.5">
            {results.known_for_department}
          </p>
        )}
      </div>
    </Link>
  );
}
