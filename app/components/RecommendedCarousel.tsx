"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type RecommendedItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

type Props = {
  items: RecommendedItem[];
  mediaType: "movie" | "show";
};

export default function RecommendedCarousel({ items, mediaType }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  function scrollLeft() {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: -container.clientWidth * 0.75, behavior: "smooth" });
  }

  function scrollRight() {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: container.clientWidth * 0.75, behavior: "smooth" });
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollStart.current = container.scrollLeft;
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    container.scrollLeft = scrollStart.current - (x - startX.current) * 1.5;
  }

  function onMouseUp() {
    isDragging.current = false;
  }

  const basePath = mediaType === "movie" ? "/films" : "/shows";

  return (
    <div className="relative group w-full">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-3 py-3 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDragStart={(e) => e.preventDefault()}
      >
        {items.map((item) => {
          const title = item.title ?? item.name ?? "Unknown";
          const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
          return (
            <Link
              key={item.id}
              href={`${basePath}/${item.id}`}
              className="shrink-0 w-32 sm:w-36 md:w-40 transition-transform duration-300 hover:scale-105"
            >
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-black/40">
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                    No Image
                  </div>
                )}
              </div>
              <div className="mt-2 px-1">
                <p className="text-white font-roboto-slab text-sm leading-tight line-clamp-2">
                  {title}
                </p>
                {year && (
                  <p className="text-white/50 font-roboto-serif text-xs mt-0.5">{year}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <button
        onClick={scrollLeft}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
      >
        <IoIosArrowBack size={30} />
      </button>

      <button
        onClick={scrollRight}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
      >
        <IoIosArrowForward size={30} />
      </button>
    </div>
  );
}
