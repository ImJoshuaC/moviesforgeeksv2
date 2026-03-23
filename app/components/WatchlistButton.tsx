"use client";

import { useRef, useState, useTransition } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";

type Props = {
  mediaId: number;
  mediaType: "movie" | "show";
  title: string;
  posterPath: string;
  releaseYear?: number;
  initialIsInWatchlist: boolean;
  isLoggedIn: boolean;
};

export default function WatchlistButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  releaseYear,
  initialIsInWatchlist,
  isLoggedIn,
}: Props) {
  const [inWatchlist, setInWatchlist] = useState(initialIsInWatchlist);
  const [isPending, startTransition] = useTransition();
  const pendingAction = useRef<"add" | "remove">("add");

  if (!isLoggedIn) {
    return (
      <a
        href="/auth/login"
        className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 border border-white/10 rounded-xl text-white/30 min-w-[72px] hover:bg-white/5 transition-colors"
      >
        <FaRegBookmark size={18} />
        <span className="text-[10px] font-roboto-slab uppercase tracking-wide">Watchlist</span>
      </a>
    );
  }

  const handleClick = () => {
    pendingAction.current = inWatchlist ? "remove" : "add";
    startTransition(async () => {
      if (inWatchlist) {
        const result = await removeFromWatchlist(mediaId, mediaType);
        if (result?.error) {
          console.error("[WatchlistButton] remove failed:", result.error);
        } else {
          setInWatchlist(false);
        }
      } else {
        const result = await addToWatchlist(mediaId, mediaType, title, posterPath, releaseYear);
        if (result?.error) {
          console.error("[WatchlistButton] add failed:", result.error);
        } else {
          setInWatchlist(true);
        }
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex flex-col items-center justify-center gap-1.5 px-4 py-3 border rounded-xl transition-colors min-w-[72px] disabled:cursor-not-allowed ${
        isPending
          ? "border-white/20 text-white/50 bg-white/5"
          : inWatchlist
          ? "border-[#4ade80]/50 text-[#4ade80] bg-[#4ade80]/10 hover:bg-red-500/10 hover:border-red-400/50 hover:text-red-400"
          : "border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {isPending ? (
        <span className="inline-block w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : inWatchlist ? (
        <FaBookmark size={18} />
      ) : (
        <FaRegBookmark size={18} />
      )}
      <span className="text-[10px] font-roboto-slab uppercase tracking-wide">
        {isPending ? (pendingAction.current === "add" ? "Adding" : "Removing") : "Watchlist"}
      </span>
    </button>
  );
}
