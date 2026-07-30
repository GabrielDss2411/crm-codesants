import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiExternalLink, FiPhone } from "react-icons/fi";
import { Card, CardHeader, Progress, StatusBadge } from "@/components/ui";
import { getRepository } from "@/lib/data/repository";
import { detalheDe, isAnswered } from "@/lib/data/normalize";
import { formatDataHora, linkWhatsApp, tempoRelativo } from "@/lib/format";
import { DIAGNOSTIC_QUESTIONS, PARTS, IDENTITY_PART } from "@/lib/questions";
import { PERIODO_HORARIO } from "@/lib/types";
import type { Diagnostico, Disponibilidade as DisponibilidadeDados } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diagnostico = await getRepository().getDiagnostico(id);
  return { title: diagnostico?.empresa || "Diagnóstico" };
}

export default async function DiagnosticoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diagnostico = await getRepository().getDiagnostico(id);
  if (!diagnostico) notFound();

  const whatsapp = linkWhatsApp(diagnostico.telefone);
  const partes = PARTS.filter((p) => p !== IDENTITY_PART);
  const respondidas = DIAGNOSTIC_QUESTIONS.filter((q) => isAnswered(diagnostico.answers[q.id]));

  return (
    <>
      {/* ---- Cabeçalho do registro ---- */}
      <header className="app-grid border-b border-white/[.05] px-6 py-7 sm:px-9">
        <Link
          href="/diagnosticos"
          className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Diagnósticos
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[clamp(24px,3vw,34px)] font-bold leading-tight tracking-[-0.025em] text-ink-bright">
                {diagnostico.empresa || "Empresa não informada"}
              </h1>
              <StatusBadge status={diagnostico.status} />
            </div>
            <p className="mt-2 text-[15px] text-muted">
              {diagnostico.nome}
              {diagnostico.telefone && (
                <>
                  {" · "}
                  <span className="font-mono text-[14px]">{diagnostico.telefone}</span>
                </>
              )}
              {diagnostico.email && (
                <>
                  {" · "}
                  <a
                    href={`mailto:${diagnostico.email}`}
                    className="text-brand transition-opacity hover:opacity-80"
                  >
                    {diagnostico.email}
                  </a>
                </>
              )}
            </p>
            <p className="mt-1 text-[13px] text-faint">
              Recebido {tempoRelativo(diagnostico.criadoEm)} ·{" "}
              {formatDataHora(diagnostico.criadoEm)} · via {diagnostico.origem}
            </p>
          </div>

          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-5 py-2.5 text-[14px] font-semibold text-ink-invert transition-opacity hover:opacity-90"
            >
              <FiPhone className="h-4 w-4" aria-hidden />
              Falar no WhatsApp
              <FiExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </a>
          )}
        </div>

        <div className="mt-6 max-w-md">
          <div className="mb-2 flex items-baseline justify-between text-[13px]">
            <span className="text-muted-2">Preenchimento</span>
            <span className="font-mono tabular-nums text-ink">
              {respondidas.length} de {DIAGNOSTIC_QUESTIONS.length} perguntas ·{" "}
              {diagnostico.completude}%
            </span>
          </div>
          <Progress value={diagnostico.completude} label="Preenchimento do diagnóstico" />
        </div>
      </header>

      <div className="grid gap-6 px-6 py-7 sm:px-9 lg:grid-cols-[1fr_300px]">
        {/* ---- Respostas, na ordem do formulário ---- */}
        <div className="min-w-0 space-y-6">
          {partes.map((parte) => (
            <ParteRespostas key={parte} parte={parte} diagnostico={diagnostico} />
          ))}
        </div>

        {/* ---- Coluna lateral ---- */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          {diagnostico.disponibilidade && (
            <Disponibilidade dados={diagnostico.disponibilidade} />
          )}

          {diagnostico.notas && (
            <Card>
              <CardHeader title="Anotações internas" subtitle="Nunca visível para o cliente." />
              <p className="whitespace-pre-line px-5 py-4 text-[14px] leading-relaxed text-muted">
                {diagnostico.notas}
              </p>
            </Card>
          )}

          <Card>
            <CardHeader title="Registro" />
            <dl className="space-y-3 px-5 py-4 text-[13px]">
              <Linha termo="Identificador" valor={diagnostico.id} mono />
              <Linha termo="Recebido em" valor={formatDataHora(diagnostico.criadoEm)} />
              <Linha termo="Origem" valor={diagnostico.origem} />
              <Linha termo="Sem resposta" valor={`${DIAGNOSTIC_QUESTIONS.length - respondidas.length} perguntas`} />
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
}

/** Agenda preferida para a call, informada no encerramento do formulário. */
function Disponibilidade({ dados }: { dados: DisponibilidadeDados }) {
  return (
    <Card className="border-brand/25 bg-brand/[.05]">
      <CardHeader
        title="Disponibilidade para call"
        subtitle={`Informada ${tempoRelativo(dados.informadaEm)} pelo próprio lead.`}
      />
      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            Dias
          </p>
          {dados.dias.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {dados.dias.map((dia) => (
                <li
                  key={dia}
                  className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[12.5px] text-brand-soft"
                >
                  {dia}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-faint">Sem preferência.</p>
          )}
        </div>

        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            Períodos
          </p>
          {dados.periodos.length ? (
            <ul className="space-y-1">
              {dados.periodos.map((periodo) => (
                <li key={periodo} className="text-[13.5px] text-ink">
                  {periodo}
                  <span className="ml-1.5 text-faint">{PERIODO_HORARIO[periodo]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-faint">Sem preferência.</p>
          )}
        </div>

        {dados.observacao && (
          <p className="whitespace-pre-line border-t border-white/[.06] pt-3.5 text-[13.5px] leading-relaxed text-muted">
            {dados.observacao}
          </p>
        )}
      </div>
    </Card>
  );
}

function ParteRespostas({
  parte,
  diagnostico,
}: {
  parte: string;
  diagnostico: Diagnostico;
}) {
  const questions = DIAGNOSTIC_QUESTIONS.filter((q) => q.part === parte);

  return (
    <Card as="section">
      <CardHeader title={parte} />
      <ol className="divide-y divide-white/[.05]">
        {questions.map((q, i) => {
          const resposta = diagnostico.answers[q.id];
          const detalhe = detalheDe(diagnostico.answers, q.id);
          // Numa pergunta com relato, o texto responde mesmo sem opção marcada.
          const vazio = !isAnswered(resposta) && !detalhe;

          return (
            <li key={q.id} className="px-5 py-4">
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-faint tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-snug text-muted-2">{q.label}</p>

                  {vazio ? (
                    <p className="mt-2 text-[14px] italic text-faint">Não respondida.</p>
                  ) : Array.isArray(resposta) && q.type === "rank" ? (
                    // A posição é a resposta: etiquetas soltas perderiam a ordem.
                    <ol className="mt-2.5 space-y-1.5">
                      {resposta.map((item, ordem) => (
                        <li key={`${ordem}-${item}`} className="flex gap-2.5">
                          <span className="mt-px shrink-0 font-mono text-[12px] text-brand-soft tabular-nums">
                            {ordem + 1}º
                          </span>
                          <span className="text-[15px] leading-relaxed text-ink">{item}</span>
                        </li>
                      ))}
                    </ol>
                  ) : Array.isArray(resposta) ? (
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {resposta.map((opcao) => (
                        <li
                          key={opcao}
                          className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-[13px] text-brand-soft"
                        >
                          {opcao}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    resposta && (
                      <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                        {resposta}
                      </p>
                    )
                  )}

                  {detalhe && (
                    <p className="mt-3 whitespace-pre-line border-l-2 border-brand/30 pl-3.5 text-[15px] leading-relaxed text-ink">
                      {detalhe}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function Linha({ termo, valor, mono }: { termo: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-muted-2">{termo}</dt>
      <dd className={`min-w-0 truncate text-right text-ink ${mono ? "font-mono text-[12px]" : ""}`}>
        {valor}
      </dd>
    </div>
  );
}
