import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { breadcrumbs, JsonLd } from "@/components/JsonLd";
import { FloralDivider } from "@/components/ornaments";
import { PostCard } from "@/components/PostCard";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ShareButtons } from "@/components/ShareButtons";
import { SmartImage } from "@/components/SmartImage";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/config/site";
import { getPostBySlug, getPosts, getRelatedPosts, getSettings } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { openGraph } from "@/lib/seo";
import { absoluteUrl, formatDate, readingTime } from "@/lib/utils";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { posts } = await getPosts({ pageSize: 200 });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()]);
  if (!post) return {};
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const images = [post.cover_url ? { url: absoluteUrl(SITE_URL, post.cover_url), alt: post.cover_alt } : DEFAULT_OG_IMAGE];
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    // Textos de exemplo não devem aparecer no Google
    robots: post.is_demo ? { index: false, follow: true } : undefined,
    authors: [{ name: settings.authorName || settings.siteName, url: "/sobre" }],
    openGraph: await openGraph({
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      section: post.category?.name,
      authors: [settings.authorName || settings.siteName],
      images,
    }),
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [settings, related] = await Promise.all([getSettings(), getRelatedPosts(post)]);
  const url = absoluteUrl(SITE_URL, `/blog/${post.slug}`);
  const cover = absoluteUrl(SITE_URL, post.cover_url || DEFAULT_OG_IMAGE.url);
  const authorName = settings.authorName || settings.siteName;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seo_description || post.excerpt,
      image: [cover],
      datePublished: post.published_at,
      dateModified: post.updated_at,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      articleSection: post.category?.name,
      wordCount: post.content.split(/\s+/).filter(Boolean).length,
      inLanguage: "pt-BR",
      author: { "@type": settings.authorName ? "Person" : "Organization", name: authorName, url: `${SITE_URL}/sobre` },
      publisher: {
        "@type": "Organization",
        name: settings.siteName,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
      },
      isPartOf: { "@id": `${SITE_URL}/#site` },
    },
    breadcrumbs(SITE_URL, [
      { name: "Blog", path: "/blog" },
      ...(post.category ? [{ name: post.category.name, path: `/blog/categoria/${post.category.slug}` }] : []),
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <article>
      <ReadingProgress />
      <JsonLd data={jsonLd} />

      <header className="article-header container">
        {post.category ? (
          <Link href={`/blog/categoria/${post.category.slug}`} className="category-link">
            {post.category.name}
          </Link>
        ) : (
          <span className="eyebrow">Do diário</span>
        )}
        <h1>{post.title}</h1>
        {post.excerpt && <p className="lead">{post.excerpt}</p>}
        <div className="article-meta">
          {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
          <span className="dot" aria-hidden="true" />
          <span>{readingTime(post.content)} min de leitura</span>
          {post.is_demo && <span className="badge badge--demo">Texto de exemplo</span>}
        </div>
      </header>

      {post.cover_url && (
        <div className="container">
          <figure className="article-cover" style={{ margin: "0 auto clamp(36px, 6vw, 64px)" }}>
            <SmartImage src={post.cover_url} alt={post.cover_alt || ""} sizes="(min-width: 1100px) 1040px, 100vw" priority />
          </figure>
        </div>
      )}

      <div className="container">
        {post.is_demo && (
          <div className="notice" style={{ maxWidth: 680, margin: "0 auto 36px" }}>
            <p>
              Este é um <strong>texto demonstrativo</strong>, criado para mostrar como os artigos aparecem no site. Ele
              pode ser editado ou removido no painel administrativo.
            </p>
          </div>
        )}

        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

        <footer className="article-footer">
          <FloralDivider />
          <ShareButtons url={url} title={post.title} image={cover} />
          <div className="author-card">
            <div className="author-card__photo" style={{ position: "relative" }}>
              <SmartImage src={settings.aboutPhotoUrl} alt="" sizes="72px" />
            </div>
            <div>
              <strong>{settings.aboutSignature}</strong>
              <p>
                Escrevo sobre o que Deus tem me ensinado na Palavra e nos dias comuns.{" "}
                <Link href="/sobre">Conheça minha história</Link>.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {related.length > 0 && (
        <section className="section" aria-labelledby="leia-tambem">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow eyebrow--left">Continue lendo</span>
                <h2 id="leia-tambem">
                  Leia <em>também</em>
                </h2>
              </div>
              <Link href="/blog" className="text-link">
                Todos os textos <ArrowRight width={16} height={16} />
              </Link>
            </div>
            <div className="post-grid">
              {related.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
