import { DIAS_SEMANA, PERIODOS } from "@/lib/types";
import type { DiaSemana, Disponibilidade, Periodo } from "@/lib/types";

/**
 * Valida o que chega do formulário: só dias e períodos conhecidos entram, na
 * ordem da semana (a pessoa pode marcar sexta antes de segunda).
 * Devolve `null` quando não sobrou nada de útil.
 */
export function sanitizeDisponibilidade(input: unknown): Disponibilidade | null {
  if (!input || typeof input !== "object") return null;
  const bruto = input as Record<string, unknown>;

  const listaDe = <T extends string>(valor: unknown, validos: readonly T[]): T[] => {
    if (!Array.isArray(valor)) return [];
    const marcados = new Set(valor.filter((v): v is string => typeof v === "string"));
    // Percorre `validos` para preservar a ordem canônica e remover duplicatas.
    return validos.filter((v) => marcados.has(v));
  };

  const dias = listaDe<DiaSemana>(bruto.dias, DIAS_SEMANA);
  const periodos = listaDe<Periodo>(bruto.periodos, PERIODOS);
  const observacao =
    typeof bruto.observacao === "string" ? bruto.observacao.trim().slice(0, 800) : "";

  if (!dias.length && !periodos.length && !observacao) return null;

  return {
    dias,
    periodos,
    ...(observacao ? { observacao } : {}),
    informadaEm: new Date().toISOString(),
  };
}
