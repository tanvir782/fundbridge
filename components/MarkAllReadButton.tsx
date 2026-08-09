"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MarkAllReadButton({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-teal underline underline-offset-2 disabled:opacity-50"
    >
      {loading ? "Marking…" : "Mark all as read"}
    </button>
  );
}
