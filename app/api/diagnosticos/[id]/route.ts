import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { sanitizeDisponibilidade } from "@/lib/data/disponibilidade";
import { corsHeaders, tokenValido } from "@/lib/cors";

/**
 * Anexa a disponibilidade de agenda a um diagnóstico já gravado.
 *
 *   PATCH /api/diagnosticos/<id>
 *   { "disponibilidade": { "dias": ["Terça"], "periodos": ["Manhã"],
 *                          "observacao": "depois do dia 20" } }
 *
 * É uma segunda chamada de propósito: quando a tela de encerramento aparece,
 * o diagnóstico já foi gravado. Se a pessoa fechar a aba sem informar a
 * agenda, nada se perde — só falta a disponibilidade.
 *
 * Rota pública com CORS explícito; ver lib/cors.ts.
 */

export const dynamic = "force-dynamic";

const METODOS = "PATCH, OPTIONS";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin"), METODOS),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = corsHeaders(request.headers.get("origin"), METODOS);

  if (!tokenValido(request)) {
    return NextResponse.json({ erro: "Token inválido." }, { status: 401, headers });
  }

  const { id } = await params;

  let corpo: { disponibilidade?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400, headers });
  }

  const disponibilidade = sanitizeDisponibilidade(corpo?.disponibilidade);
  if (!disponibilidade) {
    return NextResponse.json(
      { erro: "Informe ao menos um dia, um período ou uma observação." },
      { status: 422, headers },
    );
  }

  const repo = getRepository();

  try {
    const ok = await repo.setDisponibilidade(id, disponibilidade);
    if (!ok) {
      return NextResponse.json(
        { erro: "Diagnóstico não encontrado." },
        { status: 404, headers },
      );
    }
    return NextResponse.json(
      { id, disponibilidade, persistido: repo.kind === "supabase" },
      { status: 200, headers },
    );
  } catch (erro) {
    console.error("[disponibilidade] falha ao gravar", erro);
    return NextResponse.json(
      { erro: "Não foi possível registrar a disponibilidade." },
      { status: 500, headers },
    );
  }
}
