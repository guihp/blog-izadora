import "server-only";
import { cache } from "react";
import { defaultSettings, POSTS_PER_PAGE } from "@/config/site";
import { demoCategories, demoDevotionals, demoPosts, demoVideos } from "@/content/demo";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicClient } from "@/lib/supabase/public";
import type { Category, Devotional, Post, SiteSettings, Video } from "@/lib/types";

/**
 * Toda leitura de conteúdo do site passa por aqui.
 * - Com Supabase configurado: lê do banco (a RLS só entrega o que está publicado).
 * - Sem Supabase: usa o conteúdo demonstrativo de src/content/demo.ts.
 */

const POST_FIELDS = "*, category:categories(*)";

function logError(where: string, error: unknown) {
  console.error(`[data] ${where}:`, error);
}

/** Remove caracteres com significado especial nos filtros do PostgREST. */
function cleanSearch(q: string) {
  return q.replace(/[,()%*\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// ───────────── Configurações ─────────────
export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return defaultSettings;
  const { data, error } = await getPublicClient().from("site_settings").select("data").eq("id", 1).maybeSingle();
  if (error) logError("getSettings", error);
  const stored = (data?.data ?? {}) as Partial<SiteSettings>;
  return {
    ...defaultSettings,
    ...stripEmpty(stored),
    socials: { ...defaultSettings.socials, ...(stored.socials ?? {}) },
  };
});

function stripEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && !(typeof v === "string" && v.trim() === "")),
  ) as Partial<T>;
}

// ───────────── Categorias ─────────────
export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return demoCategories;
  const { data, error } = await getPublicClient().from("categories").select("*").order("sort_order").order("name");
  if (error) logError("getCategories", error);
  return (data ?? []) as Category[];
});

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

// ───────────── Artigos ─────────────
export type PostQuery = { q?: string; category?: string; page?: number; pageSize?: number };

export async function getPosts({ q = "", category, page = 1, pageSize = POSTS_PER_PAGE }: PostQuery = {}) {
  const search = cleanSearch(q);
  const from = (Math.max(1, page) - 1) * pageSize;

  if (!isSupabaseConfigured) {
    let list = [...demoPosts].sort(byPublishedDesc);
    if (category) list = list.filter((p) => p.category?.slug === category);
    if (search) {
      const term = normalize(search);
      list = list.filter((p) => normalize(`${p.title} ${p.excerpt} ${p.content}`).includes(term));
    }
    return { posts: list.slice(from, from + pageSize), total: list.length };
  }

  let query = getPublicClient()
    .from("posts")
    .select(POST_FIELDS, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (category) {
    const cat = await getCategoryBySlug(category);
    if (!cat) return { posts: [], total: 0 };
    query = query.eq("category_id", cat.id);
  }
  if (search) {
    const like = `%${search}%`;
    query = query.or(`title.ilike.${like},excerpt.ilike.${like},content.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) logError("getPosts", error);
  return { posts: (data ?? []) as Post[], total: count ?? 0 };
}

export async function getLatestPosts(limit = 6) {
  return (await getPosts({ pageSize: limit })).posts;
}

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  if (!isSupabaseConfigured) return demoPosts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await getPublicClient()
    .from("posts")
    .select(POST_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) logError("getPostBySlug", error);
  return (data as Post) ?? null;
});

export async function getRelatedPosts(post: Post, limit = 3) {
  const sameCategory = post.category?.slug
    ? (await getPosts({ category: post.category.slug, pageSize: limit + 1 })).posts
    : [];
  const related = sameCategory.filter((p) => p.id !== post.id);
  if (related.length < limit) {
    const latest = await getLatestPosts(limit + 4);
    for (const p of latest) {
      if (related.length >= limit) break;
      if (p.id !== post.id && !related.some((r) => r.id === p.id)) related.push(p);
    }
  }
  return related.slice(0, limit);
}

export async function getCategoryPostCounts() {
  const counts: Record<string, number> = {};
  if (!isSupabaseConfigured) {
    for (const p of demoPosts) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
    return counts;
  }
  const { data, error } = await getPublicClient()
    .from("posts")
    .select("category_id")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (error) logError("getCategoryPostCounts", error);
  for (const row of data ?? []) if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  return counts;
}

// ───────────── Devocionais ─────────────
export async function getDevotionals({ theme, book, q }: { theme?: string; book?: string; q?: string } = {}) {
  let list: Devotional[];
  if (!isSupabaseConfigured) {
    list = [...demoDevotionals];
  } else {
    const { data, error } = await getPublicClient()
      .from("devotionals")
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(500);
    if (error) logError("getDevotionals", error);
    list = (data ?? []) as Devotional[];
  }
  list.sort(byPublishedDesc);
  if (theme) list = list.filter((d) => d.theme === theme);
  if (book) list = list.filter((d) => d.book === book);
  if (q) {
    const term = normalize(cleanSearch(q));
    list = list.filter((d) =>
      normalize(`${d.title} ${d.bible_reference} ${d.summary} ${d.main_text} ${d.reflection}`).includes(term),
    );
  }
  return list;
}

export const getDevotionalBySlug = cache(async (slug: string): Promise<Devotional | null> => {
  if (!isSupabaseConfigured) return demoDevotionals.find((d) => d.slug === slug) ?? null;
  const { data, error } = await getPublicClient()
    .from("devotionals")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) logError("getDevotionalBySlug", error);
  return (data as Devotional) ?? null;
});

/** O devocional marcado como "da semana" ou, na falta dele, o mais recente. */
export async function getWeeklyDevotional() {
  const list = await getDevotionals();
  return list.find((d) => d.is_weekly) ?? list[0] ?? null;
}

// ───────────── Vídeos ─────────────
export const getVideos = cache(async (): Promise<Video[]> => {
  if (!isSupabaseConfigured) return demoVideos;
  const { data, error } = await getPublicClient()
    .from("videos")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("sort_order");
  if (error) logError("getVideos", error);
  return (data ?? []) as Video[];
});

// ───────────── Sitemap ─────────────
export async function getAllSlugs() {
  const [{ posts }, devotionals, categories] = await Promise.all([
    getPosts({ pageSize: 1000 }),
    getDevotionals(),
    getCategories(),
  ]);
  return {
    posts: posts.map((p) => ({ slug: p.slug, updated: p.updated_at, cover: p.cover_url, demo: p.is_demo })),
    devotionals: devotionals.map((d) => ({ slug: d.slug, updated: d.updated_at, cover: d.cover_url, demo: d.is_demo })),
    categories: categories.map((c) => c.slug),
  };
}

function byPublishedDesc(a: { published_at: string | null }, b: { published_at: string | null }) {
  return (b.published_at ?? "").localeCompare(a.published_at ?? "");
}
