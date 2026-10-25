import { brevoErrorMessage } from "@/lib/brevo";
import { RECIPIENT_LABELS, TRANSACTIONAL_LABELS, type RecipientStatus, type TransactionalStatus } from "@/lib/email-reports";

export const number = new Intl.NumberFormat("pt-BR");
export const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
export const dateOnly = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Sao_Paulo" });

export const fmtDate = (iso?: string | null) => (iso ? dateTime.format(new Date(iso)) : "—");
export const percent = (part = 0, total = 0) => (total ? `${Math.round((part / total) * 100)}%` : "—");

/** Executa a chamada ao Brevo e devolve o erro em vez de derrubar a página. */
export async function safe<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    return { data: null, error: brevoErrorMessage(error) };
  }
}

export const CAMPAIGN_STATUS: Record<string, string> = {
  sent: "Enviada",
  draft: "Rascunho",
  queued: "Na fila",
  in_process: "Enviando",
  suspended: "Suspensa",
  archive: "Arquivada",
  scheduled: "Agendada",
};

const TONE: Record<string, string> = {
  clicked: "ok",
  opened: "ok",
  delivered: "rose",
  sent: "muted",
  sending: "muted",
  bounced: "bad",
  failed: "bad",
  unsubscribed: "warn",
  complaint: "bad",
  spam: "bad",
};

export function StatusBadge({ status }: { status: RecipientStatus | TransactionalStatus }) {
  const label = (RECIPIENT_LABELS as Record<string, string>)[status] ?? (TRANSACTIONAL_LABELS as Record<string, string>)[status] ?? status;
  return <span className={`badge badge--${TONE[status] ?? "muted"}`}>{label}</span>;
}

export const subscriberHref = (email: string) => `/admin/emails/inscritas/${encodeURIComponent(email)}`;

/** Barras proporcionais (mesmo desenho do ranking das Estatísticas). */
export function Funnel({ rows }: { rows: [string, number][] }) {
  const top = Math.max(1, rows[0]?.[1] ?? 1);
  return (
    <ol>
      {rows.map(([label, value]) => (
        <li key={label}>
          <span className="rank__label">{label}</span>
          <span className="rank__value">
            {number.format(value)} <small className="muted">({percent(value, rows[0][1])})</small>
          </span>
          <span className="rank__bar" style={{ width: `${(value / top) * 100}%` }} aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}
