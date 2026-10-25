import Link from "next/link";
import { POSTS_PER_PAGE } from "@/config/site";
import { getCategories, getPosts } from "@/lib/data";
import { SearchIcon } from "./icons";
import { Pagination } from "./Pagination";
import { PostCard } from "./PostCard";

/** Lista de artigos com busca, filtro por categoria e paginação (usada em /blog e /blog/categoria/...). */
export async function PostListing({ q, category, page }: { q: string; category?: string; page: number }) {
  const [{ posts, total }, categories] = await Promise.all([getPosts({ q, category, page }), getCategories()]);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const base = category ? `/blog/categoria/${category}` : "/blog";

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <>
      <div className="filters">
        <form role="search" action={base} className="search-box">
          <SearchIcon />
          <label htmlFor="blog-q" className="sr-only">
            Pesquisar por título ou conteúdo
          </label>
          <input id="blog-q" name="q" type="search" className="input" placeholder="Pesquisar nos textos…" defaultValue={q} />
          <button type="submit" className="btn btn--sm">
            Buscar
          </button>
        </form>
        <nav className="chips" aria-label="Filtrar por categoria">
          <Link href={q ? `/blog?q=${encodeURIComponent(q)}` : "/blog"} className="chip" aria-current={!category ? "page" : undefined}>
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog/categoria/${c.slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`}
              className="chip"
              aria-current={category === c.slug ? "page" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>

      {q && (
        <p className="results-info" role="status">
          {total === 0 ? "Nenhum texto" : total === 1 ? "1 texto" : `${total} textos`} para “{q}”
          {" · "}
          <Link href={base}>limpar busca</Link>
        </p>
      )}

      {posts.length > 0 ? (
        <div className="post-grid">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} priority={i < 3 && page === 1} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nada por aqui ainda</h2>
          <p>
            {q
              ? "Tente outra palavra, um tema como “propósito” ou uma passagem bíblica."
              : "Os textos desta categoria estão sendo escritos com carinho. Volte em breve ♡"}
          </p>
          <Link href="/blog" className="btn btn--ghost btn--sm">
            Ver todos os textos
          </Link>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </>
  );
}

export function parsePage(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function parseQ(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value ?? "").trim().slice(0, 80);
}
