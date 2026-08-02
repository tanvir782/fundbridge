"use client";

type RoleCardProps = {
  value: "founder" | "investor" | "bidder";
  label: string;
  blurb: string;
  selected: boolean;
  onSelect: (value: "founder" | "investor" | "bidder") => void;
};

// A single tappable role option, styled like a physical badge rather than
// a <select> — role choice is a one-time, meaningful decision so it gets
// real visual weight instead of hiding in a dropdown.
export default function RoleCard({ value, label, blurb, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`text-left w-full rounded-lg border-2 p-4 transition-colors cursor-pointer ${
        selected
          ? "border-teal bg-teal/5"
          : "border-paper-dim hover:border-slate/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-ink">{label}</span>
        <span
          className={`h-4 w-4 rounded-full border-2 ${
            selected ? "border-teal bg-teal" : "border-slate/40"
          }`}
        />
      </div>
      <p className="mt-1 text-sm text-slate">{blurb}</p>
    </button>
  );
}
