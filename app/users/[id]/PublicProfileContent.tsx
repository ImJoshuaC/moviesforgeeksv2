"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type MediaItem = {
  id: string;
  media_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  release_year?: number | null;
};

type TopItem = {
  id: string;
  position: number;
  media_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
};

type Props = {
  topFilms: TopItem[];
  topShows: TopItem[];
  favoriteFilms: MediaItem[];
  favoriteShows: MediaItem[];
  watchlistFilms: MediaItem[];
  watchlistShows: MediaItem[];
};

export default function PublicProfileContent({
  topFilms,
  topShows,
  favoriteFilms,
  favoriteShows,
  watchlistFilms,
  watchlistShows,
}: Props) {
  const [tab, setTab] = useState<"films" | "shows">("films");

  const isFilms = tab === "films";
  const topItems = isFilms ? topFilms : topShows;
  const favorites = isFilms ? favoriteFilms : favoriteShows;
  const watchlist = isFilms ? watchlistFilms : watchlistShows;
  const browseHref = isFilms ? "/films" : "/shows";
  const label = isFilms ? "films" : "shows";

  return (
    <>
      {/* ── TAB SWITCHER ── */}
      <div className="flex gap-6 mb-10 border-b border-white/10 pb-4">
        <button
          onClick={() => setTab("films")}
          className={`font-roboto-slab text-sm uppercase tracking-widest transition-colors pb-1 border-b-2 -mb-[17px] ${
            tab === "films"
              ? "text-white border-white"
              : "text-white/30 border-transparent hover:text-white/60"
          }`}
        >
          Films
        </button>
        <button
          onClick={() => setTab("shows")}
          className={`font-roboto-slab text-sm uppercase tracking-widest transition-colors pb-1 border-b-2 -mb-[17px] ${
            tab === "shows"
              ? "text-white border-white"
              : "text-white/30 border-transparent hover:text-white/60"
          }`}
        >
          Shows
        </button>
      </div>

      {/* ── TOP 5 ── */}
      {topItems.length > 0 && (
        <section className="mb-10">
          <h2 className="font-roboto-slab text-sm uppercase tracking-widest text-white/60 mb-4">
            Top 5 {label}
          </h2>
          <div className="flex gap-3">
            {topItems.map((item) => (
              <Link
                key={item.id}
                href={`${browseHref}/${item.media_id}`}
                className="group relative flex-1"
              >
                <div className="relative aspect-2/3 rounded-md overflow-hidden">
                  {item.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <span className="text-white/30 text-xs font-roboto-slab text-center px-1">
                        {item.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
                    <span className="text-white text-[10px] font-roboto-slab font-bold">
                      {item.position}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FAVORITES + WATCHLIST ── */}
      <div className="grid grid-cols-2 gap-6">
        <section>
          <h2 className="font-roboto-slab text-sm uppercase tracking-widest text-white/60 mb-4">
            Favorites
          </h2>
          {favorites.length === 0 ? (
            <p className="text-white/30 font-roboto-serif text-sm italic">
              No {label} liked yet.
            </p>
          ) : (
            <PosterGrid items={favorites} browseHref={browseHref} />
          )}
        </section>

        <section>
          <h2 className="font-roboto-slab text-sm uppercase tracking-widest text-white/60 mb-4">
            Watchlist
          </h2>
          {watchlist.length === 0 ? (
            <p className="text-white/30 font-roboto-serif text-sm italic">
              No {label} watchlisted yet.
            </p>
          ) : (
            <PosterGrid items={watchlist} browseHref={browseHref} />
          )}
        </section>
      </div>
    </>
  );
}

function PosterGrid({ items, browseHref }: { items: MediaItem[]; browseHref: string }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {items.map((item) => (
        <Link key={item.id} href={`${browseHref}/${item.media_id}`} className="group">
          <div className="relative aspect-2/3 rounded-md overflow-hidden">
            {item.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <span className="text-white/30 text-xs font-roboto-slab text-center px-1">?</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
