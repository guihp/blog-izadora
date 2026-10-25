"use client";

import { startTransition, useActionState, useState } from "react";
import { previewNewsletter, sendNewsletter, sendNewsletterTest } from "@/app/admin/newsletter-actions";
import { EMAIL_KINDS_CLIENT, type EmailKindClient } from "./newsletterKinds";
import { FormStatus } from "./FormStatus";

type Item = { id: string; title: string };

type Props = {
  posts: Item[];
  devotionals: Item[];
  videos: Item[];
  testEmail: string;
  subscribers: number | null;
};

export function NewsletterComposer({ posts, devotionals, videos, testEmail, subscribers }: Props) {
  const [kind, setKind] = useState<EmailKindClient>(posts.length ? "post" : devotionals.length ? "devotional" : "letter");
  const [preview, setPreview] = useState<{ html?: string; subject?: string; error?: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [testState, testAction, testPending] = useActionState(sendNewsletterTest, null);
  const [sendState, sendAction, sendPending] = useActionState(sendNewsletter, null);

  const items = kind === "post" ? posts : kind === "devotional" ? devotionals : kind === "video" ? videos : [];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    const intent = fd.get("intent");
    if (intent === "preview") {
      setPreviewing(true);
      previewNewsletter(fd)
        .then(setPreview)
        .catch(() => setPreview({ error: "Não foi possível gerar a prévia." }))
        .finally(() => setPreviewing(false));
    } else if (intent === "test") {
      startTransition(() => testAction(fd));
    } else if (intent === "send") {
      if (!window.confirm(`Enviar esta cartinha agora para ${subscribers ?? "todas as"} inscritas? Não dá para desfazer.`)) return;
      startTransition(() => sendAction(fd));
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <FormStatus state={sendState ?? testState} />

      <div className="field">
        <span className="label">Tipo de cartinha</span>
        <div className="segmented" role="radiogroup" aria-label="Tipo de cartinha">
          {EMAIL_KINDS_CLIENT.map((k) => (
            <label key={k.kind} aria-current={kind === k.kind ? "page" : undefined}>
              <input
                type="radio"
                name="kind"
                value={k.kind}
                checked={kind === k.kind}
                onChange={() => {
                  setKind(k.kind);
                  setPreview(null);
                }}
                className="sr-only"
              />
              {k.label}
            </label>
          ))}
        </div>
      </div>

      {kind !== "letter" ? (
        <div className="field">
          <label htmlFor="item_id">Qual conteúdo?</label>
          {items.length ? (
            <select id="item_id" name="item_id" className="control" key={kind}>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          ) : (
            <p className="muted">Nada publicado deste tipo ainda. Publique primeiro (ou escolha “Cartinha livre”).</p>
          )}
        </div>
      ) : (
        <>
          <div className="field">
            <label htmlFor="letter_title">Título da cartinha</label>
            <input id="letter_title" name="letter_title" className="control" placeholder="Ex.: Um recado para o seu coração" />
          </div>
          <div className="field">
            <label htmlFor="letter_body">Texto</label>
            <textarea id="letter_body" name="letter_body" className="control" rows={10} placeholder="Escreva como nos artigos (aceita **negrito**, listas e ::: versiculo)." />
          </div>
        </>
      )}

      <div className="field-row">
        <div className="field">
          <label htmlFor="subject">Assunto do e-mail (opcional)</label>
          <input id="subject" name="subject" className="control" placeholder="Em branco = assunto automático" maxLength={150} />
        </div>
        <div className="field">
          <label htmlFor="test_to">Enviar teste para</label>
          <input id="test_to" name="test_to" type="email" className="control" defaultValue={testEmail} />
        </div>
      </div>

      {kind !== "letter" && (
        <div className="field">
          <label htmlFor="intro">Recadinho antes do conteúdo (opcional)</label>
          <textarea id="intro" name="intro" className="control" rows={3} placeholder="Ex.: Oi, amiga! Esse texto nasceu de uma conversa com Deus nesta semana…" />
        </div>
      )}

      <div className="composer__actions">
        <button className="btn btn--ghost" type="submit" name="intent" value="preview" disabled={previewing}>
          {previewing ? "Gerando…" : "Pré-visualizar"}
        </button>
        <button className="btn btn--ghost" type="submit" name="intent" value="test" disabled={testPending}>
          {testPending ? "Enviando teste…" : "Enviar teste"}
        </button>
      </div>

      {preview?.error && <div className="alert alert--error">{preview.error}</div>}
      {preview?.html && (
        <div className="email-preview">
          <p>
            <strong>Assunto:</strong> {preview.subject}
          </p>
          <iframe title="Prévia da cartinha" srcDoc={preview.html} sandbox="" />
        </div>
      )}

      <div className="composer__send">
        <label className="checkbox">
          <input type="checkbox" name="confirm" /> Conferi a prévia e o teste, e quero enviar para{" "}
          {subscribers === null ? "todas as inscritas" : `${subscribers} inscrita${subscribers === 1 ? "" : "s"}`}.
        </label>
        <button className="btn btn--rose" type="submit" name="intent" value="send" disabled={sendPending || subscribers === 0}>
          {sendPending ? "Enviando…" : "Enviar para todas"}
        </button>
      </div>
    </form>
  );
}
