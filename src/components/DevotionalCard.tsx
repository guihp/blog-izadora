import Link from "next/link";
import type { Devotional } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function DevotionalCard({ devotional, index = 0 }: { devotional: Devotional; index?: number }) {
  return (
    <Link
      href={`/devocionais/${devotional.slug}`}
      className="devo-card reveal"
      style={{ ["--reveal-delay" as string]: `${(index % 3) * 90}ms` }}
    >
      <span className={`tape${index % 2 ? " tape--sage" : ""}`} aria-hidden="true" />
      {devotional.published_at && <span className="devo-card__date">{formatDate(devotional.published_at)}</span>}
      <h3>{devotional.title}</h3>
      <span className="devo-card__ref">{devotional.bible_reference}</span>
      <p>{devotional.summary}</p>
      <div className="devo-card__foot">
        {devotional.theme && <span className="badge">{devotional.theme}</span>}
        {devotional.is_weekly && <span className="badge">Da semana</span>}
        {devotional.is_demo && <span className="badge badge--demo">Exemplo</span>}
      </div>
    </Link>
  );
}
