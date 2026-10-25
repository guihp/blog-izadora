import "server-only";

/** Robôs de busca e ferramentas automáticas não contam como visitas. */
const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|headless|lighthouse|pagespeed|curl|wget|python|axios|node-fetch|go-http|monitor|uptime/i;

export function isBot(userAgent: string) {
  return !userAgent || BOT_RE.test(userAgent);
}

export function detectDevice(userAgent: string): "celular" | "tablet" | "computador" {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(userAgent)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(userAgent)) return "celular";
  return "computador";
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"],
  [/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/, "Pinterest"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  [/(^|\.)threads\.net$/, "Threads"],
  [/(^|\.)linktr\.ee$/, "Linktree"],
  [/(^|\.)spotify\.com$/, "Spotify"],
];

const UTM_NAMES: Record<string, string> = {
  ig: "Instagram",
  instagram: "Instagram",
  facebook: "Facebook",
  fb: "Facebook",
  youtube: "YouTube",
  yt: "YouTube",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  newsletter: "Newsletter",
  email: "Newsletter",
};

/** Descobre de onde a pessoa veio: link com ?utm_source=, site de origem ou "Direto". */
export function classifySource(referrer: string, utmSource: string, ownHosts: string[]) {
  const utm = utmSource.trim().toLowerCase().slice(0, 40);
  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^(www|m|l|lm)\./, "") : "";
  } catch {
    host = "";
  }
  if (host && ownHosts.includes(host)) host = "";

  if (utm) return { host, source: UTM_NAMES[utm] ?? utm.charAt(0).toUpperCase() + utm.slice(1) };
  if (!host) return { host, source: "Direto" };
  const match = SOURCES.find(([re]) => re.test(host));
  return { host, source: match ? match[1] : host };
}

function decode(value: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Localização aproximada informada pela hospedagem (Vercel, Netlify ou Cloudflare).
 * Nenhum IP é enviado a serviços externos.
 */
export function readGeo(headers: Headers) {
  let country = headers.get("x-vercel-ip-country") ?? "";
  let region = headers.get("x-vercel-ip-country-region") ?? "";
  let city = decode(headers.get("x-vercel-ip-city"));

  const netlify = headers.get("x-nf-geo");
  if (!country && netlify) {
    try {
      const geo = JSON.parse(Buffer.from(netlify, "base64").toString("utf8"));
      country = geo?.country?.code ?? "";
      region = geo?.subdivision?.code ?? "";
      city = geo?.city ?? "";
    } catch {
      // cabeçalho inválido: segue sem localização
    }
  }
  if (!country) country = headers.get("cf-ipcountry") ?? "";
  if (country === "XX" || country === "T1") country = "";
  return { country, region, city };
}

export type AnalyticsRow = { label: string; visitors: number; views?: number };

export type AnalyticsSummary = {
  views: number;
  visitors: number;
  today_views: number;
  today_visitors: number;
  online: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: AnalyticsRow[];
  sources: AnalyticsRow[];
  countries: AnalyticsRow[];
  cities: AnalyticsRow[];
  devices: AnalyticsRow[];
};
