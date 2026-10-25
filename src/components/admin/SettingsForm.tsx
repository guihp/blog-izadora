"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";
import { FormStatus } from "./FormStatus";
import { ImageField } from "./ImageField";
import { useFormSubmit } from "./useFormSubmit";

type Key = keyof Omit<SiteSettings, "socials">;

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  const onSubmit = useFormSubmit(action);

  // Funções simples (não componentes) para não recriar os campos a cada renderização
  const textField = ({ name, label, hint }: { name: Key; label: string; hint?: string }) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={settings[name]} className="control" />
      {hint && <small>{hint}</small>}
    </div>
  );
  const longField = ({ name, label, hint, rows = 4 }: { name: Key; label: string; hint?: string; rows?: number }) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={settings[name]} rows={rows} className="control" />
      {hint && <small>{hint}</small>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <FormStatus state={state} />

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>Identidade</h2>
        <div className="field-row">
          {textField({ name: "siteName", label: "Nome do blog" })}
          {textField({ name: "tagline", label: "Frase curta (aparece no título do Google)" })}
        </div>
        {textField({ name: "footerPhrase", label: "Frase do rodapé" })}
      </section>

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>Página inicial — destaque</h2>
        {textField({ name: "heroEyebrow", label: "Linha acima do título" })}
        {textField({ name: "heroTitle", label: "Frase principal", hint: "Coloque um trecho entre *asteriscos* para deixá-lo em itálico rosa." })}
        {longField({ name: "heroSubtitle", label: "Subtítulo", rows: 2 })}
        {textField({ name: "heroNote", label: "Bilhetinho sobre a foto" })}
        <div className="field-row">
          <ImageField name="heroImageUrl" label="Foto principal" defaultValue={settings.heroImageUrl} folder="site" hint="Formato vertical (4:5) funciona melhor." />
          {longField({ name: "heroImageAlt", label: "Descrição da foto principal", rows: 3 })}
        </div>
      </section>

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>Carta de boas-vindas</h2>
        {textField({ name: "welcomeTitle", label: "Saudação" })}
        {longField({ name: "welcomeLetter", label: "Texto da carta", rows: 8, hint: "Deixe uma linha em branco entre os parágrafos." })}
        {textField({ name: "welcomeSignature", label: "Assinatura" })}
      </section>

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>Outras seções</h2>
        {textField({ name: "weeklyTitle", label: "Título do devocional da semana" })}
        <div className="field-row">
          {textField({ name: "newsletterTitle", label: "Título da newsletter" })}
          {textField({ name: "newsletterText", label: "Texto da newsletter" })}
        </div>
      </section>

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>Sobre mim</h2>
        {textField({ name: "aboutTitle", label: "Título" })}
        {longField({ name: "aboutText", label: "Sua história", rows: 12, hint: "Linha em branco entre parágrafos. *itálico* e **negrito** funcionam." })}
        {textField({ name: "aboutSignature", label: "Assinatura" })}
        <div className="field-row">
          <ImageField name="aboutPhotoUrl" label="Sua foto" defaultValue={settings.aboutPhotoUrl} folder="site" hint="Formato vertical (4:5)." />
          {longField({ name: "aboutPhotoAlt", label: "Descrição da foto", rows: 3 })}
        </div>
      </section>

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>YouTube</h2>
        <div className="field-row">
          {textField({ name: "youtubeChannelUrl", label: "URL do canal", hint: "Ex.: https://www.youtube.com/@seucanal" })}
          {textField({ name: "youtubeChannelName", label: "Nome do canal" })}
        </div>
        {longField({ name: "youtubeIntro", label: "Apresentação do canal", rows: 4 })}
      </section>

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>Google e SEO</h2>
        {longField({
          name: "seoDescription",
          label: "Descrição do blog no Google",
          rows: 2,
          hint: "O resumo que aparece embaixo do título na busca. Ideal: entre 120 e 160 caracteres.",
        })}
        {textField({ name: "authorName", label: "Seu nome (autora dos textos)", hint: "Aparece para o Google como autora dos artigos." })}
        <div className="field-row">
          {textField({
            name: "googleVerification",
            label: "Código do Google Search Console",
            hint: "Em search.google.com/search-console → Adicionar propriedade → Tag HTML. Pode colar a tag inteira.",
          })}
          {textField({ name: "bingVerification", label: "Código do Bing Webmaster (opcional)", hint: "Também pode colar a tag inteira." })}
        </div>
      </section>

      <section className="panel form-grid" style={{ margin: 0 }}>
        <h2>Redes sociais</h2>
        <p style={{ margin: 0 }}>Deixe em branco as que não usa — elas não aparecerão no site.</p>
        <div className="field-row">
          {(["instagram", "tiktok", "pinterest", "spotify"] as const).map((k) => (
            <div className="field" key={k}>
              <label htmlFor={`social_${k}`} style={{ textTransform: "capitalize" }}>
                {k}
              </label>
              <input id={`social_${k}`} name={`social_${k}`} defaultValue={settings.socials[k]} className="control" placeholder="https://" />
            </div>
          ))}
          <div className="field">
            <label htmlFor="social_email">E-mail de contato</label>
            <input id="social_email" name="social_email" type="email" defaultValue={settings.socials.email} className="control" />
          </div>
        </div>
      </section>

      <div style={{ position: "sticky", bottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="btn btn--rose" disabled={pending} style={{ boxShadow: "var(--shadow-lift)" }}>
          {pending ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
