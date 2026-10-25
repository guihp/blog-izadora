import Link from "next/link";
import { FloralDivider } from "@/components/ornaments";

export function NotFoundContent() {
  return (
    <section className="container not-found">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="not-found__flower" src="/images/recortes/rosa-prensada.webp" alt="" width={380} height={474} aria-hidden="true" />
      <span className="eyebrow">Página não encontrada</span>
      <h1>
        Essa página <em>se perdeu</em> entre as flores
      </h1>
      <p style={{ color: "var(--ink-soft)", maxWidth: "30em", margin: "0 auto 28px" }}>
        Talvez o link tenha mudado ou o texto ainda não tenha sido publicado. Mas há muito para ler por aqui ♡
      </p>
      <FloralDivider />
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
        <Link href="/" className="btn">
          Voltar ao início
        </Link>
        <Link href="/blog" className="btn btn--ghost">
          Ver o blog
        </Link>
      </div>
    </section>
  );
}
