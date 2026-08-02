import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-paper flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="font-display text-xl italic">FundBridge</span>
        <nav className="flex gap-3 text-sm font-mono">
          <Link
            href="/login"
            className="px-4 py-2 rounded-md hover:bg-paper/10 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-md bg-amber text-ink font-medium hover:bg-amber-soft transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="flex-1 grid md:grid-cols-2 gap-10 items-center px-6 md:px-12 py-16 max-w-6xl mx-auto w-full">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-amber-soft mb-4">
            Startups · Investors · Bidders
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            One deck of cards.
            <br />
            <span className="italic text-amber-soft">Three hands to play.</span>
          </h1>
          <p className="mt-5 text-paper/70 max-w-md">
            Founders post the idea and the work. Investors back what they
            believe in. Freelancers bid on what needs building. FundBridge is
            the table where all three sit down together.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/register"
              className="px-5 py-3 rounded-md bg-amber text-ink font-medium hover:bg-amber-soft transition-colors"
            >
              Create your account
            </Link>
            <Link
              href="/login"
              className="px-5 py-3 rounded-md border border-paper/30 hover:border-paper/60 transition-colors"
            >
              I already have one
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            {
              role: "Founder",
              detail: "Publish a campaign, post a project, pick a winning bid.",
            },
            {
              role: "Investor",
              detail: "Browse startups, read the plan, commit virtual funds.",
            },
            {
              role: "Bidder",
              detail: "Browse open projects, submit a proposal, track its status.",
            },
          ].map((card) => (
            <div
              key={card.role}
              className="rounded-lg border border-paper/15 bg-paper/5 p-5"
            >
              <p className="font-display italic text-lg text-amber-soft">{card.role}</p>
              <p className="text-sm text-paper/70 mt-1">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
