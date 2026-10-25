import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { VideoForm } from "@/components/admin/VideoForm";
import { getAdminSession } from "@/lib/auth";
import type { Video } from "@/lib/types";
import { deleteVideo } from "../../actions";

export default async function AdminVideos() {
  const { supabase } = await getAdminSession();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false });
  const videos = (data ?? []) as Video[];
  const playlists = [...new Set(videos.map((v) => v.playlist).filter(Boolean))];

  return (
    <>
      <header>
        <div>
          <h1>Vídeos do YouTube</h1>
          <p>Cole o link de um vídeo do seu canal. A miniatura e o player oficial são carregados automaticamente.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Adicionar vídeo</h2>
        <VideoForm playlists={playlists} />
      </section>

      {videos.map((v) => (
        <section key={v.id} className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>
              {v.title} {v.is_featured && <span className="badge">Destaque</span>}{" "}
              {v.is_demo && <span className="badge badge--demo">Exemplo — cole um link real ou exclua</span>}
            </h2>
            <form action={deleteVideo}>
              <input type="hidden" name="id" value={v.id} />
              <ConfirmButton message={`Remover “${v.title}” do site?`}>Excluir</ConfirmButton>
            </form>
          </div>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}>Editar</summary>
            <div style={{ marginTop: 14 }}>
              <VideoForm video={v} playlists={playlists} />
            </div>
          </details>
        </section>
      ))}
    </>
  );
}
