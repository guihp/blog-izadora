"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MAX_BYTES = 5 * 1024 * 1024;

/** Envia uma imagem para o Supabase Storage (bucket "media") e devolve a URL pública. */
export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
  if (file.size > MAX_BYTES) throw new Error("A imagem precisa ter no máximo 5 MB.");
  const supabase = createSupabaseBrowserClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw new Error("Não foi possível enviar a imagem. Confira se sua conta é administradora.");
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function ImageField({
  name,
  label,
  defaultValue,
  folder = "capas",
  altName,
  altDefault,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
  altName?: string;
  altDefault?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setUrl(await uploadImage(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no envio.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="field image-field">
      <span className="label">{label}</span>
      <div className="image-field__preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt="" /> : <span>Nenhuma imagem</span>}
      </div>
      <input type="hidden" name={name} value={url} />
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={onFile} />
      <div className="image-field__buttons">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Enviando…" : url ? "Trocar imagem" : "Enviar imagem"}
        </button>
        {url && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setUrl("")}>
            Remover
          </button>
        )}
      </div>
      {error && (
        <small role="alert" style={{ color: "#8a3329" }}>
          {error}
        </small>
      )}
      {hint && <small>{hint}</small>}
      {altName && (
        <div className="field">
          <label htmlFor={`${name}-alt`}>Descrição da imagem (texto alternativo)</label>
          <input
            id={`${name}-alt`}
            name={altName}
            defaultValue={altDefault}
            className="control"
            placeholder="Ex.: Bíblia aberta com flores sobre a mesa"
          />
          <small>Descreva o que aparece na foto — ajuda quem usa leitor de tela e melhora o SEO.</small>
        </div>
      )}
    </div>
  );
}
