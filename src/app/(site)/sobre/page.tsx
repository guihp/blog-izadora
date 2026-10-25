import type { Metadata } from "next";
import Link from "next/link";
import { Emphasis } from "@/components/Emphasis";
import { ArrowRight } from "@/components/icons";
import { breadcrumbs, JsonLd } from "@/components/JsonLd";
import { Sprig } from "@/components/ornaments";
import { socialLinks } from "@/components/SiteFooter";
import { SmartImage } from "@/components/SmartImage";
import { SITE_URL } from "@/config/site";
import { getSettings } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { openGraph } from "@/lib/seo";

export const revalidate = 300;

const DESCRIPTION =
  "Minha caminhada de fé e o propósito deste diário: encorajar mulheres a viverem uma vida verdadeira com Jesus.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const isPlaceholder = settings.aboutPhotoUrl === "/images/sobre-provisoria.jpg";
  return {
    title: "Sobre mim",
    description: DESCRIPTION,
    alternates: { canonical: "/sobre" },
    openGraph: await openGraph({
      type: "profile",
      title: settings.authorName ? `Sobre ${settings.authorName}` : "Sobre mim",
      description: DESCRIPTION,
      url: "/sobre",
      ...(isPlaceholder ? {} : { images: [{ url: settings.aboutPhotoUrl, alt: settings.aboutPhotoAlt }] }),
    }),
  };
}

export default async function AboutPage() {
  const settings = await getSettings();
  const socials = socialLinks(settings);
  const isPlaceholder = settings.aboutPhotoUrl === "/images/sobre-provisoria.jpg";

  return (
    <section className="section" style={{ paddingTop: "clamp(40px, 7vw, 88px)" }}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Sobre mim",
            url: `${SITE_URL}/sobre`,
            inLanguage: "pt-BR",
            about: { "@id": `${SITE_URL}/#autora` },
            isPartOf: { "@id": `${SITE_URL}/#site` },
          },
          breadcrumbs(SITE_URL, [{ name: "Sobre mim", path: "/sobre" }]),
        ]}
      />
      <div className="container about">
        <div className="about__photo-wrap">
          <figure className="polaroid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="polaroid__bow" src="/images/recortes/laco.webp" alt="" width={420} height={440} aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="polaroid__pressed" src="/images/recortes/rosa-prensada.webp" alt="" width={380} height={474} aria-hidden="true" />
            <div className="polaroid__img">
              <SmartImage src={settings.aboutPhotoUrl} alt={settings.aboutPhotoAlt} sizes="(min-width: 900px) 420px, 90vw" priority />
            </div>
            <figcaption>{isPlaceholder ? "sua foto aqui ♡" : "oi, amiga ♡"}</figcaption>
          </figure>
          {isPlaceholder && (
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: 28 }}>
              Imagem provisória. Envie sua fotografia em Painel → Configurações → Sobre mim.
            </p>
          )}
        </div>

        <article className="letter">
          <span className="tape tape--sage" aria-hidden="true" />
          <span className="eyebrow eyebrow--left">Sobre mim</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 400, fontStyle: "italic", margin: "12px 0 24px" }}>
            <Emphasis text={settings.aboutTitle} />
          </h1>
          <div className="about-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(settings.aboutText) }} />
          <p className="letter__signature">{settings.aboutSignature}</p>
          <Sprig className="ornament letter__flower" width={92} height={92} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>
            <Link href="/blog" className="btn">
              Ler o blog <ArrowRight width={16} height={16} />
            </Link>
            <Link href="/meu-youtube" className="btn btn--ghost">
              Assistir aos vídeos
            </Link>
          </div>
          {socials.length > 0 && (
            <p style={{ marginTop: 28, lineHeight: 1.6 }}>
              <span className="hand" style={{ fontSize: "1.3rem" }}>me encontre também: </span>
              {socials.map(({ label, href }, i) => (
                <span key={label}>
                  {i > 0 && " · "}
                  <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                    {label}
                  </a>
                </span>
              ))}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
