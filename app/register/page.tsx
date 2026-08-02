"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import RoleCard from "@/components/RoleCard";
import BridgeProgress from "@/components/BridgeProgress";

type Role = "founder" | "investor" | "bidder";

const ROLES: { value: Role; label: string; blurb: string }[] = [
  { value: "founder", label: "Founder", blurb: "I'm raising funding or posting project work." },
  { value: "investor", label: "Investor", blurb: "I'm browsing startups to back." },
  { value: "bidder", label: "Bidder", blurb: "I'm looking for projects to bid on." },
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Choose a role to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard`
            : undefined,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/verify-email");
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-ink text-paper p-12">
        <Link href="/" className="font-display text-xl italic">
          FundBridge
        </Link>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-amber-soft mb-4">
            Step 1 of 3
          </p>
          <h2 className="font-display text-3xl leading-snug">
            Every account
            <br />
            starts as a choice.
          </h2>
          <p className="mt-4 text-paper/60 max-w-sm text-sm">
            Founder, investor, or bidder — pick the seat you&apos;re taking at the
            table. You can&apos;t change it later without an admin&apos;s help, so
            choose the one that matches what you&apos;re here to do.
          </p>
        </div>
        <p className="text-xs text-paper/40">© FundBridge, a capstone project.</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <BridgeProgress step={1} />
          </div>

          <h1 className="font-display text-2xl mb-1">Create your account</h1>
          <p className="text-sm text-slate mb-6">
            Already have one?{" "}
            <Link href="/login" className="text-teal underline underline-offset-2">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
                placeholder="Ayesha Rahman"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-ink mb-2">I&apos;m joining as a…</span>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <RoleCard
                    key={r.value}
                    value={r.value}
                    label={r.label}
                    blurb={r.blurb}
                    selected={role === r.value}
                    onSelect={setRole}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-coral bg-coral/10 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-ink text-paper py-2.5 font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
