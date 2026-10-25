"use client";

import { useRef, useState, useTransition } from "react";
import { previewMarkdown } from "@/app/admin/actions";
import { uploadImage } from "./ImageField";

/**
 * Editor simples para quem não programa: botões inserem a formatação
 * e a aba "Pré-visualizar" mostra o texto exatamente como ficará no site.
 */
export function MarkdownEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function apply(fn: (selected: string) => { text: string; select?: [number, number] }, block = false) {
    const el = textarea.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    let { text, select } = fn(selected);
    let prefix = "";
    if (block && start > 0 && value[start - 1] !== "\n") prefix = "\n\n";
    text = prefix + text;
    const next = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const base = start + prefix.length;
      if (select) el.setSelectionRange(base + select[0], base + select[1]);
      else el.setSelectionRange(start + text.length, start + text.length);
    });
  }

  const wrap = (mark: string, placeholder: string) =>
    apply((s) => {
      const inner = s || placeholder;
      return { text: `${mark}${inner}${mark}`, select: [mark.length, mark.length + inner.length] };
    });

  const linePrefix = (prefix: string, placeholder: string) =>
    apply((s) => {
      const inner = s || placeholder;
      const text = inner
        .split("\n")
        .map((l) => `${prefix}${l}`)
        .join("\n");
      return { text: `${text}\n\n`, select: s ? undefined : [prefix.length, prefix.length + inner.length] };
    }, true);

  function insertVerse() {
    const ref = window.prompt("Referência bíblica (ex.: João 15:5)", "");
    if (ref === null) return;
    apply((s) => {
      const body = s || "Texto do versículo";
      const head = `::: versiculo ${ref.trim()}\n`;
      return { text: `${head}${body}\n:::\n\n`, select: [head.length, head.length + body.length] };
    }, true);
  }

  function insertLink() {
    const url = window.prompt("Endereço do link (https://…)", "https://");
    if (!url) return;
    apply((s) => {
      const label = s || "texto do link";
      return { text: `[${label}](${url})`, select: [1, 1 + label.length] };
    });
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const alt = window.prompt("Descreva a imagem (texto alternativo):", "") ?? "";
    setUploading(true);
    try {
      const url = await uploadImage(file, "artigos");
      apply(() => ({ text: `![${alt.replace(/[\[\]]/g, "")}](${url})\n\n` }), true);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Falha no envio da imagem.");
    } finally {
      setUploading(false);
    }
  }

  function showPreview() {
    setMode("preview");
    startTransition(async () => setHtml(await previewMarkdown(value)));
  }

  return (
    <div className="editor">
      <div className="editor__toolbar" role="toolbar" aria-label="Formatação">
        <button type="button" aria-pressed={mode === "write"} onClick={() => setMode("write")}>
          Escrever
        </button>
        <button type="button" aria-pressed={mode === "preview"} onClick={showPreview}>
          Pré-visualizar
        </button>
        {mode === "write" && (
          <>
            <span className="sep" aria-hidden="true" />
            <button type="button" onClick={() => linePrefix("## ", "Subtítulo")} title="Subtítulo">
              Título
            </button>
            <button type="button" onClick={() => linePrefix("### ", "Tópico")} title="Subtítulo menor">
              Subtítulo
            </button>
            <button type="button" onClick={() => wrap("**", "negrito")}>
              <strong>N</strong>
            </button>
            <button type="button" onClick={() => wrap("*", "itálico")}>
              <em>I</em>
            </button>
            <button type="button" onClick={insertLink}>
              Link
            </button>
            <button type="button" onClick={() => linePrefix("- ", "item da lista")}>
              Lista
            </button>
            <button type="button" onClick={() => linePrefix("> ", "citação")}>
              Citação
            </button>
            <button type="button" onClick={insertVerse}>
              ✿ Versículo
            </button>
            <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading}>
              {uploading ? "Enviando…" : "Imagem"}
            </button>
            <button type="button" onClick={() => apply(() => ({ text: "---\n\n" }), true)} title="Divisor floral">
              Divisor
            </button>
          </>
        )}
      </div>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={onImage} />
      <textarea
        ref={textarea}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        hidden={mode !== "write"}
        aria-label="Conteúdo do texto"
        placeholder={"Escreva aqui…\n\nDica: referências como João 3:16 são destacadas automaticamente."}
      />
      {mode === "preview" && (
        <div className="editor__preview">
          {pending ? <p>Carregando pré-visualização…</p> : <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
      )}
    </div>
  );
}
