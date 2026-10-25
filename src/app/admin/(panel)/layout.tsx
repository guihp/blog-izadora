import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { TrackingToggle } from "@/components/admin/TrackingToggle";
import { Sparkle } from "@/components/ornaments";
import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [{ user, isAdmin }, settings] = await Promise.all([getAdminSession(), getSettings()]);
  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    return (
      <main className="login">
        <div className="login__card">
          <h1>Acesso restrito</h1>
          <p>
            Você entrou como <strong>{user.email}</strong>, mas esta conta ainda não tem permissão para editar o site.
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>
            Para liberar, execute no SQL Editor do Supabase o comando que está no fim do arquivo{" "}
            <code>supabase/schema.sql</code> com este e-mail.
          </p>
          <form action={signOut}>
            <button className="btn btn--ghost" type="submit">
              Sair
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link href="/admin" className="logo">
          <Sparkle /> {settings.siteName}
        </Link>
        <AdminNav />
        <div className="admin-side__foot">
          <Link href="/" target="_blank" className="text-link" style={{ justifySelf: "start" }}>
            Ver o site ↗
          </Link>
          <span>{user.email}</span>
          <form action={signOut}>
            <button className="btn btn--ghost btn--sm" type="submit">
              Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
      <TrackingToggle />
    </div>
  );
}
