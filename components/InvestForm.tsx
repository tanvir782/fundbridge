"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InvestForm({
  startupId,
  balance,
}: {
  startupId: string;
  balance: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error: rpcError } = await supabase.rpc("invest_in_startup", {
      p_startup_id: startupId,
      p_amount: Number(amount),
    });

    setLoading(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setAmount("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <label htmlFor="amount" className="block text-sm font-medium text-ink mb-1">
        Invest an amount
      </label>
      <div className="flex gap-2">
        <input
          id="amount"
          type="number"
          min="1"
          max={balance}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          placeholder="1000"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber text-ink px-4 py-2 font-medium hover:bg-amber-soft transition-colors disabled:opacity-50"
        >
          {loading ? "Investing…" : "Invest"}
        </button>
      </div>
      <p className="text-xs text-slate mt-1">
        Virtual balance available: ${balance.toLocaleString()}
      </p>
      {error && <p className="text-sm text-coral mt-2">{error}</p>}
      {success && <p className="text-sm text-teal mt-2">Investment recorded.</p>}
    </form>
  );
}
