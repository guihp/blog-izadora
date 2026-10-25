import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

/** Permite "adicionar à tela inicial" no celular com nome e cores do blog. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  return {
    name: settings.siteName,
    short_name: settings.siteName,
    description: settings.seoDescription || settings.heroSubtitle,
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#fff9f2",
    theme_color: "#fff9f2",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
