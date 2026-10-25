import { Fragment } from "react";

/** Converte trechos entre *asteriscos* em <em> — usado nos títulos editáveis. */
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

export function plain(text: string) {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
