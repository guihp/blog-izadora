import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Renova a sessão do Supabase e protege as rotas /admin:
 * sem login → /admin/login; com login, mas sem o código do app autenticador (2FA) → /admin/verificar.
 */
export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redireciona levando junto os cookies de sessão que acabaram de ser renovados
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/admin/login");
  const isVerify = path.startsWith("/admin/verificar");

  if (!user && !isLogin) return redirectTo("/admin/login");

  if (user && !isLogin) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const verified = aal?.currentLevel === "aal2";
    if (!verified && !isVerify) return redirectTo("/admin/verificar");
    if (verified && isVerify) return redirectTo("/admin");
  }

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
