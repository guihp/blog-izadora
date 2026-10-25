"use client";

import { useActionState, useRef } from "react";
import { saveVideo } from "@/app/admin/actions";
import type { Video } from "@/lib/types";
import { youTubeWatchUrl } from "@/lib/utils";
import { FormStatus } from "./FormStatus";
import { ImageField } from "./ImageField";
import { useFormSubmit } from "./useFormSubmit";

export function VideoForm({ video, playlists }: { video?: Video; playlists: string[] }) {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: Parameters<typeof saveVideo>[0], fd: FormData) => {
    const result = await saveVideo(prev, fd);
    if (result?.ok && !video) form.current?.reset();
    return result;
  }, null);
  const onSubmit = useFormSubmit(action);
  const listId = `playlists-${video?.id ?? "novo"}`;

  return (
    <form ref={form} onSubmit={onSubmit} className="form-grid">
      {video && <input type="hidden" name="id" value={video.id} />}
      <FormStatus state={state} />
      <div className="field-row">
        <div className="field">
          <label htmlFor={`url-${video?.id ?? "novo"}`}>Link do vídeo no YouTube</label>
          <input
            id={`url-${video?.id ?? "novo"}`}
            name="youtube_url"
            required
            defaultValue={video?.youtube_id ? youTubeWatchUrl(video.youtube_id) : ""}
            className="control"
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div className="field">
          <label htmlFor={`title-${video?.id ?? "novo"}`}>Título</label>
          <input id={`title-${video?.id ?? "novo"}`} name="title" required defaultValue={video?.title} className="control" />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`desc-${video?.id ?? "novo"}`}>Breve descrição</label>
        <textarea id={`desc-${video?.id ?? "novo"}`} name="description" defaultValue={video?.description} className="control" rows={2} style={{ minHeight: 70 }} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`pl-${video?.id ?? "novo"}`}>Playlist / tema</label>
          <input id={`pl-${video?.id ?? "novo"}`} name="playlist" defaultValue={video?.playlist} className="control" list={listId} placeholder="Vida com Deus" />
          <datalist id={listId}>
            {playlists.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor={`date-${video?.id ?? "novo"}`}>Data de publicação no YouTube</label>
          <input id={`date-${video?.id ?? "novo"}`} name="published_at" type="date" defaultValue={video?.published_at ?? ""} className="control" />
        </div>
      </div>
      <details>
        <summary style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 700 }}>Miniatura personalizada (opcional)</summary>
        <div style={{ maxWidth: 320, marginTop: 12 }}>
          <ImageField name="thumbnail_url" label="Miniatura" defaultValue={video?.thumbnail_url} folder="videos" hint="Sem imagem, usamos a miniatura oficial do YouTube." />
        </div>
      </details>
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <label className="checkbox">
          <input type="checkbox" name="is_featured" defaultChecked={video?.is_featured} /> Vídeo em destaque
        </label>
        <input type="hidden" name="sort_order" value={video?.sort_order ?? 0} />
        <button type="submit" className="btn btn--rose btn--sm" disabled={pending}>
          {pending ? "Salvando…" : video ? "Salvar vídeo" : "Adicionar vídeo"}
        </button>
      </div>
    </form>
  );
}
