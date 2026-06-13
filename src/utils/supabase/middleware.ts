import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, RateLimits } from "@/utils/rate-limiter";

function copyCookies(from: NextResponse, to: NextResponse) {
  try {
    const cookies = from.cookies.getAll();
    cookies.forEach((cookie) => {
      to.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        expires: cookie.expires,
        maxAge: cookie.maxAge,
        httpOnly: cookie.httpOnly,
      });
    });
  } catch (err) {
    console.error("[MIDDLEWARE] Error copying via cookies.getAll():", err);
  }

  try {
    if (typeof from.headers.getSetCookie === "function") {
      const setCookies = from.headers.getSetCookie();
      setCookies.forEach((cookieStr) => {
        to.headers.append("set-cookie", cookieStr);
      });
    } else {
      from.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          to.headers.append(key, value);
        }
      });
    }
  } catch (err) {
    console.error("[MIDDLEWARE] Error copying via headers set-cookie:", err);
  }
}

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
            supabaseResponse.cookies.set(name, value, options),
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
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && isAuthPage) {
    try {
      // Fetch user profile to check institution
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role:roles(name), institution_id")
        .eq("id", user.id)
        .maybeSingle();

      console.log("[MIDDLEWARE DEBUG] Auth redirect check - User ID:", user.id);
      console.log("[MIDDLEWARE DEBUG] Auth redirect check - Profile:", profile);
      if (profileError) {
        console.error("[MIDDLEWARE DEBUG] Auth redirect check - Profile Error:", profileError);
      }

      if (profile) {
        const roleName = (profile as unknown as { role: { name: string } | null } | null)?.role?.name || "gestor";
        
        // admin_geral is bypassable
        if (roleName !== "admin_geral" && profile.institution_id) {
          // Fetch institution subscription status
          const { data: sub, error: subError } = await supabase
            .from("subscriptions")
            .select("status, current_period_end, trial_end, plan_id")
            .eq("institution_id", profile.institution_id)
            .maybeSingle();

          console.log("[MIDDLEWARE DEBUG] Auth redirect check - Sub:", sub);
          if (subError) {
            console.error("[MIDDLEWARE DEBUG] Auth redirect check - Sub Error:", subError);
          }

          let subStatus = sub?.status || "Suspensa por inadimplência";
          const now = new Date();
          const isTrial = sub ? !sub.plan_id : true;
          const periodEnd = sub
            ? (isTrial
                ? (sub.trial_end ? new Date(sub.trial_end) : null)
                : (sub.current_period_end ? new Date(sub.current_period_end) : null))
            : null;

          const isSubActive = subStatus === "Ativa" || subStatus === "active";
          if (isSubActive && periodEnd && now > periodEnd) {
            subStatus = "Suspensa por inadimplência";
          }

          // If current subscription is blocked, redirect them to the blocked page so they can pay
          if (subStatus !== "Ativa" && subStatus !== "active") {
            console.log(`[MIDDLEWARE] Blocked account ${user.id} tried to access auth page. Redirecting to blocked page.`);
            const url = request.nextUrl.clone();
            url.pathname = "/billing/blocked";
            const redirectResponse = NextResponse.redirect(url);
            copyCookies(supabaseResponse, redirectResponse);
            return redirectResponse;
          }
        }
      }
    } catch (err) {
      console.error("[MIDDLEWARE] Error checking subscription on auth page redirect:", err);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  // Cheat Protection: Server-side validation of subscription status for authenticated users
  if (user && !isAuthPage && !isRootPage && !isBlockedPage && !isWebhook && !isCron) {
    try {
      // 1. Fetch user role and institution ID
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role:roles(name), institution_id")
        .eq("id", user.id)
        .maybeSingle();

      console.log("[MIDDLEWARE DEBUG] Path:", request.nextUrl.pathname);
      console.log("[MIDDLEWARE DEBUG] Main check - User ID:", user.id);
      console.log("[MIDDLEWARE DEBUG] Main check - Profile:", profile);
      if (profileError) {
        console.error("[MIDDLEWARE DEBUG] Main check - Profile Error:", profileError);
      }

      if (profile) {
        const roleName = (profile as unknown as { role: { name: string } | null } | null)?.role?.name || "gestor";
        
        // admin_geral is bypassable (is the global system administrator)
        if (roleName !== "admin_geral" && profile.institution_id) {
          // 2. Fetch institution subscription status
          const { data: sub, error: subError } = await supabase
            .from("subscriptions")
            .select("status, current_period_end, trial_end, plan_id")
            .eq("institution_id", profile.institution_id)
            .maybeSingle();

          console.log("[MIDDLEWARE DEBUG] Main check - Sub:", sub);
          if (subError) {
            console.error("[MIDDLEWARE DEBUG] Main check - Sub Error:", subError);
          }

          let subStatus = sub?.status || "Suspensa por inadimplência";
          const now = new Date();
          const isTrial = sub ? !sub.plan_id : true;
          const periodEnd = sub
            ? (isTrial
                ? (sub.trial_end ? new Date(sub.trial_end) : null)
                : (sub.current_period_end ? new Date(sub.current_period_end) : null))
            : null;

          const isSubActive = subStatus === "Ativa" || subStatus === "active";
          // Check for expiration by date even if database status says otherwise
          if (isSubActive && periodEnd && now > periodEnd) {
            subStatus = "Suspensa por inadimplência";
          }

          // If not Active, block access to all pages and APIs
          if (subStatus !== "Ativa" && subStatus !== "active") {
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
            const redirectResponse = NextResponse.redirect(url);
            copyCookies(supabaseResponse, redirectResponse);
            return redirectResponse;
          }
        }
      }
    } catch (err) {
      console.error("[MIDDLEWARE] Error validating subscription:", err);
    }
  }

  return supabaseResponse;
}
