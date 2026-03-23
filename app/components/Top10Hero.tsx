"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaPlay,
  FaTimes,
} from "react-icons/fa";

export type Top10Item = {
  id: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  href: string;
  trailerKey?: string;
};

type Props = {
  items: Top10Item[];
};

const ratingColor = (score: number) =>
  score >= 6.5
    ? "text-green-400"
    : score >= 5.0
      ? "text-yellow-400"
      : "text-red-400";

function StarRating({ score }: { score: number }) {
  const stars = score / 2;
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => {
        if (stars >= i)
          return <FaStar key={i} size={13} className="text-yellow-400" />;
        if (stars >= i - 0.5)
          return (
            <FaStarHalfAlt key={i} size={13} className="text-yellow-400" />
          );
        return <FaRegStar key={i} size={13} className="text-white/25" />;
      })}
    </div>
  );
}

export default function Top10Hero({ items }: Props) {
  const [active, setActive] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const current = items[active];
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 5000);
  }, [items.length, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  const closeTrailer = useCallback(() => setTrailerOpen(false), []);

  useEffect(() => {
    if (!trailerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTrailer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trailerOpen, closeTrailer]);

  useEffect(() => {
    document.body.style.overflow = trailerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [trailerOpen]);

  // Close trailer when switching active item
  useEffect(() => {
    setTrailerOpen(false);
  }, [active]);

  return (
    <div>
      {/* Hero backdrop */}
      <div className="relative w-full h-[68vh] md:h-[78vh] overflow-hidden">
        {items.map((item, i) =>
          item.backdrop_path ? (
            <Image
              key={item.id}
              src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
              alt=""
              fill
              priority={i === 0}
              quality={90}
              sizes="100vw"
              className={`object-cover object-top transition-opacity duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null,
        )}

        {/* Left fade + bottom fade */}
        <div className="absolute inset-0 bg-linear-to-r from-[#1c1c1c] via-[#1c1c1c]/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#1c1c1c] via-transparent to-transparent" />

        {/* Info */}
        <div className="absolute inset-0 flex items-center px-6 md:px-14 lg:px-20">
          <div className="flex flex-col gap-2.5 max-w-xs md:max-w-md">
            <span className="font-roboto-slab text-[10px] uppercase tracking-[0.2em] text-[#4ade80]">
              Top 10
            </span>
            <h2 className="font-roboto-slab font-black text-3xl md:text-4xl uppercase text-white leading-tight [text-shadow:2px_2px_8px_rgb(0_0_0/80%)]">
              {current.title}
            </h2>
            {current.vote_average > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <StarRating score={current.vote_average} />
                  <span
                    className={`font-roboto-slab font-bold text-sm ${ratingColor(current.vote_average)}`}
                  >
                    {current.vote_average.toFixed(1)}
                  </span>
                  <span className="text-white/40 text-xs font-roboto-serif">
                    /10
                  </span>
                </div>
              </div>
            )}
            {current.overview && (
              <p className="font-roboto-serif text-xs md:text-sm text-white/65 line-clamp-2 leading-relaxed">
                {current.overview}
              </p>
            )}
            <div className="flex gap-2 mt-1">
              <Link
                href={current.href}
                className="self-start px-5 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold font-roboto-slab text-sm rounded-lg transition-colors"
              >
                View
              </Link>
              {current.trailerKey && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 border border-white/30 text-white font-roboto-slab font-bold text-sm rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaPlay size={11} />
                  Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Numbered poster row */}
      <div className="relative z-10 -mt-24">
        <div
          className="flex overflow-x-auto scrollbar-hide px-4 md:px-10 pt-6 pb-6"
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
        >
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={item.href}
              onMouseEnter={() => setActive(i)}
              className="flex items-end shrink-0 group cursor-pointer"
            >
              {/* Rank number */}
              <span
                className={`font-jaro select-none leading-none transition-all duration-200 text-[90px] md:text-[120px] -mr-4 z-10 relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                  i === active
                    ? "text-white/90 [text-shadow:0_0_20px_rgba(0,0,0,0.8),-1px_-1px_0_rgba(0,0,0,0.6),1px_-1px_0_rgba(0,0,0,0.6),-1px_1px_0_rgba(0,0,0,0.6),1px_1px_0_rgba(0,0,0,0.6)]"
                    : "text-white/40 group-hover:text-white/65 [text-shadow:0_0_10px_rgba(0,0,0,0.8),-1px_-1px_0_rgba(0,0,0,0.5),1px_-1px_0_rgba(0,0,0,0.5),-1px_1px_0_rgba(0,0,0,0.5),1px_1px_0_rgba(0,0,0,0.5)]"
                }`}
              >
                {i + 1}
              </span>
              {/* Poster */}
              <div
                className={`relative w-[90px] md:w-[110px] shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-2 origin-bottom ${
                  i === active
                    ? "border-[#4ade80]"
                    : "border-transparent group-hover:border-white/30"
                }`}
              >
                <Image
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                      : "/poster-placeholder.svg"
                  }
                  alt={item.title}
                  width={342}
                  height={513}
                  quality={90}
                  className="w-full h-auto"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trailer modal */}
      {trailerOpen && current.trailerKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={closeTrailer}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeTrailer}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-roboto-slab"
            >
              <FaTimes size={14} /> Close
            </button>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${current.trailerKey}?autoplay=1&rel=0`}
                title={`${current.title} — Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
