"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { InstitutionCompletionBanner } from "@/components/institution-completion-banner";
import { SubscriptionCountdownBanner } from "@/components/subscription-countdown-banner";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathnameRef = { current: pathname };
  pathnameRef.current = pathname;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/auth/login?reason=no_user");
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select(
            `
                role:roles(name),
                institution_id,
                institutions (
                    subscriptions (
                        status,
                        trial_end,
                        current_period_end,
                        plan_id
                    )
                )
            `,
          )
          .eq("id", user.id)
          .maybeSingle();

        let finalProfile = profile;

        if (!finalProfile) {
          const metadata = user.user_metadata;
          if (metadata?.full_name && metadata?.institution_id && metadata?.role_id) {
            const { data: recoveredProfile, error: recoveryError } = await supabase
              .from("users")
              .insert({
                id: user.id,
                full_name: metadata.full_name,
                email: user.email,
                institution_id: metadata.institution_id,
                role_id: metadata.role_id,
                status: "active",
              })
              .select("role:roles(name), institution_id, institutions(subscriptions(status, trial_end, current_period_end, plan_id))")
              .maybeSingle();

            if (!recoveryError && recoveredProfile) {
              finalProfile = recoveredProfile;
            }
          }
        }

        if (!finalProfile) {
          await supabase.auth.signOut();
          router.push("/auth/login?error=auth_failed&reason=profile_not_found");
          return;
        }

        const roleName = (finalProfile as any)?.role?.name || "gestor";
        setRole(roleName);

        // Verificar status da subscrição
        let subStatus = "Ativa";
        const instData = (finalProfile as any)?.institutions;
        const sub = Array.isArray(instData?.subscriptions)
          ? instData.subscriptions[0]
          : instData?.subscriptions;

        console.log("[LAYOUT DEBUG] User ID:", user.id);
        console.log("[LAYOUT DEBUG] finalProfile:", finalProfile);
        console.log("[LAYOUT DEBUG] roleName:", roleName);
        console.log("[LAYOUT DEBUG] sub:", sub);

        if (sub) {
          subStatus = sub.status || "Ativa";
          const now = new Date();
          const isTrial = !sub.plan_id;
          const periodEnd = isTrial
            ? (sub.trial_end ? new Date(sub.trial_end) : null)
            : (sub.current_period_end ? new Date(sub.current_period_end) : null);
          const isSubActive = subStatus === "Ativa" || subStatus === "active";
          console.log("[LAYOUT DEBUG] subStatus (initial):", subStatus);
          console.log("[LAYOUT DEBUG] isTrial:", isTrial);
          console.log("[LAYOUT DEBUG] periodEnd:", periodEnd);
          console.log("[LAYOUT DEBUG] now:", now);
          console.log("[LAYOUT DEBUG] isExpired:", periodEnd ? now > periodEnd : false);
          if (isSubActive && periodEnd && now > periodEnd) {
            subStatus = "Suspensa por inadimplência";
          }
        } else {
          console.log("[LAYOUT DEBUG] No subscription found, defaulting to Suspensa");
          subStatus = "Suspensa por inadimplência";
        }

        console.log("[LAYOUT DEBUG] Computed subStatus:", subStatus);
        (window as any).__subscriptionStatus = subStatus;

        // --- Verificações de autorização feitas aqui mesmo, após termos o role ---
        const currentPath = pathnameRef.current;
        const platformRoutes = ["/institutions", "/audit-logs"];
        const operadorBlockedSubRoutes = ["/settings/billing", "/settings/plans", "/settings/institution", "/monitoring"];
        const managementRoutes = ["/users", "/monitoring", "/agents"];

        const isPlatformRoute = platformRoutes.some(p => currentPath.startsWith(p));
        const isOperadorBlockedSubRoute = operadorBlockedSubRoutes.some(p => currentPath.startsWith(p));
        const isManagementRoute = managementRoutes.some(p => currentPath.startsWith(p));

        if (isOperadorBlockedSubRoute && roleName === "operador") {
          router.push("/settings");
          return;
        }
        if (isPlatformRoute && roleName !== "admin_geral") {
          router.push("/auth/login?error=access_denied&from=" + encodeURIComponent(currentPath));
          return;
        }
        if (isManagementRoute && roleName !== "admin_geral" && roleName !== "gestor") {
          router.push("/auth/login?error=access_denied&from=" + encodeURIComponent(currentPath));
          return;
        }
        if (roleName !== "admin_geral" && subStatus !== "Ativa" && subStatus !== "active") {
          router.push("/billing/blocked");
          return;
        }

        // Tudo ok — autorizar acesso
        setAuthorized(true);
      } catch (err: any) {
        console.error("[DashboardLayout] Erro crítico:", err);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push(`/auth/login?error=auth_failed&reason=catch_error`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (isLoading || !authorized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Carregando Sistema...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-[#F8FAFC]">
      <SubscriptionCountdownBanner role={role} />
      <InstitutionCompletionBanner role={role} />
      
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40 shadow-2xl">
        <Sidebar />
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 bg-[#111827] border-none w-72">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="md:pl-72 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} role={role} />
        <div className="flex-1 w-full max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-10 pt-4">
          {children}
        </div>
      </main>
    </div>
  );
}
