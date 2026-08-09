"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({ startupId }: { startupId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("reviews").insert({
      startup_id: startupId,
      investor_id: user.id,
      rating,
      comment,
    });

    setLoading(false);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "You've already reviewed this startup."
          : dbError.message
      );
      return;
    }

    setComment("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={`text-2xl leading-none ${n <= rating ? "text-amber" : "text-paper-dim"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-ink mb-1">
          Comment
        </label>
        <textarea
          id="comment"
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          placeholder="What's your take on this startup?"
        />
      </div>

      {error && <p className="text-sm text-coral bg-coral/10 rounded-md px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {loading ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
