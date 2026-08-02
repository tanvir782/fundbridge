import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";
import InvestForm from "@/components/InvestForm";

const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  mvp: "MVP",
  early_revenue: "Early revenue",
  growth: "Growth",
};

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("investor");
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startups")
    .select("id, name, tagline, description, stage, funding_goal, verified, profiles(full_name)")
    .eq("id", id)
    .maybeSingle();

  if (!startup) notFound();

  const { data: investments } = await supabase
    .from("investments")
    .select("amount")
    .eq("startup_id", id);

  const raised = (investments ?? []).reduce((sum, i) => sum + Number(i.amount), 0);
  const progress = Math.min(100, Math.round((raised / startup.funding_goal) * 100));

  return (
    <div>
      <Link href="/dashboard/investor" className="text-sm text-teal underline underline-offset-2">
        ← Back to startups
      </Link>

      <div className="mt-3 mb-2 flex items-center gap-3">
        <h1 className="font-display text-3xl">{startup.name}</h1>
        {startup.verified && (
          <span className="text-xs font-mono uppercase tracking-wide px-2 py-1 rounded bg-teal/10 text-teal">
            Verified
          </span>
        )}
      </div>
      <p className="text-slate">{startup.tagline}</p>
      <p className="text-xs font-mono uppercase tracking-wide text-slate mt-1">
        {STAGE_LABELS[startup.stage]} · Founded by{" "}
        {(startup.profiles as unknown as { full_name: string } | null)?.full_name ?? "a founder"}
      </p>

      <p className="mt-4 max-w-2xl text-sm">{startup.description}</p>

      <div className="mt-6 max-w-md">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Funding progress</p>
          <p className="text-sm font-mono">
            ${raised.toLocaleString()} / ${startup.funding_goal.toLocaleString()}
          </p>
        </div>
        <div className="h-2 rounded-full bg-paper-dim overflow-hidden">
          <div className="h-full bg-amber" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-8">
        <InvestForm startupId={startup.id} balance={Number(profile?.virtual_balance ?? 0)} />
      </div>
    </div>
  );
}
