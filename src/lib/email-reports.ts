import "server-only";
import { unstable_cache } from "next/cache";
import { BREVO_LIST_ID, getAllListContacts, getContactStats, type BrevoContactStats, type BrevoEvent } from "@/lib/brevo";

/**
 * Relatórios da área E-mails do painel, montados a partir da API do Brevo.
 * O Brevo não tem um "quem recebeu a campanha X" direto: cruzamos as pessoas
 * da lista com o histórico de cada uma (campaignStats).
 */

export type RecipientStatus = "clicked" | "opened" | "delivered" | "sent" | "bounced" | "unsubscribed" | "complaint";

export const RECIPIENT_LABELS: Record<RecipientStatus, string> = {
  clicked: "Clicou",
  opened: "Abriu",
  delivered: "Entregue",
  sent: "Enviado",
  bounced: "Não entregue",
  unsubscribed: "Cancelou a inscrição",
  complaint: "Marcou como spam",
};

export type CampaignRecipient = {
  email: string;
  status: RecipientStatus;
  sentAt?: string;
  openedAt?: string;
  opens: number;
  clicks: number;
  links: string[];
};

/** Situação de uma pessoa numa campanha (null = não recebeu essa campanha). */
export function recipientFromStats(email: string, stats: BrevoContactStats, campaignId: number): CampaignRecipient | null {
  const is = (list?: { campaignId: number; eventTime?: string }[]) => list?.find((x) => x.campaignId === campaignId);
  const sent = is(stats.messagesSent);
  const delivered = is(stats.delivered);
  const bounced = is(stats.hardBounces) ?? is(stats.softBounces);
  const opened = stats.opened?.find((x) => x.campaignId === campaignId);
  const clicked = stats.clicked?.find((x) => x.campaignId === campaignId);
  const unsub = is(stats.unsubscriptions?.userUnsubscription);
  const complaint = is(stats.complaints);
  if (!sent && !delivered && !opened && !clicked && !bounced) return null;

  const status: RecipientStatus = complaint
    ? "complaint"
    : unsub
      ? "unsubscribed"
      : clicked
        ? "clicked"
        : opened
          ? "opened"
          : delivered
            ? "delivered"
            : bounced
              ? "bounced"
              : "sent";
  return {
    email,
    status,
    sentAt: sent?.eventTime ?? delivered?.eventTime,
    openedAt: opened?.eventTime,
    opens: opened?.count ?? 0,
    clicks: clicked?.links.reduce((n, l) => n + l.count, 0) ?? 0,
    links: clicked?.links.map((l) => l.url) ?? [],
  };
}

/** Executa `fn` em lotes para não estourar o limite de requisições do Brevo. */
async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return out;
}

export const MAX_REPORT_CONTACTS = 1000;

async function buildCampaignRecipients(campaignId: number, listIds: number[]) {
  const lists = listIds.length ? listIds : BREVO_LIST_ID ? [BREVO_LIST_ID] : [];
  const seen = new Set<string>();
  const contacts: string[] = [];
  for (const id of lists) {
    for (const c of await getAllListContacts(id, MAX_REPORT_CONTACTS)) {
      if (!seen.has(c.email)) {
        seen.add(c.email);
        contacts.push(c.email);
      }
    }
  }
  const truncated = contacts.length > MAX_REPORT_CONTACTS;
  let unchecked = 0;
  const rows = await inBatches(contacts.slice(0, MAX_REPORT_CONTACTS), 5, async (email) => {
    try {
      return recipientFromStats(email, await getContactStats(email), campaignId);
    } catch (error) {
      // Uma pessoa que o Brevo não respondeu não derruba o relatório inteiro
      console.error("[emails] campaignStats", email, error);
      unchecked += 1;
      return null;
    }
  });
  return {
    recipients: rows.filter((r): r is CampaignRecipient => r !== null),
    checked: Math.min(contacts.length, MAX_REPORT_CONTACTS),
    unchecked,
    truncated,
    generatedAt: new Date().toISOString(),
  };
}

/** Guardado por 10 minutos (o botão "Atualizar" da página limpa esse cache). */
export function getCampaignRecipients(campaignId: number, listIds: number[]) {
  return unstable_cache(() => buildCampaignRecipients(campaignId, listIds), ["campaign-recipients", String(campaignId), listIds.join(",")], {
    revalidate: 600,
    tags: [`campaign-${campaignId}`],
  })();
}

// ───────────── E-mails automáticos (transacionais) ─────────────
export type TransactionalStatus = "clicked" | "opened" | "delivered" | "sending" | "failed" | "spam" | "unsubscribed";

export const TRANSACTIONAL_LABELS: Record<TransactionalStatus, string> = {
  clicked: "Clicou",
  opened: "Abriu",
  delivered: "Entregue",
  sending: "Enviando",
  failed: "Não entregue",
  spam: "Marcou como spam",
  unsubscribed: "Cancelou",
};

export type TransactionalMessage = {
  messageId: string;
  email: string;
  subject: string;
  kind: "Boas-vindas" | "Teste" | "Outro";
  sentAt: string;
  status: TransactionalStatus;
  reason?: string;
};

const FAILED = new Set(["hardBounces", "softBounces", "blocked", "invalid", "error", "deferred"]);

/** Junta os eventos (enviado, entregue, aberto…) de cada mensagem numa linha só. */
export function groupTransactional(events: BrevoEvent[]): TransactionalMessage[] {
  const byId = new Map<string, BrevoEvent[]>();
  for (const e of events) byId.set(e.messageId, [...(byId.get(e.messageId) ?? []), e]);

  return [...byId.entries()]
    .map(([messageId, list]) => {
      const types = new Set(list.map((e) => e.event));
      const first = list.reduce((a, b) => (a.date < b.date ? a : b));
      const subject = first.subject ?? list.find((e) => e.subject)?.subject ?? "";
      const status: TransactionalStatus = types.has("spam")
        ? "spam"
        : types.has("unsubscribed")
          ? "unsubscribed"
          : types.has("clicks")
            ? "clicked"
            : types.has("opened") || types.has("loadedByProxy")
              ? "opened"
              : types.has("delivered")
                ? "delivered"
                : [...types].some((t) => FAILED.has(t))
                  ? "failed"
                  : "sending";
      return {
        messageId,
        email: first.email,
        subject,
        kind: subject.startsWith("[Teste]") ? "Teste" : /^Bem-vinda/i.test(subject) ? "Boas-vindas" : "Outro",
        sentAt: first.date,
        status,
        reason: list.find((e) => e.reason)?.reason,
      } satisfies TransactionalMessage;
    })
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}
