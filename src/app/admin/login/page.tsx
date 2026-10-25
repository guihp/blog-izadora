import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkle } from "@/components/ornaments";
import { SmartImage } from "@/components/SmartImage";
import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const [{ user }, settings] = await Promise.all([getAdminSession(), getSettings()]);
  if (user) redirect("/admin");

  return (
    <main className="login">
      <div className="login__media" aria-hidden="true">
        <SmartImage src="/images/hero-principal.jpg" alt="" sizes="50vw" priority />
        <p className="login__quote">“Permanecei em mim, e eu permanecerei em vós.”</p>
      </div>
      <div className="login__card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="login__bow" src="/images/recortes/laco.webp" alt="" width={420} height={440} aria-hidden="true" />
        <Link href="/" className="logo" style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Sparkle /> {settings.siteName}
        </Link>
        <h1>Bem-vinda de volta</h1>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", marginBottom: 24 }}>Entre para cuidar do seu cantinho ♡</p>
        <LoginForm />
      </div>
    </main>
  );
}
