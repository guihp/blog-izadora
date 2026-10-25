import type { Metadata } from "next";
import Link from "next/link";
import { Sparkle } from "@/components/ornaments";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import "./admin.css";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="login">
        <div className="login__card" style={{ width: "min(620px, 100%)" }}>
          <Link href="/" className="logo" style={{ justifyContent: "center", display: "flex" }}>
            <Sparkle /> Painel
          </Link>
          <h1 style={{ marginTop: 16 }}>Falta só conectar o banco ♡</h1>
          <p>
            O painel administrativo usa o <strong>Supabase</strong> para guardar textos, devocionais e vídeos com
            segurança. Enquanto ele não está configurado, o site mostra apenas o conteúdo de exemplo.
          </p>
          <ol className="help-list">
            <li>Crie um projeto gratuito em supabase.com.</li>
            <li>
              No <em>SQL Editor</em>, execute o arquivo <code>supabase/schema.sql</code>.
            </li>
            <li>
              Copie a URL e a chave <em>anon/publishable</em> para <code>.env.local</code> (veja <code>.env.example</code>).
            </li>
            <li>
              Crie sua conta em <em>Authentication → Users</em> e cadastre-a como administradora (instruções no fim do{" "}
              <code>schema.sql</code>).
            </li>
            <li>Reinicie o site e volte para esta página.</li>
          </ol>
          <p style={{ marginTop: 20 }}>
            O passo a passo completo está no arquivo <code>README.md</code>.
          </p>
        </div>
      </div>
    );
  }
  return children;
}
