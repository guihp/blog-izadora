"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  BREVO_LIST_ID,
  brevoErrorMessage,
  createAndSendCampaign,
  isBrevoConfigured,
  removeFromList,
  sendTransactional,
} from "@/lib/brevo";
import { syncBrevoTemplates } from "@/lib/brevo-sync";
import { getSettings } from "@/lib/data";
import {
  devotionalEmail,
  letterEmail,
  postEmail,
  videoEmail,
  welcomeEmail,
  type EmailKind,
  type RenderedEmail,
} from "@/lib/email-templates";
import { isValidEmail } from "@/lib/utils";
import type { ActionState } from "./actions";

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** Monta a cartinha a partir do formulário do painel. */
async function buildEmail(supabase: Supabase, fd: FormData, flags: { campaign: boolean; test?: boolean }): Promise<RenderedEmail | string> {
  const settings = await getSettings();
  const kind = str(fd, "kind") as EmailKind;
  const id = str(fd, "item_id");
  const common = { settings, intro: str(fd, "intro"), subject: str(fd, "subject"), ...flags };

  if (kind === "letter") {
    const title = str(fd, "letter_title");
    const markdown = String(fd.get("letter_body") ?? "");
    if (!title && !common.subject) return "Dê um título ou um assunto para a cartinha.";
    if (!markdown.trim()) return "Escreva o texto da cartinha.";
    return letterEmail({ title, markdown }, common);
  }
  if (!id) return "Escolha qual conteúdo vai na cartinha.";

  if (kind === "post") {
    const { data } = await supabase.from("posts").select("title, slug, excerpt, cover_url, cover_alt").eq("id", id).maybeSingle();
    return data ? postEmail(data, common) : "Texto não encontrado.";
  }
  if (kind === "devotional") {
    const { data } = await supabase
      .from("devotionals")
      .select("title, slug, summary, verse_text, bible_reference, cover_url, cover_alt")
      .eq("id", id)
      .maybeSingle();
    return data ? devotionalEmail(data, common) : "Devocional não encontrado.";
  }
  if (kind === "video") {
    const { data } = await supabase.from("videos").select("title, description, youtube_id, thumbnail_url").eq("id", id).maybeSingle();
    return data ? videoEmail(data, common) : "Vídeo não encontrado.";
  }
  return "Escolha o tipo de cartinha.";
}

export async function previewNewsletter(fd: FormData): Promise<{ html?: string; subject?: string; error?: string }> {
  const { supabase } = await requireAdmin();
  const mail = await buildEmail(supabase, fd, { campaign: true });
  if (typeof mail === "string") return { error: mail };
  return { html: mail.html, subject: mail.subject };
}

export async function sendNewsletterTest(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  if (!isBrevoConfigured()) return { error: "O Brevo não está configurado (BREVO_API_KEY)." };
  const to = str(fd, "test_to") || user.email || "";
  if (!isValidEmail(to)) return { error: "Informe um e-mail válido para o teste." };
  const mail = await buildEmail(supabase, fd, { campaign: false, test: true });
  if (typeof mail === "string") return { error: mail };
  try {
    await sendTransactional(to, `[Teste] ${mail.subject}`, mail.html, (await getSettings()).siteName);
    return { ok: true, message: `Teste enviado para ${to}. Confira também a caixa de spam.` };
  } catch (error) {
    return { error: brevoErrorMessage(error) };
  }
}

export async function sendNewsletter(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isBrevoConfigured() || !BREVO_LIST_ID) return { error: "Configure BREVO_API_KEY e BREVO_LIST_ID antes de enviar." };
  if (str(fd, "confirm") !== "on") return { error: "Marque a caixinha de confirmação antes de enviar para todas." };
  const mail = await buildEmail(supabase, fd, { campaign: true });
  if (typeof mail === "string") return { error: mail };
  let id: number;
  try {
    const date = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    id = await createAndSendCampaign({
      name: `[Blog] ${date} · ${mail.subject}`.slice(0, 250),
      subject: mail.subject,
      previewText: mail.preheader.slice(0, 200),
      html: mail.html,
      listId: BREVO_LIST_ID,
      fromName: (await getSettings()).siteName,
    });
  } catch (error) {
    return { error: brevoErrorMessage(error) };
  }
  revalidatePath("/admin/emails", "layout");
  redirect(`/admin/emails/enviadas/${id}?enviada=1`);
}

/** Refaz o relatório "Quem recebeu" (fica guardado por 10 minutos). */
export async function refreshCampaign(fd: FormData) {
  await requireAdmin();
  const id = Number(str(fd, "id"));
  if (!Number.isInteger(id) || id <= 0) return;
  revalidateTag(`campaign-${id}`);
  redirect(`/admin/emails/enviadas/${id}`);
}

/** Mantém na área "Templates" do Brevo uma cópia organizada de cada modelo do blog. */
export async function syncTemplates(_prev: ActionState): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isBrevoConfigured()) return { error: "O Brevo não está configurado (BREVO_API_KEY)." };
  try {
    const result = await syncBrevoTemplates(supabase);
    revalidatePath("/admin/emails", "layout");
    return { ok: true, message: `${result} modelos atualizados no Brevo (em Campanhas → Templates, com a etiqueta “blog”).` };
  } catch (error) {
    return { error: brevoErrorMessage(error) };
  }
}

export async function removeSubscriber(fd: FormData) {
  await requireAdmin();
  const email = str(fd, "email");
  if (BREVO_LIST_ID && isValidEmail(email)) {
    try {
      await removeFromList(BREVO_LIST_ID, email);
    } catch (error) {
      console.error("[newsletter] remover inscrita", error);
    }
  }
  revalidatePath("/admin/emails", "layout");
}
