import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-grid flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="mt-4 font-display text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.03em] text-ink-bright">
        Não encontramos essa página
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        O registro pode ter sido removido, ou o endereço está incorreto.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center rounded-full bg-gradient-to-r from-brand to-brand-2 px-6 py-3 text-[14px] font-semibold text-ink-invert transition-opacity hover:opacity-90"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
