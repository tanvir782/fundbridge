import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-paper-dim">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-display text-lg italic">
            FundBridge
          </Link>
          <Link
            href="/"
            className="text-sm text-slate hover:text-ink transition-colors hidden sm:inline"
          >
            About FundBridge
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/notifications" className="relative text-slate hover:text-ink transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {!!unreadCount && (
              <span className="absolute -top-1.5 -right-1.5 bg-coral text-white text-[10px] font-mono rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/profile" className="text-right leading-tight hover:opacity-70 transition-opacity">
            <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
            <p className="text-xs font-mono uppercase tracking-wide text-slate">
              {profile?.role ?? "—"}
            </p>
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6 md:p-10 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
