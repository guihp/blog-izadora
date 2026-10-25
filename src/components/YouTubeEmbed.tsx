"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";
import { youTubeThumb } from "@/lib/utils";
import { PlayIcon } from "./icons";
import { SmartImage } from "./SmartImage";

/**
 * Incorporação oficial do YouTube (youtube-nocookie.com) carregada somente
 * quando a pessoa clica em "assistir" — deixa a página leve e respeita a privacidade.
 */
export function YouTubeEmbed({ video, priority }: { video: Video; priority?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const thumb = video.thumbnail_url || (video.youtube_id ? youTubeThumb(video.youtube_id) : null);

  if (!video.youtube_id) {
    return (
      <div className="yt">
        {thumb && <SmartImage src={thumb} alt="" sizes="(min-width: 1000px) 33vw, 100vw" />}
        <div className="yt__demo">
          <strong>vídeo de exemplo</strong>
          <span>Adicione o link de um vídeo real no painel.</span>
        </div>
      </div>
    );
  }

  if (playing) {
    return (
      <div className="yt">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="yt">
      {thumb && (
        <SmartImage src={thumb} alt="" sizes="(min-width: 1000px) 50vw, 100vw" priority={priority} />
      )}
      <button type="button" className="yt__play" onClick={() => setPlaying(true)} aria-label={`Assistir: ${video.title}`}>
        <span>
          <PlayIcon />
        </span>
      </button>
    </div>
  );
}
