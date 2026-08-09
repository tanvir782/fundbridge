import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";
import InvestForm from "@/components/InvestForm";
import ReviewForm from "@/components/ReviewForm";

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
    .select("amount, investor_id")
    .eq("startup_id", id);

  const raised = (investments ?? []).reduce((sum, i) => sum + Number(i.amount), 0);
  const progress = Math.min(100, Math.round((raised / startup.funding_goal) * 100));

  const hasInvested = (investments ?? []).some((i) => i.investor_id === profile?.id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, investor_id, profiles(full_name)")
    .eq("startup_id", id)
    .order("created_at", { ascending: false });

  const hasReviewed = (reviews ?? []).some((r) => r.investor_id === profile?.id);
  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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
        {avgRating && <> · ★ {avgRating} ({reviews!.length} review{reviews!.length === 1 ? "" : "s"})</>}
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

      <div className="mt-10">
        <h2 className="font-display text-xl mb-3">Reviews</h2>

        <div className="space-y-3 mb-6">
          {reviews?.length ? (
            reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-paper-dim p-4 bg-white max-w-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {(r.profiles as unknown as { full_name: string } | null)?.full_name ?? "Investor"}
                  </p>
                  <span className="text-amber text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p className="text-sm mt-1">{r.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate">No reviews yet.</p>
          )}
        </div>

        {hasInvested && !hasReviewed && <ReviewForm startupId={startup.id} />}
        {hasInvested && hasReviewed && (
          <p className="text-sm text-slate">You&apos;ve already reviewed this startup.</p>
        )}
        {!hasInvested && (
          <p className="text-sm text-slate">Invest in this startup to leave a review.</p>
        )}
      </div>
    </div>
  );
}
