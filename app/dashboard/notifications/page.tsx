import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarkAllReadButton from "@/components/MarkAllReadButton";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, message, link, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Notifications</h1>
        <MarkAllReadButton userId={user.id} />
      </div>

      <div className="space-y-2">
        {notifications?.length ? (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "/dashboard"}
              className={`block rounded-lg border p-4 transition-colors ${
                n.read
                  ? "border-paper-dim bg-white"
                  : "border-teal/40 bg-teal/5"
              }`}
            >
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-slate mt-1 font-mono">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate">Nothing yet — you&apos;ll see activity here as it happens.</p>
        )}
      </div>
    </div>
  );
}
