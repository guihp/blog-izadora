import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminSession } from "@/lib/auth";
import { defaultSettings } from "@/config/site";
import type { SiteSettings } from "@/lib/types";

export default async function AdminSettings() {
  const { supabase } = await getAdminSession();
  const { data } = await supabase.from("site_settings").select("data").eq("id", 1).maybeSingle();
  const stored = (data?.data ?? {}) as Partial<SiteSettings>;
  const settings: SiteSettings = {
    ...defaultSettings,
    ...Object.fromEntries(Object.entries(stored).filter(([, v]) => v !== "" && v != null)),
    socials: { ...defaultSettings.socials, ...(stored.socials ?? {}) },
  };

  return (
    <>
      <header>
        <div>
          <h1>Página inicial e textos</h1>
          <p>Altere os textos do site, sua foto, o canal do YouTube e as redes sociais.</p>
        </div>
      </header>
      <SettingsForm settings={settings} />
    </>
  );
}
