import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function FounderDashboard() {
  const profile = await requireRole("founder");
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startups")
    .select("id, name, funding_goal, verified")
    .eq("founder_id", profile?.id ?? "")
    .maybeSingle();

  let raised = 0;
  let projectCount = 0;

  if (startup) {
    const [{ data: investments }, { count }] = await Promise.all([
      supabase.from("investments").select("amount").eq("startup_id", startup.id),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("startup_id", startup.id),
    ]);
    raised = (investments ?? []).reduce((sum, i) => sum + Number(i.amount), 0);
    projectCount = count ?? 0;
  }

  const progress = startup ? Math.min(100, Math.round((raised / startup.funding_goal) * 100)) : 0;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-amber mb-2">
        Founder dashboard
      </p>
      <h1 className="font-display text-3xl mb-6">
        Welcome, {profile?.full_name?.split(" ")[0] || "there"}.
      </h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/founder/startup"
          className="rounded-lg border border-paper-dim p-5 bg-white hover:border-slate/40 transition-colors block"
        >
          <p className="font-display text-lg">Startup profile</p>
          {startup ? (
            <>
              <p className="text-sm text-slate mt-1">{startup.name}</p>
              <p className="text-xs font-mono uppercase tracking-wide mt-2 text-slate">
                {startup.verified ? "Verified" : "Pending verification"}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate mt-1">Not created yet — click to start.</p>
          )}
        </Link>

        <Link
          href="/dashboard/founder/projects"
          className="rounded-lg border border-paper-dim p-5 bg-white hover:border-slate/40 transition-colors block"
        >
          <p className="font-display text-lg">Projects</p>
          <p className="text-sm text-slate mt-1">
            {startup
              ? `${projectCount} project${projectCount === 1 ? "" : "s"} posted`
              : "Create a startup profile first"}
          </p>
        </Link>
      </div>

      {startup && (
        <div className="mt-4 rounded-lg border border-paper-dim p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display text-lg">Funding progress</p>
            <p className="text-sm font-mono">
              ${raised.toLocaleString()} / ${startup.funding_goal.toLocaleString()}
            </p>
          </div>
          <div className="h-2 rounded-full bg-paper-dim overflow-hidden">
            <div className="h-full bg-amber" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {!startup && (
        <p className="mt-8 text-sm text-slate">
          Start by creating your startup profile — funding campaigns and
          project posting both live under it.
        </p>
      )}
    </div>
  );
}
