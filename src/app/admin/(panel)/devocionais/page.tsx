import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getAdminSession } from "@/lib/auth";
import type { Devotional } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { deleteDevotional, setWeeklyDevotional } from "../../actions";

export default async function AdminDevotionals() {
  const { supabase } = await getAdminSession();
  const { data } = await supabase.from("devotionals").select("*").order("published_at", { ascending: false, nullsFirst: true });
  const list = (data ?? []) as Devotional[];

  return (
    <>
      <header>
        <div>
          <h1>Devocionais</h1>
          <p>Escolha qual aparece como “Um momento com a Palavra” na página inicial.</p>
        </div>
        <Link href="/admin/devocionais/novo" className="btn btn--rose">
          + Novo devocional
        </Link>
      </header>
      <div className="panel">
        {list.length === 0 ? (
          <p>Nenhum devocional ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Referência</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link href={`/admin/devocionais/${d.id}`}>{d.title}</Link>{" "}
                      {d.is_weekly && <span className="badge">Da semana</span>} {d.is_demo && <span className="badge badge--demo">Exemplo</span>}
                    </td>
                    <td>{d.bible_reference}</td>
                    <td>
                      <span className={`badge${d.status === "draft" ? " badge--draft" : ""}`}>{d.status === "draft" ? "Rascunho" : "Publicado"}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(d.published_at) || "—"}</td>
                    <td>
                      <div className="actions">
                        {!d.is_weekly && d.status === "published" && (
                          <form action={setWeeklyDevotional}>
                            <input type="hidden" name="id" value={d.id} />
                            <button className="btn btn--ghost btn--sm" type="submit">
                              Tornar da semana
                            </button>
                          </form>
                        )}
                        <Link href={`/admin/devocionais/${d.id}`} className="btn btn--ghost btn--sm">
                          Editar
                        </Link>
                        <form action={deleteDevotional}>
                          <input type="hidden" name="id" value={d.id} />
                          <ConfirmButton message={`Excluir “${d.title}”?`}>Excluir</ConfirmButton>
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
