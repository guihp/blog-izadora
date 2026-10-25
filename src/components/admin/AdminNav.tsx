"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/estatisticas", label: "Estatísticas" },
  { href: "/admin/artigos", label: "Artigos" },
  { href: "/admin/devocionais", label: "Devocionais" },
  { href: "/admin/videos", label: "Vídeos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/configuracoes", label: "Página inicial e textos" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Menu do painel">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
