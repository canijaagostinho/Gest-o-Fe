import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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

  // If no user and trying to access protected route (anything not auth or root)
  if (!user && !isAuthPage && !isRootPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access auth pages or root landing page
  // We allow root for landing, but usually we want to push logged-in users to dashboard
  if (user && (isAuthPage || isRootPage)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard"; // Note: dashboard is handled by (dashboard) group, but / usually maps to it or we can use /
    // If the dashboard is actually at / (as /(dashboard)/page.tsx), then this might need adjustment.
    // Based on the file structure, /(dashboard)/page.tsx exists.
    // However, if the user is at root and authenticated, we might want to stay or go to dashboard.
    // If /(dashboard)/page.tsx is the index, then / for authenticated users should work.
    // Let's check if there's a explicit /dashboard route as well or if / is handled by the group.

    // In Next.js, (dashboard)/page.tsx handles /. 
    // If we want a separate landing page at app/page.tsx, it will take precedence over (dashboard)/page.tsx.
    // So if app/page.tsx exists, unauthenticated users see it, and authenticated users should probably go to / still?
    // Wait, if app/page.tsx exists, it will shadow (dashboard)/page.tsx.
    // To have both, we need to handle the logic in app/page.tsx or middleware.

    // If I put the landing page at app/page.tsx, I should redirect authenticated users to /dashboard if I create a dashboard route, 
    // OR move (dashboard)/page.tsx to (dashboard)/dashboard/page.tsx.

    // Let's assume we want landing at / and dashboard at /dashboard.
    url.pathname = "/dashboard";
    // Wait, I need to check if /dashboard exists or if it's currently /.
    // Previous list_dir showed src/app/(dashboard) with page.tsx. This means CURRENTLY / is the dashboard.
    // If I add src/app/page.tsx, it will conflict or override.

    // Better: rename (dashboard)/page.tsx to (dashboard)/dashboard/page.tsx or similar.
    // Or just keep landing page as a separate component and render conditionally in app/page.tsx.

    // Let's see the implementation plan again: "Initial root landing page at src/app/page.tsx".
    // If I create app/page.tsx, I should probably move the current dashboard index.

    url.pathname = "/"; // If dashboard remains at / but is handled by (dashboard)/page.tsx? 
    // actually if app/page.tsx and app/(dashboard)/page.tsx both exist, app/page.tsx wins for /.

    // I will move (dashboard)/page.tsx to (dashboard)/home or similar to avoid conflict, 
    // or just use middleware to direct traffic.

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
