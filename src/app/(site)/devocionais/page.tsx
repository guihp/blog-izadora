import type { Metadata } from "next";
import Link from "next/link";
import { DevotionalCard } from "@/components/DevotionalCard";
import { PageHero } from "@/components/PageHero";
import { parseQ } from "@/components/PostListing";
import { getDevotionals } from "@/lib/data";
import { openGraph } from "@/lib/seo";

const DESCRIPTION =
  "Uma biblioteca de devocionais organizada por tema e passagem bíblica, como páginas de um diário espiritual.";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Devocionais",
    description: DESCRIPTION,
    alternates: { canonical: "/devocionais" },
    // As versões filtradas por tema/livro apontam para a página principal
    robots: parseQ(sp.tema) || parseQ(sp.livro) ? { index: false, follow: true } : undefined,
    openGraph: await openGraph({ title: "Devocionais", description: DESCRIPTION, url: "/devocionais" }),
  };
}

export default async function DevotionalsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const theme = parseQ(sp.tema);
  const book = parseQ(sp.livro);

  const all = await getDevotionals();
  const themes = [...new Set(all.map((d) => d.theme).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const books = [...new Set(all.map((d) => d.book).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const list = all.filter((d) => (!theme || d.theme === theme) && (!book || d.book === book));

  const hrefWith = (next: { tema?: string; livro?: string }) => {
    const params = new URLSearchParams();
    const t = "tema" in next ? next.tema : theme;
    const l = "livro" in next ? next.livro : book;
    if (t) params.set("tema", t);
    if (l) params.set("livro", l);
    const qs = params.toString();
    return qs ? `/devocionais?${qs}` : "/devocionais";
  };

  return (
    <>
      <PageHero
        eyebrow="Biblioteca"
        title={
          <>
            Um momento <em>com a Palavra</em>
          </>
        }
        text="Páginas do meu diário espiritual: uma passagem, um pouco de contexto, uma reflexão sincera e uma oração para levar no dia."
        image={{ src: "/images/pagina-devocionais.jpg", alt: "Bíblia antiga aberta junto à janela, com luz da manhã e um vaso de flores" }}
      />

      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="devo-filters">
          {themes.length > 0 && (
            <nav className="chips" aria-label="Filtrar por tema">
              <Link href={hrefWith({ tema: "" })} className="chip" aria-current={!theme ? "page" : undefined}>
                Todos os temas
              </Link>
              {themes.map((t) => (
                <Link key={t} href={hrefWith({ tema: t })} className="chip" aria-current={theme === t ? "page" : undefined}>
                  {t}
                </Link>
              ))}
            </nav>
          )}
          {books.length > 0 && (
            <form action="/devocionais" className="devo-filters__row">
              {theme && <input type="hidden" name="tema" value={theme} />}
              <label htmlFor="livro" className="hand" style={{ fontSize: "1.3rem" }}>
                passagem bíblica:
              </label>
              <select id="livro" name="livro" className="select" defaultValue={book}>
                <option value="">Todos os livros</option>
                {books.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn--ghost btn--sm">
                Filtrar
              </button>
            </form>
          )}
        </div>

        {list.length > 0 ? (
          <div className="devo-grid">
            {list.map((d, i) => (
              <DevotionalCard key={d.id} devotional={d} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Nenhum devocional por aqui</h2>
            <p>{all.length ? "Experimente outro tema ou livro." : "Os primeiros devocionais estão sendo preparados com carinho."}</p>
            {all.length > 0 && (
              <Link href="/devocionais" className="btn btn--ghost btn--sm">
                Ver todos
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}
