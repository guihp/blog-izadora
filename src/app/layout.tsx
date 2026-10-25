import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, DM_Sans } from "next/font/google";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/config/site";
import { getSettings } from "@/lib/data";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-caveat", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = settings.seoDescription || settings.heroSubtitle;
  const author = settings.authorName || settings.siteName;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${settings.siteName} · ${settings.tagline}`, template: `%s · ${settings.siteName}` },
    description,
    applicationName: settings.siteName,
    authors: [{ name: author, url: "/sobre" }],
    creator: author,
    category: "religião e espiritualidade",
    keywords: [
      "blog cristão",
      "devocional",
      "fé",
      "mulher cristã",
      "vida com Deus",
      "identidade em Cristo",
      "propósito",
      "Bíblia",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    verification: {
      google: settings.googleVerification || undefined,
      other: settings.bingVerification ? { "msvalidate.01": settings.bingVerification } : undefined,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: settings.siteName,
      title: settings.siteName,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: settings.siteName, description, images: [DEFAULT_OG_IMAGE.url] },
    alternates: { types: { "application/rss+xml": [{ url: "/feed.xml", title: settings.siteName }] } },
    icons: { icon: "/icon.svg" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#fff9f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        {/* Ativa as animações de entrada somente quando há JavaScript */}
        <script dangerouslySetInnerHTML={{ __html: "if(!/[?&]static\\b/.test(location.search))document.documentElement.classList.add('js')" }} />
      </head>
      {/* Extensões do navegador (ex.: ColorZilla) colocam atributos no <body> antes do React */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
