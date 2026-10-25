import Link from "next/link";
import { Sparkle } from "./ornaments";

/** Faixa de temas deslizando devagar (pausa ao passar o mouse; parada para quem reduz movimento). */
export function Marquee({ items }: { items: { label: string; href: string }[] }) {
  if (items.length === 0) return null;
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} tabIndex={hidden ? -1 : undefined}>
            {item.label}
          </Link>
          <Sparkle width={14} height={14} />
        </li>
      ))}
    </ul>
  );
  return (
    <nav className="marquee" aria-label="Temas do blog">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </nav>
  );
}
