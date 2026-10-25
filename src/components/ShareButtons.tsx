"use client";

import { useEffect, useState } from "react";
import { FacebookIcon, LinkIcon, PinterestIcon, ShareIcon, WhatsAppIcon } from "./icons";

export function ShareButtons({ url, title, image }: { url: string; title: string; image?: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const enc = encodeURIComponent;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  return (
    <div className="share">
      <span className="share__label">compartilhe ♡</span>
      {canShare && (
        <button type="button" onClick={() => navigator.share({ title, url }).catch(() => {})}>
          <ShareIcon width={16} height={16} /> Enviar
        </button>
      )}
      <a href={`https://wa.me/?text=${enc(`${title} — ${url}`)}`} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon width={16} height={16} /> WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
        <FacebookIcon width={16} height={16} /> Facebook
      </a>
      {image && (
        <a
          href={`https://pinterest.com/pin/create/button/?url=${enc(url)}&media=${enc(image)}&description=${enc(title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PinterestIcon width={16} height={16} /> Pinterest
        </a>
      )}
      <button type="button" onClick={copy}>
        <LinkIcon width={16} height={16} /> <span aria-live="polite">{copied ? "Link copiado!" : "Copiar link"}</span>
      </button>
    </div>
  );
}
