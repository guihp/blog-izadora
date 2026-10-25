"use client";

/** Botão de envio que pede confirmação antes (para exclusões). */
export function ConfirmButton({ message, children, className = "btn btn--danger btn--sm" }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
