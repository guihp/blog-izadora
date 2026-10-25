import "server-only";

/**
 * Cliente mínimo da API do Brevo (https://developers.brevo.com).
 * A chave fica só no servidor (BREVO_API_KEY, nunca NEXT_PUBLIC_).
 */
const API = "https://api.brevo.com/v3";

export const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID) || null;
/** Domínio próprio das cartinhas. Quando ele estiver autenticado no Brevo, os envios saem dele. */
export const NEWSLETTER_DOMAIN = "izadoracarreirobarros.com";

export function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY);
}

export class BrevoError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Brevo ${status}: ${body.slice(0, 300)}`);
  }
}

export async function brevo<T = unknown>(path: string, init: { method?: string; body?: unknown; timeoutMs?: number } = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "api-key": process.env.BREVO_API_KEY ?? "",
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(init.timeoutMs ?? 15_000),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new BrevoError(res.status, text);
  return (text ? JSON.parse(text) : null) as T;
}

/** Mensagem amigável para mostrar no painel. */
export function brevoErrorMessage(error: unknown) {
  if (error instanceof BrevoError) {
    if (/unrecognised IP/i.test(error.body)) {
      return "O Brevo bloqueou o acesso por IP. Desative o bloqueio em app.brevo.com/security/authorised_ips.";
    }
    if (error.status === 401) return "A chave do Brevo (BREVO_API_KEY) foi recusada. Gere uma nova no Brevo e atualize na Vercel.";
    if (error.status === 402) return "O plano do Brevo não permite este envio agora (limite diário atingido?).";
    try {
      const { message } = JSON.parse(error.body) as { message?: string };
      if (message) return `O Brevo respondeu: ${message}`;
    } catch {}
  }
  console.error("[brevo]", error);
  return "Não foi possível falar com o Brevo agora. Tente novamente em alguns minutos.";
}

// ───────────── Tipos (só os campos usados) ─────────────
export type BrevoSender = { id: number; name: string; email: string; active: boolean };
export type BrevoList = { id: number; name: string; uniqueSubscribers: number; totalBlacklisted: number };
export type BrevoContact = { email: string; createdAt: string; emailBlacklisted: boolean; listUnsubscribed?: number[] };
export type BrevoDnsRecord = { type: string; value: string; host_name: string; status: boolean };
export type BrevoDomain = {
  domain: string;
  verified: boolean;
  authenticated: boolean;
  dns_records: Record<string, BrevoDnsRecord | null>;
};
export type BrevoCampaign = {
  id: number;
  name: string;
  subject: string;
  status: string;
  sentDate?: string;
  scheduledAt?: string;
  createdAt: string;
  statistics?: { globalStats?: { sent?: number; delivered?: number; uniqueViews?: number; trackableViews?: number; uniqueClicks?: number; unsubscriptions?: number } };
};
export type BrevoTemplate = { id: number; name: string; subject: string; isActive: boolean; tag: string; modifiedAt: string };

// ───────────── Leitura ─────────────
export async function getSenders() {
  return (await brevo<{ senders: BrevoSender[] }>("/senders")).senders ?? [];
}

const isOwn = (s: BrevoSender) => s.email.toLowerCase().endsWith(`@${NEWSLETTER_DOMAIN}`);

/**
 * Remetente preferido: o do domínio próprio (se ativo); se não houver, o primeiro ativo (o Gmail).
 * `replyTo`: com o remetente do domínio, as respostas das leitoras vão para o Gmail.
 */
export async function pickSender(fromName?: string) {
  const active = (await getSenders()).filter((s) => s.active);
  const own = active.find(isOwn);
  const personal = active.find((s) => !isOwn(s));
  const sender = own ?? personal;
  if (!sender) throw new Error("Nenhum remetente ativo no Brevo.");
  return { ...sender, name: fromName || sender.name, replyTo: own && personal ? personal.email : sender.email };
}

/** Depois que o domínio é autenticado, cria o remetente cartinhas@ (o Brevo já o considera verificado). */
export async function ensureDomainSender(name: string) {
  const senders = await getSenders();
  if (senders.some(isOwn)) return false;
  await brevo("/senders", { method: "POST", body: { name, email: `cartinhas@${NEWSLETTER_DOMAIN}` } });
  return true;
}

export async function getDomain(name = NEWSLETTER_DOMAIN) {
  try {
    return await brevo<BrevoDomain>(`/senders/domains/${encodeURIComponent(name)}`);
  } catch (error) {
    if (error instanceof BrevoError && error.status === 404) return null;
    throw error;
  }
}

export async function getList(id: number) {
  return brevo<BrevoList>(`/contacts/lists/${id}`);
}

export async function getListContacts(id: number, limit = 25) {
  const data = await brevo<{ contacts?: BrevoContact[]; count?: number }>(
    `/contacts/lists/${id}/contacts?limit=${limit}&offset=0&sort=desc`,
  );
  return data?.contacts ?? [];
}

export async function getCampaigns(limit = 10) {
  const data = await brevo<{ campaigns?: BrevoCampaign[] }>(
    `/emailCampaigns?limit=${limit}&offset=0&sort=desc&statistics=globalStats`,
  );
  return data?.campaigns ?? [];
}

export async function getTemplates() {
  const data = await brevo<{ templates?: BrevoTemplate[] }>("/smtp/templates?limit=100&offset=0&sort=desc");
  return data?.templates ?? [];
}

/** Envios restantes no plano gratuito (o Brevo conta por dia). */
export async function getSendCredits() {
  const account = await brevo<{ plan?: { type: string; credits: number; creditsType: string }[] }>("/account");
  const plan = account.plan?.find((p) => p.creditsType === "sendLimit") ?? account.plan?.[0];
  return plan ? { plan: plan.type, credits: plan.credits } : null;
}

// ───────────── Escrita ─────────────
/** `fromName`: nome que aparece como remetente (o nome do blog). */
export async function sendTransactional(to: string, subject: string, html: string, fromName?: string) {
  const sender = await pickSender(fromName);
  return brevo("/smtp/email", {
    method: "POST",
    body: {
      sender: { name: sender.name, email: sender.email },
      replyTo: { email: sender.replyTo },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      tags: ["blog"],
    },
  });
}

export async function createAndSendCampaign(input: {
  name: string;
  subject: string;
  previewText: string;
  html: string;
  listId: number;
  fromName?: string;
}) {
  const sender = await pickSender(input.fromName);
  const { id } = await brevo<{ id: number }>("/emailCampaigns", {
    method: "POST",
    body: {
      name: input.name,
      subject: input.subject,
      previewText: input.previewText,
      sender: { name: sender.name, email: sender.email },
      replyTo: sender.replyTo,
      htmlContent: input.html,
      recipients: { listIds: [input.listId] },
      tag: "blog",
    },
  });
  await brevo(`/emailCampaigns/${id}/sendNow`, { method: "POST" });
  return id;
}

/** Cria ou atualiza um modelo (pelo nome) na área "Templates" do Brevo. */
export async function upsertTemplate(existing: BrevoTemplate[], input: { name: string; subject: string; html: string; fromName?: string }) {
  const sender = await pickSender(input.fromName);
  const body = {
    templateName: input.name,
    subject: input.subject,
    htmlContent: input.html,
    sender: { name: sender.name, email: sender.email },
    replyTo: sender.replyTo,
    tag: "blog",
    isActive: true,
  };
  const found = existing.find((t) => t.name === input.name);
  if (found) {
    await brevo(`/smtp/templates/${found.id}`, { method: "PUT", body });
    return found.id;
  }
  return (await brevo<{ id: number }>("/smtp/templates", { method: "POST", body })).id;
}

export async function removeFromList(listId: number, email: string) {
  return brevo(`/contacts/lists/${listId}/contacts/remove`, { method: "POST", body: { emails: [email] } });
}

// ───────────── Relatórios ─────────────
export type BrevoCampaignDetail = BrevoCampaign & {
  htmlContent?: string;
  previewText?: string;
  sender?: { name: string; email: string };
  recipients?: { lists?: number[] };
  statistics?: BrevoCampaign["statistics"] & {
    globalStats?: { hardBounces?: number; softBounces?: number; complaints?: number; clickers?: number; viewed?: number };
    linksStats?: Record<string, number>;
  };
};

export async function getCampaign(id: number) {
  try {
    return await brevo<BrevoCampaignDetail>(`/emailCampaigns/${id}`);
  } catch (error) {
    if (error instanceof BrevoError && error.status === 404) return null;
    throw error;
  }
}

type CampaignRef = { campaignId: number; eventTime?: string };
/** Histórico de campanhas de uma pessoa (o Brevo devolve {} quando não há nada). */
export type BrevoContactStats = {
  messagesSent?: CampaignRef[];
  delivered?: CampaignRef[];
  hardBounces?: CampaignRef[];
  softBounces?: CampaignRef[];
  complaints?: CampaignRef[];
  opened?: (CampaignRef & { count: number })[];
  clicked?: { campaignId: number; links: { count: number; eventTime: string; url: string }[] }[];
  unsubscriptions?: { userUnsubscription?: CampaignRef[]; adminUnsubscription?: { eventTime: string }[] };
};

/** Este endpoint do Brevo às vezes demora muito: limite curto e uma nova tentativa. */
export async function getContactStats(email: string, attempts = 2): Promise<BrevoContactStats> {
  try {
    return (await brevo<BrevoContactStats>(`/contacts/${encodeURIComponent(email)}/campaignStats`, { timeoutMs: 8_000 })) ?? {};
  } catch (error) {
    if (error instanceof BrevoError && error.status === 404) return {};
    if (attempts > 1 && !(error instanceof BrevoError)) return getContactStats(email, attempts - 1);
    throw error;
  }
}

export type BrevoContactFull = BrevoContact & { id: number; modifiedAt: string; listIds: number[]; attributes?: Record<string, unknown> };

export async function getContact(email: string) {
  try {
    return await brevo<BrevoContactFull>(`/contacts/${encodeURIComponent(email)}`);
  } catch (error) {
    if (error instanceof BrevoError && error.status === 404) return null;
    throw error;
  }
}

/** Todas as pessoas da lista (em páginas de 500), até `max`. */
export async function getAllListContacts(listId: number, max = 5000) {
  const all: BrevoContactFull[] = [];
  for (let offset = 0; offset < max; offset += 500) {
    const data = await brevo<{ contacts?: BrevoContactFull[]; count?: number }>(
      `/contacts/lists/${listId}/contacts?limit=500&offset=${offset}&sort=desc`,
    );
    const page = data?.contacts ?? [];
    all.push(...page);
    if (page.length < 500 || all.length >= (data?.count ?? 0)) break;
  }
  return all;
}

export type BrevoEvent = {
  email: string;
  date: string;
  messageId: string;
  event: string;
  subject?: string;
  tag?: string;
  from?: string;
  reason?: string;
  link?: string;
};

/** Registro dos e-mails transacionais (boas-vindas, testes), mais recentes primeiro. */
export async function getTransactionalEvents(options: { days?: number; email?: string; limit?: number } = {}) {
  const params = new URLSearchParams({ limit: String(options.limit ?? 2500), offset: "0", sort: "desc", days: String(options.days ?? 90) });
  if (options.email) params.set("email", options.email);
  const data = await brevo<{ events?: BrevoEvent[] }>(`/smtp/statistics/events?${params}`);
  return data?.events ?? [];
}
