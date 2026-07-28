import type { ReactNode } from "react";
import { STATUS_LABEL, type Status } from "@/lib/types";

/* ============================================================
   Blocos base do CRM — mesma linguagem visual do site e do forms.
   ============================================================ */

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={`rounded-[16px] border border-white/[.07] bg-surface/80 backdrop-blur-sm ${className}`}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[.05] px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-bright">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-[13px] text-muted-2">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_#3ddc84]" />
      <span className="eyebrow">{children}</span>
    </span>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  novo: "border-brand/35 bg-brand/12 text-brand-soft",
  em_analise: "border-cat-3/40 bg-cat-3/12 text-[#8fb4ee]",
  proposta: "border-warning/40 bg-warning/12 text-[#e0b263]",
  ganho: "border-good/45 bg-good/15 text-[#79d3a4]",
  perdido: "border-serious/40 bg-serious/12 text-[#e59a94]",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${STATUS_STYLE[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/[.08] bg-panel px-2.5 py-1 text-[12px] text-muted">
      {children}
    </span>
  );
}

/** Barra de progresso fina. `label` é obrigatório para leitores de tela. */
export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/[.07]"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[.08] bg-panel">
        <span className="h-2 w-2 rounded-full bg-faint" />
      </div>
      <h3 className="font-display text-[16px] font-semibold text-ink-bright">{title}</h3>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted-2">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="app-grid border-b border-white/[.05] px-6 py-8 sm:px-9 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(26px,3.2vw,36px)] font-bold leading-[1.1] tracking-[-0.025em] text-ink-bright">
            {title}
          </h1>
          {description && (
            <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-muted">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}

/** Avatar com iniciais — sem imagem, sem requisição externa. */
export function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/25 bg-brand/10 font-display text-[13px] font-semibold text-brand-soft"
    >
      {initials}
    </span>
  );
}
