import { requireRole } from "@/lib/require-role";

export default async function AdminDashboard() {
  await requireRole("admin");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-ink mb-2">
        Admin dashboard
      </p>
      <h1 className="font-display text-3xl mb-6">Platform overview</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { title: "Users", detail: "User management plugs in here." },
          { title: "Startup verification", detail: "Pending verifications plug in here." },
          { title: "Reports & analytics", detail: "Platform stats plug in here." },
        ].map((card) => (
          <div key={card.title} className="rounded-lg border border-paper-dim p-5 bg-white">
            <p className="font-display text-lg">{card.title}</p>
            <p className="text-sm text-slate mt-1">{card.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate">
        No account signs up as admin — promote a user by editing their{" "}
        <code className="font-mono text-xs bg-paper-dim px-1 py-0.5 rounded">role</code>{" "}
        in the Supabase Table Editor.
      </p>
    </div>
  );
}
