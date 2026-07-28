import { DIAGNOSTIC_QUESTIONS, QUESTIONS_BY_ID } from "@/lib/questions";
import type { Answers, AnswerValue } from "@/lib/types";

/** Uma resposta conta como preenchida se tem texto ou ao menos uma opção. */
export function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

/** Percentual (0–100) das perguntas do diagnóstico que foram respondidas. */
export function completude(answers: Answers): number {
  const respondidas = DIAGNOSTIC_QUESTIONS.filter((q) => isAnswered(answers[q.id])).length;
  return Math.round((respondidas / DIAGNOSTIC_QUESTIONS.length) * 100);
}

/** Texto legível de uma resposta, para tabelas e exportações. */
export function answerToText(value: AnswerValue | undefined): string {
  if (value == null) return "";
  return Array.isArray(value) ? value.join(", ") : value;
}

/**
 * Mantém apenas chaves conhecidas e normaliza os tipos, para que um formulário
 * desatualizado (ou um POST malicioso) não injete campos arbitrários na base.
 */
export function sanitizeAnswers(input: unknown): Answers {
  if (!input || typeof input !== "object") return {};
  const out: Answers = {};

  for (const [key, raw] of Object.entries(input as Record<string, unknown>)) {
    const question = QUESTIONS_BY_ID[key];
    if (!question) continue;

    if (question.type === "multi") {
      const list = Array.isArray(raw) ? raw : [raw];
      const values = list
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim().slice(0, 400))
        .filter(Boolean);
      if (values.length) out[key] = values;
      continue;
    }

    if (typeof raw === "string") {
      const value = raw.trim().slice(0, 5000);
      if (value) out[key] = value;
    }
  }

  return out;
}
