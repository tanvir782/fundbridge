"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerifyToggle({
  startupId,
  verified,
}: {
  startupId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await supabase.from("startups").update({ verified: !verified }).eq("id", startupId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-mono uppercase tracking-wide px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50 ${
        verified
          ? "border-teal text-teal hover:bg-teal/10"
          : "border-slate/40 text-slate hover:border-slate/70"
      }`}
    >
      {loading ? "…" : verified ? "Verified — unverify" : "Verify"}
    </button>
  );
}
