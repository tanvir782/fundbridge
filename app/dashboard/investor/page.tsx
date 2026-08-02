import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function InvestorDashboard() {
  const profile = await requireRole("investor");
  const supabase = await createClient();

  const { data: startups } = await supabase
    .from("startups")
    .select("id, name, tagline, stage, funding_goal, verified")
    .order("created_at", { ascending: false });

  const { data: investments } = await supabase.from("investments").select("startup_id, amount");

  const raisedByStartup = new Map<string, number>();
  (investments ?? []).forEach((inv) => {
    raisedByStartup.set(inv.startup_id, (raisedByStartup.get(inv.startup_id) ?? 0) + Number(inv.amount));
  });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-teal mb-2">
        Investor dashboard
      </p>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">
          Welcome, {profile?.full_name?.split(" ")[0] || "there"}.
        </h1>
        <div className="text-right">
          <p className="text-xs font-mono uppercase tracking-wide text-slate">Virtual balance</p>
          <p className="font-display text-xl">${Number(profile?.virtual_balance ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">Browse startups</h2>
        <Link
          href="/dashboard/investor/investments"
          className="text-sm text-teal underline underline-offset-2"
        >
          Your investments →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {startups?.length ? (
          startups.map((s) => {
            const raised = raisedByStartup.get(s.id) ?? 0;
            const progress = Math.min(100, Math.round((raised / s.funding_goal) * 100));
            return (
              <Link
                key={s.id}
                href={`/dashboard/investor/startups/${s.id}`}
                className="rounded-lg border border-paper-dim p-5 bg-white hover:border-slate/40 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg">{s.name}</p>
                  {s.verified && (
                    <span className="text-xs font-mono uppercase tracking-wide px-2 py-1 rounded bg-teal/10 text-teal">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate mt-1">{s.tagline}</p>
                <div className="h-1.5 rounded-full bg-paper-dim overflow-hidden mt-3">
                  <div className="h-full bg-amber" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs font-mono text-slate mt-1">
                  ${raised.toLocaleString()} / ${s.funding_goal.toLocaleString()}
                </p>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-slate">No startups have been posted yet.</p>
        )}
      </div>
    </div>
  );
}
