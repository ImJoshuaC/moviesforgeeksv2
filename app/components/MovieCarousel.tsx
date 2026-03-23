"use client";

import { Movie } from "@/app/types/movie";
import MediaCard from "./MediaCard";
import Carousel from "./Carousel";

type MovieCarouselProps = {
  results: Movie[];
};

export default function MovieCarousel({ results }: MovieCarouselProps) {
  return (
    <Carousel
      items={results}
      renderItem={(movie) => <MediaCard type="movie" results={movie} />}
      getKey={(movie, index) => `${movie.id}-${index}`}
    />
  );
}
