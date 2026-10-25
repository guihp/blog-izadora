import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { parseQ } from "@/components/PostListing";
import { getDevotionals, getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Busca", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SearchPage({ searchParams }: Props) {
  const q = parseQ((await searchParams).q);
  const [{ posts }, devotionals] = q
    ? await Promise.all([getPosts({ q, pageSize: 30 }), getDevotionals({ q })])
    : [{ posts: [] }, []];
  const total = posts.length + devotionals.length;

  return (
    <>
      <header className="page-hero container">
        <span className="eyebrow">Busca</span>
        <h1>
          O que você <em>procura?</em>
        </h1>
      </header>
      <section className="container container--narrow" style={{ paddingBottom: 40 }}>
        <form role="search" action="/busca" className="search-box" style={{ marginBottom: 32 }}>
          <SearchIcon />
          <label htmlFor="busca-q" className="sr-only">
            Pesquisar
          </label>
          <input id="busca-q" name="q" type="search" className="input" defaultValue={q} placeholder="Ex.: propósito, João 15…" />
          <button className="btn btn--sm" type="submit">
            Buscar
          </button>
        </form>

        {q && (
          <p className="results-info" role="status">
            {total === 0 ? "Nenhum resultado" : total === 1 ? "1 resultado" : `${total} resultados`} para “{q}”
          </p>
        )}

        <div className="search-results">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="search-result">
              <span className="category-link">Texto · {p.category?.name ?? "Blog"}</span>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </Link>
          ))}
          {devotionals.map((d) => (
            <Link key={d.id} href={`/devocionais/${d.slug}`} className="search-result">
              <span className="category-link">
                Devocional · {d.bible_reference} {d.published_at ? `· ${formatDate(d.published_at)}` : ""}
              </span>
              <h3>{d.title}</h3>
              <p>{d.summary}</p>
            </Link>
          ))}
        </div>

        {q && total === 0 && (
          <div className="empty-state">
            <h2>Nada encontrado</h2>
            <p>Tente outra palavra ou explore os textos pelo blog.</p>
            <Link href="/blog" className="btn btn--ghost btn--sm">
              Ir para o blog
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
