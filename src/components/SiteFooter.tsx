import Link from "next/link";
import { NAV_LINKS } from "@/config/site";
import type { SiteSettings } from "@/lib/types";
import { safeUrl } from "@/lib/utils";
import { InstagramIcon, MailIcon, PinterestIcon, SpotifyIcon, TikTokIcon, YouTubeIcon } from "./icons";
import { Sparkle } from "./ornaments";

export function socialLinks(settings: SiteSettings) {
  const s = settings.socials;
  return [
    { label: "YouTube", href: safeUrl(settings.youtubeChannelUrl), Icon: YouTubeIcon },
    { label: "Instagram", href: safeUrl(s.instagram), Icon: InstagramIcon },
    { label: "TikTok", href: safeUrl(s.tiktok), Icon: TikTokIcon },
    { label: "Pinterest", href: safeUrl(s.pinterest), Icon: PinterestIcon },
    { label: "Spotify", href: safeUrl(s.spotify), Icon: SpotifyIcon },
    { label: "E-mail", href: s.email ? `mailto:${s.email}` : "", Icon: MailIcon },
  ].filter((l) => l.href);
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = socialLinks(settings);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <Sparkle />
              <span>{settings.siteName}</span>
            </Link>
            <p>
              Um diário digital para quem deseja caminhar com Jesus de verdade — na Palavra, no secreto e na vida
              real.
            </p>
            <p className="footer-phrase">{settings.footerPhrase}</p>
          </div>

          <div className="footer-col">
            <h2>Navegue</h2>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h2>Acompanhe</h2>
            {socials.length > 0 ? (
              <ul>
                {socials.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                      <Icon width={18} height={18} />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                As redes sociais aparecerão aqui assim que forem configuradas no painel.
              </p>
            )}
          </div>
        </div>

        <p className="footer-wordmark" aria-hidden="true">
          {settings.siteName}
        </p>

        <div className="footer-bottom">
          <span>
            © {year} {settings.siteName}. Feito com amor e oração.
          </span>
          <Link href="/#newsletter">Receber as cartinhas ♡</Link>
        </div>
      </div>
    </footer>
  );
}
