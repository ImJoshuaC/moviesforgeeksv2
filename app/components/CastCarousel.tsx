"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  cast_id?: number;
  credit_id?: string;
};

type CastCarouselProps = {
  cast: CastMember[];
};

export default function CastCarousel({ cast }: CastCarouselProps) {
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
        {cast.map((member, index) => (
          <Link
            key={member.cast_id ?? `${member.id}-${member.credit_id}-${index}`}
            href={`/people/${member.id}`}
            className="shrink-0 w-32 sm:w-36 md:w-40 transition-transform duration-300 hover:scale-105"
          >
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-black/40">
              {member.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w342${member.profile_path}`}
                  alt={member.name ?? "Cast member"}
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
                {member.name}
              </p>
              <p className="text-white/70 font-roboto-serif text-xs italic mt-0.5 line-clamp-2">
                as {member.character}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Prev arrow */}
      <button
        onClick={scrollLeft}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
      >
        <IoIosArrowBack size={30} />
      </button>

      {/* Next arrow */}
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
