import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { Card, EmptyState, PageHeader, Pill, Progress } from "@/components/ui";
import { getRepository } from "@/lib/data/repository";
import { formatData } from "@/lib/format";
import { FASE_LABEL, PROJETO_FASES, type Projeto } from "@/lib/types";

export const metadata = { title: "Projetos" };
export const dynamic = "force-dynamic";

export default async function ProjetosPage() {
  const projetos = await getRepository().listProjetos();

  return (
    <>
      <PageHeader
        eyebrow="Fase 2"
        title="Projetos"
        description="O acompanhamento dos projetos em andamento. É esta tela que o cliente verá quando o portal for aberto."
      />

      <div className="space-y-5 px-6 py-7 sm:px-9">
        {/* Aviso honesto sobre o estágio da funcionalidade */}
        <div className="rounded-[14px] border border-warning/25 bg-warning/[.07] px-5 py-4">
          <p className="text-[14px] leading-relaxed text-muted">
            <strong className="font-semibold text-ink-bright">Ainda interno.</strong> Os
            projetos são cadastrados por você — o formulário não cria projeto sozinho. O
            acesso do cliente entra junto com a autenticação do Supabase, e a política de
            leitura por dono já está escrita em{" "}
            <code className="font-mono text-[13px] text-brand-soft">supabase/schema.sql</code>.
          </p>
        </div>

        {projetos.length === 0 ? (
          <Card>
            <EmptyState
              title="Nenhum projeto cadastrado"
              description="Quando um diagnóstico virar contrato, cadastre o projeto para acompanhar as fases por aqui."
            />
          </Card>
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {projetos.map((projeto) => (
              <li key={projeto.id}>
                <CartaoProjeto projeto={projeto} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function CartaoProjeto({ projeto }: { projeto: Projeto }) {
  const indiceAtual = PROJETO_FASES.indexOf(projeto.fase);

  return (
    <Card className="h-full p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.015em] text-ink-bright">
            {projeto.nome}
          </h2>
          <p className="mt-1 text-[13.5px] text-muted-2">{projeto.cliente}</p>
        </div>
        <Pill>{FASE_LABEL[projeto.fase]}</Pill>
      </div>

      {/* Trilha de fases: a posição atual não depende só de cor */}
      <ol className="mt-5 flex gap-[2px]" aria-label="Fases do projeto">
        {PROJETO_FASES.map((fase, i) => {
          const concluida = i < indiceAtual;
          const atual = i === indiceAtual;
          return (
            <li
              key={fase}
              className="flex-1"
              aria-current={atual ? "step" : undefined}
              title={FASE_LABEL[fase]}
            >
              <span
                className={`block h-1.5 rounded-full ${
                  concluida ? "bg-brand/45" : atual ? "bg-brand" : "bg-white/[.07]"
                }`}
              />
              <span className="mt-1.5 block truncate text-[10px] text-faint">
                {atual ? FASE_LABEL[fase] : ""}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <div className="mb-2 flex items-baseline justify-between text-[13px]">
          <span className="text-muted-2">Progresso</span>
          <span className="font-mono tabular-nums text-ink">{projeto.progresso}%</span>
        </div>
        <Progress value={projeto.progresso} label={`Progresso de ${projeto.nome}`} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/[.05] pt-4 text-[13px]">
        <div>
          <dt className="text-muted-2">Início</dt>
          <dd className="mt-0.5 text-ink">{formatData(projeto.inicioEm)}</dd>
        </div>
        <div>
          <dt className="text-muted-2">Previsão</dt>
          <dd className="mt-0.5 text-ink">
            {projeto.previsaoEm ? formatData(projeto.previsaoEm) : "a definir"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {projeto.url && (
          <a
            href={projeto.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-brand transition-opacity hover:opacity-80"
          >
            Ver no ar
            <FiExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
        {projeto.diagnosticoId && (
          <Link
            href={`/diagnosticos/${projeto.diagnosticoId}`}
            className="text-[13px] text-muted transition-colors hover:text-ink"
          >
            Diagnóstico de origem
          </Link>
        )}
      </div>
    </Card>
  );
}
