"use client";

import { Shows } from "@/app/types/shows";
import MediaCard from "./MediaCard";
import Carousel from "./Carousel";

type ShowsCarouselProps = {
  results: Shows[];
};

export default function ShowsCarousel({ results }: ShowsCarouselProps) {
  return (
    <Carousel
      items={results}
      renderItem={(show) => <MediaCard type="show" results={show} />}
      getKey={(show, index) => `${show.id}-${index}`}
    />
  );
}
