import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function InvestorInvestmentsPage() {
  const profile = await requireRole("investor");
  const supabase = await createClient();

  const { data: investments } = await supabase
    .from("investments")
    .select("id, amount, created_at, startups(id, name, tagline)")
    .eq("investor_id", profile?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href="/dashboard/investor" className="text-sm text-teal underline underline-offset-2">
        ← Back to browse
      </Link>
      <h1 className="font-display text-3xl mt-3 mb-6">Your investments</h1>

      <div className="space-y-3">
        {investments?.length ? (
          investments.map((inv) => {
            const startup = inv.startups as unknown as { id: string; name: string; tagline: string } | null;
            return (
              <Link
                key={inv.id}
                href={`/dashboard/investor/startups/${startup?.id}`}
                className="block rounded-lg border border-paper-dim p-4 bg-white hover:border-slate/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg">{startup?.name}</p>
                  <p className="font-mono text-sm">${Number(inv.amount).toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate mt-1">{startup?.tagline}</p>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-slate">You haven&apos;t invested in anything yet.</p>
        )}
      </div>
    </div>
  );
}
