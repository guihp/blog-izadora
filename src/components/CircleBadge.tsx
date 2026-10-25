import { useId } from "react";
import { Heart } from "./ornaments";

/** Selo redondo com texto girando em volta de um coração (decorativo). */
export function CircleBadge({ text, className = "" }: { text: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`circle-badge ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="circle-badge__text">
        <defs>
          <path id={`c${id}`} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text>
          <textPath href={`#c${id}`} textLength="289">
            {text}
          </textPath>
        </text>
      </svg>
      <Heart width={22} height={22} />
    </div>
  );
}
