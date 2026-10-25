import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  title,
  text,
  action,
  center,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  action?: ReactNode;
  center?: boolean;
  id?: string;
}) {
  return (
    <div className={`section-head reveal${center ? " section-head--center" : ""}`}>
      <div>
        <span className={`eyebrow${center ? "" : " eyebrow--left"}`}>{eyebrow}</span>
        <h2 id={id}>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}
