"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Avatar, EmptyState, Progress, StatusBadge } from "./ui";
import { formatData, iniciais, tempoRelativo } from "@/lib/format";
import { STATUSES, STATUS_LABEL, type Diagnostico, type Status } from "@/lib/types";

type Filtro = Status | "todos";

/**
 * Lista filtrável. A busca e o filtro rodam no cliente sobre o conjunto já
 * carregado — o volume aqui é de dezenas, não de milhares; quando passar disso,
 * mover para o repositório com paginação.
 */
export function DiagnosticosLista({ diagnosticos }: { diagnosticos: Diagnostico[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const contagem = useMemo(() => {
    const mapa = new Map<Filtro, number>([["todos", diagnosticos.length]]);
    for (const s of STATUSES) {
      mapa.set(s, diagnosticos.filter((d) => d.status === s).length);
    }
    return mapa;
  }, [diagnosticos]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return diagnosticos.filter((d) => {
      if (filtro !== "todos" && d.status !== filtro) return false;
      if (!termo) return true;
      return (
        d.nome.toLowerCase().includes(termo) ||
        d.empresa.toLowerCase().includes(termo) ||
        d.email.toLowerCase().includes(termo) ||
        d.telefone.includes(termo)
      );
    });
  }, [diagnosticos, busca, filtro]);

  return (
    <div className="space-y-5">
      {/* ---- Controles, numa linha só, acima da lista ---- */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Buscar por nome, empresa, e-mail ou telefone</span>
          <FiSearch
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, empresa, e-mail ou telefone…"
            className="w-full rounded-full border border-white/[.08] bg-surface py-2.5 pl-10 pr-4 text-[14px] text-ink outline-none transition-colors focus:border-brand/45"
          />
        </label>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por status">
          {(["todos", ...STATUSES] as Filtro[]).map((opcao) => {
            const ativo = filtro === opcao;
            return (
              <button
                key={opcao}
                type="button"
                onClick={() => setFiltro(opcao)}
                aria-pressed={ativo}
                className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                  ativo
                    ? "border-brand/45 bg-brand/12 text-ink-bright"
                    : "border-white/[.08] bg-surface text-muted hover:text-ink"
                }`}
              >
                {opcao === "todos" ? "Todos" : STATUS_LABEL[opcao]}
                <span className="ml-1.5 font-mono text-[11px] text-faint tabular-nums">
                  {contagem.get(opcao) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Lista ---- */}
      <div className="overflow-hidden rounded-[16px] border border-white/[.07] bg-surface/80">
        {visiveis.length === 0 ? (
          <EmptyState
            title="Nada por aqui"
            description={
              busca
                ? `Nenhum diagnóstico corresponde a “${busca}”.`
                : "Nenhum diagnóstico com esse status."
            }
          />
        ) : (
          <>
            {/* Cabeçalho só no desktop; no mobile cada item vira um cartão */}
            <div className="hidden grid-cols-[minmax(0,2.2fr)_1fr_140px_152px] gap-4 border-b border-white/[.05] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-faint md:grid">
              <span>Empresa e contato</span>
              <span>Recebido</span>
              <span>Preenchimento</span>
              <span>Status</span>
            </div>

            <ul className="divide-y divide-white/[.05]">
              {visiveis.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/diagnosticos/${d.id}`}
                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-white/[.025] md:grid-cols-[minmax(0,2.2fr)_1fr_140px_152px] md:items-center md:gap-4"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar initials={iniciais(d.nome || d.empresa)} />
                      <span className="min-w-0">
                        <span className="block truncate text-[14.5px] text-ink-bright">
                          {d.empresa || "Empresa não informada"}
                        </span>
                        <span className="block truncate text-[13px] text-muted-2">
                          {d.nome}
                          {d.email && ` · ${d.email}`}
                        </span>
                      </span>
                    </span>

                    <span className="text-[13px] text-muted">
                      <span className="md:hidden">Recebido </span>
                      {tempoRelativo(d.criadoEm)}
                      <span className="ml-1.5 text-faint">{formatData(d.criadoEm)}</span>
                    </span>

                    <span className="flex items-center gap-2.5">
                      <Progress
                        value={d.completude}
                        label={`Preenchimento de ${d.empresa || d.nome}`}
                      />
                      <span className="shrink-0 font-mono text-[12px] tabular-nums text-muted">
                        {d.completude}%
                      </span>
                    </span>

                    <span className="justify-self-start">
                      <StatusBadge status={d.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p className="text-[12.5px] text-faint">
        {visiveis.length} de {diagnosticos.length} diagnósticos.
      </p>
    </div>
  );
}
