"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Startup = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stage: "idea" | "mvp" | "early_revenue" | "growth";
  funding_goal: number;
};

const STAGES: { value: Startup["stage"]; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "mvp", label: "MVP" },
  { value: "early_revenue", label: "Early revenue" },
  { value: "growth", label: "Growth" },
];

export default function StartupForm({ startup }: { startup?: Startup }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(startup?.name ?? "");
  const [tagline, setTagline] = useState(startup?.tagline ?? "");
  const [description, setDescription] = useState(startup?.description ?? "");
  const [stage, setStage] = useState<Startup["stage"]>(startup?.stage ?? "idea");
  const [fundingGoal, setFundingGoal] = useState(
    startup ? String(startup.funding_goal) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in.");
      setLoading(false);
      return;
    }

    const payload = {
      name,
      tagline,
      description,
      stage,
      funding_goal: Number(fundingGoal),
    };

    const { error: dbError } = startup
      ? await supabase.from("startups").update(payload).eq("id", startup.id)
      : await supabase.from("startups").insert({ ...payload, founder_id: user.id });

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">
          Startup name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          placeholder="Acme Robotics"
        />
      </div>

      <div>
        <label htmlFor="tagline" className="block text-sm font-medium text-ink mb-1">
          One-line tagline
        </label>
        <input
          id="tagline"
          required
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          placeholder="Warehouse robots that pick faster than people"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink mb-1">
          Business description
        </label>
        <textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          placeholder="What you're building, who it's for, and why now."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-ink mb-1">
            Stage
          </label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as Startup["stage"])}
            className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fundingGoal" className="block text-sm font-medium text-ink mb-1">
            Funding goal ($)
          </label>
          <input
            id="fundingGoal"
            type="number"
            min="1"
            step="1"
            required
            value={fundingGoal}
            onChange={(e) => setFundingGoal(e.target.value)}
            className="w-full rounded-md border border-paper-dim px-3 py-2 bg-white focus:border-teal outline-none"
            placeholder="50000"
          />
        </div>
      </div>

      {error && <p className="text-sm text-coral bg-coral/10 rounded-md px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink text-paper px-5 py-2.5 font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {loading ? "Saving…" : startup ? "Save changes" : "Create startup profile"}
      </button>
    </form>
  );
}
