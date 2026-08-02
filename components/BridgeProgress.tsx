type BridgeProgressProps = {
  step: 1 | 2 | 3;
};

const STEPS = ["Create account", "Verify email", "Start building"];

// Signature element: the account-creation flow is rendered as a literal
// bridge under construction — each completed step fills in one span of
// the deck and lights up its support truss. Ties the UI motif directly
// to the product name instead of a generic progress bar.
export default function BridgeProgress({ step }: BridgeProgressProps) {
  const spanWidth = 100;
  const gap = 12;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 340 90"
        className="w-full h-auto"
        role="img"
        aria-label={`Step ${step} of 3: ${STEPS[step - 1]}`}
      >
        {/* water line */}
        <line x1="0" y1="70" x2="340" y2="70" stroke="var(--color-paper-dim)" strokeWidth="2" />

        {[0, 1, 2].map((i) => {
          const x = i * (spanWidth + gap) + 10;
          const complete = step > i;
          const active = step === i + 1;
          const color = complete || active ? "var(--color-amber)" : "var(--color-paper-dim)";
          return (
            <g key={i}>
              {/* pier */}
              <rect x={x + spanWidth / 2 - 3} y="58" width="6" height="14" fill={color} />
              {/* deck span */}
              <rect
                x={x}
                y="52"
                width={spanWidth}
                height="6"
                rx="2"
                fill={complete ? "var(--color-teal)" : color}
              />
              {/* truss */}
              <path
                d={`M ${x} 52 L ${x + spanWidth / 2} 28 L ${x + spanWidth} 52`}
                fill="none"
                stroke={complete ? "var(--color-teal)" : color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <line
                x1={x + spanWidth / 2}
                y1="28"
                x2={x + spanWidth / 2}
                y2="52"
                stroke={complete ? "var(--color-teal)" : color}
                strokeWidth="3"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 grid grid-cols-3 text-center">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`text-xs font-mono uppercase tracking-wide ${
              step === i + 1 ? "text-ink font-medium" : "text-slate"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
