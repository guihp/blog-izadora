"use client";

import { useActionState } from "react";
import { syncTemplates } from "@/app/admin/newsletter-actions";
import { FormStatus } from "./FormStatus";

export function SyncTemplatesButton() {
  const [state, action, pending] = useActionState(syncTemplates, null);
  return (
    <form action={action} className="form-grid" style={{ justifyItems: "start" }}>
      <FormStatus state={state} />
      <button className="btn btn--ghost" type="submit" disabled={pending}>
        {pending ? "Sincronizando…" : "Sincronizar modelos com o Brevo"}
      </button>
    </form>
  );
}
