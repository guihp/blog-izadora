import { EmailsNav } from "@/components/admin/EmailsNav";
import { isBrevoConfigured } from "@/lib/brevo";
import { getNewsletterProvider } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export default function EmailsLayout({ children }: { children: React.ReactNode }) {
  const connected = getNewsletterProvider() === "brevo" && isBrevoConfigured();
  return (
    <>
      <header>
        <div>
          <h1>E-mails</h1>
          <p>As cartinhas da newsletter: quem recebe, o que foi enviado e como cada envio se saiu.</p>
        </div>
        <a className="btn btn--ghost" href="https://app.brevo.com/" target="_blank" rel="noreferrer">
          Abrir o Brevo ↗
        </a>
      </header>
      {connected ? (
        <>
          <EmailsNav />
          {children}
        </>
      ) : (
        <section className="panel">
          <h2>O Brevo ainda não está conectado</h2>
          <p>
            Defina <code>NEWSLETTER_PROVIDER=brevo</code>, <code>BREVO_API_KEY</code> e <code>BREVO_LIST_ID</code> nas variáveis de
            ambiente (na Vercel: Settings → Environment Variables) e faça um novo deploy.
          </p>
        </section>
      )}
    </>
  );
}
