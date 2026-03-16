"use client";

import { useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";

type Props = {
  mediaId: number;
  mediaType: "movie" | "show";
  title: string;
  posterPath: string;
  initialIsInWatchlist: boolean;
  isLoggedIn: boolean;
};

export default function WatchlistButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  initialIsInWatchlist,
  isLoggedIn,
}: Props) {
  const [inWatchlist, setInWatchlist] = useState(initialIsInWatchlist);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <a
        href="/auth/login"
        className="inline-block mt-2 px-5 py-2 border border-white/40 text-white/70 font-roboto-slab text-sm rounded-md hover:border-white/70 hover:text-white transition-colors"
      >
        Sign in to add to Watchlist
      </a>
    );
  }

  const handleClick = () => {
    startTransition(async () => {
      if (inWatchlist) {
        await removeFromWatchlist(mediaId, mediaType);
        setInWatchlist(false);
      } else {
        await addToWatchlist(mediaId, mediaType, title, posterPath);
        setInWatchlist(true);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`mt-2 px-5 py-2 font-roboto-slab text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        inWatchlist
          ? "bg-white/20 border border-white/40 text-white hover:bg-red-500/30 hover:border-red-400 hover:text-red-300"
          : "bg-[#4ade80] text-black font-bold hover:bg-[#22c55e]"
      }`}
    >
      {isPending ? "..." : inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
    </button>
  );
}
