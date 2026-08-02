import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";
import SelectWinnerButton from "@/components/SelectWinnerButton";

const BID_STATUS_STYLES: Record<string, string> = {
  pending: "bg-paper-dim text-slate",
  accepted: "bg-teal/10 text-teal",
  rejected: "bg-coral/10 text-coral",
};

export default async function FounderProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("founder");
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, description, budget, status, winning_bid_id, startups(name, founder_id)")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const { data: bids } = await supabase
    .from("bids")
    .select("id, amount, proposal, status, created_at, profiles(full_name)")
    .eq("project_id", id)
    .order("amount", { ascending: true });

  const pendingBidIds = (bids ?? []).filter((b) => b.id !== project.winning_bid_id).map((b) => b.id);

  return (
    <div>
      <Link
        href="/dashboard/founder/projects"
        className="text-sm text-teal underline underline-offset-2"
      >
        ← Back to projects
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="font-display text-3xl">{project.title}</h1>
        <p className="text-slate text-sm mt-1">
          ${project.budget.toLocaleString()} budget · status: {project.status.replace("_", " ")}
        </p>
        <p className="mt-3 text-sm max-w-2xl">{project.description}</p>
      </div>

      <h2 className="font-display text-xl mb-3">
        Bids ({bids?.length ?? 0})
      </h2>

      <div className="space-y-3">
        {bids?.length ? (
          bids.map((bid) => (
            <div key={bid.id} className="rounded-lg border border-paper-dim p-4 bg-white">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {(bid.profiles as unknown as { full_name: string } | null)?.full_name ?? "Bidder"}
                </p>
                <span
                  className={`text-xs font-mono uppercase tracking-wide px-2 py-1 rounded ${BID_STATUS_STYLES[bid.status]}`}
                >
                  {bid.status}
                </span>
              </div>
              <p className="text-sm text-slate mt-1">${bid.amount.toLocaleString()}</p>
              <p className="text-sm mt-2">{bid.proposal}</p>

              {project.status === "open" && (
                <div className="mt-3">
                  <SelectWinnerButton
                    projectId={project.id}
                    bidId={bid.id}
                    otherBidIds={pendingBidIds.filter((bId) => bId !== bid.id)}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate">No bids yet.</p>
        )}
      </div>
    </div>
  );
}
