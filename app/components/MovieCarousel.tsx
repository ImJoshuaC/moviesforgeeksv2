"use client";

import { Movie } from "@/app/types/movie";
import MovieCard from "./MovieCard";
import Carousel from "./Carousel";

type MovieCarouselProps = {
  results: Movie[];
};

export default function MovieCarousel({ results }: MovieCarouselProps) {
  return (
    <Carousel
      items={results}
      renderItem={(movie) => <MovieCard results={movie} />}
      getKey={(movie, index) => `${movie.id}-${index}`}
    />
  );
}
