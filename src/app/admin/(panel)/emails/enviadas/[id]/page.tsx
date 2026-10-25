import Link from "next/link";
import { notFound } from "next/navigation";
import { refreshCampaign } from "@/app/admin/newsletter-actions";
import { getCampaign } from "@/lib/brevo";
import { getCampaignRecipients, type RecipientStatus } from "@/lib/email-reports";
import { CAMPAIGN_STATUS, fmtDate, Funnel, number, percent, safe, StatusBadge, subscriberHref } from "../../shared";

const FILTERS: { key: string; label: string; match: (s: RecipientStatus) => boolean }[] = [
  { key: "todas", label: "Todas", match: () => true },
  { key: "abriram", label: "Abriram", match: (s) => s === "opened" || s === "clicked" },
  { key: "clicaram", label: "Clicaram", match: (s) => s === "clicked" },
  { key: "nao-abriram", label: "Não abriram", match: (s) => s === "delivered" || s === "sent" },
  { key: "problemas", label: "Problemas", match: (s) => s === "bounced" || s === "complaint" || s === "unsubscribed" },
];

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ filtro?: string; q?: string; enviada?: string }> };

export default async function CampaignPage({ params, searchParams }: Props) {
  const [{ id: rawId }, { filtro, q = "", enviada }] = await Promise.all([params, searchParams]);
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const campaign = await safe(() => getCampaign(id));
  if (campaign.error) return <div className="alert alert--error">{campaign.error}</div>;
  const c = campaign.data;
  if (!c) notFound();

  const isSent = c.status === "sent";
  const report = isSent ? await safe(() => getCampaignRecipients(id, c.recipients?.lists ?? [])) : { data: null, error: null };
  const all = report.data?.recipients ?? [];
  const s = c.statistics?.globalStats ?? {};
  const filter = FILTERS.find((f) => f.key === filtro) ?? FILTERS[0];
  const term = q.trim().toLowerCase();
  const rows = all.filter((r) => filter.match(r.status) && (!term || r.email.includes(term)));
  const links = Object.entries(c.statistics?.linksStats ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <p>
        <Link href="/admin/emails/enviadas" className="text-link">
          ← Todas as cartinhas
        </Link>
      </p>
      {enviada && <div className="alert alert--ok">Cartinha enviada! ♡ Os números aparecem aos poucos, conforme as pessoas abrem.</div>}

      <section className="panel">
        <div className="panel__head">
          <h2>{c.subject || c.name}</h2>
          <span className={`badge ${isSent ? "badge--ok" : "badge--muted"}`}>{CAMPAIGN_STATUS[c.status] ?? c.status}</span>
        </div>
        <dl className="kv">
          <dt>Enviada em</dt>
          <dd>{fmtDate(c.sentDate ?? c.scheduledAt)}</dd>
          <dt>De</dt>
          <dd>{c.sender ? `${c.sender.name} <${c.sender.email}>` : "—"}</dd>
          {c.previewText && (
            <>
              <dt>Pré-cabeçalho</dt>
              <dd>{c.previewText}</dd>
            </>
          )}
          <dt>Nome interno</dt>
          <dd>{c.name}</dd>
        </dl>
      </section>

      {isSent && (
        <>
          <div className="stats">
            <div className="stat">
              <strong>{number.format(s.delivered ?? 0)}</strong>
              <span>entregues de {number.format(s.sent ?? 0)}</span>
            </div>
            <div className="stat">
              <strong>{percent(s.uniqueViews, s.delivered)}</strong>
              <span>abriram ({number.format(s.uniqueViews ?? 0)})</span>
            </div>
            <div className="stat">
              <strong>{percent(s.uniqueClicks, s.delivered)}</strong>
              <span>clicaram ({number.format(s.uniqueClicks ?? 0)})</span>
            </div>
            <div className="stat">
              <strong>{number.format((s.hardBounces ?? 0) + (s.softBounces ?? 0))}</strong>
              <span>não entregues</span>
            </div>
            <div className="stat">
              <strong>{number.format(s.unsubscriptions ?? 0)}</strong>
              <span>cancelaram</span>
            </div>
          </div>

          <div className="stats-grid">
            <section className="panel rank">
              <h2>Funil</h2>
              <Funnel
                rows={[
                  ["Entregues", s.delivered ?? 0],
                  ["Abriram", s.uniqueViews ?? 0],
                  ["Clicaram", s.uniqueClicks ?? 0],
                ]}
              />
            </section>
            <section className="panel rank">
              <h2>Links clicados</h2>
              {links.length ? (
                <ol>
                  {links.map(([url, count]) => (
                    <li key={url}>
                      <span className="rank__label">
                        <a href={url} target="_blank" rel="noreferrer">
                          {url.replace(/^https?:\/\//, "")}
                        </a>
                      </span>
                      <span className="rank__value">{number.format(count)}</span>
                      <span className="rank__bar" style={{ width: `${(count / links[0][1]) * 100}%` }} aria-hidden="true" />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="muted">Nenhum clique ainda.</p>
              )}
            </section>
          </div>

          <section className="panel">
            <div className="panel__head">
              <h2>Quem recebeu</h2>
              <form action={refreshCampaign}>
                <input type="hidden" name="id" value={id} />
                <button className="btn btn--ghost btn--sm" type="submit">
                  Atualizar
                </button>
              </form>
            </div>
            {report.error && <div className="alert alert--error">{report.error}</div>}
            {report.data && report.data.unchecked > 0 && (
              <div className="alert alert--info">
                O Brevo demorou para responder sobre {report.data.unchecked} pessoa(s), que ficaram de fora da lista abaixo. Clique em
                “Atualizar” daqui a pouco.
              </div>
            )}
            <div className="toolbar">
              <nav className="segmented" aria-label="Filtrar">
                {FILTERS.map((f) => (
                  <Link
                    key={f.key}
                    href={`?filtro=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    aria-current={f.key === filter.key ? "page" : undefined}
                  >
                    {f.label} ({all.filter((r) => f.match(r.status)).length})
                  </Link>
                ))}
              </nav>
              <form className="toolbar" style={{ margin: 0, flex: 1 }}>
                <input type="hidden" name="filtro" value={filter.key} />
                <input className="control" type="search" name="q" defaultValue={q} placeholder="Buscar e-mail" aria-label="Buscar e-mail" />
              </form>
            </div>
            {rows.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Situação</th>
                      <th>Aberturas</th>
                      <th>Cliques</th>
                      <th>Abriu em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.email}>
                        <td>
                          <Link href={subscriberHref(r.email)}>{r.email}</Link>
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>{r.opens || "—"}</td>
                        <td title={r.links.join("\n")}>{r.clicks || "—"}</td>
                        <td className="muted">{fmtDate(r.openedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              report.data && <p className="muted">Ninguém nesta categoria.</p>
            )}
            {report.data && (
              <small className="muted">
                Conferido em {fmtDate(report.data.generatedAt)} com as {number.format(report.data.checked)} pessoas da lista
                {report.data.truncated ? " (só as mais recentes)" : ""}. Quem saiu da lista depois do envio não aparece aqui; o
                relatório completo fica no Brevo.
              </small>
            )}
          </section>
        </>
      )}

      {c.htmlContent && (
        <section className="panel email-preview">
          <div className="panel__head">
            <h2>Como a cartinha chegou</h2>
            <a className="text-link" href={`https://app.brevo.com/marketing-campaign/report/${id}`} target="_blank" rel="noreferrer">
              Relatório no Brevo ↗
            </a>
          </div>
          <iframe title="Cartinha enviada" srcDoc={c.htmlContent} sandbox="" />
        </section>
      )}
    </>
  );
}
