import Link from "next/link";
import { TrackingToggle } from "@/components/admin/TrackingToggle";
import type { AnalyticsRow, AnalyticsSummary } from "@/lib/analytics";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
  { days: 365, label: "12 meses" },
];

const STATIC_PAGES: Record<string, string> = {
  "/": "Página inicial",
  "/blog": "Blog",
  "/devocionais": "Devocionais",
  "/meu-youtube": "Meu YouTube",
  "/sobre": "Sobre mim",
  "/busca": "Busca",
};

const number = new Intl.NumberFormat("pt-BR");
const regionNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });

function flag(code: string) {
  return /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";
}
function countryName(code: string) {
  if (!code) return "Não identificado";
  try {
    return `${flag(code)} ${regionNames.of(code) ?? code}`;
  } catch {
    return code;
  }
}
function cityName(label: string) {
  const parts = label.split(", ");
  const code = parts.length > 1 ? parts[parts.length - 1] : "";
  return /^[A-Z]{2}$/.test(code) ? `${flag(code)} ${parts.slice(0, -1).join(", ")}` : label;
}
function shortDate(day: string) {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

type Props = { searchParams: Promise<{ periodo?: string }> };

export default async function StatsPage({ searchParams }: Props) {
  const { periodo } = await searchParams;
  const days = PERIODS.find((p) => String(p.days) === periodo)?.days ?? 30;
  const { supabase } = await getAdminSession();

  const [{ data, error }, posts, devotionals, categories] = await Promise.all([
    supabase.rpc("analytics_summary", { p_days: days }),
    supabase.from("posts").select("slug, title"),
    supabase.from("devotionals").select("slug, title"),
    supabase.from("categories").select("slug, name"),
  ]);

  const titles = new Map<string, string>(Object.entries(STATIC_PAGES));
  for (const p of posts.data ?? []) titles.set(`/blog/${p.slug}`, p.title);
  for (const d of devotionals.data ?? []) titles.set(`/devocionais/${d.slug}`, d.title);
  for (const c of categories.data ?? []) titles.set(`/blog/categoria/${c.slug}`, `Categoria: ${c.name}`);

  const header = (
    <header>
      <div>
        <h1>Estatísticas</h1>
        <p>Quantas pessoas visitaram o blog e de onde elas vieram.</p>
      </div>
      <nav className="segmented" aria-label="Período">
        {PERIODS.map((p) => (
          <Link
            key={p.days}
            href={`/admin/estatisticas?periodo=${p.days}`}
            aria-current={p.days === days ? "page" : undefined}
          >
            {p.label}
          </Link>
        ))}
      </nav>
    </header>
  );

  if (error || !data) {
    if (error) console.error("[estatísticas]", error.message);
    return (
      <>
        {header}
        <div className="alert alert--error">
          Não foi possível carregar as estatísticas. Confira se o arquivo <code>supabase/analytics.sql</code> foi
          executado no Supabase.
        </div>
      </>
    );
  }

  const s = data as AnalyticsSummary;
  const max = Math.max(1, ...s.daily.map((d) => d.visitors));
  const hasGeo = s.countries.some((c) => c.label);
  const mid = s.daily[Math.floor((s.daily.length - 1) / 2)];

  return (
    <>
      {header}

      <div className="stats">
        <div className="stat">
          <strong>{number.format(s.visitors)}</strong>
          <span>visitantes no período</span>
        </div>
        <div className="stat">
          <strong>{number.format(s.views)}</strong>
          <span>páginas vistas</span>
        </div>
        <div className="stat">
          <strong>{number.format(s.today_visitors)}</strong>
          <span>visitantes hoje</span>
        </div>
        <div className="stat">
          <strong>
            {s.online > 0 && <span className="live-dot" aria-hidden="true" />}
            {number.format(s.online)}
          </strong>
          <span>no site agora</span>
        </div>
      </div>

      <section className="panel">
        <h2>Visitantes por dia</h2>
        {s.visitors === 0 ? (
          <p className="muted">Ainda não há visitas neste período. Assim que alguém abrir o blog, os números aparecem aqui. ♡</p>
        ) : (
          <>
            <div className="day-chart" role="img" aria-label={`Visitantes por dia nos últimos ${days} dias; máximo de ${max} em um dia.`}>
              <div className="day-chart__axis" aria-hidden="true">
                <span>{number.format(max)}</span>
                <span>0</span>
              </div>
              <div className="day-chart__plot">
                {s.daily.map((d) => (
                  <div key={d.day} className="day-chart__col" tabIndex={0} aria-label={`${shortDate(d.day)}: ${d.visitors} visitantes, ${d.views} páginas vistas`}>
                    <div className="day-chart__bar" style={{ height: `${(d.visitors / max) * 100}%` }} />
                    <span className="day-chart__tip" role="tooltip">
                      <b>{shortDate(d.day)}</b>
                      {number.format(d.visitors)} visitantes
                      <br />
                      {number.format(d.views)} páginas vistas
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="day-chart__dates" aria-hidden="true">
              <span>{shortDate(s.daily[0].day)}</span>
              {s.daily.length > 2 && <span>{shortDate(mid.day)}</span>}
              <span>{shortDate(s.daily[s.daily.length - 1].day)}</span>
            </div>
            <details className="day-chart__table">
              <summary>Ver em tabela</summary>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Dia</th>
                      <th>Visitantes</th>
                      <th>Páginas vistas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...s.daily].reverse().map((d) => (
                      <tr key={d.day}>
                        <td>{shortDate(d.day)}</td>
                        <td>{number.format(d.visitors)}</td>
                        <td>{number.format(d.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </section>

      <div className="stats-grid">
        <RankList title="Páginas mais lidas" rows={s.pages} format={(l) => titles.get(l) ?? l} hrefOf={(l) => l} />
        <RankList title="De onde vieram" rows={s.sources} hint="Google, Instagram, YouTube… “Direto” é quem digitou o endereço ou abriu por um link sem origem (como o WhatsApp)." />
        <RankList
          title="Países"
          rows={s.countries}
          format={countryName}
          hint={hasGeo ? undefined : "A localização aparece quando o site estiver publicado na Vercel. No computador de testes ela não é informada."}
        />
        <RankList title="Cidades" rows={s.cities} format={cityName} />
        <RankList title="Aparelhos" rows={s.devices} format={(l) => l.charAt(0).toUpperCase() + l.slice(1)} />
      </div>

      <section className="panel">
        <h2>Privacidade</h2>
        <p className="muted">
          As visitas são contadas sem cookies e sem guardar o IP de ninguém. Cada pessoa é contada uma vez por dia, de forma
          anônima, e a localização é aproximada (cidade). Robôs de busca não entram na conta.
        </p>
        <TrackingToggle showControl />
      </section>
    </>
  );
}

function RankList({
  title,
  rows,
  hint,
  format = (l) => l,
  hrefOf,
}: {
  title: string;
  rows: AnalyticsRow[];
  hint?: string;
  format?: (label: string) => string;
  hrefOf?: (label: string) => string;
}) {
  const top = Math.max(1, ...rows.map((r) => r.visitors));
  return (
    <section className="panel rank">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="muted">Sem dados ainda.</p>
      ) : (
        <ol>
          {rows.map((r) => (
            <li key={r.label} title={`${r.visitors} visitantes${r.views ? ` · ${r.views} visualizações` : ""}`}>
              <span className="rank__label">
                {hrefOf ? (
                  <a href={hrefOf(r.label)} target="_blank" rel="noreferrer">
                    {format(r.label)}
                  </a>
                ) : (
                  format(r.label)
                )}
              </span>
              <span className="rank__value">{number.format(r.visitors)}</span>
              <span className="rank__bar" style={{ width: `${(r.visitors / top) * 100}%` }} aria-hidden="true" />
            </li>
          ))}
        </ol>
      )}
      {hint && <small className="muted">{hint}</small>}
    </section>
  );
}
