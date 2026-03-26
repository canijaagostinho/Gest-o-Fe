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
          console.warn("No user found, redirecting to login");
          router.push("/auth/login");
          return;
        }

        console.log("Fetching profile for user:", user.id);

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select(
            `
                role:roles(name),
                institution_id,
                institutions (
                    subscriptions (status)
                )
            `,
          )
          .eq("id", user.id)
          .maybeSingle();

        let finalProfile = profile;

        // TENTATIVA DE RECUPERAÇÃO: Se o perfil não existe mas o usuário está autenticado
        if (!finalProfile) {
          console.warn("Perfil não encontrado, tentando recuperar...");
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
              .select("role:roles(name), institution_id, institutions(subscriptions(status))")
              .maybeSingle();

            if (!recoveryError && recoveredProfile) {
              finalProfile = recoveredProfile;
            }
          }
        }

        if (!finalProfile) {
          console.warn("No profile found - signing out and redirecting");
          await supabase.auth.signOut();
          router.push("/auth/login?error=auth_failed");
          return;
        }

        const profileData = finalProfile;
        let roleName = null;
        const roleData = profileData?.role;
        if (Array.isArray(roleData)) {
          roleName = roleData[0]?.name;
        } else {
          roleName = (roleData as any)?.name;
        }

        if (!roleName) roleName = "gestor";
        setRole(roleName);

        // Subscription status core check
        let subStatus = "active";
        const instData = (profileData as any)?.institutions;
        const subscriptions = instData?.subscriptions;
        if (Array.isArray(subscriptions) && subscriptions.length > 0) {
          subStatus = subscriptions[0].status;
        } else if (instData?.subscriptions) {
          subStatus = (instData.subscriptions as any).status || "active";
        }

        (window as any).__subscriptionStatus = subStatus;
      } catch (err: any) {
        console.error("Critical error in DashboardLayout:", err);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login?error=auth_failed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Permission and Authorization effect
  useEffect(() => {
    if (isLoading) return;

    if (role === null) {
        const supabase = createClient();
        supabase.auth.signOut().then(() => {
            router.push("/auth/login?error=auth_failed");
        });
        return;
    }

    // Role-based route protection
    const platformRoutes = ["/institutions", "/audit-logs", "/plans"];
    const operadorBlockedSubRoutes = ["/settings/billing", "/settings/plans", "/settings/institution", "/monitoring"];
    
    const isPlatformRoute = platformRoutes.some(p => pathname.startsWith(p));
    const isOperadorBlockedSubRoute = operadorBlockedSubRoutes.some(p => pathname.startsWith(p));
    const managementRoutes = ["/users", "/monitoring", "/agents"];
    const isManagementRoute = managementRoutes.some(p => pathname.startsWith(p));

    if (isOperadorBlockedSubRoute && role === "operador") {
      router.push("/settings");
      return;
    }

    if (isPlatformRoute && role !== "admin_geral") {
      router.push("/");
      return;
    }

    if (isManagementRoute && role !== "admin_geral" && role !== "gestor") {
      router.push("/");
      return;
    }

    const subStatus = (window as any).__subscriptionStatus || "active";
    if (role !== "admin_geral" && (subStatus === "past_due" || subStatus === "canceled")) {
      router.push("/billing/blocked");
      return;
    }

    setAuthorized(true);
  }, [pathname, role, isLoading, router]);

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
        <SubscriptionCountdownBanner role={role} />
        <InstitutionCompletionBanner role={role} />
        <div className="flex-1 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
