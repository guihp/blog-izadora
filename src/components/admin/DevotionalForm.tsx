"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveDevotional } from "@/app/admin/actions";
import type { Devotional } from "@/lib/types";
import { toLocalInput } from "@/lib/utils";
import { FormStatus } from "./FormStatus";
import { ImageField } from "./ImageField";
import { useFormSubmit } from "./useFormSubmit";

function Area({ name, label, value, hint, rows = 5 }: { name: string; label: string; value?: string; hint?: string; rows?: number }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={value} rows={rows} className="control" />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function DevotionalForm({ devotional: d, notice }: { devotional?: Devotional; notice?: string }) {
  const [state, action, pending] = useActionState(saveDevotional, notice ? { ok: true, message: notice } : null);
  const onSubmit = useFormSubmit(action);
  const published = d?.status === "published";

  return (
    <form onSubmit={onSubmit}>
      {d && <input type="hidden" name="id" value={d.id} />}
      <input type="hidden" name="status" value={d?.status ?? "draft"} />
      <FormStatus state={state} />

      <div className="form-grid form-grid--editor">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" defaultValue={d?.title} required className="control control--title" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="bible_reference">Referência bíblica</label>
              <input id="bible_reference" name="bible_reference" defaultValue={d?.bible_reference} required className="control" placeholder="João 15:1-8" />
            </div>
            <div className="field">
              <label htmlFor="theme">Tema</label>
              <input id="theme" name="theme" defaultValue={d?.theme} className="control" placeholder="Confiança, Intimidade com Deus…" />
            </div>
          </div>
          <Area name="verse_text" label="Versículo em destaque" value={d?.verse_text} rows={3} />
          <Area name="summary" label="Resumo curto" value={d?.summary} rows={2} hint="Aparece nos cards e como anotação na página inicial." />
          <Area name="main_text" label="Texto principal" value={d?.main_text} rows={6} />
          <Area name="context" label="Contexto da passagem" value={d?.context} />
          <Area name="reflection" label="Reflexão pessoal" value={d?.reflection} />
          <Area name="application" label="Aplicação prática para o dia" value={d?.application} rows={3} />
          <Area name="questions" label="Perguntas para reflexão" value={d?.questions.join("\n")} rows={4} hint="Uma pergunta por linha. A primeira aparece na página inicial." />
          <Area name="prayer" label="Oração final" value={d?.prayer} rows={4} />
        </div>

        <aside className="form-grid">
          <div className="panel" style={{ margin: 0 }}>
            <p style={{ margin: "0 0 12px" }}>
              Status: <span className={`badge${published ? "" : " badge--draft"}`}>{published ? "Publicado" : "Rascunho"}</span>
            </p>
            <label className="checkbox" style={{ marginBottom: 14 }}>
              <input type="checkbox" name="is_weekly" defaultChecked={d?.is_weekly} /> Devocional da semana (página inicial)
            </label>
            <div style={{ display: "grid", gap: 8 }}>
              <button type="submit" name="intent" value="publish" className="btn btn--rose" disabled={pending}>
                {published ? "Salvar e manter publicado" : "Publicar"}
              </button>
              <button type="submit" name="intent" value="draft" className="btn btn--ghost" disabled={pending}>
                {published ? "Despublicar" : "Salvar rascunho"}
              </button>
              {d && published && (
                <Link href={`/devocionais/${d.slug}`} target="_blank" className="text-link" style={{ justifySelf: "center", marginTop: 6 }}>
                  Ver no site ↗
                </Link>
              )}
            </div>
          </div>
          <div className="panel form-grid" style={{ margin: 0 }}>
            <div className="field">
              <label htmlFor="book">Livro da Bíblia</label>
              <input id="book" name="book" defaultValue={d?.book} className="control" placeholder="Detectado pela referência" />
              <small>Usado no filtro “passagem bíblica”.</small>
            </div>
            <div className="field">
              <label htmlFor="published_at">Data</label>
              <input id="published_at" name="published_at" type="datetime-local" defaultValue={toLocalInput(d?.published_at)} className="control" />
            </div>
            <div className="field">
              <label htmlFor="slug">Endereço (URL)</label>
              <input id="slug" name="slug" defaultValue={d?.slug} className="control" placeholder="gerado a partir do título" />
            </div>
          </div>
          <div className="panel" style={{ margin: 0 }}>
            <ImageField name="cover_url" label="Imagem (opcional)" defaultValue={d?.cover_url} altName="cover_alt" altDefault={d?.cover_alt} folder="devocionais" />
          </div>
        </aside>
      </div>
    </form>
  );
}
