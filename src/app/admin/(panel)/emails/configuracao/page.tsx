import { SyncTemplatesButton } from "@/components/admin/SyncTemplatesButton";
import { BREVO_LIST_ID, ensureDomainSender, getDomain, getList, getSendCredits, getTemplates, NEWSLETTER_DOMAIN, pickSender } from "@/lib/brevo";
import { getSettings } from "@/lib/data";
import { TEMPLATE_NAMES } from "@/lib/email-templates";
import { fmtDate, number, safe } from "../shared";

const DNS_LABELS: Record<string, string> = {
  brevo_code: "Código de verificação",
  dkim1Record: "Assinatura DKIM 1",
  dkim2Record: "Assinatura DKIM 2",
  dkim_record: "Assinatura DKIM",
  dmarc_record: "Política DMARC",
};

export default async function EmailSettingsPage() {
  const settings = await getSettings();
  // Domínio autenticado e ainda sem remetente próprio: cria cartinhas@ antes de ler os remetentes
  const domain = await safe(() => getDomain());
  if (domain.data?.authenticated) await safe(() => ensureDomainSender(settings.siteName));

  const [sender, list, templates, credits] = await Promise.all([
    safe(() => pickSender(settings.siteName)),
    BREVO_LIST_ID ? safe(() => getList(BREVO_LIST_ID!)) : Promise.resolve({ data: null, error: "BREVO_LIST_ID não definido." }),
    safe(() => getTemplates()),
    safe(() => getSendCredits()),
  ]);
  // O Brevo devolve alguns registros como null (ex.: dkim_record quando usa DKIM 1 e 2)
  const records = Object.entries(domain.data?.dns_records ?? {}).filter(
    (entry): entry is [string, NonNullable<(typeof entry)[1]>] => Boolean(entry[1]),
  );
  const blogTemplates = (templates.data ?? []).filter((t) => (Object.values(TEMPLATE_NAMES) as string[]).includes(t.name));

  return (
    <>
      <section className="panel">
        <h2>Envio</h2>
        {(sender.error ?? list.error) && <div className="alert alert--error">{sender.error ?? list.error}</div>}
        <dl className="kv">
          <dt>Remetente</dt>
          <dd>{sender.data ? `${sender.data.name} <${sender.data.email}>` : "—"}</dd>
          <dt>Respostas vão para</dt>
          <dd>{sender.data?.replyTo ?? "—"}</dd>
          <dt>Lista</dt>
          <dd>{list.data ? `${list.data.name} (nº ${list.data.id})` : "—"}</dd>
          <dt>Plano</dt>
          <dd>
            {credits.data
              ? `${credits.data.plan === "free" ? "Grátis" : credits.data.plan} · ${number.format(credits.data.credits)} envios disponíveis hoje`
              : "—"}
          </dd>
          <dt>Boas-vindas</dt>
          <dd>enviada sozinha a cada inscrição nova</dd>
        </dl>
      </section>

      <section className="panel">
        <h2>Domínio do e-mail</h2>
        {domain.data ? (
          domain.data.authenticated ? (
            <p>
              <span className="status-dot">
                <strong>{NEWSLETTER_DOMAIN}</strong> está autenticado: as cartinhas saem de cartinhas@{NEWSLETTER_DOMAIN}.
              </span>
            </p>
          ) : (
            <>
              <p>
                Para as cartinhas saírem de <strong>cartinhas@{NEWSLETTER_DOMAIN}</strong> e não caírem no spam, adicione estes
                registros na Vercel (Domains → {NEWSLETTER_DOMAIN} → DNS Records). Depois, clique em “Authenticate” no Brevo
                (Senders, Domains &amp; Dedicated IPs → Domains). Esta página cria o remetente sozinha quando o domínio for aprovado.
              </p>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Registro</th>
                      <th>Tipo</th>
                      <th>Nome</th>
                      <th>Valor</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(([key, r]) => (
                      <tr key={key}>
                        <td>{DNS_LABELS[key] ?? key}</td>
                        <td>{r.type}</td>
                        <td className="dns-value">{r.host_name}</td>
                        <td className="dns-value">{r.value}</td>
                        <td>{r.status ? <span className="badge badge--ok">OK</span> : <span className="badge badge--warn">Pendente</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        ) : (
          <p>{domain.error ?? `O domínio ${NEWSLETTER_DOMAIN} não está cadastrado no Brevo.`}</p>
        )}
      </section>

      <section className="panel">
        <h2>Modelos no Brevo</h2>
        <p>
          Cópias dos modelos do blog ficam na área <em>Templates</em> do Brevo, com a etiqueta “blog”, caso você queira montar
          uma campanha direto por lá. Depois de mudar o nome do blog ou os textos da newsletter, sincronize de novo.
        </p>
        {templates.error && <div className="alert alert--error">{templates.error}</div>}
        <ul className="help-list" style={{ listStyle: "none", paddingLeft: 0 }}>
          {Object.values(TEMPLATE_NAMES).map((name) => {
            const t = blogTemplates.find((x) => x.name === name);
            return (
              <li key={name}>
                <span className={`status-dot${t ? "" : " status-dot--off"}`}>
                  {name.replace("[Blog] ", "")}: {t ? `sincronizado em ${fmtDate(t.modifiedAt)}` : "ainda não está no Brevo"}
                </span>
              </li>
            );
          })}
        </ul>
        <SyncTemplatesButton />
      </section>
    </>
  );
}
