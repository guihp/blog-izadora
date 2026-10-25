import "server-only";
import { SITE_URL } from "@/config/site";
import { renderMarkdown } from "@/lib/markdown";
import type { Devotional, Post, SiteSettings, Video } from "@/lib/types";
import { absoluteUrl, paragraphs, youTubeThumb, youTubeWatchUrl } from "@/lib/utils";

/**
 * ✿ Modelos de e-mail das "cartinhas".
 * HTML de e-mail: tabelas, estilos inline e fontes de sistema (Georgia), porque
 * Gmail/Outlook ignoram boa parte do CSS moderno. Paleta igual à do blog.
 */

export type { EmailKindClient as EmailKind } from "@/components/admin/newsletterKinds";

/** Nomes dos modelos na área "Templates" do Brevo (o painel os mantém atualizados). */
export const TEMPLATE_NAMES = {
  welcome: "[Blog] Boas-vindas",
  post: "[Blog] Novo texto",
  devotional: "[Blog] Devocional",
  video: "[Blog] Vídeo novo",
  letter: "[Blog] Cartinha livre",
} as const;

const C = {
  page: "#F4DDE3",
  card: "#FFFEFC",
  cream: "#FFF9F2",
  line: "#EAD7CF",
  ink: "#3F322C",
  soft: "#6E5A50",
  brown: "#806B60",
  button: "#A9506A", // contraste 5,4:1 com o texto branco
  rose: "#C46F86",
  sage: "#B8C5B0",
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

export function esc(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const abs = (path: string) => absoluteUrl(SITE_URL, path);

/** Texto com parágrafos (linhas em branco) → <p> com estilo de e-mail. */
function textBlock(text: string, size = 16) {
  return paragraphs(text)
    .map((p) => `<p style="margin:0 0 16px;font:${size}px/1.65 ${SANS};color:${C.ink}">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px"><tr><td style="border-radius:999px;background:${C.button}">
<a href="${esc(href)}" style="display:inline-block;padding:14px 30px;font:bold 15px/1 ${SANS};color:#ffffff;text-decoration:none;border-radius:999px">${esc(label)}</a>
</td></tr></table>`;
}

function image(src: string, alt: string, href?: string) {
  const img = `<img src="${esc(abs(src))}" alt="${esc(alt)}" width="520" style="display:block;width:100%;max-width:520px;height:auto;border-radius:14px;border:0">`;
  return `<div style="margin:0 0 22px">${href ? `<a href="${esc(href)}">${img}</a>` : img}</div>`;
}

function eyebrow(text: string) {
  return `<p style="margin:0 0 10px;font:bold 11px/1.4 ${SANS};letter-spacing:2.5px;text-transform:uppercase;color:${C.rose}">${esc(text)}</p>`;
}

function title(text: string) {
  return `<h1 style="margin:0 0 16px;font:normal 30px/1.2 ${SERIF};color:${C.ink}">${esc(text)}</h1>`;
}

function verse(text: string, reference: string) {
  if (!text && !reference) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px"><tr>
<td style="background:${C.cream};border-left:3px solid ${C.rose};border-radius:0 12px 12px 0;padding:18px 20px">
${text ? `<p style="margin:0 0 8px;font:italic 19px/1.5 ${SERIF};color:${C.ink}">“${esc(text.replace(/^[“"]|[”"]$/g, ""))}”</p>` : ""}
${reference ? `<p style="margin:0;font:bold 12px/1.4 ${SANS};letter-spacing:1.5px;text-transform:uppercase;color:${C.brown}">${esc(reference)}</p>` : ""}
</td></tr></table>`;
}

type LayoutOptions = {
  settings: SiteSettings;
  preheader: string;
  body: string;
  /** Campanha (lista): inclui o link de descadastro que o Brevo preenche. */
  campaign: boolean;
  /** Faixa avisando que é um e-mail de teste. */
  test?: boolean;
};

export function layout({ settings, preheader, body, campaign, test }: LayoutOptions) {
  const unsubscribe = campaign
    ? ` Se não quiser mais receber, <a href="{{ unsubscribe }}" style="color:${C.brown}">cancele a inscrição aqui</a>.`
    : "";
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>${esc(settings.siteName)}</title>
<style>
  .content p{margin:0 0 16px;font:16px/1.65 ${SANS};color:${C.ink}}
  .content h2,.content h3{font:normal 23px/1.3 ${SERIF};color:${C.ink};margin:26px 0 10px}
  .content a{color:${C.button}}
  .content ul,.content ol{margin:0 0 16px;padding-left:22px;font:16px/1.65 ${SANS};color:${C.ink}}
  .content blockquote{margin:0 0 18px;padding:14px 18px;background:${C.cream};border-left:3px solid ${C.rose};font-style:italic}
  .content figure{margin:0 0 20px}
  .content figure.verse{background:${C.cream};border-left:3px solid ${C.rose};border-radius:0 12px 12px 0;padding:18px 20px}
  .content figure.verse blockquote{margin:0;padding:0;background:none;border:0}
  .content figure.verse p{margin:0 0 8px;font:italic 19px/1.5 ${SERIF};color:${C.ink}}
  .content figure.verse figcaption cite{font:bold 12px/1.4 ${SANS};letter-spacing:1.5px;text-transform:uppercase;color:${C.brown}}
  .content img{max-width:100%;height:auto;border-radius:12px}
  .content cite{font-style:normal;font-weight:bold;color:${C.brown}}
  @media (max-width:620px){ .card{padding:28px 22px!important} }
</style></head>
<body style="margin:0;padding:0;background:${C.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
${test ? `<tr><td style="padding:0 0 12px;text-align:center;font:bold 12px/1.4 ${SANS};color:${C.button}">✿ E-MAIL DE TESTE — só você recebeu ✿</td></tr>` : ""}
<tr><td style="text-align:center;padding:6px 0 22px">
  <a href="${esc(SITE_URL)}" style="text-decoration:none">
    <span style="display:block;font:italic 30px/1.2 ${SERIF};color:${C.ink}">${esc(settings.siteName)}</span>
    <span style="display:block;margin-top:6px;font:bold 11px/1.4 ${SANS};letter-spacing:2.5px;text-transform:uppercase;color:${C.brown}">${esc(settings.newsletterTitle)}</span>
  </a>
</td></tr>
<tr><td class="card content" style="background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:40px 40px 32px">
${body}
<p style="margin:26px 0 0;font:italic 18px/1.5 ${SERIF};color:${C.soft}">${esc(settings.welcomeSignature)}</p>
</td></tr>
<tr><td style="padding:24px 18px 8px;text-align:center;font:12px/1.6 ${SANS};color:${C.soft}">
  <p style="margin:0 0 6px;font:italic 15px/1.5 ${SERIF};color:${C.brown}">${esc(settings.footerPhrase)}</p>
  <p style="margin:0">Você recebe esta cartinha porque se inscreveu em <a href="${esc(SITE_URL)}" style="color:${C.brown}">${esc(SITE_URL.replace(/^https?:\/\//, ""))}</a>.${unsubscribe}</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

export type RenderedEmail = { subject: string; preheader: string; html: string };
type Common = { settings: SiteSettings; intro?: string; subject?: string; campaign?: boolean; test?: boolean };

function finish(o: Common & { subject: string; preheader: string; body: string }): RenderedEmail {
  return {
    subject: o.subject,
    preheader: o.preheader,
    html: layout({ settings: o.settings, preheader: o.preheader, body: o.body, campaign: o.campaign ?? true, test: o.test }),
  };
}

const intro = (text?: string) =>
  text?.trim() ? `<div style="margin:0 0 24px;padding-bottom:8px;border-bottom:1px solid ${C.line}">${textBlock(text)}</div>` : "";

export function postEmail(post: Pick<Post, "title" | "slug" | "excerpt" | "cover_url" | "cover_alt">, o: Common) {
  const url = abs(`/blog/${post.slug}`);
  return finish({
    ...o,
    subject: o.subject || `Texto novo: ${post.title}`,
    preheader: post.excerpt || "Tem texto novo no blog esperando por você.",
    body: [
      intro(o.intro),
      post.cover_url ? image(post.cover_url, post.cover_alt || post.title, url) : "",
      eyebrow("Texto novo no blog"),
      title(post.title),
      post.excerpt ? textBlock(post.excerpt, 17) : "",
      button(url, "Ler o texto completo"),
    ].join("\n"),
  });
}

export function devotionalEmail(
  d: Pick<Devotional, "title" | "slug" | "summary" | "verse_text" | "bible_reference" | "cover_url" | "cover_alt">,
  o: Common,
) {
  const url = abs(`/devocionais/${d.slug}`);
  return finish({
    ...o,
    subject: o.subject || `Devocional: ${d.title}`,
    preheader: d.summary || `Um momento com a Palavra — ${d.bible_reference}`,
    body: [
      intro(o.intro),
      d.cover_url ? image(d.cover_url, d.cover_alt || d.title, url) : "",
      eyebrow("Um momento com a Palavra"),
      title(d.title),
      verse(d.verse_text, d.bible_reference),
      d.summary ? textBlock(d.summary) : "",
      button(url, "Fazer o devocional"),
    ].join("\n"),
  });
}

export function videoEmail(v: Pick<Video, "title" | "description" | "youtube_id" | "thumbnail_url">, o: Common) {
  const url = v.youtube_id ? youTubeWatchUrl(v.youtube_id) : abs("/meu-youtube");
  const thumb = v.thumbnail_url || (v.youtube_id ? youTubeThumb(v.youtube_id) : "");
  return finish({
    ...o,
    subject: o.subject || `Vídeo novo: ${v.title}`,
    preheader: v.description.split("\n")[0] || "Tem vídeo novo no canal.",
    body: [
      intro(o.intro),
      thumb ? image(thumb, `Miniatura do vídeo ${v.title}`, url) : "",
      eyebrow("Vídeo novo no canal"),
      title(v.title),
      v.description ? textBlock(v.description.slice(0, 600)) : "",
      button(url, "Assistir ao vídeo"),
    ].join("\n"),
  });
}

/** Texto livre escrito no painel (aceita o mesmo markdown dos artigos). */
export function letterEmail(input: { title: string; markdown: string }, o: Common) {
  const html = renderMarkdown(input.markdown)
    .replace(/(src|href)="\/(?!\/)/g, `$1="${SITE_URL}/`)
    .replace(/ loading="lazy" decoding="async"/g, "");
  const firstLine = input.markdown.replace(/[#>*_`:\[\]]/g, "").trim().split("\n")[0] ?? "";
  return finish({
    ...o,
    subject: o.subject || input.title,
    preheader: firstLine.slice(0, 140),
    body: [input.title ? title(input.title) : "", html, button(SITE_URL, "Visitar o blog")].join("\n"),
  });
}

export function welcomeEmail(o: Omit<Common, "campaign">) {
  const s = o.settings;
  return finish({
    ...o,
    campaign: false,
    subject: o.subject || `Bem-vinda às ${s.newsletterTitle}! ♡`,
    preheader: "Que alegria ter você por aqui.",
    body: [
      eyebrow("Que bom ter você aqui"),
      title(`Bem-vinda às ${s.newsletterTitle}`),
      textBlock(
        `Oi, amiga! Sua inscrição deu certo. ♡\n\n${s.newsletterText}\n\nDe vez em quando, chega uma cartinha nova por aqui: um texto do blog, um devocional ou um vídeo novo do canal. Nada de excesso, só o que pode te aproximar de Jesus.`,
      ),
      verse("Permanecei em mim, e eu permanecerei em vós.", "João 15:4"),
      textBlock("Enquanto a próxima cartinha não chega, que tal conhecer os textos que já estão no blog?"),
      button(SITE_URL, "Conhecer o blog"),
    ].join("\n"),
  });
}
