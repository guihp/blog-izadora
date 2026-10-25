import Link from "next/link";
import { removeSubscriber } from "@/app/admin/newsletter-actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { BREVO_LIST_ID, getAllListContacts } from "@/lib/brevo";
import { fmtDate, number, safe, subscriberHref } from "../shared";

const PAGE_SIZE = 50;

type Props = { searchParams: Promise<{ q?: string; situacao?: string; pagina?: string; removida?: string }> };

export default async function SubscribersPage({ searchParams }: Props) {
  const { q = "", situacao, pagina, removida } = await searchParams;
  const contacts = BREVO_LIST_ID ? await safe(() => getAllListContacts(BREVO_LIST_ID!)) : { data: null, error: "BREVO_LIST_ID não definido." };
  const all = contacts.data ?? [];
  const cancelled = (c: (typeof all)[number]) => c.emailBlacklisted || Boolean(c.listUnsubscribed?.includes(BREVO_LIST_ID ?? -1));

  const filters = [
    { key: "todas", label: "Todas", match: () => true },
    { key: "ativas", label: "Ativas", match: (c: (typeof all)[number]) => !cancelled(c) },
    { key: "canceladas", label: "Cancelaram", match: cancelled },
  ];
  const filter = filters.find((f) => f.key === situacao) ?? filters[0];
  const term = q.trim().toLowerCase();
  const filtered = all.filter((c) => filter.match(c) && (!term || c.email.includes(term)));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(pagina) || 1));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const qs = (p: Record<string, string | number>) =>
    "?" + new URLSearchParams({ situacao: filter.key, ...(q ? { q } : {}), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) });

  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Inscritas</h2>
        <a className="btn btn--ghost btn--sm" href="/admin/emails/inscritas/exportar" download>
          Baixar planilha (CSV)
        </a>
      </div>
      {removida && <div className="alert alert--ok">Pessoa removida da lista das cartinhas.</div>}
      {contacts.error && <div className="alert alert--error">{contacts.error}</div>}

      <div className="toolbar">
        <nav className="segmented" aria-label="Situação">
          {filters.map((f) => (
            <Link key={f.key} href={`?situacao=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={f.key === filter.key ? "page" : undefined}>
              {f.label} ({all.filter(f.match).length})
            </Link>
          ))}
        </nav>
        <form className="toolbar" style={{ margin: 0, flex: 1 }}>
          <input type="hidden" name="situacao" value={filter.key} />
          <input className="control" type="search" name="q" defaultValue={q} placeholder="Buscar e-mail" aria-label="Buscar e-mail" />
        </form>
      </div>

      {rows.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Inscrita em</th>
                <th>Situação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.email}>
                  <td>
                    <Link href={subscriberHref(c.email)}>{c.email}</Link>
                  </td>
                  <td className="muted">{fmtDate(c.createdAt)}</td>
                  <td>{cancelled(c) ? <span className="badge badge--warn">Cancelou</span> : <span className="badge badge--ok">Ativa</span>}</td>
                  <td>
                    <form action={removeSubscriber} className="actions">
                      <input type="hidden" name="email" value={c.email} />
                      <ConfirmButton message={`Remover ${c.email} da lista das cartinhas?`}>Remover</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !contacts.error && <p className="muted">{all.length ? "Ninguém encontrado com esse filtro." : "Ninguém se inscreveu ainda."}</p>
      )}

      {pages > 1 && (
        <nav className="pager" aria-label="Páginas">
          {page > 1 && (
            <Link className="btn btn--ghost btn--sm" href={qs({ pagina: page - 1 })}>
              ← Anterior
            </Link>
          )}
          <span>
            Página {page} de {pages} · {number.format(filtered.length)} pessoas
          </span>
          {page < pages && (
            <Link className="btn btn--ghost btn--sm" href={qs({ pagina: page + 1 })}>
              Próxima →
            </Link>
          )}
        </nav>
      )}
      <small className="muted">Os e-mails ficam guardados no Brevo, não no banco do blog. Remover tira a pessoa só desta lista.</small>
    </section>
  );
}
