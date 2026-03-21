"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  FaStar, FaRegStar, FaTrash, FaEdit, FaCheck, FaTimes,
} from "react-icons/fa";
import { GiGoat } from "react-icons/gi";
import { submitReview, updateReview, deleteReview } from "@/app/actions/reviews";

// ── Types ─────────────────────────────────────────────────────────────────────

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type Review = {
  id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: Date | string;
  updated_at: Date | string | null;
  profile: Profile | null;
};

type Props = {
  mediaId: number;
  mediaType: "movie" | "show";
  initialReviews: Review[];
  currentUserId: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTs(ts: Date | string): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isEdited(created: Date | string, updated: Date | string | null): boolean {
  if (!updated) return false;
  return Math.abs(new Date(updated).getTime() - new Date(created).getTime()) > 5000;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ profile }: { profile: Profile | null }) {
  const initials =
    (profile?.display_name?.[0] ?? profile?.username?.[0] ?? "?").toUpperCase();

  if (profile?.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.display_name ?? profile.username ?? "User"}
        width={36}
        height={36}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
}

// ── Rating display / picker ───────────────────────────────────────────────────

function RatingPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(0)}
        title="0 – Trash"
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
          value === 0 ? "bg-red-500/30 text-red-400" : "text-white/40 hover:text-red-400"
        }`}
      >
        <FaTrash size={15} />
      </button>

      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          title={`${n} star${n > 1 ? "s" : ""}`}
          className="transition-colors"
        >
          {value !== null && value >= n ? (
            <FaStar size={22} className="text-yellow-400" />
          ) : (
            <FaRegStar size={22} className="text-white/30 hover:text-yellow-300" />
          )}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(6)}
        title="6 – GOAT"
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
          value === 6 ? "bg-green-500/30 text-green-400" : "text-white/40 hover:text-green-400"
        }`}
      >
        <GiGoat size={22} />
      </button>
    </div>
  );
}

function RatingDisplay({ rating }: { rating: number }) {
  if (rating === 0)
    return (
      <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
        <FaTrash size={11} /> Trash
      </span>
    );
  if (rating === 6)
    return (
      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
        <GiGoat size={15} /> GOAT
      </span>
    );
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        rating >= n ? (
          <FaStar key={n} size={12} className="text-yellow-400" />
        ) : (
          <FaRegStar key={n} size={12} className="text-white/25" />
        )
      )}
    </span>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isOwner,
  mediaId,
  mediaType,
  onDelete,
  onUpdate,
}: {
  review: Review;
  isOwner: boolean;
  mediaId: number;
  mediaType: "movie" | "show";
  onDelete: (id: string) => void;
  onUpdate: (id: string, rating: number, body: string, updatedAt: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState<number | null>(review.rating);
  const [editBody, setEditBody] = useState(review.body ?? "");
  const [isPending, startTransition] = useTransition();

  const displayName = review.profile?.display_name ?? review.profile?.username ?? "Anonymous";
  const username = review.profile?.username ? `@${review.profile.username}` : null;
  const edited = isEdited(review.created_at, review.updated_at);

  function handleSave() {
    if (editRating === null) return;
    startTransition(async () => {
      const res = await updateReview(review.id, mediaId, mediaType, editRating, editBody);
      if (!res?.error) {
        onUpdate(review.id, editRating, editBody, new Date().toISOString());
        setEditing(false);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteReview(review.id, mediaId, mediaType);
      onDelete(review.id);
    });
  }

  return (
    <div
      className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors ${
        isOwner
          ? "bg-[#4ade80]/8 border-[#4ade80]/25"
          : "bg-white/5 border-white/10"
      }`}
    >
      {/* Top row: avatar + identity left, rating + actions right */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: avatar + name + timestamps */}
        <div className="flex gap-3 min-w-0">
          <Avatar profile={review.profile} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-white text-sm font-semibold leading-tight truncate">
                {displayName}
              </span>
              {username && (
                <span className="text-white/35 text-xs truncate">{username}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-white/35 text-xs">{formatTs(review.created_at)}</span>
              {edited && review.updated_at && (
                <span className="text-white/25 text-xs italic">
                  · edited {formatTs(review.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: rating + edit/delete */}
        <div className="flex items-center gap-2 shrink-0">
          {!editing && <RatingDisplay rating={review.rating} />}
          {isOwner && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-white/30 hover:text-white transition-colors ml-1"
                title="Edit"
              >
                <FaEdit size={13} />
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                title="Delete"
              >
                <FaTrash size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body or edit form */}
      {editing ? (
        <div className="flex flex-col gap-3">
          <RatingPicker value={editRating} onChange={setEditRating} />
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            placeholder="Share your thoughts... (optional)"
            className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/40 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending || editRating === null}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors disabled:opacity-40"
            >
              <FaCheck size={11} /> Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditRating(review.rating);
                setEditBody(review.body ?? "");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs rounded-lg transition-colors"
            >
              <FaTimes size={11} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        review.body && (
          <p className="text-white/70 text-sm leading-relaxed">{review.body}</p>
        )
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReviewSection({ mediaId, mediaType, initialReviews, currentUserId }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating === null) return;
    setError(null);
    startTransition(async () => {
      const res = await submitReview(mediaId, mediaType, rating, body);
      if (res?.error) {
        setError(res.error);
      } else {
        if (res.review) setReviews((prev) => [res.review as Review, ...prev]);
        setRating(null);
        setBody("");
      }
    });
  }

  function handleDelete(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  function handleUpdate(id: string, newRating: number, newBody: string, updatedAt: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, rating: newRating, body: newBody, updated_at: updatedAt } : r
      )
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase tracking-wide">
        Reviews
      </h2>
      <hr className="border-white/15 my-3" />

      {/* Write form */}
      {currentUserId ? (
        <div className="flex flex-col gap-3 mb-8">
          <p className="text-white/50 text-xs uppercase tracking-widest font-roboto-slab">
            Write a review
          </p>
          <RatingPicker value={rating} onChange={setRating} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Share your thoughts... (optional)"
            className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/40 resize-none"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div>
            <button
              onClick={handleSubmit}
              disabled={isPending || rating === null}
              className="px-5 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white/40 text-sm mb-8">
          <a href="/auth/login" className="underline hover:text-white transition-colors">
            Sign in
          </a>{" "}
          to write a review.
        </p>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-white/30 text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={review.user_id === currentUserId}
              mediaId={mediaId}
              mediaType={mediaType}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
