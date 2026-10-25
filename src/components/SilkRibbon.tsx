"use client";

import { useEffect, useRef, useState } from "react";

/** Safari e qualquer navegador de iPhone/iPad (todos usam WebKit) não exibem VP9 com transparência. */
function supportsAlphaWebm() {
  // No celular e com economia de dados fica a imagem parada (poupa dados e bateria)
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData || !window.matchMedia("(min-width: 700px)").matches) return false;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const safari = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua);
  if (ios || safari) return false;
  return document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
}

/**
 * Fita de cetim renderizada no Blender (scripts/blender/fita.py) ondulando em loop.
 * O vídeo é um WebM com canal alfa, então fica transparente sem nenhum efeito de mistura.
 * A imagem parada fica sempre por baixo: é o que aparece sem JavaScript, no modo `?static`,
 * com "reduzir movimento", no Safari, no celular e enquanto o vídeo carrega (é o primeiro quadro do loop).
 */
export function SilkRibbon({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [animate, setAnimate] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setAnimate(!reduce.matches && document.documentElement.classList.contains("js") && supportsAlphaWebm());
    update();
    reduce.addEventListener("change", update);
    return () => reduce.removeEventListener("change", update);
  }, []);

  // Toca só enquanto a fita está visível (economiza processamento ao rolar a página)
  useEffect(() => {
    const el = video.current;
    if (!animate || !el || !wrap.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(wrap.current);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div ref={wrap} className={`silk-ribbon${playing ? " is-playing" : ""} ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/efeitos/fita.webp" alt="" width={1024} height={320} decoding="async" />
      {animate && (
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          onEnded={(e) => e.currentTarget.play().catch(() => {})}
        >
          <source src="/images/efeitos/fita.webm" type="video/webm" />
        </video>
      )}
    </div>
  );
}
