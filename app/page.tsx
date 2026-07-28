import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiClock, FiFileText, FiTrendingUp } from "react-icons/fi";
import { BarrasRanqueadas, ColunasPeriodo } from "@/components/charts";
import { StatTile } from "@/components/stat-tile";
import { Avatar, Card, CardHeader, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { contarOpcoes, contarOpcoesOrdenado, porSemana, porStatus, resumo } from "@/lib/analytics";
import { getRepository } from "@/lib/data/repository";
import { iniciais, tempoRelativo } from "@/lib/format";
import { DIAGNOSTIC_QUESTIONS, QUESTIONS_BY_ID } from "@/lib/questions";
import { STATUS_LABEL } from "@/lib/types";

export const metadata = { title: "Dashboard" };

// Os dados mudam a cada envio do formulário: sempre renderizar na requisição.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const repo = getRepository();
  const diagnosticos = await repo.listDiagnosticos();

  const kpis = resumo(diagnosticos);
  const semanas = porSemana(diagnosticos);
  const status = porStatus(diagnosticos);
  const faturamento = contarOpcoes(diagnosticos, "q9");
  const decisao = contarOpcoesOrdenado(diagnosticos, "q7");
  const acao = contarOpcoesOrdenado(diagnosticos, "q12");
  const evitar = contarOpcoesOrdenado(diagnosticos, "q18");
  const materiais = contarOpcoesOrdenado(diagnosticos, "q20");
  const recentes = diagnosticos.slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="O que os diagnósticos estão dizendo sobre quem procura a CodeSants."
        action={
          <Link
            href="/diagnosticos"
            className="inline-flex items-center gap-2 rounded-full border border-white/[.1] bg-panel px-4 py-2.5 text-[14px] text-ink transition-colors hover:border-brand/40 hover:text-ink-bright"
          >
            Ver todos os diagnósticos
            <FiArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <div className="space-y-6 px-6 py-7 sm:px-9">
        {/* ---- KPIs ---- */}
        <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Diagnósticos recebidos"
            value={kpis.total}
            hint="desde o início"
            icon={<FiFileText className="h-4 w-4" aria-hidden />}
          />
          <StatTile
            label="Últimos 7 dias"
            value={kpis.ultimos7}
            delta={kpis.variacao7}
            hint="vs. 7 dias anteriores"
            icon={<FiTrendingUp className="h-4 w-4" aria-hidden />}
          />
          <StatTile
            label="Preenchimento médio"
            value={kpis.completudeMedia}
            suffix="%"
            hint={`das ${DIAGNOSTIC_QUESTIONS.length} perguntas`}
            icon={<FiCheckCircle className="h-4 w-4" aria-hidden />}
          />
          <StatTile
            label="Em aberto"
            value={kpis.emAberto}
            hint={
              kpis.taxaGanho == null
                ? "nenhum caso decidido ainda"
                : `${kpis.taxaGanho}% de aproveitamento`
            }
            icon={<FiClock className="h-4 w-4" aria-hidden />}
          />
        </section>

        {/* ---- Volume + pipeline ---- */}
        <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Card>
            <CardHeader
              title="Diagnósticos por semana"
              subtitle="Últimas 8 semanas. Passe o cursor para ver cada semana."
            />
            <ColunasPeriodo dados={semanas} />
          </Card>

          <Card>
            <CardHeader title="Pipeline" subtitle="Onde cada diagnóstico está hoje." />
            <ul className="space-y-2.5 px-5 py-5">
              {status.map(({ status: s, value }) => (
                <li key={s} className="flex items-center justify-between gap-3">
                  <StatusBadge status={s} />
                  <span className="font-mono text-[13px] tabular-nums text-ink">{value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ---- Leitura estratégica ---- */}
        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader
              title={QUESTIONS_BY_ID.q9.short}
              subtitle="Faixa de faturamento mensal declarada."
            />
            <BarrasRanqueadas
              dados={faturamento}
              total={diagnosticos.length}
              sequencial
              neutros={["Prefiro não informar"]}
            />
          </Card>

          <Card>
            <CardHeader
              title={QUESTIONS_BY_ID.q7.short}
              subtitle="O que convence o cliente a contratar. Múltipla escolha."
            />
            <BarrasRanqueadas dados={decisao} total={diagnosticos.length} />
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader
              title={QUESTIONS_BY_ID.q12.short}
              subtitle="A atitude que o site deve provocar no visitante."
            />
            <BarrasRanqueadas dados={acao} total={diagnosticos.length} />
          </Card>

          <Card>
            <CardHeader
              title={QUESTIONS_BY_ID.q18.short}
              subtitle="Percepções que a marca precisa evitar. Múltipla escolha."
            />
            <BarrasRanqueadas dados={evitar} total={diagnosticos.length} />
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
          <Card>
            <CardHeader
              title={QUESTIONS_BY_ID.q20.short}
              subtitle="O que o cliente já tem pronto ao entrar no projeto."
            />
            <BarrasRanqueadas
              dados={materiais}
              total={diagnosticos.length}
              cor="var(--color-cat-3)"
            />
          </Card>

          {/* ---- Últimos recebidos ---- */}
          <Card>
            <CardHeader
              title="Últimos recebidos"
              action={
                <Link
                  href="/diagnosticos"
                  className="text-[13px] text-brand transition-opacity hover:opacity-80"
                >
                  ver todos
                </Link>
              }
            />
            {recentes.length === 0 ? (
              <EmptyState
                title="Nenhum diagnóstico ainda"
                description="Assim que alguém concluir o formulário, o registro aparece aqui."
              />
            ) : (
              <ul className="divide-y divide-white/[.05]">
                {recentes.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/diagnosticos/${d.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[.025]"
                    >
                      <Avatar initials={iniciais(d.nome || d.empresa)} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-ink-bright">
                          {d.empresa || "Empresa não informada"}
                        </span>
                        <span className="block truncate text-[12.5px] text-muted-2">
                          {d.nome} · {tempoRelativo(d.criadoEm)}
                        </span>
                      </span>
                      <span className="hidden shrink-0 sm:block">
                        <StatusBadge status={d.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <p className="pb-2 text-[12px] text-faint">
          Pipeline considera {STATUS_LABEL.novo}, {STATUS_LABEL.em_analise} e{" "}
          {STATUS_LABEL.proposta} como em aberto.
        </p>
      </div>
    </>
  );
}
