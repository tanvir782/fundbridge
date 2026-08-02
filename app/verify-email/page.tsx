import Link from "next/link";
import BridgeProgress from "@/components/BridgeProgress";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <BridgeProgress step={2} />
        </div>
        <h1 className="font-display text-2xl mb-2">Check your inbox</h1>
        <p className="text-slate text-sm">
          We sent a confirmation link to the email you signed up with.
          Click it to verify your account, then come back and log in —
          the last span of the bridge is your dashboard.
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 rounded-md bg-ink text-paper px-5 py-2.5 font-medium hover:bg-ink-soft transition-colors"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
