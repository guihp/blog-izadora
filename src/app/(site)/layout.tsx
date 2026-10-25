import { Analytics } from "@/components/Analytics";
import { RevealObserver } from "@/components/RevealObserver";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      {!isSupabaseConfigured && (
        <div className="demo-ribbon" role="note">
          Modo demonstração: os textos e vídeos marcados como “Exemplo” são ilustrativos e ainda não foram publicados.
        </div>
      )}
      <SiteHeader siteName={settings.siteName} footerPhrase={settings.footerPhrase} />
      <main id="conteudo">{children}</main>
      <SiteFooter settings={settings} />
      <RevealObserver />
      <Analytics />
    </>
  );
}
