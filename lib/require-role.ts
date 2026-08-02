import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Call at the top of a role-specific dashboard page to bounce anyone
// whose profile role doesn't match back to their own dashboard.
export async function requireRole(role: "founder" | "investor" | "bidder" | "admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== role) {
    redirect("/dashboard");
  }

  return profile;
}
