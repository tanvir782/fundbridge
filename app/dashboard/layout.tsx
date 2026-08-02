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
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
            <p className="text-xs font-mono uppercase tracking-wide text-slate">
              {profile?.role ?? "—"}
            </p>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6 md:p-10 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
