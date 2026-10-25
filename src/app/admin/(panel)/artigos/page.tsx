import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getAdminSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { deletePost } from "../../actions";

type Row = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  is_demo: boolean;
  category: { name: string } | null;
};

export default async function AdminPosts({ searchParams }: { searchParams: Promise<{ excluido?: string }> }) {
  const { excluido } = await searchParams;
  const { supabase } = await getAdminSession();
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, status, published_at, is_demo, category:categories(name)")
    .order("updated_at", { ascending: false });
  const posts = (data ?? []) as unknown as Row[];

  return (
    <>
      <header>
        <div>
          <h1>Artigos</h1>
          <p>Escreva, salve rascunhos e publique quando estiver pronta.</p>
        </div>
        <Link href="/admin/artigos/novo" className="btn btn--rose">
          + Novo artigo
        </Link>
      </header>
      {excluido && <div className="alert alert--ok">Artigo excluído.</div>}
      <div className="panel">
        {posts.length === 0 ? (
          <p>Nenhum artigo ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/artigos/${p.id}`}>{p.title}</Link>{" "}
                      {p.is_demo && <span className="badge badge--demo">Exemplo</span>}
                    </td>
                    <td>{p.category?.name ?? "—"}</td>
                    <td>
                      <span className={`badge${p.status === "draft" ? " badge--draft" : ""}`}>
                        {p.status === "draft" ? "Rascunho" : "Publicado"}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(p.published_at) || "—"}</td>
                    <td>
                      <div className="actions">
                        {p.status === "published" && (
                          <Link href={`/blog/${p.slug}`} target="_blank" className="btn btn--ghost btn--sm">
                            Ver
                          </Link>
                        )}
                        <Link href={`/admin/artigos/${p.id}`} className="btn btn--ghost btn--sm">
                          Editar
                        </Link>
                        <form action={deletePost}>
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmButton message={`Excluir “${p.title}”? Esta ação não pode ser desfeita.`}>Excluir</ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
