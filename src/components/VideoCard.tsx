import type { Video } from "@/lib/types";
import { youTubeWatchUrl } from "@/lib/utils";
import { ArrowRight } from "./icons";
import { YouTubeEmbed } from "./YouTubeEmbed";

export function VideoCard({ video, index = 0 }: { video: Video; index?: number }) {
  return (
    <article className="video-card reveal" style={{ ["--reveal-delay" as string]: `${(index % 4) * 80}ms` }}>
      <YouTubeEmbed video={video} />
      <div className="video-card__body">
        {video.playlist && <span className="category-link">{video.playlist}</span>}
        <h3>{video.title}</h3>
        {video.description && <p>{video.description}</p>}
        {video.youtube_id ? (
          <a className="text-link" href={youTubeWatchUrl(video.youtube_id)} target="_blank" rel="noopener noreferrer">
            Assistir no YouTube <ArrowRight width={16} height={16} />
          </a>
        ) : (
          <span className="badge badge--demo" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
            Exemplo
          </span>
        )}
      </div>
    </article>
  );
}
