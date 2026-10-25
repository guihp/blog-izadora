import type { Metadata } from "next";
import { ArrowRight, YouTubeIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { Sparkle } from "@/components/ornaments";
import { SmartImage } from "@/components/SmartImage";
import { VideoCard } from "@/components/VideoCard";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { SITE_URL } from "@/config/site";
import { getSettings, getVideos } from "@/lib/data";
import { openGraph } from "@/lib/seo";
import { absoluteUrl, paragraphs, safeUrl, youTubeThumb, youTubeWatchUrl } from "@/lib/utils";

export const revalidate = 300;

const DESCRIPTION = "Vídeos sobre fé, propósito, identidade e vida com Deus — como uma conversa entre amigas.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Meu YouTube",
    description: DESCRIPTION,
    alternates: { canonical: "/meu-youtube" },
    openGraph: await openGraph({ title: "Meu YouTube", description: DESCRIPTION, url: "/meu-youtube" }),
  };
}

export default async function YouTubePage() {
  const [settings, videos] = await Promise.all([getSettings(), getVideos()]);
  const channelUrl = safeUrl(settings.youtubeChannelUrl);
  const featured = videos.find((v) => v.is_featured) ?? videos[0];
  const rest = videos.filter((v) => v.id !== featured?.id);

  // Só vídeos reais (com ID do YouTube e data) entram nos dados para o Google
  const videoLd = videos
    .filter((v) => v.youtube_id && v.published_at && !v.is_demo)
    .map((v) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: v.title,
      description: v.description || v.title,
      thumbnailUrl: [v.thumbnail_url ? absoluteUrl(SITE_URL, v.thumbnail_url) : youTubeThumb(v.youtube_id!)],
      uploadDate: v.published_at,
      contentUrl: youTubeWatchUrl(v.youtube_id!),
      embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtube_id}`,
      inLanguage: "pt-BR",
    }));

  const playlists = new Map<string, typeof videos>();
  for (const v of videos) {
    const key = v.playlist || "Outros vídeos";
    playlists.set(key, [...(playlists.get(key) ?? []), v]);
  }

  return (
    <>
      {videoLd.length > 0 && <JsonLd data={videoLd} />}
      <section className="section" style={{ paddingTop: "clamp(40px, 7vw, 88px)" }}>
        <div className="container channel-intro">
          <div>
            <span className="eyebrow eyebrow--left">Meu YouTube</span>
            <h1 className="channel-intro__title">
              Uma conversa <em>entre amigas</em>, com a Bíblia aberta
            </h1>
            {paragraphs(settings.youtubeIntro).map((p, i) => (
              <p key={i} style={{ color: "var(--ink-soft)", fontSize: "1.08rem" }}>
                {p}
              </p>
            ))}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              {channelUrl ? (
                <>
                  <a href={`${channelUrl}?sub_confirmation=1`} className="btn btn--rose" target="_blank" rel="noopener noreferrer">
                    <YouTubeIcon width={18} height={18} /> Inscreva-se no canal
                  </a>
                  <a href={channelUrl} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                    Visitar {settings.youtubeChannelName} <ArrowRight width={16} height={16} />
                  </a>
                </>
              ) : (
                <div className="notice">
                  <p>
                    O botão de inscrição aparecerá aqui assim que a URL do canal for configurada no painel
                    (Configurações → YouTube).
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="channel-intro__photo">
            <SmartImage
              src="/images/youtube.jpg"
              alt="Mesa clara com notebook, Bíblia com marcadores, café e peônias"
              sizes="(min-width: 900px) 560px, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      {featured ? (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="destaque">
          <div className="container container--narrow">
            <div className="section-head section-head--center">
              <div>
                <span className="eyebrow">Em destaque</span>
                <h2 id="destaque">
                  Para assistir <em>hoje</em>
                </h2>
              </div>
            </div>
            <div className="featured-video reveal">
              <YouTubeEmbed video={featured} priority />
              <div className="featured-video__info">
                {featured.playlist && <span className="category-link">{featured.playlist}</span>}
                <h3>{featured.title}</h3>
                {featured.description && <p>{featured.description}</p>}
                {featured.youtube_id && (
                  <a className="text-link" style={{ justifySelf: "start" }} href={youTubeWatchUrl(featured.youtube_id)} target="_blank" rel="noopener noreferrer">
                    Assistir no YouTube <ArrowRight width={16} height={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container container--narrow">
            <div className="empty-state">
              <h2>Os vídeos chegam em breve</h2>
              <p>Assim que forem adicionados no painel, eles aparecerão aqui.</p>
            </div>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="section videos-band" aria-labelledby="recentes">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow eyebrow--left">Mais recentes</span>
                <h2 id="recentes">
                  Últimos <em>vídeos</em>
                </h2>
              </div>
            </div>
            <div className="video-grid video-grid--3">
              {rest.slice(0, 6).map((v, i) => (
                <VideoCard key={v.id} video={v} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {playlists.size > 1 && (
        <section className="section" aria-labelledby="playlists">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow eyebrow--left">Playlists</span>
                <h2 id="playlists">
                  Por <em>tema</em>
                </h2>
              </div>
            </div>
            {[...playlists.entries()].map(([name, list]) => (
              <div key={name} className="playlist">
                <h3>
                  <Sparkle /> {name}
                </h3>
                <div className="video-grid video-grid--3">
                  {list.map((v, i) => (
                    <VideoCard key={v.id} video={v} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
