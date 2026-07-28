import "server-only";

import { SEED_DIAGNOSTICOS, SEED_PROJETOS } from "./seed";
import { completude } from "./normalize";
import type { Answers, Diagnostico, Projeto, Status } from "@/lib/types";

/**
 * Contrato único de acesso a dados.
 *
 * Toda tela e toda rota de API falam com esta interface — nunca com o Supabase
 * direto. Trocar de fonte é trocar a implementação devolvida por
 * `getRepository()`, sem tocar em componente nenhum.
 */
export interface Repository {
  /** Identifica a fonte ativa nas telas ("demo" mostra o aviso de dados fictícios). */
  readonly kind: "demo" | "supabase";
  listDiagnosticos(): Promise<Diagnostico[]>;
  getDiagnostico(id: string): Promise<Diagnostico | null>;
  createDiagnostico(input: NovoDiagnostico): Promise<Diagnostico>;
  updateStatus(id: string, status: Status): Promise<void>;
  listProjetos(): Promise<Projeto[]>;
}

export type NovoDiagnostico = {
  answers: Answers;
  criadoEm: string;
  origem: string;
};

/** Deriva os campos de topo (nome/empresa/telefone) a partir das respostas. */
function fromAnswers(input: NovoDiagnostico, id: string): Diagnostico {
  const texto = (key: string) => {
    const value = input.answers[key];
    return typeof value === "string" ? value : "";
  };
  return {
    id,
    criadoEm: input.criadoEm,
    nome: texto("nome"),
    empresa: texto("empresa"),
    telefone: texto("telefone"),
    email: texto("email"),
    status: "novo",
    completude: completude(input.answers),
    origem: input.origem,
    answers: input.answers,
  };
}

/* ============================================================
   Implementação de demonstração (sem banco)
   ============================================================ */

/**
 * Guarda os envios em memória do processo.
 *
 * Ancorado em `globalThis` de propósito: as rotas de API e as páginas são
 * empacotadas em grafos de módulo diferentes, então um `const` no topo do
 * arquivo daria dois arrays distintos e o que chegasse pelo formulário nunca
 * apareceria nas telas.
 *
 * Não sobrevive a redeploy nem é compartilhado entre instâncias serverless —
 * serve para conferir a ponta a ponta antes de o Supabase entrar.
 */
const CHAVE_MEMORIA = Symbol.for("codesants.crm.memoria");

const escopoGlobal = globalThis as typeof globalThis & {
  [CHAVE_MEMORIA]?: Diagnostico[];
};

escopoGlobal[CHAVE_MEMORIA] ??= [];
const memoria: Diagnostico[] = escopoGlobal[CHAVE_MEMORIA];

class DemoRepository implements Repository {
  readonly kind = "demo" as const;

  async listDiagnosticos(): Promise<Diagnostico[]> {
    return [...memoria, ...SEED_DIAGNOSTICOS].sort((a, b) =>
      b.criadoEm.localeCompare(a.criadoEm),
    );
  }

  async getDiagnostico(id: string): Promise<Diagnostico | null> {
    const todos = await this.listDiagnosticos();
    return todos.find((d) => d.id === id) ?? null;
  }

  async createDiagnostico(input: NovoDiagnostico): Promise<Diagnostico> {
    const registro = fromAnswers(input, `tmp-${Date.now().toString(36)}`);
    memoria.unshift(registro);
    return registro;
  }

  async updateStatus(id: string, status: Status): Promise<void> {
    const alvo =
      memoria.find((d) => d.id === id) ?? SEED_DIAGNOSTICOS.find((d) => d.id === id);
    if (alvo) alvo.status = status;
  }

  async listProjetos(): Promise<Projeto[]> {
    return SEED_PROJETOS;
  }
}

/* ============================================================
   Implementação Supabase
   ============================================================ */

type DiagnosticoRow = {
  id: string;
  criado_em: string;
  nome: string | null;
  empresa: string | null;
  telefone: string | null;
  email: string | null;
  status: Status;
  completude: number;
  origem: string | null;
  answers: Answers;
  notas: string | null;
};

type ProjetoRow = {
  id: string;
  diagnostico_id: string | null;
  nome: string;
  cliente: string;
  fase: Projeto["fase"];
  progresso: number;
  inicio_em: string;
  previsao_em: string | null;
  url: string | null;
};

function toDiagnostico(row: DiagnosticoRow): Diagnostico {
  return {
    id: row.id,
    criadoEm: row.criado_em,
    nome: row.nome ?? "",
    empresa: row.empresa ?? "",
    telefone: row.telefone ?? "",
    email: row.email ?? "",
    status: row.status,
    completude: row.completude,
    origem: row.origem ?? "desconhecida",
    answers: row.answers ?? {},
    notas: row.notas ?? undefined,
  };
}

class SupabaseRepository implements Repository {
  readonly kind = "supabase" as const;

  private async client() {
    // Import dinâmico: o pacote só é carregado quando há Supabase configurado.
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
  }

  async listDiagnosticos(): Promise<Diagnostico[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(`Falha ao listar diagnósticos: ${error.message}`);
    return (data as DiagnosticoRow[]).map(toDiagnostico);
  }

  async getDiagnostico(id: string): Promise<Diagnostico | null> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Falha ao buscar diagnóstico: ${error.message}`);
    return data ? toDiagnostico(data as DiagnosticoRow) : null;
  }

  async createDiagnostico(input: NovoDiagnostico): Promise<Diagnostico> {
    const supabase = await this.client();
    const base = fromAnswers(input, "");
    const { data, error } = await supabase
      .from("diagnosticos")
      .insert({
        criado_em: base.criadoEm,
        nome: base.nome,
        empresa: base.empresa,
        telefone: base.telefone,
        email: base.email,
        status: base.status,
        completude: base.completude,
        origem: base.origem,
        answers: base.answers,
      })
      .select("*")
      .single();
    if (error) throw new Error(`Falha ao gravar diagnóstico: ${error.message}`);
    return toDiagnostico(data as DiagnosticoRow);
  }

  async updateStatus(id: string, status: Status): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase.from("diagnosticos").update({ status }).eq("id", id);
    if (error) throw new Error(`Falha ao atualizar status: ${error.message}`);
  }

  async listProjetos(): Promise<Projeto[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("projetos")
      .select("*")
      .order("inicio_em", { ascending: false });
    if (error) throw new Error(`Falha ao listar projetos: ${error.message}`);
    return (data as ProjetoRow[]).map((row) => ({
      id: row.id,
      diagnosticoId: row.diagnostico_id,
      nome: row.nome,
      cliente: row.cliente,
      fase: row.fase,
      progresso: row.progresso,
      inicioEm: row.inicio_em,
      previsaoEm: row.previsao_em,
      url: row.url,
    }));
  }
}

/* ============================================================
   Seleção da fonte
   ============================================================ */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let cache: Repository | null = null;

/**
 * Devolve o repositório ativo: Supabase quando as variáveis existem, senão a
 * fonte de demonstração. Lê `process.env` só na primeira chamada em runtime,
 * nunca no topo do módulo — assim o `next build` não quebra sem as variáveis.
 */
export function getRepository(): Repository {
  if (!cache) {
    cache = isSupabaseConfigured() ? new SupabaseRepository() : new DemoRepository();
  }
  return cache;
}
