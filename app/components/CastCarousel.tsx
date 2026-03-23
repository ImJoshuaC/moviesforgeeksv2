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
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -scrollRef.current.clientWidth * 0.75, behavior: "smooth" });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth * 0.75, behavior: "smooth" });
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - container.offsetLeft;
    scrollStart.current = container.scrollLeft;
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const diff = x - startX.current;
    if (Math.abs(diff) > 5) hasDragged.current = true;
    container.scrollLeft = scrollStart.current - diff * 1.5;
  }

  function onMouseUp() {
    isDragging.current = false;
  }

  return (
    <div className="relative group w-full">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-5 py-4 cursor-grab active:cursor-grabbing select-none"
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
            onClick={(e) => { if (hasDragged.current) e.preventDefault(); }}
            className="shrink-0 w-40 flex flex-col items-center gap-2"
          >
            <div className="relative w-36 h-36 rounded-full overflow-hidden bg-white/10 shrink-0">
              {member.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                  alt={member.name ?? "Cast member"}
                  fill
                  sizes="144px"
                  className="object-cover pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                  ?
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-roboto-slab text-base leading-tight line-clamp-2">
                {member.name}
              </p>
              <p className="text-white/50 font-roboto-serif text-sm italic mt-0.5 line-clamp-1">
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
        className="absolute left-0 top-[88px] -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
      >
        <IoIosArrowBack size={30} />
      </button>

      {/* Next arrow */}
      <button
        onClick={scrollRight}
        aria-label="Scroll right"
        className="absolute right-0 top-[88px] -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
      >
        <IoIosArrowForward size={30} />
      </button>
    </div>
  );
}
