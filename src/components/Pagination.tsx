import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="pagination" aria-label="Paginação">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev">
          ← Anterior
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden="true">
          ← Anterior
        </span>
      )}
      {pages.map((p, i) => (
        <span key={p} style={{ display: "contents" }}>
          {i > 0 && p - pages[i - 1] > 1 && <span aria-hidden="true">…</span>}
          {p === page ? (
            <span aria-current="page">{p}</span>
          ) : (
            <Link href={hrefFor(p)} aria-label={`Página ${p}`}>
              {p}
            </Link>
          )}
        </span>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next">
          Próxima →
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden="true">
          Próxima →
        </span>
      )}
    </nav>
  );
}
