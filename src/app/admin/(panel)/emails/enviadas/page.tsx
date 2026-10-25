import Link from "next/link";
import { getCampaigns } from "@/lib/brevo";
import { CAMPAIGN_STATUS, fmtDate, number, percent, safe } from "../shared";

export default async function SentPage() {
  const campaigns = await safe(() => getCampaigns(50));
  const list = campaigns.data ?? [];

  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Cartinhas enviadas</h2>
        <Link href="/admin/emails/nova" className="btn btn--rose btn--sm">
          + Escrever
        </Link>
      </div>
      {campaigns.error && <div className="alert alert--error">{campaigns.error}</div>}
      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Cartinha</th>
                <th>Situação</th>
                <th>Entregues</th>
                <th>Abertura</th>
                <th>Cliques</th>
                <th>Cancelaram</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const s = c.statistics?.globalStats ?? {};
                return (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/emails/enviadas/${c.id}`}>{c.subject || c.name}</Link>
                      <br />
                      <small className="muted">{fmtDate(c.sentDate ?? c.scheduledAt ?? c.createdAt)}</small>
                    </td>
                    <td>
                      <span className={`badge ${c.status === "sent" ? "badge--ok" : "badge--muted"}`}>{CAMPAIGN_STATUS[c.status] ?? c.status}</span>
                    </td>
                    <td>{s.delivered !== undefined ? number.format(s.delivered) : "—"}</td>
                    <td>{percent(s.uniqueViews, s.delivered)}</td>
                    <td>{percent(s.uniqueClicks, s.delivered)}</td>
                    <td>{s.unsubscriptions !== undefined ? number.format(s.unsubscriptions) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !campaigns.error && <p>Nenhuma cartinha enviada ainda.</p>
      )}
      <small className="muted">
        Também aparecem aqui as campanhas criadas direto no Brevo. A abertura é aproximada: o app de e-mail do iPhone, por
        exemplo, abre as mensagens sozinho para proteger a privacidade.
      </small>
    </section>
  );
}
