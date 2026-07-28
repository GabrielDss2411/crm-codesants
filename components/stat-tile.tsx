import type { ReactNode } from "react";

/**
 * Número-herói. Quando o dado é um valor único, um bloco de destaque comunica
 * melhor do que um gráfico de uma barra só.
 */
export function StatTile({
  label,
  value,
  suffix,
  hint,
  delta,
  icon,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  /** Variação percentual contra o período anterior. */
  delta?: number | null;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-white/[.07] bg-surface/80 px-5 py-[18px]">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          {label}
        </span>
        {icon && <span className="text-faint">{icon}</span>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-ink-bright tabular-nums">
          {value}
        </span>
        {suffix && <span className="text-[15px] text-muted-2">{suffix}</span>}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {delta != null && <Delta value={delta} />}
        {hint && <span className="text-[12px] text-faint">{hint}</span>}
      </div>
    </div>
  );
}

function Delta({ value }: { value: number }) {
  const subiu = value > 0;
  const parado = value === 0;
  const cor = parado ? "text-muted-2" : subiu ? "text-good" : "text-serious";
  // Seta + sinal: a direção nunca depende só da cor.
  const seta = parado ? "→" : subiu ? "↑" : "↓";
  return (
    <span className={`font-mono text-[12px] tabular-nums ${cor}`}>
      {seta} {subiu ? "+" : ""}
      {value}%
    </span>
  );
}
