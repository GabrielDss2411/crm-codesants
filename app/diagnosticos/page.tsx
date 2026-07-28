import { DiagnosticosLista } from "@/components/diagnosticos-lista";
import { PageHeader } from "@/components/ui";
import { getRepository } from "@/lib/data/repository";

export const metadata = { title: "Diagnósticos" };
export const dynamic = "force-dynamic";

export default async function DiagnosticosPage() {
  const diagnosticos = await getRepository().listDiagnosticos();

  return (
    <>
      <PageHeader
        eyebrow="Base"
        title="Diagnósticos"
        description="Tudo que chegou pelo formulário de Diagnóstico Estratégico."
      />
      <div className="px-6 py-7 sm:px-9">
        <DiagnosticosLista diagnosticos={diagnosticos} />
      </div>
    </>
  );
}
