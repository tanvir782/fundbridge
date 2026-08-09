import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";

const ROLE_LABELS: Record<string, string> = {
  founder: "Founder",
  investor: "Investor",
  bidder: "Bidder",
  admin: "Admin",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, virtual_balance, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Your profile</h1>
      <p className="text-sm text-slate mb-6">
        {user.email} · {ROLE_LABELS[profile?.role ?? ""]} · joined{" "}
        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
      </p>

      <ProfileForm userId={user.id} initialName={profile?.full_name ?? ""} />

      {profile?.role === "investor" && (
        <p className="mt-6 text-sm text-slate">
          Virtual balance: ${Number(profile.virtual_balance).toLocaleString()}
        </p>
      )}
    </div>
  );
}
