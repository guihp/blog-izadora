"use client";

import { startTransition } from "react";

/**
 * Envia o formulário para a Server Action sem o "reset" automático do React 19,
 * assim nada do que foi digitado se perde quando aparece um erro de validação.
 */
export function useFormSubmit(dispatch: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(fd));
  };
}
