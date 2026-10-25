import { NextResponse } from "next/server";
import { getNewsletterProvider, subscribe } from "@/lib/newsletter";
import { isValidEmail } from "@/lib/utils";

// Limite simples por IP (por instância do servidor) para evitar abusos
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 10 * 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ message: "Muitas tentativas seguidas. Tente novamente daqui a alguns minutos." }, { status: 429 });
  }

  let body: { email?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot preenchido = robô. Respondemos sem inscrever ninguém.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ message: "Obrigada!" }, { status: 200 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Confira o seu e-mail — parece que falta alguma coisa." }, { status: 400 });
  }

  const provider = getNewsletterProvider();
  if (!provider) {
    return NextResponse.json(
      { message: "As cartinhas ainda não estão abertas para inscrição. Volte em breve! ♡", code: "not_configured" },
      { status: 503 },
    );
  }

  try {
    const result = await subscribe(provider, email);
    if (result.ok) {
      return NextResponse.json({
        message: result.alreadySubscribed
          ? "Você já faz parte das cartinhas! ♡"
          : "Inscrição feita! Confira sua caixa de entrada (e o spam) para confirmar. ♡",
      });
    }
    return NextResponse.json(
      {
        message:
          result.reason === "invalid"
            ? "Não conseguimos usar esse e-mail. Confira se está correto."
            : "Não foi possível concluir agora. Tente novamente em instantes.",
      },
      { status: result.reason === "invalid" ? 400 : 502 },
    );
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json({ message: "Não foi possível concluir agora. Tente novamente em instantes." }, { status: 502 });
  }
}
