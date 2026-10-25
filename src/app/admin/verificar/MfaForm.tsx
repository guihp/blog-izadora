"use client";

import { useActionState, useState } from "react";
import { FormStatus } from "@/components/admin/FormStatus";
import { mfaEnroll, mfaVerify } from "../actions";

type Enrollment = { factorId?: string; qr?: string; secret?: string; error?: string };

/** Com um app já cadastrado, pede o código; sem ele, mostra o QR code para cadastrar. */
export function MfaForm({ factorId }: { factorId: string | null }) {
  const [state, action, pending] = useActionState(mfaVerify, null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(false);
  const activeFactor = factorId ?? enrollment?.factorId ?? null;

  async function start() {
    setLoading(true);
    setEnrollment(await mfaEnroll().catch(() => ({ error: "Não foi possível gerar o QR code. Tente de novo." })));
    setLoading(false);
  }

  if (!factorId && !enrollment?.factorId) {
    return (
      <div className="form-grid">
        {enrollment?.error && <div className="alert alert--error">{enrollment.error}</div>}
        <ol className="help-list">
          <li>
            Instale no celular um app autenticador: <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>{" "}
            ou o app <em>Senhas</em> do iPhone.
          </li>
          <li>Toque no botão abaixo e leia o QR code com o app.</li>
          <li>Digite o código de 6 números que aparecer.</li>
        </ol>
        <button className="btn btn--rose" type="button" onClick={start} disabled={loading}>
          {loading ? "Gerando…" : "Mostrar o QR code"}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="form-grid">
      <FormStatus state={state} />
      {enrollment?.qr && (
        <div className="mfa-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrollment.qr} alt="QR code para cadastrar o blog no app autenticador" width={200} height={200} />
          <details>
            <summary>Não consegue ler o QR code?</summary>
            <p>
              No app, escolha “inserir chave” e digite: <code className="dns-value">{enrollment.secret}</code>
            </p>
          </details>
        </div>
      )}
      <input type="hidden" name="factorId" value={activeFactor ?? ""} />
      <div className="field">
        <label htmlFor="code">Código de 6 números</label>
        <input
          id="code"
          name="code"
          className="control mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
        />
      </div>
      <button type="submit" className="btn btn--rose" disabled={pending}>
        {pending ? "Conferindo…" : enrollment ? "Confirmar e entrar" : "Entrar"}
      </button>
    </form>
  );
}
