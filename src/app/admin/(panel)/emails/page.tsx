import Link from "next/link";
import { BREVO_LIST_ID, getAllListContacts, getCampaigns, getDomain, getSendCredits, getTransactionalEvents } from "@/lib/brevo";
import { groupTransactional } from "@/lib/email-reports";
import { fmtDate, Funnel, number, percent, safe, StatusBadge, subscriberHref } from "./shared";

const DAY = 86_400_000;

export default async function EmailsOverview() {
  const [contacts, campaigns, credits, domain, events] = await Promise.all([
    BREVO_LIST_ID ? safe(() => getAllListContacts(BREVO_LIST_ID!)) : Promise.resolve({ data: null, error: "BREVO_LIST_ID não definido." }),
    safe(() => getCampaigns(20)),
    safe(() => getSendCredits()),
    safe(() => getDomain()),
    safe(() => getTransactionalEvents({ days: 30 })),
  ]);
  const error = contacts.error ?? campaigns.error;

  const all = contacts.data ?? [];
  const isActive = (c: (typeof all)[number]) => !c.emailBlacklisted && !c.listUnsubscribed?.includes(BREVO_LIST_ID ?? -1);
  const active = all.filter(isActive);
  const since = Date.now() - 30 * DAY;
  const newIn30 = all.filter((c) => new Date(c.createdAt).getTime() >= since).length;
  const cancelled = all.length - active.length;

  const sent = (campaigns.data ?? []).filter((c) => c.status === "sent");
  const recent = sent.slice(0, 5);
  const sum = (f: (s: NonNullable<NonNullable<(typeof sent)[number]["statistics"]>["globalStats"]>) => number | undefined) =>
    recent.reduce((n, c) => n + (f(c.statistics?.globalStats ?? {}) ?? 0), 0);
  const delivered = sum((s) => s.delivered);
  const last = sent[0];
  const lastStats = last?.statistics?.globalStats ?? {};

  const messages = groupTransactional(events.data ?? []);
  const welcomes = messages.filter((m) => m.kind === "Boas-vindas");

  return (
    <>
      {error && <div className="alert alert--error">{error}</div>}
      {domain.data && !domain.data.authenticated && (
        <div className="alert alert--info">
          O domínio do e-mail ainda não está autenticado, então as cartinhas têm mais chance de cair no spam.{" "}
          <Link href="/admin/emails/configuracao" className="text-link">
            Ver o que falta →
          </Link>
        </div>
      )}

      <div className="stats">
        <Link href="/admin/emails/inscritas" className="stat">
          <strong>{contacts.data ? number.format(active.length) : "—"}</strong>
          <span>inscritas ativas</span>
        </Link>
        <Link href="/admin/emails/inscritas" className="stat">
          <strong>{contacts.data ? `+${number.format(newIn30)}` : "—"}</strong>
          <span>novas nos últimos 30 dias</span>
        </Link>
        <Link href="/admin/emails/enviadas" className="stat">
          <strong>{percent(sum((s) => s.uniqueViews), delivered)}</strong>
          <span>abertura média (últimas {recent.length || "—"})</span>
        </Link>
        <Link href="/admin/emails/enviadas" className="stat">
          <strong>{percent(sum((s) => s.uniqueClicks), delivered)}</strong>
          <span>cliques médios</span>
        </Link>
        <div className="stat">
          <strong>{credits.data ? number.format(credits.data.credits) : "—"}</strong>
          <span>envios disponíveis hoje</span>
        </div>
      </div>

      <div className="stats-grid">
        <section className="panel rank">
          <div className="panel__head">
            <h2>Última cartinha</h2>
            <Link href="/admin/emails/nova" className="btn btn--rose btn--sm">
              + Escrever
            </Link>
          </div>
          {last ? (
            <>
              <p>
                <Link href={`/admin/emails/enviadas/${last.id}`} className="text-link">
                  {last.subject}
                </Link>
                <br />
                <small className="muted">Enviada em {fmtDate(last.sentDate)}</small>
              </p>
              <Funnel
                rows={[
                  ["Entregues", lastStats.delivered ?? 0],
                  ["Abriram", lastStats.uniqueViews ?? 0],
                  ["Clicaram", lastStats.uniqueClicks ?? 0],
                ]}
              />
            </>
          ) : (
            <p className="muted">Nenhuma cartinha enviada ainda. Que tal escrever a primeira?</p>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Inscritas recentes</h2>
            <Link href="/admin/emails/inscritas" className="text-link">
              Ver todas →
            </Link>
          </div>
          {all.length ? (
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {all.slice(0, 6).map((c) => (
                    <tr key={c.email}>
                      <td>
                        <Link href={subscriberHref(c.email)}>{c.email}</Link>
                      </td>
                      <td className="muted">{fmtDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">Ninguém se inscreveu ainda. O formulário fica no fim da página inicial do blog.</p>
          )}
          {cancelled > 0 && <small className="muted">{number.format(cancelled)} pessoa(s) cancelaram a inscrição.</small>}
        </section>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>E-mails automáticos (30 dias)</h2>
          <Link href="/admin/emails/automaticos" className="text-link">
            Ver todos →
          </Link>
        </div>
        <p>
          {number.format(welcomes.length)} boas-vindas enviadas
          {welcomes.length > 0 && <> · {percent(welcomes.filter((m) => m.status === "opened" || m.status === "clicked").length, welcomes.length)} abertas</>}.
        </p>
        {messages.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {messages.slice(0, 5).map((m) => (
                  <tr key={m.messageId}>
                    <td>
                      <Link href={subscriberHref(m.email)}>{m.email}</Link>
                      <br />
                      <small className="muted">{m.subject}</small>
                    </td>
                    <td className="muted">{fmtDate(m.sentAt)}</td>
                    <td>
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
