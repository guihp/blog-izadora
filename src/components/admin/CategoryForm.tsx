"use client";

import { useActionState, useRef } from "react";
import { saveCategory } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import { FormStatus } from "./FormStatus";
import { useFormSubmit } from "./useFormSubmit";

export function CategoryForm({ category }: { category?: Category }) {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: Parameters<typeof saveCategory>[0], fd: FormData) => {
    const result = await saveCategory(prev, fd);
    if (result?.ok && !category) form.current?.reset();
    return result;
  }, null);
  const onSubmit = useFormSubmit(action);
  const k = category?.id ?? "nova";

  return (
    <form ref={form} onSubmit={onSubmit} className="form-grid">
      {category && <input type="hidden" name="id" value={category.id} />}
      <FormStatus state={state} />
      <div className="field-row">
        <div className="field">
          <label htmlFor={`name-${k}`}>Nome</label>
          <input id={`name-${k}`} name="name" required defaultValue={category?.name} className="control" />
        </div>
        <div className="field">
          <label htmlFor={`slug-${k}`}>Endereço (URL)</label>
          <input id={`slug-${k}`} name="slug" defaultValue={category?.slug} className="control" placeholder="gerado a partir do nome" />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`desc-${k}`}>Descrição</label>
        <input id={`desc-${k}`} name="description" defaultValue={category?.description} className="control" />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="field" style={{ width: 120 }}>
          <label htmlFor={`order-${k}`}>Ordem</label>
          <input id={`order-${k}`} name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} className="control" />
        </div>
        <button type="submit" className="btn btn--rose btn--sm" disabled={pending}>
          {category ? "Salvar" : "Criar categoria"}
        </button>
      </div>
    </form>
  );
}
