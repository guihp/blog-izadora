import Link from "next/link";
import { getTransactionalEvents } from "@/lib/brevo";
import { groupTransactional, type TransactionalMessage } from "@/lib/email-reports";
import { fmtDate, number, percent, safe, StatusBadge, subscriberHref } from "../shared";

const KINDS: { key: string; label: string; match: (m: TransactionalMessage) => boolean }[] = [
  { key: "todos", label: "Todos", match: () => true },
  { key: "boas-vindas", label: "Boas-vindas", match: (m) => m.kind === "Boas-vindas" },
  { key: "testes", label: "Testes", match: (m) => m.kind === "Teste" },
  { key: "problemas", label: "Problemas", match: (m) => m.status === "failed" || m.status === "spam" },
];

type Props = { searchParams: Promise<{ tipo?: string; dias?: string }> };

export default async function AutomaticPage({ searchParams }: Props) {
  const { tipo, dias } = await searchParams;
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const events = await safe(() => getTransactionalEvents({ days }));
  const all = groupTransactional(events.data ?? []);
  const kind = KINDS.find((k) => k.key === tipo) ?? KINDS[0];
  const rows = all.filter(kind.match);
  const opened = all.filter((m) => m.status === "opened" || m.status === "clicked").length;
  const delivered = all.filter((m) => m.status !== "sending" && m.status !== "failed").length;

  return (
    <>
      <div className="stats">
        <div className="stat">
          <strong>{number.format(all.length)}</strong>
          <span>e-mails automáticos em {days} dias</span>
        </div>
        <div className="stat">
          <strong>{percent(delivered, all.length)}</strong>
          <span>entregues</span>
        </div>
        <div className="stat">
          <strong>{percent(opened, delivered)}</strong>
          <span>abertos</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>E-mails automáticos</h2>
          <nav className="segmented" aria-label="Período">
            {[7, 30, 90].map((d) => (
              <Link key={d} href={`?dias=${d}&tipo=${kind.key}`} aria-current={d === days ? "page" : undefined}>
                {d} dias
              </Link>
            ))}
          </nav>
        </div>
        <p>
          A cartinha de boas-vindas (enviada sozinha a cada inscrição nova) e os testes que você manda para si mesma antes de
          enviar uma cartinha.
        </p>
        {events.error && <div className="alert alert--error">{events.error}</div>}
        <div className="toolbar">
          <nav className="segmented" aria-label="Tipo">
            {KINDS.map((k) => (
              <Link key={k.key} href={`?tipo=${k.key}&dias=${days}`} aria-current={k.key === kind.key ? "page" : undefined}>
                {k.label} ({all.filter(k.match).length})
              </Link>
            ))}
          </nav>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Para</th>
                  <th>Assunto</th>
                  <th>Tipo</th>
                  <th>Enviado em</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.messageId}>
                    <td>
                      <Link href={subscriberHref(m.email)}>{m.email}</Link>
                    </td>
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
          !events.error && <p className="muted">Nenhum e-mail automático neste período.</p>
        )}
      </section>
    </>
  );
}
