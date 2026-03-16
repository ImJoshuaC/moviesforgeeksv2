"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type Genre = { id: number; name: string };

type HeroMovie = {
  id: number;
  title: string;
  tagline?: string;
  overview: string;
  backdrop_path: string;
  vote_average: number;
  genres: Genre[];
  trailerKey?: string;
};

export default function HeroCarousel({ movies }: { movies: HeroMovie[] }) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((index + movies.length) % movies.length);
        setTransitioning(false);
      }, 300);
    },
    [transitioning, movies.length]
  );

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), 6000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const movie = movies[current];

  const scoreColor =
    movie.vote_average >= 6.5
      ? "bg-green-600"
      : movie.vote_average >= 5.0
        ? "bg-yellow-500"
        : "bg-red-600";

  return (
    <div className="relative w-full h-[75vh] min-h-[480px] overflow-hidden">
      {/* Backdrop — fades on slide change */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}
      >
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-[#1c1c1c] via-[#1c1c1c]/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-[#1c1c1c]/80 via-transparent to-transparent" />

      {/* Content */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-14 transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}
      >
        <div className="max-w-2xl flex flex-col gap-3">
          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.slice(0, 3).map((g) => (
              <Badge
                key={g.id}
                variant="outline"
                className="border-white/40 text-white/80 font-roboto-slab text-xs"
              >
                {g.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-white font-roboto-slab font-black text-4xl md:text-5xl lg:text-6xl uppercase leading-tight [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
            {movie.title}
          </h1>

          {/* Tagline */}
          {movie.tagline && (
            <p className="text-white/70 font-roboto-serif italic text-base md:text-lg">
              &ldquo;{movie.tagline}&rdquo;
            </p>
          )}

          {/* Overview */}
          <p className="text-white/60 font-roboto-serif text-sm md:text-base leading-relaxed line-clamp-2">
            {movie.overview}
          </p>

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <a
              href={`/films/${movie.id}`}
              className="px-4 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black font-roboto-slab font-bold text-sm rounded-lg transition-colors"
            >
              View Details
            </a>
            {movie.trailerKey && (
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-white/50 text-white bg-transparent hover:bg-white/10 font-roboto-slab text-sm rounded-lg transition-colors"
              >
                ▶ Watch Trailer
              </a>
            )}
            <span className={`${scoreColor} text-white font-roboto-slab font-bold text-sm px-3 py-1.5 rounded-full`}>
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Prev arrow */}
      <button
        onClick={() => goTo(current - 1)}
        aria-label="Previous"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all"
      >
        <IoIosArrowBack size={22} />
      </button>

      {/* Next arrow */}
      <button
        onClick={() => goTo(current + 1)}
        aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all"
      >
        <IoIosArrowForward size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
