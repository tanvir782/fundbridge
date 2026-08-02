import { requireRole } from "@/lib/require-role";

export default async function InvestorDashboard() {
  const profile = await requireRole("investor");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-teal mb-2">
        Investor dashboard
      </p>
      <h1 className="font-display text-3xl mb-6">
        Welcome, {profile?.full_name?.split(" ")[0] || "there"}.
      </h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { title: "Browse startups", detail: "No campaigns live yet." },
          { title: "Your investments", detail: "You haven't invested yet." },
          { title: "Virtual balance", detail: "Not set up yet." },
        ].map((card) => (
          <div key={card.title} className="rounded-lg border border-paper-dim p-5 bg-white">
            <p className="font-display text-lg">{card.title}</p>
            <p className="text-sm text-slate mt-1">{card.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate">
        This is the auth + role scaffold. Startup browsing and the virtual
        investment flow plug in here next.
      </p>
    </div>
  );
}
