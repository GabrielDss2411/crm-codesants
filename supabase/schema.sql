-- ============================================================
-- CodeSants CRM · schema
--
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`)
-- depois de provisionar a integração. As tabelas abaixo são exatamente o que
-- lib/data/repository.ts espera — os nomes de coluna são o contrato.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---- Diagnósticos ------------------------------------------------------
create table if not exists public.diagnosticos (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  nome        text,
  empresa     text,
  telefone    text,
  status      text not null default 'novo'
              check (status in ('novo','em_analise','proposta','ganho','perdido')),
  completude  smallint not null default 0 check (completude between 0 and 100),
  origem      text,
  -- Respostas cruas do formulário: { "q1": "texto", "q7": ["Preço","Confiança"] }
  answers     jsonb not null default '{}'::jsonb,
  notas       text
);

create index if not exists diagnosticos_criado_em_idx
  on public.diagnosticos (criado_em desc);
create index if not exists diagnosticos_status_idx
  on public.diagnosticos (status);
-- Consultas por conteúdo de resposta (ex.: quem marcou "Preço" na q7)
create index if not exists diagnosticos_answers_idx
  on public.diagnosticos using gin (answers);

-- ---- Projetos (fase 2 · portal do cliente) -----------------------------
create table if not exists public.projetos (
  id             uuid primary key default gen_random_uuid(),
  diagnostico_id uuid references public.diagnosticos (id) on delete set null,
  nome           text not null,
  cliente        text not null,
  fase           text not null default 'descoberta'
                 check (fase in ('descoberta','arquitetura','design','desenvolvimento','revisao','publicado')),
  progresso      smallint not null default 0 check (progresso between 0 and 100),
  inicio_em      timestamptz not null default now(),
  previsao_em    timestamptz,
  url            text
);

create index if not exists projetos_inicio_em_idx on public.projetos (inicio_em desc);

-- ---- Segurança ---------------------------------------------------------
-- RLS ligado e SEM policies: nada é legível pela chave anônima.
-- O CRM acessa via SUPABASE_SERVICE_ROLE_KEY, que ignora RLS por definição —
-- por isso essa chave nunca pode aparecer em código de cliente.
alter table public.diagnosticos enable row level security;
alter table public.projetos     enable row level security;

-- Fase 2 · quando o cliente logar para ver o projeto dele, adicione a coluna
-- de dono e libere só as linhas dele. Deixado comentado de propósito:
--
-- alter table public.projetos add column owner_id uuid references auth.users (id);
-- create policy "cliente lê o próprio projeto"
--   on public.projetos for select
--   using (auth.uid() = owner_id);
