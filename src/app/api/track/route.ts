import { SITE_URL } from "@/config/site";
import { classifySource, detectDevice, isBot, readGeo } from "@/lib/analytics";
import { getPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const done = () => new Response(null, { status: 204 });

// Limite simples por IP (por instância do servidor) para evitar números inflados
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 30;
}

/** Registra uma visualização de página de forma anônima (sem cookies e sem guardar IP). */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) return done();

  const headers = request.headers;
  const host = headers.get("host") ?? "";
  const origin = headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return new Response(null, { status: 403 });
    } catch {
      return new Response(null, { status: 403 });
    }
  }

  const userAgent = headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return done();

  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  if (rateLimited(ip)) return done();

  let body: { path?: unknown; referrer?: unknown; utm?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path.split(/[?#]/)[0].slice(0, 300) : "";
  if (!path.startsWith("/")) return new Response(null, { status: 400 });

  const ownHosts = [host.split(":")[0], new URL(SITE_URL).hostname].map((h) => h.replace(/^www\./, ""));
  const { host: refHost, source } = classifySource(
    typeof body.referrer === "string" ? body.referrer : "",
    typeof body.utm === "string" ? body.utm : "",
    ownHosts,
  );
  const geo = readGeo(headers);

  const { error } = await getPublicClient().rpc("track_view", {
    p_path: path,
    p_referrer: refHost,
    p_source: source,
    p_country: geo.country,
    p_region: geo.region,
    p_city: geo.city,
    p_device: detectDevice(userAgent),
    // Embaralhado no banco com um sal diário e descartado: o IP nunca é salvo
    p_client: `${ip}|${userAgent}`,
  });
  if (error) console.error("[estatísticas] não foi possível registrar a visita:", error.message);
  return done();
}
