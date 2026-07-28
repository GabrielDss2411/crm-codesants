/** Marca CodeSants reduzida ao lettering, em SVG inline (sem requisição). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-6 w-6 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 7 4 12l5 5" className="text-brand" />
        <path d="m15 7 5 5-5 5" className="text-brand-2" />
      </svg>
      <span className="font-display text-[15px] font-bold tracking-[-0.02em] text-ink-bright">
        Code<span className="gradient-text">Sants</span>
      </span>
    </span>
  );
}
