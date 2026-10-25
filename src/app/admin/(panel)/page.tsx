import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { getNewsletterProvider } from "@/lib/newsletter";
import { formatDate } from "@/lib/utils";
import { importDemoContent, removeDemoContent } from "../actions";

type Props = { searchParams: Promise<{ demo?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  const { demo } = await searchParams;
  const { supabase } = await getAdminSession();

  const count = async (table: string, filter?: [string, string | boolean]) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return (await q).count ?? 0;
  };

  const [published, drafts, devotionals, videos, demoCount, recent] = await Promise.all([
    count("posts", ["status", "published"]),
    count("posts", ["status", "draft"]),
    count("devotionals"),
    count("videos"),
    Promise.all([count("posts", ["is_demo", true]), count("devotionals", ["is_demo", true]), count("videos", ["is_demo", true])]).then(
      (n) => n.reduce((a, b) => a + b, 0),
    ),
    supabase.from("posts").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);
  const newsletter = getNewsletterProvider();

  return (
    <>
      <header>
        <div>
          <h1>Olá! ♡</h1>
          <p>O que vamos escrever hoje?</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/artigos/novo" className="btn btn--rose">
            + Novo artigo
          </Link>
          <Link href="/admin/devocionais/novo" className="btn btn--ghost">
            + Novo devocional
          </Link>
        </div>
      </header>

      {demo === "importado" && <div className="alert alert--ok">Conteúdo de exemplo importado. Ele aparece com o selo “Exemplo”.</div>}
      {demo === "removido" && <div className="alert alert--ok">Conteúdo de exemplo removido.</div>}

      <div className="stats">
        <Link href="/admin/artigos" className="stat">
          <strong>{published}</strong>
          <span>artigos publicados</span>
        </Link>
        <Link href="/admin/artigos" className="stat">
          <strong>{drafts}</strong>
          <span>rascunhos</span>
        </Link>
        <Link href="/admin/devocionais" className="stat">
          <strong>{devotionals}</strong>
          <span>devocionais</span>
        </Link>
        <Link href="/admin/videos" className="stat">
          <strong>{videos}</strong>
          <span>vídeos</span>
        </Link>
      </div>

      <section className="panel">
        <h2>Editados recentemente</h2>
        {recent.data && recent.data.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {recent.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/artigos/${p.id}`}>{p.title}</Link>
                    </td>
                    <td>
                      <span className={`badge${p.status === "draft" ? " badge--draft" : ""}`}>{p.status === "draft" ? "Rascunho" : "Publicado"}</span>
                    </td>
                    <td style={{ color: "var(--ink-soft)" }}>{formatDate(p.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhum artigo ainda. Que tal escrever o primeiro?</p>
        )}
      </section>

      <section className="panel">
        <h2>Integrações</h2>
        <ul className="help-list" style={{ listStyle: "none", paddingLeft: 0 }}>
          <li>
            <span className="status-dot">Banco de dados e login (Supabase): conectado</span>
          </li>
          <li>
            {newsletter ? (
              <span className="status-dot">Newsletter: conectada ({newsletter})</span>
            ) : (
              <span className="status-dot status-dot--off">
                Newsletter: não configurada — o formulário avisa às visitantes que as inscrições ainda não estão abertas.
                Configure <code>NEWSLETTER_PROVIDER</code> e a chave do serviço (veja o README).
              </span>
            )}
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Conteúdo de exemplo</h2>
        <p>
          Importe os 8 textos, 4 devocionais e 4 vídeos de demonstração para ver o site preenchido. Eles ficam marcados
          como “Exemplo” e podem ser removidos de uma vez quando você publicar seus próprios conteúdos.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <form action={importDemoContent}>
            <button className="btn btn--ghost btn--sm" type="submit">
              Importar exemplos
            </button>
          </form>
          {demoCount > 0 && (
            <form action={removeDemoContent}>
              <button className="btn btn--danger btn--sm" type="submit">
                Remover {demoCount} itens de exemplo
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
