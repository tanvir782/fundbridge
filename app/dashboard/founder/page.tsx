import { requireRole } from "@/lib/require-role";

export default async function FounderDashboard() {
  const profile = await requireRole("founder");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-amber mb-2">
        Founder dashboard
      </p>
      <h1 className="font-display text-3xl mb-6">
        Welcome, {profile?.full_name?.split(" ")[0] || "there"}.
      </h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { title: "Startup profile", detail: "Not created yet.", cta: "Create profile" },
          { title: "Funding campaign", detail: "No active campaign.", cta: "Launch campaign" },
          { title: "Projects", detail: "No projects posted.", cta: "Post a project" },
        ].map((card) => (
          <div key={card.title} className="rounded-lg border border-paper-dim p-5 bg-white">
            <p className="font-display text-lg">{card.title}</p>
            <p className="text-sm text-slate mt-1">{card.detail}</p>
            <button
              disabled
              title="Coming in the next module"
              className="mt-4 text-sm font-mono px-3 py-1.5 rounded-md bg-paper-dim text-slate cursor-not-allowed"
            >
              {card.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate">
        This is the auth + role scaffold. The startup profile, funding
        campaign, and bidding modules plug in here next.
      </p>
    </div>
  );
}
