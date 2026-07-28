import { QUESTIONS_BY_ID } from "./questions";
import type { Diagnostico, Status } from "./types";
import { STATUSES } from "./types";

const DIA = 24 * 60 * 60 * 1000;

export type Bucket = { label: string; value: number };

/** Contagem por opção de uma pergunta de escolha (single ou multi). */
export function contarOpcoes(
  diagnosticos: Diagnostico[],
  questionId: string,
): Bucket[] {
  const question = QUESTIONS_BY_ID[questionId];
  if (!question) return [];

  const contagem = new Map<string, number>();
  // Semeia com as opções oficiais para que um zero apareça como zero,
  // e não simplesmente suma do gráfico.
  for (const opcao of question.options ?? []) contagem.set(opcao, 0);

  for (const d of diagnosticos) {
    const resposta = d.answers[questionId];
    if (resposta == null) continue;
    const valores = Array.isArray(resposta) ? resposta : [resposta];
    for (const v of valores) {
      const chave = v.trim();
      if (!chave) continue;
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    }
  }

  return [...contagem].map(([label, value]) => ({ label, value }));
}

/** Igual a contarOpcoes, mas ordenado do maior para o menor. */
export function contarOpcoesOrdenado(
  diagnosticos: Diagnostico[],
  questionId: string,
): Bucket[] {
  return contarOpcoes(diagnosticos, questionId).sort((a, b) => b.value - a.value);
}

/** Volume por semana, da mais antiga para a mais recente. */
export function porSemana(
  diagnosticos: Diagnostico[],
  semanas = 8,
  agora = Date.now(),
): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const fim = agora - i * 7 * DIA;
    const inicio = fim - 7 * DIA;
    const value = diagnosticos.filter((d) => {
      const t = new Date(d.criadoEm).getTime();
      return t > inicio && t <= fim;
    }).length;
    const rotulo = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(inicio + DIA));
    buckets.push({ label: rotulo, value });
  }
  return buckets;
}

export function porStatus(diagnosticos: Diagnostico[]): { status: Status; value: number }[] {
  return STATUSES.map((status) => ({
    status,
    value: diagnosticos.filter((d) => d.status === status).length,
  }));
}

export type Resumo = {
  total: number;
  ultimos7: number;
  /** Variação percentual dos últimos 7 dias contra os 7 anteriores. */
  variacao7: number | null;
  completudeMedia: number;
  emAberto: number;
  taxaGanho: number | null;
};

export function resumo(diagnosticos: Diagnostico[], agora = Date.now()): Resumo {
  const dentro = (de: number, ate: number) =>
    diagnosticos.filter((d) => {
      const t = new Date(d.criadoEm).getTime();
      return t > agora - de * DIA && t <= agora - ate * DIA;
    }).length;

  const ultimos7 = dentro(7, 0);
  const anteriores7 = dentro(14, 7);

  const decididos = diagnosticos.filter(
    (d) => d.status === "ganho" || d.status === "perdido",
  ).length;
  const ganhos = diagnosticos.filter((d) => d.status === "ganho").length;

  return {
    total: diagnosticos.length,
    ultimos7,
    variacao7:
      anteriores7 === 0
        ? null
        : Math.round(((ultimos7 - anteriores7) / anteriores7) * 100),
    completudeMedia: diagnosticos.length
      ? Math.round(
          diagnosticos.reduce((soma, d) => soma + d.completude, 0) / diagnosticos.length,
        )
      : 0,
    emAberto: diagnosticos.filter(
      (d) => d.status === "novo" || d.status === "em_analise" || d.status === "proposta",
    ).length,
    taxaGanho: decididos ? Math.round((ganhos / decididos) * 100) : null,
  };
}
