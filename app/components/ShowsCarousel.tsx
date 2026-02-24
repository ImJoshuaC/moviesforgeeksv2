"use client";

import { Shows } from "@/app/types/shows";
import ShowsCard from "./ShowsCard";
import Carousel from "./Carousel";

type ShowsCarouselProps = {
  results: Shows[];
};

export default function ShowsCarousel({ results }: ShowsCarouselProps) {
  return (
    <Carousel
      items={results}
      renderItem={(show) => <ShowsCard results={show} />}
      getKey={(show, index) => `${show.id}-${index}`}
    />
  );
}
