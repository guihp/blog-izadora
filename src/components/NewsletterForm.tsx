"use client";

import { useId, useState } from "react";
import { isValidEmail } from "@/lib/utils";

type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

export function NewsletterForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [invalid, setInvalid] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();

    if (!isValidEmail(email)) {
      setInvalid(true);
      setStatus({ kind: "error", message: "Confira o seu e-mail — parece que falta alguma coisa." });
      return;
    }
    setInvalid(false);
    setStatus({ kind: "loading" });

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: data.get("website") ?? "" }),
      });
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) {
        setStatus({ kind: "success", message: body.message ?? "Inscrição feita! ♡" });
        form.reset();
      } else {
        setStatus({ kind: "error", message: body.message ?? "Não foi possível concluir agora. Tente novamente em instantes." });
      }
    } catch {
      setStatus({ kind: "error", message: "Sem conexão no momento. Tente novamente em instantes." });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={`${id}-msg`}>
      <div className="form-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Seu melhor e-mail
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu melhor e-mail"
          className="input"
          aria-invalid={invalid}
          required
        />
        {/* Campo invisível contra robôs */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
        <button type="submit" className="btn btn--rose" disabled={status.kind === "loading"}>
          {status.kind === "loading" ? "Enviando…" : "Quero receber ♡"}
        </button>
      </div>
      <p
        id={`${id}-msg`}
        role="status"
        aria-live="polite"
        className={`form-message ${status.kind === "success" ? "form-message--success" : status.kind === "error" ? "form-message--error" : ""}`}
      >
        {status.message}
      </p>
      <p className="form-fineprint">Sem spam. Você pode cancelar quando quiser.</p>
    </form>
  );
}
