"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BidForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] = useState("");
  const [proposal, setProposal] = useState("");
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

    const { error: dbError } = await supabase.from("bids").insert({
      project_id: projectId,
      bidder_id: user.id,
      amount: Number(amount),
      proposal,
    });

    setLoading(false);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "You've already submitted a bid on this project."
          : dbError.message
      );
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label htmlFor="bidAmount" className="block text-sm font-medium text-ink mb-1">
          Your bid ($)
        </label>
        <input
          id="bidAmount"
          type="number"
          min="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          placeholder="1800"
        />
      </div>

      <div>
        <label htmlFor="proposal" className="block text-sm font-medium text-ink mb-1">
          Proposal
        </label>
        <textarea
          id="proposal"
          required
          rows={4}
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          placeholder="Why you're a good fit, your approach, and timeline."
        />
      </div>

      {error && <p className="text-sm text-coral bg-coral/10 rounded-md px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink text-paper px-5 py-2.5 font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit bid"}
      </button>
    </form>
  );
}
