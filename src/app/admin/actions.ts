"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { demoCategories, demoDevotionals, demoPosts, demoVideos } from "@/content/demo";
import { requireAdmin } from "@/lib/auth";
import { clearAttempts, clientIp, registerAttempt, tooManyAttempts } from "@/lib/rate-limit";
import { renderMarkdown } from "@/lib/markdown";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { parseYouTubeId, safeUrl, slugify } from "@/lib/utils";

export type ActionState = { ok?: boolean; error?: string; message?: string } | null;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const nullable = (v: string) => (v ? v : null);

/** Datas do formulário são digitadas no horário de Brasília. */
function fromLocalInput(value: string) {
  if (!value) return null;
  const date = new Date(`${value.length === 16 ? `${value}:00` : value}-03:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function refreshSite() {
  revalidatePath("/", "layout");
}

function dbError(error: { code?: string; message: string }, what: string): ActionState {
  if (error.code === "23505") return { error: `Já existe ${what} com este endereço (slug). Escolha outro.` };
  if (error.code === "42501") return { error: "Sem permissão. Confirme se sua conta está cadastrada como administradora." };
  if (error.code === "23514") return { error: "Algum campo tem um formato inválido (o endereço deve ter só letras minúsculas, números e hífens)." };
  console.error(`[admin] ${what}`, error);
  return { error: "Não foi possível salvar agora. Tente novamente." };
}

// ───────────── Autenticação ─────────────
const LOGIN_WINDOW = 15 * 60_000;
const TOO_MANY = "Muitas tentativas seguidas. Espere 15 minutos e tente de novo.";

export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Preencha e-mail e senha." };
  const ip = await clientIp();
  // 5 erros por IP ou 8 por e-mail a cada 15 minutos
  if (tooManyAttempts(`login:ip:${ip}`, 5) || tooManyAttempts(`login:mail:${email}`, 8)) {
    return { error: TOO_MANY };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    registerAttempt(`login:ip:${ip}`, LOGIN_WINDOW);
    registerAttempt(`login:mail:${email}`, LOGIN_WINDOW);
    return { error: "E-mail ou senha incorretos." };
  }
  clearAttempts(`login:ip:${ip}`);
  redirect("/admin/verificar");
}

/** Gera um novo QR code do app autenticador (só quando ainda não há um confirmado). */
export async function mfaEnroll(): Promise<{ factorId?: string; qr?: string; secret?: string; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sua sessão expirou. Entre de novo." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.all.some((f) => f.factor_type === "totp" && f.status === "verified")) {
    return { error: "Esta conta já tem um app autenticador. Use o código dele." };
  }
  // Tentativas anteriores que não foram confirmadas
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Painel do blog (${new Date().toISOString().slice(0, 10)})`,
    issuer: "Mulher dos Olhos de Deus",
  });
  if (error || !data) {
    console.error("[admin] mfa enroll", error);
    return { error: "Não foi possível gerar o QR code. Tente de novo." };
  }
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function mfaVerify(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const factorId = str(fd, "factorId");
  const code = str(fd, "code").replace(/\D/g, "");
  if (!factorId || code.length !== 6) return { error: "Digite os 6 números que aparecem no app." };
  const ip = await clientIp();
  if (tooManyAttempts(`mfa:${ip}`, 6)) return { error: TOO_MANY };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) {
    registerAttempt(`mfa:${ip}`, LOGIN_WINDOW);
    return { error: "Código incorreto ou expirado. Confira se o horário do celular está certo e tente o código novo." };
  }
  clearAttempts(`mfa:${ip}`);
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ───────────── Artigos ─────────────
export async function savePost(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const intent = str(fd, "intent"); // draft | publish | save
  const title = str(fd, "title");
  if (!title) return { error: "Dê um título ao texto." };

  const slug = slugify(str(fd, "slug") || title);
  if (!slug) return { error: "O endereço (slug) não pode ficar vazio." };

  const cover_url = nullable(safeUrl(str(fd, "cover_url")));
  const cover_alt = str(fd, "cover_alt");
  const status = intent === "publish" ? "published" : intent === "draft" ? "draft" : str(fd, "status") === "published" ? "published" : "draft";
  if (status === "published" && cover_url && !cover_alt) {
    return { error: "Descreva a imagem de capa (texto alternativo) antes de publicar — isso ajuda leitoras com deficiência visual." };
  }

  let published_at = fromLocalInput(str(fd, "published_at"));
  if (status === "published" && !published_at) published_at = new Date().toISOString();

  const row = {
    title,
    slug,
    excerpt: str(fd, "excerpt"),
    content: String(fd.get("content") ?? ""),
    cover_url,
    cover_alt,
    category_id: nullable(str(fd, "category_id")),
    status,
    published_at,
    seo_title: nullable(str(fd, "seo_title")),
    seo_description: nullable(str(fd, "seo_description")),
  };

  if (id) {
    const { error } = await supabase.from("posts").update(row).eq("id", id);
    if (error) return dbError(error, "um texto");
    refreshSite();
    return {
      ok: true,
      message: intent === "publish" ? "Publicado! ♡" : intent === "draft" ? "Salvo como rascunho (não aparece no site)." : "Alterações salvas.",
    };
  }

  const { data, error } = await supabase.from("posts").insert(row).select("id").single();
  if (error) return dbError(error, "um texto");
  refreshSite();
  redirect(`/admin/artigos/${data.id}?salvo=${status === "published" ? "publicado" : "rascunho"}`);
}

export async function deletePost(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  if (id) await supabase.from("posts").delete().eq("id", id);
  refreshSite();
  redirect("/admin/artigos?excluido=1");
}

export async function previewMarkdown(markdown: string) {
  await requireAdmin();
  return renderMarkdown(markdown.slice(0, 200_000));
}

// ───────────── Categorias ─────────────
export async function saveCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return { error: "Dê um nome à categoria." };
  const row = {
    name,
    slug: slugify(str(fd, "slug") || name),
    description: str(fd, "description"),
    sort_order: Number(str(fd, "sort_order")) || 0,
  };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error) return dbError(error, "uma categoria");
  refreshSite();
  return { ok: true, message: id ? "Categoria atualizada." : "Categoria criada." };
}

export async function deleteCategory(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  if (id) await supabase.from("categories").delete().eq("id", id);
  refreshSite();
  redirect("/admin/categorias");
}

// ───────────── Devocionais ─────────────
export async function saveDevotional(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const intent = str(fd, "intent");
  const title = str(fd, "title");
  if (!title) return { error: "Dê um título ao devocional." };
  const bible_reference = str(fd, "bible_reference");
  if (!bible_reference) return { error: "Informe a referência bíblica (ex.: João 15:1-8)." };

  const status = intent === "publish" ? "published" : intent === "draft" ? "draft" : str(fd, "status") === "published" ? "published" : "draft";
  let published_at = fromLocalInput(str(fd, "published_at"));
  if (status === "published" && !published_at) published_at = new Date().toISOString();
  const is_weekly = fd.get("is_weekly") === "on";

  const row = {
    title,
    slug: slugify(str(fd, "slug") || title),
    bible_reference,
    book: str(fd, "book") || bible_reference.replace(/\s*\d+[:.,\d\s–-]*$/, "").trim(),
    theme: str(fd, "theme"),
    verse_text: str(fd, "verse_text"),
    summary: str(fd, "summary"),
    main_text: str(fd, "main_text"),
    context: str(fd, "context"),
    reflection: str(fd, "reflection"),
    application: str(fd, "application"),
    questions: str(fd, "questions")
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean),
    prayer: str(fd, "prayer"),
    cover_url: nullable(safeUrl(str(fd, "cover_url"))),
    cover_alt: str(fd, "cover_alt"),
    status,
    published_at,
    is_weekly,
  };

  // Apenas um devocional pode ser "da semana"
  if (is_weekly) {
    let unset = supabase.from("devotionals").update({ is_weekly: false }).eq("is_weekly", true);
    if (id) unset = unset.neq("id", id);
    const { error } = await unset;
    if (error) return dbError(error, "um devocional");
  }

  if (id) {
    const { error } = await supabase.from("devotionals").update(row).eq("id", id);
    if (error) return dbError(error, "um devocional");
    refreshSite();
    return { ok: true, message: intent === "publish" ? "Publicado! ♡" : intent === "draft" ? "Salvo como rascunho." : "Alterações salvas." };
  }
  const { data, error } = await supabase.from("devotionals").insert(row).select("id").single();
  if (error) return dbError(error, "um devocional");
  refreshSite();
  redirect(`/admin/devocionais/${data.id}?salvo=1`);
}

export async function deleteDevotional(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  if (id) await supabase.from("devotionals").delete().eq("id", id);
  refreshSite();
  redirect("/admin/devocionais");
}

export async function setWeeklyDevotional(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  await supabase.from("devotionals").update({ is_weekly: false }).eq("is_weekly", true);
  if (id) await supabase.from("devotionals").update({ is_weekly: true }).eq("id", id);
  refreshSite();
  redirect("/admin/devocionais");
}

// ───────────── Vídeos ─────────────
export async function saveVideo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const youtube_id = parseYouTubeId(str(fd, "youtube_url"));
  if (!youtube_id) return { error: "Cole um link válido do YouTube (ex.: https://www.youtube.com/watch?v=...)." };
  const title = str(fd, "title");
  if (!title) return { error: "Dê um título ao vídeo." };
  const is_featured = fd.get("is_featured") === "on";

  if (is_featured) {
    let unset = supabase.from("videos").update({ is_featured: false }).eq("is_featured", true);
    if (id) unset = unset.neq("id", id);
    await unset;
  }

  const row = {
    youtube_id,
    title,
    description: str(fd, "description"),
    playlist: str(fd, "playlist"),
    is_featured,
    published_at: nullable(str(fd, "published_at")),
    thumbnail_url: nullable(safeUrl(str(fd, "thumbnail_url"))),
    sort_order: Number(str(fd, "sort_order")) || 0,
    is_demo: false,
  };
  const { error } = id ? await supabase.from("videos").update(row).eq("id", id) : await supabase.from("videos").insert(row);
  if (error) return dbError(error, "um vídeo");
  refreshSite();
  return { ok: true, message: id ? "Vídeo atualizado." : "Vídeo adicionado! ♡" };
}

export async function deleteVideo(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  if (id) await supabase.from("videos").delete().eq("id", id);
  refreshSite();
  redirect("/admin/videos");
}

// ───────────── Configurações do site ─────────────
const SETTINGS_KEYS: (keyof Omit<SiteSettings, "socials">)[] = [
  "siteName", "tagline", "heroEyebrow", "heroTitle", "heroSubtitle", "heroImageUrl", "heroImageAlt", "heroNote",
  "welcomeTitle", "welcomeLetter", "welcomeSignature", "weeklyTitle", "newsletterTitle", "newsletterText",
  "footerPhrase", "aboutTitle", "aboutText", "aboutPhotoUrl", "aboutPhotoAlt", "aboutSignature",
  "youtubeChannelUrl", "youtubeChannelName", "youtubeIntro", "seoDescription", "authorName", "googleVerification",
  "bingVerification",
];
const URL_KEYS = new Set(["heroImageUrl", "aboutPhotoUrl", "youtubeChannelUrl"]);

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const data: Record<string, unknown> = {};
  for (const key of SETTINGS_KEYS) {
    const raw = String(fd.get(key) ?? "").replace(/\r\n/g, "\n").trim();
    data[key] = URL_KEYS.has(key) ? safeUrl(raw) : raw;
  }
  // Aceita a tag <meta ... content="código"> inteira e guarda só o código
  for (const key of ["googleVerification", "bingVerification"] as const) {
    const value = String(data[key] ?? "");
    data[key] = (value.match(/content=["']([^"']+)["']/)?.[1] ?? value).replace(/[^\w\-]/g, "");
  }
  const email = str(fd, "social_email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "O e-mail de contato parece inválido." };
  data.socials = {
    instagram: safeUrl(str(fd, "social_instagram")),
    tiktok: safeUrl(str(fd, "social_tiktok")),
    pinterest: safeUrl(str(fd, "social_pinterest")),
    spotify: safeUrl(str(fd, "social_spotify")),
    email,
  };
  const { error } = await supabase.from("site_settings").update({ data }).eq("id", 1);
  if (error) return dbError(error, "configurações");
  refreshSite();
  return { ok: true, message: "Configurações salvas! O site já foi atualizado. ♡" };
}

// ───────────── Conteúdo demonstrativo ─────────────
export async function importDemoContent() {
  const { supabase } = await requireAdmin();
  const { data: cats } = await supabase.from("categories").select("id, slug");
  const bySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));
  const demoCatSlug = new Map(demoCategories.map((c) => [c.id, c.slug]));

  await supabase.from("posts").upsert(
    demoPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      cover_url: p.cover_url,
      cover_alt: p.cover_alt,
      category_id: bySlug.get(demoCatSlug.get(p.category_id ?? "") ?? "") ?? null,
      status: "published",
      published_at: p.published_at,
      is_demo: true,
    })),
    { onConflict: "slug", ignoreDuplicates: true },
  );

  const { count: weeklyCount } = await supabase.from("devotionals").select("id", { count: "exact", head: true }).eq("is_weekly", true);
  await supabase.from("devotionals").upsert(
    demoDevotionals.map(({ id: _id, updated_at: _u, ...d }) => ({ ...d, is_weekly: d.is_weekly && !weeklyCount })),
    { onConflict: "slug", ignoreDuplicates: true },
  );

  const { count: videoCount } = await supabase.from("videos").select("id", { count: "exact", head: true }).eq("is_demo", true);
  if (!videoCount) {
    await supabase.from("videos").insert(demoVideos.map(({ id: _id, ...v }) => v));
  }

  refreshSite();
  redirect("/admin?demo=importado");
}

export async function removeDemoContent() {
  const { supabase } = await requireAdmin();
  await Promise.all([
    supabase.from("posts").delete().eq("is_demo", true),
    supabase.from("devotionals").delete().eq("is_demo", true),
    supabase.from("videos").delete().eq("is_demo", true),
  ]);
  refreshSite();
  redirect("/admin?demo=removido");
}
