# CodeSants CRM

Recebe as respostas do [Diagnóstico Estratégico](https://github.com/GabrielDss2411/forms-codesants),
mostra o que elas dizem em um dashboard e — na fase 2 — abre o acompanhamento
de projetos para o cliente.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · design system CodeSants.

## Rodando

```bash
npm install
npm run dev     # http://localhost:3000
```

Sobe sem nenhuma configuração: sem banco, o CRM usa dados de exemplo e a
sidebar avisa isso em amarelo. Nada de credencial para começar a mexer.

## Telas

| Rota | O que faz |
|---|---|
| `/` | Dashboard: KPIs, volume por semana, pipeline e a leitura estratégica das respostas de escolha. |
| `/diagnosticos` | Lista completa, com busca por nome/empresa/e-mail/telefone e filtro por status. Quem deixou agenda ganha a etiqueta *call*. |
| `/diagnosticos/[id]` | O diagnóstico inteiro, na ordem do formulário, com a disponibilidade para call e atalho de WhatsApp. |
| `/projetos` | Acompanhamento de projetos por fase. É a tela que o cliente verá na fase 2. |

## Como o formulário conversa com o CRM

```
forms/index.html  ──POST──►  /api/diagnosticos  ──►  Repository  ──►  Supabase
   (estático)                  (valida + CORS)        (interface)      (ou dados de exemplo)
```

```http
POST /api/diagnosticos
Content-Type: application/json
X-Ingest-Token: <opcional>

{
  "answers": { "nome": "…", "empresa": "…", "q7": ["Preço", "Confiança"] },
  "submittedAt": "2026-07-28T12:00:00.000Z",
  "origem": "forms-codesants.vercel.app"
}
```

Respostas: `201` com `{ id, completude, persistido }` · `401` token inválido ·
`400` JSON inválido · `422` envio sem identificação.

Depois, na tela de encerramento, o formulário anexa a agenda preferida ao
registro que acabou de criar:

```http
PATCH /api/diagnosticos/<id>

{ "disponibilidade": { "dias": ["Terça"], "periodos": ["Manhã"],
                       "observacao": "só depois do dia 20" } }
```

São duas chamadas de propósito: quando a tela de encerramento aparece, o
diagnóstico **já está gravado**. Quem fechar a aba ali não perde as respostas —
só deixa de marcar horário. Dias e períodos fora da lista conhecida são
descartados. Respostas: `200` · `404` diagnóstico inexistente · `422` sem
nenhum dia, período ou observação.

O campo **`persistido`** diz a verdade sobre o destino: `false` enquanto não
houver Supabase configurado.

**Para ligar de fato**, preencha a constante `CRM_ENDPOINT` no topo do
`<script>` de `index.html` no repositório do formulário:

```js
const CRM_ENDPOINT = "https://SEU-CRM.vercel.app/api/diagnosticos";
```

Chaves de resposta desconhecidas são descartadas na entrada — o contrato é o
array `QUESTIONS` do formulário, espelhado em [`lib/questions.ts`](./lib/questions.ts).
Mexeu nas perguntas lá, espelhe aqui.

## Ligando o Supabase

Nenhuma tela muda: `getRepository()` troca a implementação sozinho assim que as
duas variáveis existirem.

```bash
vercel integration add supabase     # provisiona e injeta as variáveis
vercel env pull .env.local
# rode supabase/schema.sql no SQL Editor do projeto
```

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Endereço do projeto. |
| `SUPABASE_SERVICE_ROLE_KEY` | Acesso de servidor. **Ignora RLS** — nunca exponha no cliente. |
| `CRM_ALLOWED_ORIGINS` | Origens que podem chamar a API de ingestão. |
| `CRM_INGEST_TOKEN` | Token compartilhado opcional da ingestão. |

O [`supabase/schema.sql`](./supabase/schema.sql) já cria as duas tabelas com
RLS ligado e sem policies — ou seja, nada é legível pela chave anônima. A
policy de leitura por dono, para o portal do cliente, está escrita e comentada
no fim do arquivo.

## Aviso no WhatsApp ao concluir

O lead recebe uma mensagem no WhatsApp assim que termina o diagnóstico, por um
fluxo do n8n: [`n8n/`](./n8n/) tem o workflow para importar e o passo a passo.

Ponto que decide o funcionamento: a API oficial do WhatsApp **não aceita texto
livre** para quem nunca escreveu para o número, então a primeira mensagem é um
**template aprovado pela Meta**. O README de lá traz o texto a cadastrar.

## Deploy na Vercel

Projeto Next.js padrão, sem configuração especial: **Import → Framework Preset
`Next.js` → Deploy.** Se o repositório for importado a partir do monorepo,
aponte o Root Directory para `crm/`.

## Estrutura

```
app/
  page.tsx                    dashboard
  diagnosticos/               lista e detalhe
  projetos/                   fase 2
  api/diagnosticos/route.ts        ingestão (POST) + preflight (OPTIONS)
  api/diagnosticos/[id]/route.ts   disponibilidade para call (PATCH)
  globals.css                 tokens do design system
components/                   shell, cartões, gráficos, tabela
lib/
  questions.ts                catálogo espelhado do formulário
  types.ts                    tipos de domínio
  analytics.ts                agregações do dashboard
  data/repository.ts          interface + Supabase + dados de exemplo
supabase/schema.sql           tabelas, índices e RLS
n8n/                          fluxo de WhatsApp ao concluir o diagnóstico
```

### Duas regras que sustentam o resto

1. **Nenhuma tela fala com o banco.** Tudo passa por `Repository`. É o que
   permite trocar a fonte de dados sem tocar em componente.
2. **Cores saem dos tokens em `globals.css`.** A paleta categórica dos
   gráficos foi validada para fundo escuro (faixa de luminosidade, contraste e
   separação para daltonismo); a rampa sequencial tem no mínimo 3,5:1 contra a
   superfície, para que a menor categoria não desapareça.

## O que ainda não existe

- **Autenticação.** Todas as telas são abertas. Antes de publicar em domínio
  público, proteja com o login do Supabase (é a próxima etapa planejada).
- **Edição de status pela interface.** `updateStatus` existe no repositório,
  mas ainda não há botão que o chame.
- **Cadastro de projetos.** A tela lê; ainda não escreve.
