import "server-only";

/**
 * Integração da newsletter "Cartinhas para florescer".
 * Defina NEWSLETTER_PROVIDER (buttondown | mailerlite | brevo) e a chave correspondente no .env.
 * Sem configuração, o formulário informa honestamente que as inscrições ainda não estão abertas.
 */
export type NewsletterProvider = "buttondown" | "mailerlite" | "brevo";

export function getNewsletterProvider(): NewsletterProvider | null {
  const p = (process.env.NEWSLETTER_PROVIDER ?? "").trim().toLowerCase();
  if (p === "buttondown" && process.env.BUTTONDOWN_API_KEY) return "buttondown";
  if (p === "mailerlite" && process.env.MAILERLITE_API_KEY) return "mailerlite";
  if (p === "brevo" && process.env.BREVO_API_KEY) return "brevo";
  return null;
}

export type SubscribeResult = { ok: true; alreadySubscribed?: boolean; isNew?: boolean } | { ok: false; reason: "invalid" | "provider" };

export async function subscribe(provider: NewsletterProvider, email: string): Promise<SubscribeResult> {
  const signal = AbortSignal.timeout(10_000);

  if (provider === "buttondown") {
    const res = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      signal,
      headers: { Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: email, type: "regular" }),
    });
    if (res.ok) return { ok: true };
    const text = await res.text();
    if (res.status === 400 && /already|exist/i.test(text)) return { ok: true, alreadySubscribed: true };
    if (res.status === 400 || res.status === 422) return { ok: false, reason: "invalid" };
    console.error("[newsletter] buttondown", res.status, text.slice(0, 300));
    return { ok: false, reason: "provider" };
  }

  if (provider === "mailerlite") {
    const group = process.env.MAILERLITE_GROUP_ID;
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, ...(group ? { groups: [group] } : {}) }),
    });
    if (res.status === 200) return { ok: true, alreadySubscribed: true };
    if (res.ok) return { ok: true };
    if (res.status === 422) return { ok: false, reason: "invalid" };
    console.error("[newsletter] mailerlite", res.status, (await res.text()).slice(0, 300));
    return { ok: false, reason: "provider" };
  }

  // brevo
  const listId = Number(process.env.BREVO_LIST_ID);
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    signal,
    headers: { "api-key": process.env.BREVO_API_KEY ?? "", "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, updateEnabled: true, ...(Number.isFinite(listId) && listId > 0 ? { listIds: [listId] } : {}) }),
  });
  // 201 = contato novo; 204 = contato que já existia (só entrou/voltou para a lista)
  if (res.ok) return { ok: true, isNew: res.status === 201 };
  if (res.status === 400) return { ok: false, reason: "invalid" };
  console.error("[newsletter] brevo", res.status, (await res.text()).slice(0, 300));
  return { ok: false, reason: "provider" };
}
