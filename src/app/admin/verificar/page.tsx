import { redirect } from "next/navigation";
import { Sparkle } from "@/components/ornaments";
import { getSettings } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "../actions";
import { MfaForm } from "./MfaForm";

export const metadata = { title: "Verificação em duas etapas" };

export default async function VerifyPage() {
  const supabase = await createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    settings,
  ] = await Promise.all([supabase.auth.getUser(), getSettings()]);
  if (!user) redirect("/admin/login");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.all.find((f) => f.factor_type === "totp" && f.status === "verified");

  return (
    <main className="login">
      <div className="login__card" style={{ width: "min(460px, 100%)" }}>
        <p className="logo" style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Sparkle /> {settings.siteName}
        </p>
        <h1>{factor ? "Só mais um passo" : "Proteja o seu painel"}</h1>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", marginBottom: 24 }}>
          {factor
            ? "Abra o app autenticador no celular e digite o código de 6 números do blog."
            : "Para entrar no painel, além da senha, vamos usar um código do celular. Assim, mesmo que alguém descubra a senha, não consegue entrar."}
        </p>
        <MfaForm factorId={factor?.id ?? null} />
        <form action={signOut} style={{ marginTop: 18, textAlign: "center" }}>
          <button className="btn btn--ghost btn--sm" type="submit">
            Sair ({user.email})
          </button>
        </form>
      </div>
    </main>
  );
}
