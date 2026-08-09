"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clicking the emailed reset link signs the user into a short-lived
    // "recovery" session. We just need to confirm one exists before
    // showing the form.
    supabase.auth.getUser().then(({ data: { user } }) => {
      setReady(!!user);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl mb-2">Link expired or invalid</h1>
          <p className="text-sm text-slate">
            Reset links only work once and expire after a while. Request a
            new one from the{" "}
            <a href="/forgot-password" className="text-teal underline underline-offset-2">
              forgot password
            </a>{" "}
            page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">Set a new password</h1>
        <p className="text-sm text-slate mb-6">You&apos;re verified — choose a new password.</p>

        {success ? (
          <p className="text-sm text-teal bg-teal/10 rounded-md px-3 py-2">
            Password updated. Taking you to your dashboard…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                New password
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

            {error && (
              <p className="text-sm text-coral bg-coral/10 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-ink text-paper py-2.5 font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
