import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { createClient } from "@/lib/supabase/server";
import StartupForm from "@/components/StartupForm";

export default async function FounderStartupPage() {
  const profile = await requireRole("founder");
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startups")
    .select("id, name, tagline, description, stage, funding_goal, verified")
    .eq("founder_id", profile?.id ?? "")
    .maybeSingle();

  return (
    <div>
      <Link href="/dashboard/founder" className="text-sm text-teal underline underline-offset-2">
        ← Back to dashboard
      </Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <h1 className="font-display text-3xl">
          {startup ? "Edit startup profile" : "Create your startup profile"}
        </h1>
        {startup && (
          <span
            className={`text-xs font-mono uppercase tracking-wide px-2 py-1 rounded ${
              startup.verified ? "bg-teal/10 text-teal" : "bg-paper-dim text-slate"
            }`}
          >
            {startup.verified ? "Verified" : "Pending verification"}
          </span>
        )}
      </div>

      <StartupForm startup={startup ?? undefined} />
    </div>
  );
}
