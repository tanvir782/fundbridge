"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SelectWinnerButton({
  projectId,
  bidId,
  otherBidIds,
}: {
  projectId: string;
  bidId: string;
  otherBidIds: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect() {
    setLoading(true);
    setError(null);

    const { error: acceptError } = await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bidId);

    if (acceptError) {
      setLoading(false);
      setError(acceptError.message);
      return;
    }

    if (otherBidIds.length > 0) {
      await supabase.from("bids").update({ status: "rejected" }).in("id", otherBidIds);
    }

    const { error: projectError } = await supabase
      .from("projects")
      .update({ status: "in_progress", winning_bid_id: bidId })
      .eq("id", projectId);

    setLoading(false);

    if (projectError) {
      setError(projectError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleSelect}
        disabled={loading}
        className="rounded-md bg-teal text-paper px-4 py-2 text-sm font-medium hover:bg-teal-soft transition-colors disabled:opacity-50"
      >
        {loading ? "Selecting…" : "Select as winner"}
      </button>
      {error && <p className="text-sm text-coral mt-2">{error}</p>}
    </div>
  );
}
