import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/config/site";
import { getSettings } from "@/lib/data";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * O Next.js substitui (e não mescla) o `openGraph` do layout quando a página define o seu.
 * Esta função repõe o nome do site, o idioma e a imagem padrão.
 */
export async function openGraph(og: OpenGraph & { images?: unknown }): Promise<OpenGraph> {
  const settings = await getSettings();
  return {
    type: "website",
    locale: "pt_BR",
    siteName: settings.siteName,
    images: [DEFAULT_OG_IMAGE],
    ...og,
  } as OpenGraph;
}
