import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";
import VerifyToggle from "@/components/VerifyToggle";

const ROLE_STYLES: Record<string, string> = {
  founder: "bg-amber/10 text-amber",
  investor: "bg-teal/10 text-teal",
  bidder: "bg-coral/10 text-coral",
  admin: "bg-ink/10 text-ink",
};

export default async function AdminDashboard() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: users }, { data: startups }, { count: projectCount }, { count: bidCount }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }),
      supabase
        .from("startups")
        .select("id, name, verified, funding_goal, profiles(full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("bids").select("id", { count: "exact", head: true }),
    ]);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-ink mb-2">
        Admin dashboard
      </p>
      <h1 className="font-display text-3xl mb-6">Platform overview</h1>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Users", value: users?.length ?? 0 },
          { label: "Startups", value: startups?.length ?? 0 },
          { label: "Projects", value: projectCount ?? 0 },
          { label: "Bids", value: bidCount ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-paper-dim p-4 bg-white">
            <p className="text-xs font-mono uppercase tracking-wide text-slate">{stat.label}</p>
            <p className="font-display text-2xl mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl mb-3">Startup verification</h2>
      <div className="space-y-3 mb-10">
        {startups?.length ? (
          startups.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-paper-dim p-4 bg-white"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-slate">
                  {(s.profiles as unknown as { full_name: string } | null)?.full_name} · $
                  {s.funding_goal.toLocaleString()} goal
                </p>
              </div>
              <VerifyToggle startupId={s.id} verified={s.verified} />
            </div>
          ))
        ) : (
          <p className="text-sm text-slate">No startups posted yet.</p>
        )}
      </div>

      <h2 className="font-display text-xl mb-3">Users</h2>
      <div className="rounded-lg border border-paper-dim bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-paper-dim text-left text-xs font-mono uppercase tracking-wide text-slate">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-paper-dim last:border-0">
                <td className="px-4 py-2">{u.full_name || "—"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs font-mono uppercase tracking-wide px-2 py-1 rounded ${ROLE_STYLES[u.role]}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-slate">
        To promote a user to admin, change their <code className="font-mono text-xs bg-paper-dim px-1 py-0.5 rounded">role</code>{" "}
        in the Supabase Table Editor.
      </p>
    </div>
  );
}
