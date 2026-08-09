"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
  userId,
  initialName,
}: {
  userId: string;
  initialName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error: dbError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1">
          Full name
        </label>
        <input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
        />
      </div>

      {error && <p className="text-sm text-coral bg-coral/10 rounded-md px-3 py-2">{error}</p>}
      {success && <p className="text-sm text-teal bg-teal/10 rounded-md px-3 py-2">Saved.</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink text-paper px-5 py-2.5 font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
