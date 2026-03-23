"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsFillGridFill, BsListUl } from "react-icons/bs";

export type CategoryItem = {
  id: string;
  title: string;
  poster_path: string;
  overview: string;
  date: string;
  href: string;
};

type Props = {
  items: CategoryItem[];
  label: string;
};

export default function CategoryView({ items, label }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="font-roboto-slab text-2xl md:text-3xl uppercase text-white">
          {label}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={`p-2 rounded transition-colors ${
              view === "grid"
                ? "text-white bg-white/10"
                : "text-white/40 hover:text-white"
            }`}
          >
            <BsFillGridFill size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            className={`p-2 rounded transition-colors ${
              view === "list"
                ? "text-white bg-white/10"
                : "text-white/40 hover:text-white"
            }`}
          >
            <BsListUl size={20} />
          </button>
        </div>
      </div>
      <hr className="border-white/20 mb-6" />

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item, index) => (
            <Link href={item.href} key={`${item.id}-${index}`}>
              <div className="flex flex-col items-center mt-1 w-full transform transition-transform duration-300 hover:scale-105">
                <Image
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "/poster-placeholder.svg"}
                  alt={item.title}
                  width={300}
                  height={450}
                  className="w-full h-auto rounded-lg"
                />
                <p className="font-roboto-serif text-sm text-center mt-1 leading-tight line-clamp-2 text-white">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <Link href={item.href} key={`${item.id}-${index}`}>
              <div className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <Image
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : "/poster-placeholder.svg"}
                  alt={item.title}
                  width={60}
                  height={90}
                  className="rounded shrink-0 object-cover"
                  style={{ width: 60, height: 90 }}
                />
                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <p className="font-roboto-slab text-white font-semibold text-sm md:text-base leading-tight">
                    {item.title}
                  </p>
                  {item.date && (
                    <p className="font-roboto-serif text-white/40 text-xs">
                      {item.date}
                    </p>
                  )}
                  {item.overview && (
                    <p className="font-roboto-serif text-white/60 text-xs md:text-sm line-clamp-2 leading-snug">
                      {item.overview}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
