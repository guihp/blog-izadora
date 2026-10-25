"use client";

import { useEffect, useRef, useState } from "react";

type Petal = {
  id: number;
  src: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  swayDuration: number;
  spin: number;
  opacity: number;
};

const SPRITES = 8;

/**
 * Pétalas renderizadas no Blender caindo devagar atrás do conteúdo.
 * Só aparecem com JavaScript, fora do modo `?static` e quando a pessoa
 * não pediu "reduzir movimento" no aparelho.
 */
export function PetalFall() {
  const ref = useRef<HTMLDivElement>(null);
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || !document.documentElement.classList.contains("js")) return;

    const count = window.innerWidth < 640 ? 5 : 8;
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        src: `/images/efeitos/petala-${(i % SPRITES) + 1}.webp`,
        left: Math.random() * 100,
        size: 16 + Math.random() * 18,
        duration: 13 + Math.random() * 10,
        // atrasos negativos espalham as pétalas pela tela desde o início
        delay: -Math.random() * 20,
        sway: 24 + Math.random() * 46,
        swayDuration: 3.5 + Math.random() * 3,
        spin: (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 260),
        opacity: 0.55 + Math.random() * 0.4,
      })),
    );

    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const setFall = () => el.style.setProperty("--fall", `${parent.offsetHeight + 80}px`);
    setFall();
    const observer = new ResizeObserver(setFall);
    observer.observe(parent);
    const onChange = () => reduce.matches && setPetals([]);
    reduce.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div ref={ref} className="petal-fall" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal-fall__item"
          style={
            {
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        >
          <img
            src={p.src}
            alt=""
            width={p.size}
            height={p.size}
            style={
              {
                opacity: p.opacity,
                animationDuration: `${p.swayDuration}s`,
                animationDelay: `${p.delay}s`,
                "--sway": `${p.sway}px`,
                "--spin": `${p.spin}deg`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
