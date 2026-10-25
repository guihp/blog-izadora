import "server-only";
import { headers } from "next/headers";

/**
 * Limite simples de tentativas, em memória (por instância do servidor).
 * Não substitui os limites do próprio Supabase, mas segura tentativas em série.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function tooManyAttempts(key: string, max: number) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) return false;
  return entry.count >= max;
}

export function registerAttempt(key: string, windowMs: number) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) buckets.set(key, { count: 1, reset: now + windowMs });
  else entry.count += 1;
}

export function clearAttempts(key: string) {
  buckets.delete(key);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
