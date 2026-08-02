import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";
import BidForm from "@/components/BidForm";

const BID_STATUS_STYLES: Record<string, string> = {
  pending: "bg-paper-dim text-slate",
  accepted: "bg-teal/10 text-teal",
  rejected: "bg-coral/10 text-coral",
};

export default async function BidderProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("bidder");
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, description, budget, status, startups(name)")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const { data: myBid } = await supabase
    .from("bids")
    .select("id, amount, proposal, status")
    .eq("project_id", id)
    .eq("bidder_id", profile?.id ?? "")
    .maybeSingle();

  return (
    <div>
      <Link href="/dashboard/bidder" className="text-sm text-teal underline underline-offset-2">
        ← Back to open projects
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="font-display text-3xl">{project.title}</h1>
        <p className="text-slate text-sm mt-1">
          {(project.startups as unknown as { name: string } | null)?.name} · $
          {project.budget.toLocaleString()} budget · status: {project.status.replace("_", " ")}
        </p>
        <p className="mt-3 text-sm max-w-2xl">{project.description}</p>
      </div>

      {myBid ? (
        <div className="max-w-lg rounded-lg border border-paper-dim p-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display text-lg">Your bid</p>
            <span
              className={`text-xs font-mono uppercase tracking-wide px-2 py-1 rounded ${BID_STATUS_STYLES[myBid.status]}`}
            >
              {myBid.status}
            </span>
          </div>
          <p className="text-sm font-mono">${Number(myBid.amount).toLocaleString()}</p>
          <p className="text-sm mt-2">{myBid.proposal}</p>
        </div>
      ) : project.status === "open" ? (
        <BidForm projectId={project.id} />
      ) : (
        <p className="text-sm text-slate">This project is no longer accepting bids.</p>
      )}
    </div>
  );
}
