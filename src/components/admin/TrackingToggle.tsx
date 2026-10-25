"use client";

import { useEffect, useState } from "react";
import { SKIP_TRACKING_KEY } from "@/components/Analytics";

function readFlag() {
  try {
    return localStorage.getItem(SKIP_TRACKING_KEY);
  } catch {
    return null;
  }
}

function writeFlag(value: "0" | "1") {
  try {
    localStorage.setItem(SKIP_TRACKING_KEY, value);
  } catch {
    // armazenamento bloqueado: nada a fazer
  }
}

/**
 * Por padrão, aparelhos usados no painel deixam de contar nas estatísticas,
 * para que os números mostrem as leitoras e não a dona do blog.
 * Com `showControl`, mostra a chave para mudar isso.
 */
export function TrackingToggle({ showControl = false }: { showControl?: boolean }) {
  const [skip, setSkip] = useState<boolean | null>(null);

  useEffect(() => {
    if (readFlag() === null) writeFlag("1");
    setSkip(readFlag() !== "0");
  }, []);

  if (!showControl || skip === null) return null;

  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={skip}
        onChange={(e) => {
          writeFlag(e.target.checked ? "1" : "0");
          setSkip(e.target.checked);
        }}
      />
      Não contar as minhas visitas neste aparelho
    </label>
  );
}
