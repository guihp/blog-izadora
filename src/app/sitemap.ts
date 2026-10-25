import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { getAllSlugs } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, devotionals, categories } = await getAllSlugs();
  // Textos de exemplo ficam fora do Google
  const realPosts = posts.filter((p) => !p.demo);
  const realDevotionals = devotionals.filter((d) => !d.demo);
  const latest = [...realPosts, ...realDevotionals].map((x) => x.updated).sort().pop();

  const staticPages = ["", "/blog", "/devocionais", "/meu-youtube", "/sobre"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: path === "" || path === "/blog" ? latest : undefined,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const image = (cover: string | null) => (cover ? [absoluteUrl(SITE_URL, cover)] : undefined);
  return [
    ...staticPages,
    ...categories.map((slug) => ({ url: `${SITE_URL}/blog/categoria/${slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...realPosts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated, priority: 0.7, images: image(p.cover) })),
    ...realDevotionals.map((d) => ({
      url: `${SITE_URL}/devocionais/${d.slug}`,
      lastModified: d.updated,
      priority: 0.6,
      images: image(d.cover),
    })),
  ];
}
