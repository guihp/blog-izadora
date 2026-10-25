"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/emails", label: "Visão geral" },
  { href: "/admin/emails/nova", label: "Escrever" },
  { href: "/admin/emails/enviadas", label: "Enviadas" },
  { href: "/admin/emails/automaticos", label: "Automáticos" },
  { href: "/admin/emails/inscritas", label: "Inscritas" },
  { href: "/admin/emails/configuracao", label: "Configuração" },
];

export function EmailsNav() {
  const pathname = usePathname();
  return (
    <nav className="segmented tabs" aria-label="Seções de e-mails">
      {TABS.map((t) => {
        const active = t.href === "/admin/emails" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
