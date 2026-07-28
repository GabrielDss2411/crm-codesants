/**
 * CORS das rotas de ingestão.
 *
 * O formulário é uma página estática hospedada em outro domínio, então as
 * rotas que ele chama são públicas e precisam liberar a origem explicitamente.
 * Duas defesas, ambas opcionais por configuração: a lista de origens
 * (CRM_ALLOWED_ORIGINS) e um token compartilhado (CRM_INGEST_TOKEN). Como o
 * formulário é público, o token não é segredo de verdade — só corta ruído
 * automatizado.
 */

const ORIGENS_PADRAO = [
  "https://forms-codesants.vercel.app",
  "http://localhost:3000",
  "http://localhost:5500",
];

export function origensPermitidas(): string[] {
  const configurado = process.env.CRM_ALLOWED_ORIGINS;
  if (!configurado) return ORIGENS_PADRAO;
  return configurado
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function corsHeaders(
  origin: string | null,
  metodos = "POST, OPTIONS",
): Record<string, string> {
  const permitidas = origensPermitidas();
  const liberado = origin && permitidas.includes(origin);
  return {
    // Sem origem correspondente, ecoa a primeira permitida: o navegador
    // bloqueia a leitura, que é exatamente o comportamento desejado.
    "Access-Control-Allow-Origin": liberado ? origin : permitidas[0],
    "Access-Control-Allow-Methods": metodos,
    "Access-Control-Allow-Headers": "Content-Type, X-Ingest-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** `true` quando não há token configurado ou o recebido confere. */
export function tokenValido(request: Request): boolean {
  const esperado = process.env.CRM_INGEST_TOKEN;
  if (!esperado) return true;
  return request.headers.get("x-ingest-token") === esperado;
}
