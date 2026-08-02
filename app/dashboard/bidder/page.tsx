import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function BidderDashboard() {
  const profile = await requireRole("bidder");
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, budget, created_at, startups(name)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-coral mb-2">
        Bidder dashboard
      </p>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">
          Welcome, {profile?.full_name?.split(" ")[0] || "there"}.
        </h1>
        <Link
          href="/dashboard/bidder/proposals"
          className="text-sm text-teal underline underline-offset-2"
        >
          Your proposals →
        </Link>
      </div>

      <h2 className="font-display text-xl mb-4">Open projects</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {projects?.length ? (
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/bidder/projects/${p.id}`}
              className="rounded-lg border border-paper-dim p-5 bg-white hover:border-slate/40 transition-colors block"
            >
              <p className="font-display text-lg">{p.title}</p>
              <p className="text-sm text-slate mt-1">
                {(p.startups as unknown as { name: string } | null)?.name} · ${p.budget.toLocaleString()} budget
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate">No open projects right now.</p>
        )}
      </div>
    </div>
  );
}
