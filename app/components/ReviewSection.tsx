"use client";

import { useState, useTransition } from "react";
import { submitReview, deleteReview } from "@/app/actions/reviews";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: Date | string;
};

type Props = {
  mediaId: number;
  mediaType: "movie" | "show";
  initialReviews: Review[];
  userReview: Review | null;
  isLoggedIn: boolean;
};

export default function ReviewSection({
  mediaId,
  mediaType,
  initialReviews,
  userReview,
  isLoggedIn,
}: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(userReview?.rating ?? 0);
  const [body, setBody] = useState(userReview?.body ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    setError("");

    startTransition(async () => {
      const result = await submitReview(mediaId, mediaType, rating, body);
      if (result?.error) {
        setError(result.error);
        return;
      }
      // Optimistically update the reviews list
      const updatedReview: Review = {
        id: userReview?.id ?? crypto.randomUUID(),
        user_id: "me",
        rating,
        body,
        created_at: new Date(),
      };
      setReviews((prev) => {
        const without = prev.filter((r) => r.id !== userReview?.id);
        return [updatedReview, ...without];
      });
    });
  };

  const handleDelete = () => {
    if (!userReview) return;
    startTransition(async () => {
      await deleteReview(userReview.id, mediaId, mediaType);
      setReviews((prev) => prev.filter((r) => r.id !== userReview.id));
      setRating(0);
      setBody("");
    });
  };

  return (
    <div className="mt-10">
      <h2 className="text-white font-roboto-slab text-xl md:text-2xl uppercase [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
        Reviews
      </h2>
      <hr className="border-white/30 my-1 mb-6" />

      {/* Review form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 max-w-xl">
          <p className="text-white/70 font-roboto-slab text-sm">
            {userReview ? "Update your review" : "Write a review"}
          </p>

          {/* Star rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`w-8 h-8 rounded font-roboto-slab text-sm font-bold transition-colors ${
                  n <= rating
                    ? "bg-[#4ade80] text-black"
                    : "bg-white/10 text-white/50 hover:bg-white/20"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Share your thoughts... (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/50 font-roboto-serif text-sm resize-none"
          />

          {error && <p className="text-red-400 text-sm font-roboto-slab">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold font-roboto-slab text-sm rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : userReview ? "Update Review" : "Submit Review"}
            </button>
            {userReview && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-5 py-2 border border-red-400/50 text-red-400 hover:bg-red-500/20 font-roboto-slab text-sm rounded-md transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <a
          href="/auth/login"
          className="inline-block mb-8 px-5 py-2 border border-white/40 text-white/70 font-roboto-slab text-sm rounded-md hover:border-white/70 hover:text-white transition-colors"
        >
          Sign in to write a review
        </a>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-white/40 font-roboto-serif text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#4ade80] text-black font-bold font-roboto-slab text-sm px-2 py-0.5 rounded">
                  {review.rating}/10
                </span>
                <span className="text-white/40 font-roboto-slab text-xs">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.body && (
                <p className="text-white/80 font-roboto-serif text-sm leading-relaxed">
                  {review.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
