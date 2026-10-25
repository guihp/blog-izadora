/** Tipos de cartinha (sem dependências de servidor, para usar no formulário). */
export type EmailKindClient = "post" | "devotional" | "video" | "letter";

export const EMAIL_KINDS_CLIENT: { kind: EmailKindClient; label: string }[] = [
  { kind: "post", label: "Novo texto" },
  { kind: "devotional", label: "Devocional" },
  { kind: "video", label: "Vídeo novo" },
  { kind: "letter", label: "Cartinha livre" },
];
