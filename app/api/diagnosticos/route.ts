import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { isAnswered, sanitizeAnswers } from "@/lib/data/normalize";
import type { IngestPayload } from "@/lib/types";

/**
 * Recebe um diagnóstico concluído no formulário.
 *
 *   POST /api/diagnosticos
 *   { "answers": { "nome": "...", "empresa": "...", "q1": "...", "q7": ["Preço"] } }
 *
 * O formulário é uma página estática em outro domínio, então isto é uma rota
 * pública com CORS explícito. Duas defesas, ambas opcionais por configuração:
 * a lista de origens permitidas (CRM_ALLOWED_ORIGINS) e um token compartilhado
 * (CRM_INGEST_TOKEN). Como o formulário é público, o token não é segredo de
 * verdade — ele só corta ruído automatizado.
 */

export const dynamic = "force-dynamic";

const ORIGENS_PADRAO = [
  "https://forms-codesants.vercel.app",
  "http://localhost:3000",
  "http://localhost:5500",
];

function origensPermitidas(): string[] {
  const configurado = process.env.CRM_ALLOWED_ORIGINS;
  if (!configurado) return ORIGENS_PADRAO;
  return configurado
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function corsHeaders(origin: string | null): Record<string, string> {
  const permitidas = origensPermitidas();
  const liberado = origin && permitidas.includes(origin);
  return {
    // Sem origem correspondente, ecoa a primeira permitida: o navegador
    // bloqueia a leitura, que é exatamente o comportamento desejado.
    "Access-Control-Allow-Origin": liberado ? origin : permitidas[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Ingest-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  const tokenEsperado = process.env.CRM_INGEST_TOKEN;
  if (tokenEsperado && request.headers.get("x-ingest-token") !== tokenEsperado) {
    return NextResponse.json({ erro: "Token inválido." }, { status: 401, headers });
  }

  let corpo: IngestPayload;
  try {
    corpo = (await request.json()) as IngestPayload;
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400, headers });
  }

  const answers = sanitizeAnswers(corpo?.answers);

  // Um envio precisa ao menos identificar quem respondeu ou trazer conteúdo.
  const temIdentificacao = isAnswered(answers.nome) || isAnswered(answers.empresa);
  const temConteudo = Object.keys(answers).length > 0;
  if (!temIdentificacao || !temConteudo) {
    return NextResponse.json(
      { erro: "Envio vazio: informe ao menos nome ou empresa." },
      { status: 422, headers },
    );
  }

  const criadoEm = (() => {
    const informado = corpo?.submittedAt ? new Date(corpo.submittedAt) : null;
    return informado && !Number.isNaN(informado.getTime())
      ? informado.toISOString()
      : new Date().toISOString();
  })();

  const repo = getRepository();

  try {
    const diagnostico = await repo.createDiagnostico({
      answers,
      criadoEm,
      origem: corpo?.origem?.slice(0, 120) || (origin ? new URL(origin).host : "desconhecida"),
    });

    return NextResponse.json(
      {
        id: diagnostico.id,
        completude: diagnostico.completude,
        // Sinaliza com honestidade que ainda não há banco por trás.
        persistido: repo.kind === "supabase",
      },
      { status: 201, headers },
    );
  } catch (erro) {
    console.error("[ingest] falha ao gravar diagnóstico", erro);
    return NextResponse.json(
      { erro: "Não foi possível registrar o diagnóstico." },
      { status: 500, headers },
    );
  }
}
