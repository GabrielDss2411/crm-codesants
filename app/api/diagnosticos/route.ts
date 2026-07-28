import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { isAnswered, sanitizeAnswers } from "@/lib/data/normalize";
import { corsHeaders, tokenValido } from "@/lib/cors";
import type { IngestPayload } from "@/lib/types";

/**
 * Recebe um diagnóstico concluído no formulário.
 *
 *   POST /api/diagnosticos
 *   { "answers": { "nome": "...", "empresa": "...", "q1": "...", "q7": ["Preço"] } }
 *
 * Responde com o `id` criado — é ele que o formulário usa depois para anexar
 * a disponibilidade de agenda (PATCH /api/diagnosticos/[id]).
 *
 * Rota pública com CORS explícito; ver lib/cors.ts.
 */

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!tokenValido(request)) {
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
