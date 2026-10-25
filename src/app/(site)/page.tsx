import type { Metadata } from "next";
import Link from "next/link";
import { CircleBadge } from "@/components/CircleBadge";
import { Emphasis } from "@/components/Emphasis";
import { JsonLd } from "@/components/JsonLd";
import { ArrowRight, YouTubeIcon } from "@/components/icons";
import { Marquee } from "@/components/Marquee";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Sparkle, Sprig } from "@/components/ornaments";
import { PetalFall } from "@/components/PetalFall";
import { PostCard } from "@/components/PostCard";
import { SectionHead } from "@/components/SectionHead";
import { SilkRibbon } from "@/components/SilkRibbon";
import { SmartImage } from "@/components/SmartImage";
import { VideoCard } from "@/components/VideoCard";
import {
  getCategories,
  getCategoryPostCounts,
  getLatestPosts,
  getSettings,
  getVideos,
  getWeeklyDevotional,
} from "@/lib/data";
import { categoryImage, SITE_URL } from "@/config/site";
import { absoluteUrl, paragraphs, safeUrl } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, posts, videos, weekly, categories, counts] = await Promise.all([
    getSettings(),
    getLatestPosts(6),
    getVideos(),
    getWeeklyDevotional(),
    getCategories(),
    getCategoryPostCounts(),
  ]);
  const latestVideos = videos.slice(0, 4);
  const channelUrl = safeUrl(settings.youtubeChannelUrl);
  const sameAs = [channelUrl, ...Object.entries(settings.socials).filter(([k]) => k !== "email").map(([, v]) => safeUrl(v))].filter(
    Boolean,
  );
  const owner = settings.authorName
    ? { "@type": "Person", "@id": `${SITE_URL}/#autora`, name: settings.authorName, url: `${SITE_URL}/sobre`, sameAs }
    : { "@type": "Organization", "@id": `${SITE_URL}/#autora`, name: settings.siteName, url: SITE_URL, sameAs };
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#site`,
      name: settings.siteName,
      description: settings.seoDescription || settings.heroSubtitle,
      url: SITE_URL,
      inLanguage: "pt-BR",
      image: absoluteUrl(SITE_URL, settings.heroImageUrl),
      publisher: { "@id": `${SITE_URL}/#autora` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/busca?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    { "@context": "https://schema.org", ...owner },
  ];
  const verse = splitVerse(settings.heroNote);

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* ───────────── Hero ───────────── */}
      <section className="hero" aria-labelledby="hero-title">
        <SilkRibbon className="hero__ribbon" />
        <PetalFall />
        <div className="container hero__grid">
          <div className="hero__text">
            <span className="eyebrow eyebrow--left">{settings.heroEyebrow}</span>
            <h1 id="hero-title">
              <Emphasis text={settings.heroTitle} />
            </h1>
            <p className="hero__subtitle">{settings.heroSubtitle}</p>
            <div className="hero__actions">
              <Link href="/blog" className="btn">
                Explore o blog <ArrowRight width={18} height={18} className="arrow" />
              </Link>
              <Link href="/meu-youtube" className="btn btn--ghost">
                <YouTubeIcon width={18} height={18} /> Assista aos vídeos
              </Link>
            </div>
            <ul className="hero__topics" aria-label="Sobre o que escrevo">
              <li>Fé na vida real</li>
              <li>Identidade em Cristo</li>
              <li>Vida no secreto</li>
            </ul>
          </div>

          <div className="hero__visual">
            <div className="hero__arch">
              <SmartImage src={settings.heroImageUrl} alt={settings.heroImageAlt} sizes="(min-width: 900px) 480px, 86vw" priority />
            </div>
            {/* Rosa renderizada no Blender: desabrocha uma vez; estática para quem reduz movimento */}
            <picture className="hero__rose" aria-hidden="true">
              <source media="(prefers-reduced-motion: reduce)" srcSet="/images/efeitos/rosa.webp" />
              <img src="/images/efeitos/rosa-desabrochando.webp" alt="" width={300} height={266} />
            </picture>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hero__bow" src="/images/recortes/laco.webp" alt="" width={420} height={440} aria-hidden="true" />
            <figure className="hero__polaroid">
              <span className="tape" aria-hidden="true" />
              <div className="hero__polaroid-img">
                <SmartImage
                  src="/images/hero-detalhe.jpg"
                  alt="Rosa cor-de-rosa com gotas de orvalho sobre a página de um diário"
                  sizes="(min-width: 900px) 200px, 38vw"
                />
              </div>
              <figcaption>um momento com Ele</figcaption>
            </figure>
            <CircleBadge text="diário · fé · propósito · palavra · " className="hero__badge" />
          </div>
        </div>
      </section>

      <Marquee items={categories.map((c) => ({ label: c.name, href: `/blog/categoria/${c.slug}` }))} />

      {/* ───────────── Carta de boas-vindas ───────────── */}
      <section className="section welcome" aria-labelledby="boas-vindas">
        <div className="container welcome__grid">
          <div className="welcome__media reveal">
            <div className="welcome__photo">
              <SmartImage
                src="/images/carta.jpg"
                alt="Mãos escrevendo com caneta-tinteiro em um diário, ao lado de uma Bíblia aberta, flores e uma xícara de café"
                sizes="(min-width: 900px) 520px, 92vw"
              />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="welcome__seal" src="/images/recortes/selo.webp" alt="" width={320} height={276} aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="welcome__pressed" src="/images/recortes/rosa-prensada.webp" alt="" width={380} height={474} aria-hidden="true" />
          </div>
          <article className="letter reveal">
            <span className="tape tape--sage" aria-hidden="true" />
            <h2 id="boas-vindas">{settings.welcomeTitle}</h2>
            {paragraphs(settings.welcomeLetter).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="letter__signature">{settings.welcomeSignature}</p>
            <Sprig className="ornament letter__flower" width={92} height={92} />
          </article>
        </div>
      </section>

      {/* ───────────── Últimos artigos ───────────── */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="ultimos-artigos">
        <div className="container">
          <SectionHead
            id="ultimos-artigos"
            eyebrow="Do diário"
            title={
              <>
                Últimas <em>reflexões</em>
              </>
            }
            action={
              <Link href="/blog" className="text-link">
                Ver todos os textos <ArrowRight width={16} height={16} />
              </Link>
            }
          />
          {posts.length > 0 ? (
            <div className="post-grid post-grid--editorial">
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="feature-empty reveal">
              <div className="feature-empty__media">
                <SmartImage
                  src="/images/pagina-blog.jpg"
                  alt="Diários de linho amarrados com fita, caneta-tinteiro e pétalas de rosa"
                  sizes="(min-width: 900px) 600px, 92vw"
                />
              </div>
              <div className="feature-empty__text">
                <span className="hand">em breve ♡</span>
                <h3>Os primeiros textos estão sendo escritos</h3>
                <p>Reflexões sinceras sobre fé, processos e vida com Deus. Assine as cartinhas para receber assim que forem publicados.</p>
                <a href="#newsletter" className="btn btn--sm">
                  Quero ser avisada <ArrowRight width={16} height={16} className="arrow" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───────────── Devocional da semana ───────────── */}
      {weekly && (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="devocional-semana">
          <div className="container">
            <SectionHead
              id="devocional-semana"
              center
              eyebrow="Devocional da semana"
              title={<em>{settings.weeklyTitle}</em>}
            />
            <div className="bible-spread reveal">
              <span className="ribbon-marker" aria-hidden="true" />
              <div className="bible-spread__page bible-spread__page--left">
                <div className="bible-spread__ref">
                  <span>{weekly.bible_reference}</span>
                  <Sparkle width={14} height={14} />
                </div>
                <blockquote className="bible-spread__verse">
                  <VerseWithHighlight text={weekly.verse_text} />
                </blockquote>
                <p className="bible-spread__annotation">↳ {weekly.summary}</p>
              </div>
              <div className="bible-spread__page bible-spread__page--right">
                <h3>{weekly.title}</h3>
                <div className="note-block">
                  <span className="note-block__label">reflexão</span>
                  <p>{weekly.main_text}</p>
                </div>
                {weekly.questions[0] && (
                  <div className="note-block note-block--question">
                    <span className="note-block__label">para meditar</span>
                    <p>{weekly.questions[0]}</p>
                  </div>
                )}
                {weekly.prayer && (
                  <div className="note-block">
                    <span className="note-block__label">oração</span>
                    <p>{weekly.prayer}</p>
                  </div>
                )}
                <Link href={`/devocionais/${weekly.slug}`} className="btn btn--sm">
                  Ler o devocional completo <ArrowRight width={16} height={16} />
                </Link>
                {weekly.is_demo && (
                  <p style={{ marginTop: 14, marginBottom: 0 }}>
                    <span className="badge badge--demo">Exemplo</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───────────── Categorias (bento) ───────────── */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="categorias">
        <div className="container">
          <SectionHead
            id="categorias"
            eyebrow="Assuntos do coração"
            title={
              <>
                Explore por <em>categoria</em>
              </>
            }
            text="Cada tema é uma gaveta do meu diário. Abra a que o seu coração precisa hoje."
          />
          <div className="bento">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/blog/categoria/${cat.slug}`}
                className="bento__item reveal"
                style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}
              >
                <SmartImage
                  src={categoryImage(cat.slug, i)}
                  alt=""
                  sizes={i === 0 ? "(min-width: 1000px) 560px, 92vw" : "(min-width: 1000px) 280px, 46vw"}
                />
                <span className="bento__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="bento__body">
                  <span className="bento__title">{cat.name}</span>
                  <span className="bento__desc">{cat.description}</span>
                  <span className="bento__count">
                    {counts[cat.id] ? `${counts[cat.id]} ${counts[cat.id] === 1 ? "texto" : "textos"}` : "em breve"}
                    <ArrowRight width={14} height={14} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Vídeos (faixa escura) ───────────── */}
      <section className="section band-dark" aria-labelledby="videos-recentes">
        <div className="container">
          <div className="band-dark__intro">
            <div className="band-dark__photo reveal">
              <SmartImage
                src="/images/youtube.jpg"
                alt="Mesa clara com notebook, Bíblia com marcadores, café e peônias"
                sizes="(min-width: 900px) 460px, 92vw"
              />
            </div>
            <div className="reveal">
              <span className="eyebrow eyebrow--left">No canal</span>
              <h2 id="videos-recentes">
                Uma conversa <em>entre amigas</em>, com a Bíblia aberta
              </h2>
              <p>Conversas sinceras sobre fé, propósito e identidade, para assistir com um café na mão.</p>
              <div className="band-dark__actions">
                <Link href="/meu-youtube" className="btn btn--light">
                  Todos os vídeos <ArrowRight width={16} height={16} className="arrow" />
                </Link>
                {channelUrl && (
                  <a href={`${channelUrl}?sub_confirmation=1`} className="btn btn--rose" target="_blank" rel="noopener noreferrer">
                    <YouTubeIcon width={16} height={16} /> Inscreva-se
                  </a>
                )}
              </div>
            </div>
          </div>
          {latestVideos.length > 0 ? (
            <div className="video-grid video-grid--4">
              {latestVideos.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} />
              ))}
            </div>
          ) : (
            <p className="band-dark__soon">
              <Sparkle width={14} height={14} /> Os primeiros vídeos chegam em breve
            </p>
          )}
        </div>
      </section>

      {/* ───────────── Versículo ───────────── */}
      {verse && (
        <section className="section verse-feature" aria-label="Versículo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="verse-feature__sprig" src="/images/recortes/ramo.webp" alt="" width={300} height={429} aria-hidden="true" />
          <figure className="container verse-feature__inner reveal">
            <blockquote>{verse.text}</blockquote>
            {verse.ref && <figcaption>{verse.ref}</figcaption>}
          </figure>
        </section>
      )}

      {/* ───────────── Newsletter ───────────── */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="newsletter-title" id="newsletter">
        <div className="container">
          <div className="newsletter reveal">
            <div className="newsletter__media">
              <SmartImage
                src="/images/newsletter.jpg"
                alt="Envelopes fechados com selo de cera rosa, fitas e flores secas"
                sizes="(min-width: 900px) 520px, 92vw"
              />
            </div>
            <div className="newsletter__body">
              <span className="eyebrow eyebrow--left">Newsletter</span>
              <h2 id="newsletter-title">{settings.newsletterTitle}</h2>
              <p>{settings.newsletterText}</p>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Separa "“texto” — Referência" em partes, para mostrar o versículo em destaque. */
function splitVerse(note: string) {
  const clean = note.trim();
  if (!clean) return null;
  const m = clean.match(/^[“"]?(.+?)[”"]?\s*[—–-]\s*([^—–-]+)$/);
  return m ? { text: m[1].trim(), ref: m[2].trim() } : { text: clean.replace(/^[“"]|[”"]$/g, ""), ref: "" };
}

/** Destaca a primeira frase do versículo como se fosse marcada com marca-texto. */
function VerseWithHighlight({ text }: { text: string }) {
  const cut = text.search(/[;,.](\s|$)/);
  if (cut < 18) return <>“{text}”</>;
  return (
    <>
      “<mark>{text.slice(0, cut)}</mark>
      {text.slice(cut)}”
    </>
  );
}
