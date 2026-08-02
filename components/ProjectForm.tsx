"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProjectForm({ startupId }: { startupId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: dbError } = await supabase.from("projects").insert({
      startup_id: startupId,
      title,
      description,
      budget: Number(budget),
    });

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setTitle("");
    setDescription("");
    setBudget("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink-soft transition-colors"
      >
        Post a project
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg rounded-lg border border-paper-dim p-5 bg-white">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink mb-1">
          Project title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 focus:border-teal outline-none"
          placeholder="Build a landing page"
        />
      </div>

      <div>
        <label htmlFor="pdescription" className="block text-sm font-medium text-ink mb-1">
          What needs doing
        </label>
        <textarea
          id="pdescription"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 focus:border-teal outline-none"
          placeholder="Scope, deliverables, timeline expectations."
        />
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-ink mb-1">
          Budget ($)
        </label>
        <input
          id="budget"
          type="number"
          min="1"
          required
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full rounded-md border border-paper-dim px-3 py-2 focus:border-teal outline-none"
          placeholder="2000"
        />
      </div>

      {error && <p className="text-sm text-coral bg-coral/10 rounded-md px-3 py-2">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {loading ? "Posting…" : "Post project"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-paper-dim px-4 py-2 text-sm hover:border-slate/50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
