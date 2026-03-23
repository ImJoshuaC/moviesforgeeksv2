"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { setTopFilm, removeTopFilm } from "@/app/actions/topFilms";

type FavoriteItem = {
  id: string;
  media_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
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
  mediaType: "movie" | "show";
  initialTopItems: TopItem[];
  favorites: FavoriteItem[];
};

export default function TopFilmsSection({ mediaType, initialTopItems, favorites }: Props) {
  const label = mediaType === "movie" ? "Films" : "Shows";
  const [topItems, setTopItems] = useState<TopItem[]>(initialTopItems);
  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() =>
    new Set(
      initialTopItems.map(
        (t) => favorites.find((f) => f.media_id === t.media_id && f.media_type === t.media_type)?.id ?? ""
      ).filter(Boolean)
    )
  );
  const [isPending, startTransition] = useTransition();

  const hasItems = topItems.length > 0;

  const openPicker = () => {
    const currentIds = new Set(
      topItems.map(
        (t) => favorites.find((f) => f.media_id === t.media_id && f.media_type === t.media_type)?.id ?? ""
      ).filter(Boolean)
    );
    setSelected(currentIds);
    setPickerOpen(true);
  };

  const toggleSelect = (itemId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else if (next.size < 5) {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSave = () => {
    setPickerOpen(false);
    setIsEditing(false);
    const chosenItems = favorites.filter((f) => selected.has(f.id));
    startTransition(async () => {
      await Promise.all(topItems.map((t) => removeTopFilm(mediaType, t.position)));
      await Promise.all(
        chosenItems.map((item, idx) =>
          setTopFilm(mediaType, idx + 1, item.media_id, item.title, item.poster_path ?? "")
        )
      );
      setTopItems(
        chosenItems.map((item, idx) => ({
          id: crypto.randomUUID(),
          position: idx + 1,
          media_id: item.media_id,
          media_type: item.media_type,
          title: item.title,
          poster_path: item.poster_path,
        }))
      );
    });
  };

  const handleRemoveSlot = (position: number) => {
    startTransition(async () => {
      await removeTopFilm(mediaType, position);
      setTopItems((prev) => prev.filter((t) => t.position !== position));
    });
  };

  // ── EMPTY STATE ──
  if (!hasItems && !isEditing) {
    return (
      <>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-roboto-slab text-sm uppercase tracking-widest text-white/60">
            My Top 5 {label}
          </h2>
        </div>
        <div className="flex justify-center py-10">
          <button
            onClick={openPicker}
            className="px-6 py-3 border border-white/30 text-white font-roboto-slab text-sm uppercase tracking-wide hover:border-white/60 transition-colors rounded-md"
          >
            Add your top 5 {label.toLowerCase()}
          </button>
        </div>
        {pickerOpen && (
          <PickerModal
            label={label}
            favorites={favorites}
            selected={selected}
            onToggle={toggleSelect}
            onSave={handleSave}
            onClose={() => setPickerOpen(false)}
            isPending={isPending}
          />
        )}
      </>
    );
  }

  // ── EDITING STATE ──
  if (isEditing) {
    return (
      <>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-roboto-slab text-sm uppercase tracking-widest text-white/60">
            My Top 5 {label}
          </h2>
          <div className="flex gap-4">
            <button
              onClick={openPicker}
              className="font-roboto-serif text-xs uppercase text-white/50 hover:text-white transition-colors"
            >
              Change selection
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="font-roboto-serif text-xs uppercase text-white/50 hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((pos) => {
            const item = topItems.find((t) => t.position === pos);
            return (
              <div key={pos} className="flex-1 relative aspect-2/3 rounded-md overflow-hidden group">
                {item ? (
                  <>
                    {item.poster_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <span className="text-white/40 text-xs font-roboto-slab text-center px-1">{item.title}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveSlot(pos)}
                      disabled={isPending}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600/80 transition-colors z-10 opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                    <span className="text-white/20 text-xl">+</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {pickerOpen && (
          <PickerModal
            label={label}
            favorites={favorites}
            selected={selected}
            onToggle={toggleSelect}
            onSave={handleSave}
            onClose={() => setPickerOpen(false)}
            isPending={isPending}
          />
        )}
      </>
    );
  }

  // ── DISPLAY STATE ──
  return (
    <>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-roboto-slab text-sm uppercase tracking-widest text-white/60">
          My Top 5 {label}
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          className="font-roboto-serif text-xs uppercase text-white/50 hover:text-white transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((pos) => {
          const item = topItems.find((t) => t.position === pos);
          return (
            <div key={pos} className="flex-1 relative aspect-2/3 rounded-md overflow-hidden">
              {item ? (
                item.poster_path ? (
                  <Image src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <span className="text-white/40 text-xs font-roboto-slab text-center px-1">{item.title}</span>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-white/5 border border-dashed border-white/10 rounded-md" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── PICKER MODAL ──
function PickerModal({
  label,
  favorites,
  selected,
  onToggle,
  onSave,
  onClose,
  isPending,
}: {
  label: string;
  favorites: FavoriteItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1c1c1c] border border-white/20 rounded-xl w-full max-w-sm flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h3 className="text-white font-roboto-slab font-bold uppercase text-sm">My Top 5 {label}</h3>
            <p className="text-white/40 font-roboto-serif text-xs mt-0.5">Select up to 5 — {selected.size}/5 chosen</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none transition-colors">×</button>
        </div>

        {favorites.length === 0 ? (
          <p className="text-white/40 font-roboto-serif text-sm px-5 py-8 text-center">
            Like some {label.toLowerCase()} first.
          </p>
        ) : (
          <ul className="overflow-y-auto max-h-72 scrollbar-hide divide-y divide-white/10">
            {favorites.map((item) => {
              const checked = selected.has(item.id);
              const disabled = !checked && selected.size >= 5;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onToggle(item.id)}
                    disabled={disabled}
                    className={`flex items-center gap-3 w-full px-5 py-3 text-left transition-colors ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"}`}
                  >
                    <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${checked ? "bg-[#4ade80] border-[#4ade80]" : "border-white/30 bg-transparent"}`}>
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 10 8">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {item.poster_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} width={28} height={42} className="rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-10 bg-white/10 rounded shrink-0" />
                    )}
                    <span className="text-white font-roboto-slab text-sm leading-tight">{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="px-5 py-4 border-t border-white/10">
          <button
            onClick={onSave}
            disabled={isPending || selected.size === 0}
            className="w-full py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-black font-roboto-slab font-bold text-sm uppercase rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : `Save selection (${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
