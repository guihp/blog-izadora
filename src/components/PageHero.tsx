import type { ReactNode } from "react";
import { SmartImage } from "./SmartImage";

/** Cabeçalho das páginas internas: título grande à esquerda e foto em arco à direita. */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  image: { src: string; alt: string };
}) {
  return (
    <header className="page-hero page-hero--image container">
      <div>
        <span className="eyebrow eyebrow--left">{eyebrow}</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      <div className="page-hero__media">
        <SmartImage src={image.src} alt={image.alt} sizes="(min-width: 900px) 520px, 92vw" priority />
      </div>
    </header>
  );
}
