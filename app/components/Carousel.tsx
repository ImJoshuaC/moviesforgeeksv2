"use client";

import React, { useRef, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type CarouselProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T, index: number) => string;
};

export default function Carousel<T,>({ items, renderItem, getKey }: CarouselProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const shouldLoop = items.length >= 4;
  const displayItems = shouldLoop ? [...items, ...items, ...items] : items;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (shouldLoop) container.scrollLeft = container.scrollWidth / 3;
  }, [shouldLoop]);

  function getSingleSetWidth() {
    return (scrollRef.current?.scrollWidth ?? 0) / 3;
  }

  function handleScroll() {
    if (!shouldLoop || isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const w = getSingleSetWidth();
    if (container.scrollLeft >= w * 2) container.scrollLeft -= w;
    else if (container.scrollLeft <= 0) container.scrollLeft += w;
  }

  function scrollLeft() {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.75;
    if (shouldLoop) {
      const w = getSingleSetWidth();
      if (container.scrollLeft - amount <= 0) container.scrollLeft += w;
    }
    container.scrollBy({ left: -amount, behavior: "smooth" });
  }

  function scrollRight() {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.75;
    if (shouldLoop) {
      const w = getSingleSetWidth();
      if (container.scrollLeft + amount >= w * 2) container.scrollLeft -= w;
    }
    container.scrollBy({ left: amount, behavior: "smooth" });
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
    if (shouldLoop) {
      const w = getSingleSetWidth();
      if (container.scrollLeft >= w * 2) {
        container.scrollLeft -= w;
        scrollStart.current -= w;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += w;
        scrollStart.current += w;
      }
    }
  }

  function onMouseUp() {
    isDragging.current = false;
  }

  return (
    <div className="relative group w-full">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-3 py-3 cursor-grab active:cursor-grabbing select-none"
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDragStart={(e) => e.preventDefault()}
      >
        {displayItems.map((item: T, index: number) => (
          <div
            key={getKey(item, index)}
            className="shrink-0 w-[38vw] sm:w-[25vw] md:w-[18vw] lg:w-[14vw] xl:w-[11vw]"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Edge gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-[#1c1c1c] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#1c1c1c] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
