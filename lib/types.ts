/** Tipos de domínio do CRM. Compartilhados por telas, API e adaptadores. */

/** Resposta de uma pergunta: texto livre ou lista (múltipla escolha). */
export type AnswerValue = string | string[];

/** Mapa questionId → resposta. Ex.: { empresa: "Acme", q7: ["Preço"] } */
export type Answers = Record<string, AnswerValue>;

export const STATUSES = ["novo", "em_analise", "proposta", "ganho", "perdido"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  novo: "Novo",
  em_analise: "Em análise",
  proposta: "Proposta enviada",
  ganho: "Fechado",
  perdido: "Perdido",
};

/** Um diagnóstico respondido — a unidade central do CRM. */
export type Diagnostico = {
  id: string;
  /** ISO 8601, em UTC. */
  criadoEm: string;
  nome: string;
  empresa: string;
  telefone: string;
  status: Status;
  /** 0–100: quanto do diagnóstico foi de fato preenchido. */
  completude: number;
  /** Onde o formulário foi respondido (host de origem). */
  origem: string;
  answers: Answers;
  /** Anotações internas, nunca visíveis para o cliente. */
  notas?: string;
};

/** Fase 2 — o portal do cliente. Ainda não populado pelo formulário. */
export const PROJETO_FASES = [
  "descoberta",
  "arquitetura",
  "design",
  "desenvolvimento",
  "revisao",
  "publicado",
] as const;
export type ProjetoFase = (typeof PROJETO_FASES)[number];

export const FASE_LABEL: Record<ProjetoFase, string> = {
  descoberta: "Descoberta",
  arquitetura: "Arquitetura",
  design: "Design",
  desenvolvimento: "Desenvolvimento",
  revisao: "Revisão",
  publicado: "Publicado",
};

export type Projeto = {
  id: string;
  /** Diagnóstico que originou o projeto. */
  diagnosticoId: string | null;
  nome: string;
  cliente: string;
  fase: ProjetoFase;
  /** 0–100. */
  progresso: number;
  inicioEm: string;
  previsaoEm: string | null;
  url: string | null;
};

/** Payload aceito por POST /api/diagnosticos (o formulário envia isto). */
export type IngestPayload = {
  answers: Answers;
  /** Opcional: o formulário pode carimbar quando terminou. */
  submittedAt?: string;
  origem?: string;
};
