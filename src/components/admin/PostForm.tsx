"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePost } from "@/app/admin/actions";
import type { Category, Post } from "@/lib/types";
import { toLocalInput } from "@/lib/utils";
import { FormStatus } from "./FormStatus";
import { ImageField } from "./ImageField";
import { MarkdownEditor } from "./MarkdownEditor";
import { useFormSubmit } from "./useFormSubmit";

export function PostForm({ post, categories, notice }: { post?: Post; categories: Category[]; notice?: string }) {
  const [state, action, pending] = useActionState(savePost, notice ? { ok: true, message: notice } : null);
  const published = post?.status === "published";
  const onSubmit = useFormSubmit(action);

  return (
    <form onSubmit={onSubmit}>
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="status" value={post?.status ?? "draft"} />
      <FormStatus state={state} />

      <div className="form-grid form-grid--editor">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" defaultValue={post?.title} required className="control control--title" placeholder="Título do texto" />
          </div>
          <div className="field">
            <label htmlFor="excerpt">Resumo</label>
            <textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} className="control" rows={3} style={{ minHeight: 80 }} placeholder="Uma ou duas frases que aparecem nos cards e no Google." />
          </div>
          <div className="field">
            <span className="label">Texto</span>
            <MarkdownEditor name="content" defaultValue={post?.content ?? ""} />
            <small>
              Use os botões para títulos, versículos e imagens. Referências como <em>Salmos 23:1</em> ganham destaque automático.
            </small>
          </div>
        </div>

        <aside className="form-grid">
          <div className="panel" style={{ margin: 0 }}>
            <p style={{ margin: "0 0 12px" }}>
              Status:{" "}
              <span className={`badge${published ? "" : " badge--draft"}`}>{published ? "Publicado" : "Rascunho"}</span>
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              <button type="submit" name="intent" value="publish" className="btn btn--rose" disabled={pending}>
                {published ? "Salvar e manter publicado" : "Publicar"}
              </button>
              <button type="submit" name="intent" value="draft" className="btn btn--ghost" disabled={pending}>
                {published ? "Despublicar (voltar a rascunho)" : "Salvar rascunho"}
              </button>
              {post && published && (
                <Link href={`/blog/${post.slug}`} target="_blank" className="text-link" style={{ justifySelf: "center", marginTop: 6 }}>
                  Ver no site ↗
                </Link>
              )}
            </div>
            {pending && <p style={{ margin: "10px 0 0", fontSize: "0.85rem" }}>Salvando…</p>}
          </div>

          <div className="panel form-grid" style={{ margin: 0 }}>
            <div className="field">
              <label htmlFor="category_id">Categoria</label>
              <select id="category_id" name="category_id" defaultValue={post?.category_id ?? ""} className="control">
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="published_at">Data de publicação</label>
              <input id="published_at" name="published_at" type="datetime-local" defaultValue={toLocalInput(post?.published_at)} className="control" />
              <small>Vazio = data e hora em que você publicar. Datas futuras ficam agendadas.</small>
            </div>
            <div className="field">
              <label htmlFor="slug">Endereço (URL)</label>
              <input id="slug" name="slug" defaultValue={post?.slug} className="control" placeholder="gerado a partir do título" />
              <small>/blog/{post?.slug || "titulo-do-texto"}</small>
            </div>
          </div>

          <div className="panel" style={{ margin: 0 }}>
            <ImageField name="cover_url" label="Imagem de capa" defaultValue={post?.cover_url} altName="cover_alt" altDefault={post?.cover_alt} hint="Formato horizontal (4:3 ou 16:9), até 5 MB." />
          </div>

          <details className="panel" style={{ margin: 0 }}>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>SEO e compartilhamento</summary>
            <div className="form-grid" style={{ marginTop: 14 }}>
              <div className="field">
                <label htmlFor="seo_title">Título para o Google</label>
                <input id="seo_title" name="seo_title" defaultValue={post?.seo_title ?? ""} className="control" maxLength={70} placeholder="Opcional — usa o título" />
              </div>
              <div className="field">
                <label htmlFor="seo_description">Descrição para o Google</label>
                <textarea id="seo_description" name="seo_description" defaultValue={post?.seo_description ?? ""} className="control" maxLength={170} placeholder="Opcional — usa o resumo" />
              </div>
            </div>
          </details>
        </aside>
      </div>
    </form>
  );
}
