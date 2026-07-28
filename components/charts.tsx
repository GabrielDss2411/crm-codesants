"use client";

import { useState } from "react";
import type { Bucket } from "@/lib/analytics";

/* ============================================================
   Gráficos do CRM.

   Regras seguidas (design system de dataviz):
   · Marcas finas, extremidades arredondadas em 4px ancoradas na linha de base.
   · Uma única escala por gráfico. Nunca dois eixos.
   · Série única → sem legenda; a identidade vem do título.
   · Rótulos e valores em tinta de texto, nunca na cor da série.
   · Grade e eixos recessivos.
   · Camada de hover em toda marca.
   · O valor de cada barra é texto visível — o gráfico se lê sem cor.
   ============================================================ */

/** Barras horizontais ordenadas — para perguntas de escolha. */
export function BarrasRanqueadas({
  dados,
  total,
  cor = "var(--color-brand)",
  /** Rampa sequencial: usa a ordem original como intensidade (dados ordinais). */
  sequencial = false,
  /** Rótulos fora da escala ordinal (ex.: "Prefiro não informar"): cor neutra. */
  neutros = [],
  vazio = "Nenhuma resposta ainda.",
}: {
  dados: Bucket[];
  /** Base do percentual: nº de diagnósticos, não a soma das marcações. */
  total: number;
  cor?: string;
  sequencial?: boolean;
  neutros?: string[];
  vazio?: string;
}) {
  const [ativo, setAtivo] = useState<string | null>(null);
  const max = Math.max(1, ...dados.map((d) => d.value));

  if (!dados.length) {
    return <p className="px-5 py-8 text-center text-[13px] text-faint">{vazio}</p>;
  }

  const rampa = [
    "var(--color-seq-1)",
    "var(--color-seq-2)",
    "var(--color-seq-3)",
    "var(--color-seq-4)",
    "var(--color-seq-5)",
  ];

  return (
    <ul className="space-y-3 px-5 py-5">
      {dados.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        const share = total ? Math.round((d.value / total) * 100) : 0;
        const destaque = ativo === d.label;
        // A rampa percorre só as categorias ordinais; as neutras ficam de fora
        // dela para não sugerir uma posição na escala que não existe.
        const ordinais = dados.filter((x) => !neutros.includes(x.label));
        const posicao = ordinais.findIndex((x) => x.label === d.label);
        const preenchimento = neutros.includes(d.label)
          ? "var(--color-muted-2)"
          : sequencial
            ? rampa[
                Math.min(
                  rampa.length - 1,
                  Math.round(
                    (posicao / Math.max(1, ordinais.length - 1)) * (rampa.length - 1),
                  ),
                )
              ]
            : cor;

        return (
          <li
            key={d.label}
            onMouseEnter={() => setAtivo(d.label)}
            onMouseLeave={() => setAtivo(null)}
            className="group"
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-[13px] text-muted" title={d.label}>
                {d.label}
              </span>
              <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink">
                {d.value}
                <span className="ml-1.5 text-faint">{share}%</span>
              </span>
            </div>
            {/* Trilho recessivo + marca fina com extremidade arredondada */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[.05]">
              <div
                className="h-full rounded-full transition-[width,opacity] duration-500"
                style={{
                  width: `${Math.max(pct, d.value ? 3 : 0)}%`,
                  background: preenchimento,
                  opacity: ativo && !destaque ? 0.45 : 1,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Colunas por período — volume ao longo do tempo. */
export function ColunasPeriodo({
  dados,
  unidade = "diagnósticos",
}: {
  dados: Bucket[];
  unidade?: string;
}) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const max = Math.max(1, ...dados.map((d) => d.value));
  const emFoco = ativo !== null ? dados[ativo] : null;

  return (
    <div className="px-5 pb-4 pt-5">
      <div className="relative">
        {/* Linha recessiva marcando o máximo da escala */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-white/[.07]"
          aria-hidden
        />
        {/* gap-[2px]: a folga de 2px entre colunas vizinhas exigida pela spec */}
        <div className="flex h-36 items-end gap-[2px]">
          {dados.map((d, i) => {
            const destaque = ativo === i;
            const altura = d.value === 0 ? 2 : Math.max(4, (d.value / max) * 100);
            return (
              <button
                key={d.label}
                type="button"
                onMouseEnter={() => setAtivo(i)}
                onMouseLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(i)}
                onBlur={() => setAtivo(null)}
                // O alvo ocupa a coluna inteira; a marca vive no fundo dele.
                className="group flex h-full flex-1 cursor-default items-end"
                aria-label={`Semana de ${d.label}: ${d.value} ${unidade}`}
              >
                <span
                  className="block w-full rounded-t-[4px] transition-[height,opacity] duration-500"
                  style={{
                    height: `${altura}%`,
                    background:
                      d.value === 0
                        ? "var(--color-faint)"
                        : "linear-gradient(180deg, var(--color-brand), var(--color-seq-3))",
                    opacity: ativo !== null && !destaque ? 0.45 : 1,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Eixo: só as extremidades e o ponto sob o cursor, para não poluir */}
      <div className="mt-2.5 flex items-center justify-between gap-3 font-mono text-[10px] text-faint">
        <span>{dados[0]?.label}</span>
        <span className="text-[11px] text-ink" aria-live="polite">
          {emFoco ? `semana de ${emFoco.label} · ${emFoco.value} ${unidade}` : ""}
        </span>
        <span>{dados[dados.length - 1]?.label}</span>
      </div>
    </div>
  );
}
