import Link from "next/link";
import { NewsletterComposer } from "@/components/admin/NewsletterComposer";
import { getAdminSession } from "@/lib/auth";
import { BREVO_LIST_ID, getList, NEWSLETTER_DOMAIN, pickSender } from "@/lib/brevo";
import { getSettings } from "@/lib/data";
import { safe } from "../shared";

export default async function NewEmailPage() {
  const [{ supabase, user }, settings] = await Promise.all([getAdminSession(), getSettings()]);
  const [list, sender, posts, devotionals, videos] = await Promise.all([
    BREVO_LIST_ID ? safe(() => getList(BREVO_LIST_ID!)) : Promise.resolve({ data: null, error: "BREVO_LIST_ID não definido." }),
    safe(() => pickSender(settings.siteName)),
    supabase.from("posts").select("id, title").eq("status", "published").order("published_at", { ascending: false }).limit(50),
    supabase.from("devotionals").select("id, title").eq("status", "published").order("published_at", { ascending: false }).limit(50),
    supabase.from("videos").select("id, title").not("youtube_id", "is", null).order("published_at", { ascending: false, nullsFirst: false }).limit(50),
  ]);
  const subscribers = list.data ? Math.max(0, list.data.uniqueSubscribers - list.data.totalBlacklisted) : null;
  const ownSender = sender.data?.email.toLowerCase().endsWith(`@${NEWSLETTER_DOMAIN}`);

  return (
    <section className="panel">
      <h2>Escrever uma cartinha</h2>
      {(list.error ?? sender.error) && <div className="alert alert--error">{list.error ?? sender.error}</div>}
      <p>
        Escolha um texto, devocional ou vídeo já publicado (ou escreva uma cartinha livre). Faça a prévia, mande um teste para
        você e, quando estiver tudo certo, envie para a lista.
      </p>
      {sender.data && (
        <dl className="kv" style={{ marginBottom: 18 }}>
          <dt>De</dt>
          <dd>
            {sender.data.name} &lt;{sender.data.email}&gt;
          </dd>
          <dt>Respostas vão para</dt>
          <dd>{sender.data.replyTo}</dd>
          <dt>Para</dt>
          <dd>{subscribers === null ? "a lista das cartinhas" : `${subscribers} inscrita${subscribers === 1 ? "" : "s"} ativa${subscribers === 1 ? "" : "s"}`}</dd>
        </dl>
      )}
      {!ownSender && sender.data && (
        <div className="alert alert--info">
          As cartinhas ainda saem pelo Gmail, o que aumenta a chance de cair no spam. Quando o domínio estiver autenticado, elas
          passam a sair de cartinhas@{NEWSLETTER_DOMAIN} automaticamente.{" "}
          <Link href="/admin/emails/configuracao" className="text-link">
            Ver o que falta →
          </Link>
        </div>
      )}
      <NewsletterComposer
        posts={posts.data ?? []}
        devotionals={devotionals.data ?? []}
        videos={videos.data ?? []}
        testEmail={user?.email ?? ""}
        subscribers={subscribers}
      />
    </section>
  );
}
