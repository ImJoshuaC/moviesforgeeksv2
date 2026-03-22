"use client";

import { useRef, useState, useTransition } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { addToFavorites, removeFromFavorites } from "@/app/actions/favorites";

type Props = {
  mediaId: number;
  mediaType: "movie" | "show";
  title: string;
  posterPath: string;
  releaseYear?: number;
  initialIsFavorite: boolean;
  isLoggedIn: boolean;
};

export default function FavoriteButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  releaseYear,
  initialIsFavorite,
  isLoggedIn,
}: Props) {
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const pendingAction = useRef<"add" | "remove">("add");

  if (!isLoggedIn) {
    return (
      <a
        href="/auth/login"
        className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 border border-white/10 rounded-xl text-white/30 min-w-[72px] hover:bg-white/5 transition-colors"
      >
        <FaRegHeart size={18} />
        <span className="text-[10px] font-roboto-slab uppercase tracking-wide">Liked</span>
      </a>
    );
  }

  const handleClick = () => {
    pendingAction.current = isFav ? "remove" : "add";
    startTransition(async () => {
      if (isFav) {
        const result = await removeFromFavorites(mediaId, mediaType);
        if (result?.error) {
          console.error("[FavoriteButton] remove failed:", result.error);
        } else {
          setIsFav(false);
        }
      } else {
        const result = await addToFavorites(mediaId, mediaType, title, posterPath, releaseYear);
        if (result?.error) {
          console.error("[FavoriteButton] add failed:", result.error);
        } else {
          setIsFav(true);
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
          : isFav
          ? "border-red-400/50 text-red-400 bg-red-500/10 hover:bg-red-500/20"
          : "border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {isPending ? (
        <span className="inline-block w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFav ? (
        <FaHeart size={18} />
      ) : (
        <FaRegHeart size={18} />
      )}
      <span className="text-[10px] font-roboto-slab uppercase tracking-wide">
        {isPending ? (pendingAction.current === "add" ? "Liking" : "Removing") : "Liked"}
      </span>
    </button>
  );
}
