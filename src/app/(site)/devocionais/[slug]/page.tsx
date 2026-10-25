import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DevotionalCard } from "@/components/DevotionalCard";
import { breadcrumbs, JsonLd } from "@/components/JsonLd";
import { FloralDivider } from "@/components/ornaments";
import { ShareButtons } from "@/components/ShareButtons";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/config/site";
import { getDevotionalBySlug, getDevotionals, getSettings } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { openGraph } from "@/lib/seo";
import { absoluteUrl, formatDate } from "@/lib/utils";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getDevotionals()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDevotionalBySlug(slug);
  if (!d) return {};
  const title = `${d.title} (${d.bible_reference})`;
  const images = [d.cover_url ? { url: absoluteUrl(SITE_URL, d.cover_url), alt: d.cover_alt } : DEFAULT_OG_IMAGE];
  return {
    title,
    description: d.summary,
    alternates: { canonical: `/devocionais/${d.slug}` },
    robots: d.is_demo ? { index: false, follow: true } : undefined,
    openGraph: await openGraph({
      type: "article",
      title,
      description: d.summary,
      url: `/devocionais/${d.slug}`,
      publishedTime: d.published_at ?? undefined,
      modifiedTime: d.updated_at,
      section: "Devocionais",
      images,
    }),
    twitter: { card: "summary_large_image", title, description: d.summary, images: images.map((i) => i.url) },
  };
}

export default async function DevotionalPage({ params }: Props) {
  const { slug } = await params;
  const d = await getDevotionalBySlug(slug);
  if (!d) notFound();

  const [all, settings] = await Promise.all([getDevotionals(), getSettings()]);
  const others = all.filter((x) => x.id !== d.id).slice(0, 3);
  const url = absoluteUrl(SITE_URL, `/devocionais/${d.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: d.title,
      description: d.summary,
      image: [absoluteUrl(SITE_URL, d.cover_url || DEFAULT_OG_IMAGE.url)],
      datePublished: d.published_at,
      dateModified: d.updated_at,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      articleSection: "Devocionais",
      keywords: [d.theme, d.book, d.bible_reference].filter(Boolean).join(", "),
      inLanguage: "pt-BR",
      author: {
        "@type": settings.authorName ? "Person" : "Organization",
        name: settings.authorName || settings.siteName,
        url: `${SITE_URL}/sobre`,
      },
      publisher: { "@type": "Organization", name: settings.siteName, url: SITE_URL },
      isPartOf: { "@id": `${SITE_URL}/#site` },
    },
    breadcrumbs(SITE_URL, [
      { name: "Devocionais", path: "/devocionais" },
      { name: d.title, path: `/devocionais/${d.slug}` },
    ]),
  ];

  const sections = [
    { title: "A Palavra de hoje", body: d.main_text },
    { title: "Contexto da passagem", body: d.context },
    { title: "Reflexão pessoal", body: d.reflection },
  ].filter((s) => s.body.trim());

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="section" style={{ paddingTop: "clamp(28px, 5vw, 64px)" }}>
        <div className="container">
          <p style={{ textAlign: "center", marginBottom: 24 }}>
            <Link href="/devocionais" className="text-link">
              ← Voltar para os devocionais
            </Link>
          </p>
          <article className="diary">
            <header className="diary__header">
              {d.published_at && <span className="diary__date">{formatDate(d.published_at)}</span>}
              <h1>{d.title}</h1>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {d.theme && <span className="badge">{d.theme}</span>}
                {d.is_demo && <span className="badge badge--demo">Devocional de exemplo</span>}
              </div>
            </header>

            {d.verse_text && (
              <figure className="diary__verse">
                <span className="tape" aria-hidden="true" />
                <blockquote>“{d.verse_text}”</blockquote>
                <figcaption>
                  <cite className="bible-ref">{d.bible_reference}</cite>
                </figcaption>
              </figure>
            )}

            {sections.map((s) => (
              <section key={s.title} className="diary-section">
                <h2>{s.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(s.body) }} />
              </section>
            ))}

            {d.application.trim() && (
              <section className="diary-section diary-section--box">
                <h2>Para viver hoje</h2>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(d.application) }} />
              </section>
            )}

            {d.questions.length > 0 && (
              <section className="diary-section">
                <h2>Perguntas para reflexão</h2>
                <ol className="question-list">
                  {d.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </section>
            )}

            {d.prayer.trim() && (
              <section className="diary-section">
                <h2>Oração</h2>
                <div className="prayer">
                  <p>{d.prayer}</p>
                </div>
              </section>
            )}

            <FloralDivider />
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <ShareButtons url={url} title={d.title} />
            </div>
          </article>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="mais-devocionais">
          <div className="container">
            <div className="section-head section-head--center">
              <div>
                <span className="eyebrow">Continue no diário</span>
                <h2 id="mais-devocionais">
                  Outros <em>devocionais</em>
                </h2>
              </div>
            </div>
            <div className="devo-grid">
              {others.map((o, i) => (
                <DevotionalCard key={o.id} devotional={o} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
