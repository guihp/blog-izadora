import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = { "aria-hidden": true, focusable: false } as const;

/** Estrelinha de quatro pontas */
export function Sparkle(props: P) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="ornament" {...base} {...props}>
      <path d="M12 1.5c.5 4.6 2.1 7.6 6 9.2l3.5 1.3-3.5 1.3c-3.9 1.6-5.5 4.6-6 9.2-.5-4.6-2.1-7.6-6-9.2L2.5 12 6 10.7c3.9-1.6 5.5-4.6 6-9.2z" />
    </svg>
  );
}

/** Raminho delicado de folhas */
export function Sprig(props: P) {
  return (
    <svg viewBox="0 0 64 64" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="ornament" {...base} {...props}>
      <path d="M12 56C22 42 34 28 54 10" />
      <path d="M22 43c-6-1-10-5-11-11 6 1 10 5 11 11z" fill="currentColor" fillOpacity=".18" />
      <path d="M30 33c-1-6 1-11 6-15 1 6-1 11-6 15z" fill="currentColor" fillOpacity=".18" />
      <path d="M36 27c6 0 11 3 13 8-6 0-11-3-13-8z" fill="currentColor" fillOpacity=".18" />
      <path d="M42 20c0-5 3-9 7-11 0 5-3 9-7 11z" fill="currentColor" fillOpacity=".18" />
      <path d="M26 38c5 2 8 6 8 11-5-2-8-6-8-11z" fill="currentColor" fillOpacity=".18" />
    </svg>
  );
}

/** Flor simples de cinco pétalas */
export function Blossom(props: P) {
  return (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.3" className="ornament" {...base} {...props}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="24" cy="13" rx="6.5" ry="9.5" transform={`rotate(${r} 24 24)`} fill="currentColor" fillOpacity=".14" />
      ))}
      <circle cx="24" cy="24" r="3.2" fill="currentColor" fillOpacity=".5" />
    </svg>
  );
}

/** Laço de fita */
export function Bow(props: P) {
  return (
    <svg viewBox="0 0 80 60" width="64" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ornament" {...base} {...props}>
      <path d="M40 24c-8-10-22-16-28-10s2 18 28 10z" fill="currentColor" fillOpacity=".22" />
      <path d="M40 24c8-10 22-16 28-10s-2 18-28 10z" fill="currentColor" fillOpacity=".22" />
      <path d="M38 26c-4 8-10 18-16 26M42 26c4 8 10 18 16 26" />
      <ellipse cx="40" cy="25" rx="4" ry="5" fill="currentColor" fillOpacity=".5" />
    </svg>
  );
}

export function Heart(props: P) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="ornament" {...base} {...props}>
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4z" />
    </svg>
  );
}

/** Divisor floral centralizado */
export function FloralDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--rose)" }} aria-hidden="true">
      <span style={{ height: 1, width: 64, background: "currentColor", opacity: 0.6 }} />
      <Sparkle width={12} height={12} />
      <Blossom width={26} height={26} />
      <Sparkle width={12} height={12} />
      <span style={{ height: 1, width: 64, background: "currentColor", opacity: 0.6 }} />
    </div>
  );
}
