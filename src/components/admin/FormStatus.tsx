import type { ActionState } from "@/app/admin/actions";

export function FormStatus({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return (
      <div className="alert alert--error" role="alert">
        {state.error}
      </div>
    );
  if (state.message)
    return (
      <div className="alert alert--ok" role="status">
        {state.message}
      </div>
    );
  return null;
}
