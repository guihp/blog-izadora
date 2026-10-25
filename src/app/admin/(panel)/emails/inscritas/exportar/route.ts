import { getAdminSession } from "@/lib/auth";
import { BREVO_LIST_ID, getAllListContacts } from "@/lib/brevo";

export const dynamic = "force-dynamic";

const csvCell = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Planilha com as inscritas (o middleware já exige login + 2FA em /admin). */
export async function GET() {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return new Response("Sem permissão.", { status: 403 });
  if (!BREVO_LIST_ID) return new Response("BREVO_LIST_ID não definido.", { status: 400 });

  const contacts = await getAllListContacts(BREVO_LIST_ID);
  const lines = [
    ["email", "inscrita_em", "situacao"].join(";"),
    ...contacts.map((c) =>
      [
        c.email,
        new Date(c.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        c.emailBlacklisted || c.listUnsubscribed?.includes(BREVO_LIST_ID!) ? "cancelou" : "ativa",
      ]
        .map(csvCell)
        .join(";"),
    ),
  ];
  const date = new Date().toISOString().slice(0, 10);
  // BOM + ";" para o Excel em português abrir com acentos e colunas certas
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscritas-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
