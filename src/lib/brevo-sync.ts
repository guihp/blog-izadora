import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/config/site";
import { getTemplates, upsertTemplate } from "@/lib/brevo";
import { getSettings } from "@/lib/data";
import {
  devotionalEmail,
  letterEmail,
  postEmail,
  TEMPLATE_NAMES,
  videoEmail,
  welcomeEmail,
  type RenderedEmail,
} from "@/lib/email-templates";

/** Mantém na área "Templates" do Brevo uma cópia de cada modelo do blog (pelo nome). */
export async function syncBrevoTemplates(supabase: SupabaseClient, options: { baseUrl?: string } = {}) {
  const settings = await getSettings();
  const [post, devotional, video, existing] = await Promise.all([
    supabase.from("posts").select("title, slug, excerpt, cover_url, cover_alt").eq("status", "published").order("published_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("devotionals").select("title, slug, summary, verse_text, bible_reference, cover_url, cover_alt").eq("status", "published").order("published_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("videos").select("title, description, youtube_id, thumbnail_url").not("youtube_id", "is", null).order("published_at", { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
    getTemplates(),
  ]);

  // Sem conteúdo publicado ainda, o modelo leva um texto de exemplo para ser editado no Brevo
  const common = { settings, campaign: true };
  const mails: [string, RenderedEmail][] = [
    [TEMPLATE_NAMES.welcome, welcomeEmail({ settings })],
    [
      TEMPLATE_NAMES.post,
      postEmail(
        post.data ?? {
          title: "Título do texto novo",
          slug: "",
          excerpt: "Um resumo curtinho do texto, para despertar a vontade de ler.",
          cover_url: "/images/compartilhar.jpg",
          cover_alt: "Capa do texto",
        },
        { ...common, subject: post.data ? undefined : "Texto novo: (título)" },
      ),
    ],
    [
      TEMPLATE_NAMES.devotional,
      devotionalEmail(
        devotional.data ?? {
          title: "Título do devocional",
          slug: "",
          summary: "Um resumo do devocional desta semana.",
          verse_text: "Permanecei em mim, e eu permanecerei em vós.",
          bible_reference: "João 15:4",
          cover_url: null,
          cover_alt: "",
        },
        { ...common, subject: devotional.data ? undefined : "Devocional: (título)" },
      ),
    ],
    [
      TEMPLATE_NAMES.video,
      videoEmail(video.data ?? { title: "Título do vídeo", description: "Do que o vídeo fala, em poucas linhas.", youtube_id: null, thumbnail_url: null }, {
        ...common,
        subject: video.data ? undefined : "Vídeo novo: (título)",
      }),
    ],
    [
      TEMPLATE_NAMES.letter,
      letterEmail(
        { title: "Uma cartinha para você", markdown: "Oi, amiga!\n\nEscreva aqui o que estiver no seu coração.\n\n::: versiculo João 15:5\nEu sou a videira, vós, as varas.\n:::" },
        common,
      ),
    ],
  ];

  // baseUrl: troca o endereço do site nos links (ex.: sincronizar a partir do localhost com o domínio final)
  const host = (url: string) => url.replace(/^https?:\/\//, "");
  const fix = (html: string) =>
    options.baseUrl ? html.split(SITE_URL).join(options.baseUrl).split(host(SITE_URL)).join(host(options.baseUrl)) : html;
  for (const [name, mail] of mails) {
    await upsertTemplate(existing, { name, subject: mail.subject, html: fix(mail.html), fromName: settings.siteName });
  }
  return mails.length;
}

