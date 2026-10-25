import Link from "next/link";
import { notFound } from "next/navigation";
import { removeSubscriber } from "@/app/admin/newsletter-actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { BREVO_LIST_ID, getCampaigns, getContact, getContactStats, getTransactionalEvents } from "@/lib/brevo";
import { groupTransactional, recipientFromStats } from "@/lib/email-reports";
import { isValidEmail } from "@/lib/utils";
import { fmtDate, safe, StatusBadge } from "../../shared";

type Props = { params: Promise<{ email: string }> };

export default async function SubscriberPage({ params }: Props) {
  const email = decodeURIComponent((await params).email).trim().toLowerCase();
  if (!isValidEmail(email)) notFound();

  const [contact, stats, campaigns, events] = await Promise.all([
    safe(() => getContact(email)),
    safe(() => getContactStats(email)),
    safe(() => getCampaigns(100)),
    safe(() => getTransactionalEvents({ email, days: 90 })),
  ]);
  const error = contact.error ?? stats.error;
  const c = contact.data;

  const history = (campaigns.data ?? [])
    .map((camp) => ({ camp, r: stats.data ? recipientFromStats(email, stats.data, camp.id) : null }))
    .filter((x) => x.r !== null);
  const automatic = groupTransactional(events.data ?? []);
  const inList = Boolean(c && BREVO_LIST_ID && c.listIds?.includes(BREVO_LIST_ID));
  const cancelled = Boolean(c && (c.emailBlacklisted || (BREVO_LIST_ID && c.listUnsubscribed?.includes(BREVO_LIST_ID))));

  return (
    <>
      <p>
        <Link href="/admin/emails/inscritas" className="text-link">
          ← Todas as inscritas
        </Link>
      </p>
      {error && <div className="alert alert--error">{error}</div>}

      <section className="panel">
        <div className="panel__head">
          <h2 style={{ wordBreak: "break-all" }}>{email}</h2>
          {c &&
            (cancelled ? (
              <span className="badge badge--warn">Cancelou a inscrição</span>
            ) : inList ? (
              <span className="badge badge--ok">Ativa</span>
            ) : (
              <span className="badge badge--muted">Fora da lista</span>
            ))}
        </div>
        {c ? (
          <dl className="kv">
            <dt>Inscrita em</dt>
            <dd>{fmtDate(c.createdAt)}</dd>
            <dt>Última alteração</dt>
            <dd>{fmtDate(c.modifiedAt)}</dd>
            <dt>Cartinhas recebidas</dt>
            <dd>{history.length}</dd>
            <dt>Abriu</dt>
            <dd>{history.filter((h) => h.r!.opens > 0).length}</dd>
          </dl>
        ) : (
          !error && <p className="muted">Este e-mail não está no Brevo (pode ter sido apagado).</p>
        )}
        {inList && (
          <form action={removeSubscriber} style={{ marginTop: 16 }}>
            <input type="hidden" name="email" value={email} />
            <ConfirmButton message={`Remover ${email} da lista das cartinhas?`}>Remover da lista</ConfirmButton>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>Cartinhas</h2>
        {history.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Cartinha</th>
                  <th>Recebida em</th>
                  <th>Situação</th>
                  <th>Aberturas</th>
                  <th>Cliques</th>
                </tr>
              </thead>
              <tbody>
                {history.map(({ camp, r }) => (
                  <tr key={camp.id}>
                    <td>
                      <Link href={`/admin/emails/enviadas/${camp.id}`}>{camp.subject || camp.name}</Link>
                    </td>
                    <td className="muted">{fmtDate(r!.sentAt ?? camp.sentDate)}</td>
                    <td>
                      <StatusBadge status={r!.status} />
                    </td>
                    <td>{r!.opens || "—"}</td>
                    <td title={r!.links.join("\n")}>{r!.clicks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Ainda não recebeu nenhuma cartinha da lista.</p>
        )}
      </section>

      <section className="panel">
        <h2>E-mails automáticos (90 dias)</h2>
        {automatic.length ? (
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {automatic.map((m) => (
                  <tr key={m.messageId}>
                    <td>{m.subject}</td>
                    <td className="muted">{m.kind}</td>
                    <td className="muted">{fmtDate(m.sentAt)}</td>
                    <td title={m.reason}>
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Nenhum e-mail automático para esta pessoa no período.</p>
        )}
      </section>
    </>
  );
}
