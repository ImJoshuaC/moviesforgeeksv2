"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaStar,
  FaRegStar,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaThumbsUp,
  FaThumbsDown,
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GiGoat } from "react-icons/gi";
import {
  submitReview,
  updateReview,
  deleteReview,
  voteOnReview,
} from "@/app/actions/reviews";

// ── Types ─────────────────────────────────────────────────────────────────────

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type ReviewVote = {
  id: string;
  user_id: string;
  value: number;
};

export type Review = {
  id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: Date | string;
  updated_at: Date | string | null;
  profile: Profile | null;
  votes: ReviewVote[];
};

type SortOrder = "newest" | "oldest" | "most_liked" | "controversial";

type Props = {
  mediaId: number;
  mediaType: "movie" | "show";
  initialReviews: Review[];
  currentUserId: string | null;
  showAll?: boolean;
  initialCount?: number;
  hideStats?: boolean;
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

function isEdited(
  created: Date | string,
  updated: Date | string | null,
): boolean {
  if (!updated) return false;
  return (
    Math.abs(new Date(updated).getTime() - new Date(created).getTime()) > 5000
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ profile }: { profile: Profile | null }) {
  const initials = (
    profile?.display_name?.[0] ??
    profile?.username?.[0] ??
    "?"
  ).toUpperCase();

  if (profile?.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.display_name ?? profile.username ?? "User"}
        width={48}
        height={48}
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
      <span className="text-white text-sm font-bold">{initials}</span>
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
        title="0 – Straight Garbage"
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
          value === 0
            ? "bg-red-500/30 text-red-400"
            : "text-white/40 hover:text-red-400"
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
            <FaRegStar
              size={22}
              className="text-white/30 hover:text-yellow-300"
            />
          )}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(6)}
        title="6 – GOAT"
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
          value === 6
            ? "bg-green-500/30 text-green-400"
            : "text-white/40 hover:text-green-400"
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
        <FaTrash size={11} /> Straight Garbage
      </span>
    );
  if (rating === 6)
    return (
      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
        <GiGoat size={15} /> GOATED!
      </span>
    );
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        rating >= n ? (
          <FaStar key={n} size={12} className="text-yellow-400" />
        ) : (
          <FaRegStar key={n} size={12} className="text-white/25" />
        ),
      )}
    </span>
  );
}

// ── Rating Stats (exportable for left column use) ─────────────────────────────

export function RatingStats({ reviews }: { reviews: Review[] }) {
  const ratingLabels = ["Straight Garbage", "1★", "2★", "3★", "4★", "5★", "GOAT"];
  const distribution = [0, 1, 2, 3, 4, 5, 6].map((r, i) => ({
    label: ratingLabels[i],
    count: reviews.filter((rev) => rev.rating === r).length,
    rating: r,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const mfgAvg =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length / 6) *
            100,
        ) / 10
      : null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
      <div>
        <p className="text-white/50 text-[10px] uppercase tracking-widest font-roboto-slab mb-1">
          MoviesForGeeks Rating
        </p>
        {mfgAvg !== null ? (
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-roboto-slab font-black ${mfgAvg >= 6.5 ? "text-green-400" : mfgAvg >= 5.0 ? "text-yellow-400" : "text-red-400"}`}>
              {mfgAvg.toFixed(1)}
            </span>
            <span className="text-white/30 text-sm font-roboto-serif">
              / 10
            </span>
            <span className="text-white/30 text-xs font-roboto-serif ml-1">
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        ) : (
          <span className="text-white/30 text-sm font-roboto-serif">
            No ratings yet
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {[...distribution].reverse().map(({ label, count, rating: r }) => {
          const barColor =
            r === 0
              ? "bg-red-500"
              : r === 6
                ? "bg-[#4ade80]"
                : "bg-yellow-400";
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={r} className="flex items-center gap-2">
              <span className="text-white/40 text-xs font-roboto-slab w-9 shrink-0 text-right">
                {label}
              </span>
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`${barColor} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-white/30 text-xs font-roboto-serif w-5 shrink-0">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isOwner,
  mediaId,
  mediaType,
  currentUserId,
  expanded,
  onDelete,
  onUpdate,
}: {
  review: Review;
  isOwner: boolean;
  mediaId: number;
  mediaType: "movie" | "show";
  currentUserId: string | null;
  expanded: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, rating: number, body: string, updatedAt: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState<number | null>(review.rating);
  const [editBody, setEditBody] = useState(review.body ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const initialNet = review.votes.reduce((s, v) => s + v.value, 0);
  const initialUserVote = review.votes.find((v) => v.user_id === currentUserId)?.value ?? 0;
  const [netVotes, setNetVotes] = useState(initialNet);
  const [userVote, setUserVote] = useState(initialUserVote);

  const displayName = review.profile?.display_name ?? review.profile?.username ?? "Anonymous";
  const edited = isEdited(review.created_at, review.updated_at);

  function handleVote(value: 1 | -1) {
    if (!currentUserId) return;
    const newVote = userVote === value ? 0 : value;
    setNetVotes((n) => n - userVote + newVote);
    setUserVote(newVote);
    startTransition(async () => { await voteOnReview(review.id, value); });
  }

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

  const CHAR_LIMIT = 160;
  const reviewsPagePath = `/${mediaType === "movie" ? "films" : "shows"}/${mediaId}/reviews`;
  const bodyTruncated = !expanded && review.body && review.body.length > CHAR_LIMIT;
  const displayBody = bodyTruncated ? review.body!.slice(0, CHAR_LIMIT).trimEnd() : review.body;

  return (
    <div id={review.id} className={`scroll-mt-24 rounded-xl p-4 border transition-colors ${
      isOwner ? "bg-[#4ade80]/8 border-[#4ade80]/25" : "bg-white/5 border-white/10"
    }`}>
      {/* Header: avatar + name/date/body + rating + menu */}
      <div className="flex items-start gap-3">
        <Avatar profile={review.profile} />

        {/* Right of avatar: everything */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Name row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/users/${review.user_id}`} className="text-white font-semibold text-sm leading-tight block hover:underline">{displayName}</Link>
              <span className="text-white/35 text-xs">
                {formatTs(review.created_at)}
                {edited && <span className="italic"> · edited</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!editing && <RatingDisplay rating={review.rating} />}
              {isOwner && !editing && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="text-white/30 hover:text-white transition-colors p-1"
                  >
                    <FaEllipsisV size={13} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-7 z-50 bg-[#2a2a2a] border border-white/15 rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                      <button
                        onClick={() => { setEditing(true); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <FaEdit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => { handleDelete(); setMenuOpen(false); }}
                        disabled={isPending}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      >
                        <FaTrash size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Body or edit form — aligned under name */}
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
                <button onClick={handleSave} disabled={isPending || editRating === null}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors disabled:opacity-40">
                  <FaCheck size={11} /> Save
                </button>
                <button onClick={() => { setEditing(false); setEditRating(review.rating); setEditBody(review.body ?? ""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs rounded-lg transition-colors">
                  <FaTimes size={11} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            review.body && (
              <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">
                {displayBody}
                {bodyTruncated && (
                  <>
                    {"... "}
                    <a
                      href={`${reviewsPagePath}#${review.id}`}
                      className="text-white/45 hover:text-white text-xs underline underline-offset-2 transition-colors"
                    >
                      show more
                    </a>
                  </>
                )}
              </p>
            )
          )}
        </div>
      </div>

      {/* Footer: upvote / downvote — aligned under name/body */}
      {!editing && (
        <div className="flex items-center gap-3 pt-4 mt-2 border-t border-white/8 pl-[52px]">
          <button
            onClick={() => handleVote(1)}
            disabled={!currentUserId || isPending}
            className={`flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40 ${
              userVote === 1 ? "text-[#4ade80]" : "text-white/40 hover:text-white/70"
            }`}
          >
            <FaThumbsUp size={13} />
          </button>
          <span className={`text-sm font-roboto-slab font-bold tabular-nums ${
            netVotes > 0 ? "text-[#4ade80]" : netVotes < 0 ? "text-red-400" : "text-white/40"
          }`}>
            {netVotes > 0 ? `+${netVotes}` : netVotes}
          </span>
          <button
            onClick={() => handleVote(-1)}
            disabled={!currentUserId || isPending}
            className={`flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40 ${
              userVote === -1 ? "text-red-400" : "text-white/40 hover:text-white/70"
            }`}
          >
            <FaThumbsDown size={13} />
          </button>
          {!currentUserId && (
            <span className="text-white/25 text-xs font-roboto-serif ml-1">
              <a href="/auth/login" className="underline hover:text-white/50 transition-colors">Sign in</a> to vote
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const INITIAL_COUNT = 3;
const PAGE_SIZE = 10;

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most_liked", label: "Most Liked" },
  { value: "controversial", label: "Controversial" },
];

export default function ReviewSection({
  mediaId,
  mediaType,
  initialReviews,
  currentUserId,
  showAll = false,
  initialCount = INITIAL_COUNT,
  hideStats = false,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  function handleSortChange(order: SortOrder) {
    setSortOrder(order);
    setCurrentPage(1);
  }

  function handleSubmit() {
    if (rating === null) return;
    setError(null);
    startTransition(async () => {
      const res = await submitReview(mediaId, mediaType, rating, body);
      if (res?.error) {
        setError(res.error);
      } else {
        if (res.review) setReviews((prev) => [{ ...res.review, votes: [] } as Review, ...prev]);
        setRating(null);
        setBody("");
      }
    });
  }

  function handleDelete(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  function handleUpdate(
    id: string,
    newRating: number,
    newBody: string,
    updatedAt: string,
  ) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, rating: newRating, body: newBody, updated_at: updatedAt }
          : r,
      ),
    );
  }

  const reviewsPagePath = `/${mediaType === "movie" ? "films" : "shows"}/${mediaId}/reviews`;

  // Sort
  const sorted = [...reviews].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "most_liked": {
        const aNet = a.votes.reduce((s, v) => s + v.value, 0);
        const bNet = b.votes.reduce((s, v) => s + v.value, 0);
        return bNet - aNet;
      }
      case "controversial": {
        const aNet = a.votes.reduce((s, v) => s + v.value, 0);
        const bNet = b.votes.reduce((s, v) => s + v.value, 0);
        return aNet - bNet; // lowest score first
      }
    }
  });

  const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
  const visibleReviews = showAll
    ? sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : sorted.slice(0, initialCount);
  const hasMore = !showAll && reviews.length > initialCount;

  return (
    <div className="flex flex-col gap-6">
      {/* MFG ratings distribution — hidden when hideStats is true */}
      {!hideStats && <RatingStats reviews={reviews} />}

      {/* Reviews section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase tracking-wide">Reviews</h2>
          {hasMore && (
            <a href={reviewsPagePath} className="text-white/40 hover:text-white text-xs font-roboto-slab uppercase tracking-wide transition-colors">
              See More →
            </a>
          )}
        </div>
        <hr className="border-white/15 my-2" />

        {/* Write review / sign-in prompt */}
        <div>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <button
                        onClick={handleSubmit}
                        disabled={isPending || rating === null}
                        className="px-5 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isPending ? "Submitting…" : "Submit Review"}
                      </button>
                    </span>
                  </TooltipTrigger>
                  {rating === null && (
                    <TooltipContent side="right" className="bg-[#2a2a2a] border-white/15 text-white/80 text-xs font-roboto-serif">
                      A rating is required to submit
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 border border-white/10 rounded-xl bg-white/5 flex flex-col items-center gap-3 text-center">
              <p className="text-white/60 text-sm font-roboto-serif">
                Have thoughts on this? Share your take.
              </p>
              <a
                href="/auth/login"
                className="px-5 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-bold font-roboto-slab uppercase tracking-wide rounded-lg transition-colors"
              >
                Sign in to Review
              </a>
            </div>
          )}

          {/* Sort filter controls — only on full page */}
          {showAll && reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-white/40 text-xs font-roboto-slab uppercase tracking-widest shrink-0">Sort:</span>
              <Select value={sortOrder} onValueChange={(v) => handleSortChange(v as SortOrder)}>
                <SelectTrigger className="w-44 bg-white/5 border-white/15 text-white/70 text-xs font-roboto-slab uppercase tracking-wide focus:ring-0 focus:border-white/30 hover:border-white/25 transition-colors">
                  <SelectValue>{SORT_OPTIONS.find((o) => o.value === sortOrder)?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2a] border-white/15 text-white">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs font-roboto-slab uppercase tracking-wide text-white/70 focus:bg-white/10 focus:text-white cursor-pointer"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2 text-center border border-dashed border-white/10 rounded-xl">
              <p className="text-white/50 text-base font-roboto-slab uppercase tracking-wide">No reviews yet</p>
              <p className="text-white/30 text-sm font-roboto-serif">Be the first to share your thoughts.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwner={review.user_id === currentUserId}
                  mediaId={mediaId}
                  mediaType={mediaType}
                  currentUserId={currentUserId}
                  expanded={showAll}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
              {hasMore && (
                <a
                  href={reviewsPagePath}
                  className="mt-2 w-full block text-center py-2.5 border border-white/15 rounded-lg text-white/50 hover:text-white hover:border-white/30 text-sm font-roboto-slab uppercase tracking-wide transition-colors"
                >
                  See All Reviews
                </a>
              )}
            </div>
          )}

          {/* Pagination — only on full page with multiple pages */}
          {showAll && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/30 text-sm font-roboto-slab transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FaChevronLeft size={11} /> Prev
              </button>
              <span className="text-white/40 text-sm font-roboto-serif tabular-nums">
                Page <span className="text-white font-semibold">{currentPage}</span> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/30 text-sm font-roboto-slab transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <FaChevronRight size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
