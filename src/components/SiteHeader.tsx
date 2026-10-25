"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/config/site";
import { CloseIcon, MenuIcon, SearchIcon } from "./icons";
import { Sparkle } from "./ornaments";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ siteName, footerPhrase }: { siteName: string; footerPhrase: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Fecha os painéis ao navegar
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Trava a rolagem e permite fechar com Esc
  useEffect(() => {
    const open = menuOpen || searchOpen;
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  // Borda e fundo mais firmes depois que a página começa a rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    if (q) router.push(`/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="container site-header__inner">
        <Link href="/" className="logo" aria-label={`${siteName} — página inicial`}>
          <Sparkle />
          <span>{siteName}</span>
        </Link>

        <nav className="main-nav" aria-label="Menu principal">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-btn" aria-label="Pesquisar no blog" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <Link href="/#newsletter" className="btn btn--sm header-cta">
            Receber as cartinhas
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="icon-btn menu-toggle"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mobile-menu__top">
            <Link href="/" className="logo">
              <Sparkle />
              <span>{siteName}</span>
            </Link>
            <button
              type="button"
              className="icon-btn"
              aria-label="Fechar menu"
              autoFocus
              onClick={() => {
                setMenuOpen(false);
                menuButton.current?.focus();
              }}
            >
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Menu principal (celular)">
            <ul>
              {NAV_LINKS.map((link, i) => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined}>
                    <span aria-hidden="true">0{i + 1}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mobile-menu__foot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/recortes/laco.webp" alt="" width={120} height={126} aria-hidden="true" />
            <p className="hand" style={{ fontSize: "1.5rem", margin: 0 }}>
              {footerPhrase}
            </p>
          </div>
        </div>
      )}

      {searchOpen && (
        <div
          className="search-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Pesquisar"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="search-dialog__panel">
            <form role="search" onSubmit={submitSearch}>
              <div className="search-field">
                <SearchIcon width={22} height={22} />
                <label htmlFor="site-search" className="sr-only">
                  O que você procura?
                </label>
                <input ref={searchInput} id="site-search" name="q" type="search" placeholder="O que você procura?" autoComplete="off" />
                <button type="button" className="icon-btn" aria-label="Fechar busca" onClick={() => setSearchOpen(false)}>
                  <CloseIcon />
                </button>
              </div>
            </form>
            <p className="search-dialog__hint">
              Busque por temas como <em>propósito</em>, <em>identidade</em> ou uma passagem como <em>João 15</em>.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
