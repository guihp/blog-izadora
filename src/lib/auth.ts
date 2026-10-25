import "server-only";
import { notFound, redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Usuária logada + se ela consta na tabela `admins`. */
export async function getAdminSession() {
  // Sem Supabase, o layout do /admin mostra as instruções de configuração no lugar do painel
  if (!isSupabaseConfigured) notFound();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false } as const;
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return { supabase, user, isAdmin: Boolean(data) } as const;
}

/**
 * Para Server Actions e páginas do painel: exige uma administradora.
 * (As políticas RLS do banco são a proteção definitiva; esta checagem melhora as mensagens.)
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.user) redirect("/admin/login");
  if (!session.isAdmin) throw new Error("Sem permissão para alterar o conteúdo.");
  return session;
}
