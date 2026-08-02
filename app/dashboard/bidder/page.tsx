import { requireRole } from "@/lib/require-role";

export default async function BidderDashboard() {
  const profile = await requireRole("bidder");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-coral mb-2">
        Bidder dashboard
      </p>
      <h1 className="font-display text-3xl mb-6">
        Welcome, {profile?.full_name?.split(" ")[0] || "there"}.
      </h1>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { title: "Open projects", detail: "No projects posted yet." },
          { title: "Your proposals", detail: "You haven't submitted a bid yet." },
        ].map((card) => (
          <div key={card.title} className="rounded-lg border border-paper-dim p-5 bg-white">
            <p className="font-display text-lg">{card.title}</p>
            <p className="text-sm text-slate mt-1">{card.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate">
        This is the auth + role scaffold. Project browsing and bid
        submission plug in here next.
      </p>
    </div>
  );
}
