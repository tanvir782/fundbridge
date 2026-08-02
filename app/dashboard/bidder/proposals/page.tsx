import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";

const BID_STATUS_STYLES: Record<string, string> = {
  pending: "bg-paper-dim text-slate",
  accepted: "bg-teal/10 text-teal",
  rejected: "bg-coral/10 text-coral",
};

export default async function BidderProposalsPage() {
  const profile = await requireRole("bidder");
  const supabase = await createClient();

  const { data: bids } = await supabase
    .from("bids")
    .select("id, amount, status, created_at, projects(id, title, startups(name))")
    .eq("bidder_id", profile?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href="/dashboard/bidder" className="text-sm text-teal underline underline-offset-2">
        ← Back to open projects
      </Link>
      <h1 className="font-display text-3xl mt-3 mb-6">Your proposals</h1>

      <div className="space-y-3">
        {bids?.length ? (
          bids.map((bid) => {
            const project = bid.projects as unknown as
              | { id: string; title: string; startups: { name: string } | null }
              | null;
            return (
              <Link
                key={bid.id}
                href={`/dashboard/bidder/projects/${project?.id}`}
                className="block rounded-lg border border-paper-dim p-4 bg-white hover:border-slate/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg">{project?.title}</p>
                  <span
                    className={`text-xs font-mono uppercase tracking-wide px-2 py-1 rounded ${BID_STATUS_STYLES[bid.status]}`}
                  >
                    {bid.status}
                  </span>
                </div>
                <p className="text-sm text-slate mt-1">
                  {project?.startups?.name} · ${Number(bid.amount).toLocaleString()}
                </p>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-slate">You haven&apos;t submitted a bid yet.</p>
        )}
      </div>
    </div>
  );
}
