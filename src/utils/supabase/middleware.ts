import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, RateLimits } from "@/utils/rate-limiter";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Rate Limiting on login endpoint (Camada 4 - OWASP A07: Auth Failures)
  if (request.nextUrl.pathname === "/auth/login" && request.method === "POST") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const rl = checkRateLimit(`login:${ip}`, RateLimits.AUTH_LOGIN);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: rl.error },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(RateLimits.AUTH_LOGIN.maxRequests),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: undefined,
              expires: undefined,
            }),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isRootPage = request.nextUrl.pathname === "/";
  const isBlockedPage = request.nextUrl.pathname.startsWith("/billing/blocked");
  const isWebhook = request.nextUrl.pathname.startsWith("/api/webhooks");
  const isCron = request.nextUrl.pathname.startsWith("/api/cron");

  if (!user && !isAuthPage && !isRootPage && !isBlockedPage && !isWebhook && !isCron) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Cheat Protection: Server-side validation of subscription status for authenticated users
  if (user && !isAuthPage && !isRootPage && !isBlockedPage && !isWebhook && !isCron) {
    try {
      // 1. Fetch user role and institution ID
      const { data: profile } = await supabase
        .from("users")
        .select("role:roles(name), institution_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        const roleName = (profile as any)?.role?.name || "gestor";
        
        // admin_geral is bypassable (is the global system administrator)
        if (roleName !== "admin_geral" && profile.institution_id) {
          // 2. Fetch institution subscription status
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("status, current_period_end")
            .eq("institution_id", profile.institution_id)
            .maybeSingle();

          let subStatus = sub?.status || "Suspensa por inadimplência";
          const now = new Date();
          const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;

          // Check for expiration by date even if database status says otherwise
          if (subStatus === "Ativa" && periodEnd && now > periodEnd) {
            subStatus = "Suspensa por inadimplência";
          }

          // If not Active, block access to all pages and APIs
          if (subStatus !== "Ativa") {
            console.warn(`[MIDDLEWARE] Access blocked for institution ${profile.institution_id} (Status: ${subStatus})`);
            
            // If API route, return 403 Forbidden
            if (request.nextUrl.pathname.startsWith("/api/")) {
              return new NextResponse(
                JSON.stringify({ error: "Assinatura suspensa. Acesso negado." }),
                { 
                  status: 403,
                  headers: { "Content-Type": "application/json" }
                }
              );
            }

            // Redirect web client to the blocked screen
            const url = request.nextUrl.clone();
            url.pathname = "/billing/blocked";
            return NextResponse.redirect(url);
          }
        }
      }
    } catch (err) {
      console.error("[MIDDLEWARE] Error validating subscription:", err);
    }
  }

  return supabaseResponse;
}
