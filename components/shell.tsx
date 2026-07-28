"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiFileText, FiFolder, FiGrid } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Logo } from "./logo";

type NavItem = {
  href: "/" | "/diagnosticos" | "/projetos";
  label: string;
  icon: IconType;
  /** Rótulo auxiliar à direita (contagem, "em breve"…). */
  meta?: string;
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: FiGrid },
  { href: "/diagnosticos", label: "Diagnósticos", icon: FiFileText },
  { href: "/projetos", label: "Projetos", icon: FiFolder, meta: "fase 2" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Navegação lateral no desktop, barra inferior no mobile. */
export function Shell({
  children,
  fonte,
}: {
  children: React.ReactNode;
  /** Fonte de dados ativa, mostrada no rodapé da sidebar. */
  fonte: "demo" | "supabase";
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-white/[.06] bg-surface-2 md:flex">
        <div className="px-5 py-6">
          <Link href="/" aria-label="CodeSants CRM — ir para o dashboard">
            <Logo />
          </Link>
          <p className="mt-1.5 pl-[34px] font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            CRM
          </p>
        </div>

        <nav className="flex-1 px-3" aria-label="Navegação principal">
          <ul className="space-y-1">
            {NAV.map(({ href, label, icon: Icon, meta }) => {
              const ativo = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={ativo ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-colors ${
                      ativo
                        ? "bg-brand/10 text-ink-bright"
                        : "text-muted hover:bg-white/[.03] hover:text-ink"
                    }`}
                  >
                    <Icon
                      className={`h-[17px] w-[17px] shrink-0 ${ativo ? "text-brand" : "text-faint group-hover:text-muted"}`}
                      aria-hidden
                    />
                    <span className="flex-1">{label}</span>
                    {meta && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                        {meta}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <FonteDeDados fonte={fonte} />
      </aside>

      {/* ---- Conteúdo ---- */}
      <div className="min-w-0 pb-16 md:pb-0">{children}</div>

      {/* ---- Barra inferior (mobile) ---- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-white/[.07] bg-surface-2/95 backdrop-blur md:hidden"
        aria-label="Navegação principal"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const ativo = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                ativo ? "text-brand" : "text-muted-2"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function FonteDeDados({ fonte }: { fonte: "demo" | "supabase" }) {
  const demo = fonte === "demo";
  return (
    <div className="border-t border-white/[.06] px-5 py-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${demo ? "bg-warning" : "bg-good"}`}
          aria-hidden
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          {demo ? "Dados de exemplo" : "Supabase conectado"}
        </span>
      </div>
      {demo && (
        <p className="mt-2 text-[11px] leading-snug text-faint">
          Sem banco configurado: os envios do formulário não são gravados.
        </p>
      )}
    </div>
  );
}
