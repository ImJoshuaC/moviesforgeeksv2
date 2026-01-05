import { Shows } from "@/app/types/shows";
import ShowsCard from "./ShowsCard";

type ShowsCarouselProps = {
  results: Shows[];
};

export default function MovieCarousel({ results }: ShowsCarouselProps) {
  return (
    <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      {results.slice(0, 7).map((shows) => (
        <ShowsCard key={shows.id} results={shows} />
      ))}
    </div>
  );
}
