"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Aparelhos marcados no painel ("não contar minhas visitas") ficam de fora. */
export const SKIP_TRACKING_KEY = "mdod:sem-contagem";
const ORIGIN_KEY = "mdod:origem";

function read(storage: () => Storage, key: string) {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

/** Conta as visitas de forma anônima, inclusive na navegação entre páginas. */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || navigator.webdriver) return;
    if (read(() => localStorage, SKIP_TRACKING_KEY) === "1") return;

    // A origem (Google, Instagram…) é guardada na primeira página da visita
    let origin = { referrer: "", utm: "" };
    const saved = read(() => sessionStorage, ORIGIN_KEY);
    if (saved) {
      try {
        origin = JSON.parse(saved);
      } catch {
        // ignora valor antigo inválido
      }
    } else {
      origin = {
        referrer: document.referrer,
        utm: new URLSearchParams(location.search).get("utm_source") ?? "",
      };
      try {
        sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
      } catch {
        // navegação privada: segue sem guardar
      }
    }

    const body = JSON.stringify({ path: pathname, ...origin });
    const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }));
    if (!sent) fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}
