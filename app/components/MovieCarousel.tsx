import { Movie } from "@/app/types/movie";
import MovieCard from "./MovieCard";

type MovieCarouselProps = {
  results: Movie[];
};

export default function MovieCarousel({ results }: MovieCarouselProps) {
  return (
    <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      {results.slice(0, 7).map((movie) => (
        <MovieCard key={movie.id} results={movie} />
      ))}
    </div>
  );
}

/*

<div className="movie-carousel">
      {results.map((movie) => (
        <div key={movie.id} className="movie-item">
          <h2>{movie.title}</h2>
        </div>
      ))}
    </div>
    
    */
