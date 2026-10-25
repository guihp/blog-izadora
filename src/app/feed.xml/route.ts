import { SITE_URL } from "@/config/site";
import { getPosts, getSettings } from "@/lib/data";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Feed RSS dos artigos — útil para leitores de RSS e automações de newsletter. */
export async function GET() {
  const [settings, { posts }] = await Promise.all([getSettings(), getPosts({ pageSize: 30 })]);
  const items = posts
    .map(
      (p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${SITE_URL}/blog/${p.slug}</link>
  <guid>${SITE_URL}/blog/${p.slug}</guid>
  <description>${esc(p.excerpt)}</description>
  ${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ""}
  ${p.category ? `<category>${esc(p.category.name)}</category>` : ""}
</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${esc(settings.siteName)}</title>
  <link>${SITE_URL}</link>
  <description>${esc(settings.heroSubtitle)}</description>
  <language>pt-BR</language>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
