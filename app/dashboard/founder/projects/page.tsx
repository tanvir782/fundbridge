import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "@/components/ProjectForm";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber/10 text-amber",
  in_progress: "bg-teal/10 text-teal",
  completed: "bg-paper-dim text-slate",
};

export default async function FounderProjectsPage() {
  const profile = await requireRole("founder");
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startups")
    .select("id, name")
    .eq("founder_id", profile?.id ?? "")
    .maybeSingle();

  if (!startup) {
    return (
      <div>
        <Link href="/dashboard/founder" className="text-sm text-teal underline underline-offset-2">
          ← Back to dashboard
        </Link>
        <h1 className="font-display text-3xl mt-3 mb-3">Post a project</h1>
        <p className="text-slate text-sm max-w-md">
          Create your startup profile first — projects are posted under your
          startup so bidders know who they&apos;d be working with.
        </p>
        <Link
          href="/dashboard/founder/startup"
          className="inline-block mt-4 rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink-soft transition-colors"
        >
          Create startup profile
        </Link>
      </div>
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, budget, status, created_at, bids(count)")
    .eq("startup_id", startup.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href="/dashboard/founder" className="text-sm text-teal underline underline-offset-2">
        ← Back to dashboard
      </Link>
      <h1 className="font-display text-3xl mt-3 mb-6">Projects for {startup.name}</h1>

      <div className="mb-8">
        <ProjectForm startupId={startup.id} />
      </div>

      <div className="space-y-3">
        {projects?.length ? (
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/founder/projects/${p.id}`}
              className="block rounded-lg border border-paper-dim p-4 bg-white hover:border-slate/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg">{p.title}</p>
                <span
                  className={`text-xs font-mono uppercase tracking-wide px-2 py-1 rounded ${STATUS_STYLES[p.status]}`}
                >
                  {p.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-slate mt-1">
                ${p.budget.toLocaleString()} budget · {(p.bids as unknown as { count: number }[])[0]?.count ?? 0} bid(s)
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate">No projects posted yet.</p>
        )}
      </div>
    </div>
  );
}
