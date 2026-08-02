import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Pure router: sends each user to the dashboard for their role. No UI of
// its own, so it never flashes the wrong shell before redirecting.
export default async function DashboardRouterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  switch (profile?.role) {
    case "founder":
      redirect("/dashboard/founder");
    case "investor":
      redirect("/dashboard/investor");
    case "bidder":
      redirect("/dashboard/bidder");
    case "admin":
      redirect("/dashboard/admin");
    default:
      redirect("/dashboard/founder");
  }
}
