"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { InstitutionCompletionBanner } from "@/components/institution-completion-banner";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [error, setError] = useState<string | null>(null);

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

        // maybeSingle is safer for robustness
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

        if (profileError) {
          console.error("Layout Role Fetch Error:", profileError);
          // Don't throw, just log and handle null profile
        }

        if (!profile) {
          console.warn("No profile found for user:", user.id);
          // Fallback or error state
          setError(
            "Perfil não encontrado. Por favor, tente fazer login novamente.",
          );
          return;
        }

        let roleName = null;
        const roleData = profile?.role;
        if (Array.isArray(roleData)) {
          roleName = roleData[0]?.name;
        } else {
          roleName = (roleData as any)?.name;
        }

        // If we found a profile but NO role is assigned (unlikely but possible)
        if (!roleName) {
          roleName = "gestor";
        }

        setRole(roleName);

        // Subscription status check
        let subStatus = "active";
        const instData = (profile as any)?.institutions;
        const subscriptions = instData?.subscriptions;
        if (Array.isArray(subscriptions) && subscriptions.length > 0) {
          subStatus = subscriptions[0].status;
        } else if (instData?.subscriptions) {
          subStatus = (instData.subscriptions as any).status || "active";
        }

        (window as any).__subscriptionStatus = subStatus;
        console.log("Profile loaded successfully, role:", roleName);
      } catch (err: any) {
        console.error("Critical error in DashboardLayout fetch:", err);
        setError(err.message || "Ocorreu um erro ao carregar o seu perfil.");
      } finally {
        setIsLoading(false);
        console.log("Loading finished");
      }
    };

    fetchProfile();
  }, [router]);

  // Permission check effect
  useEffect(() => {
    // If there's an error or it's loading, wait
    if (isLoading || error) return;

    // If role is null after loading and no error was caught, something is wrong
    if (role === null) {
      setError(
        "Não foi possível carregar as permissões do seu perfil. Por favor, reinicie a sessão.",
      );
      return;
    }

    // --- ROTA E PERMISSÕES ---
    // Explicit categories for better management
    const platformRoutes = ["/institutions", "/audit-logs", "/plans"]; // SaaS Admin only
    // Operador-restricted routes (gestor and admin_geral only)
    const operadorBlockedSubRoutes = ["/settings/billing", "/settings/plans", "/settings/institution", "/monitoring"];
    const isOperadorBlockedSubRoute = operadorBlockedSubRoutes.some(p => pathname.startsWith(p));
    if (isOperadorBlockedSubRoute && role === "operador") {
      router.push("/settings");
      return;
    }
    const managementRoutes = ["/users", "/monitoring", "/agents"]; // Managers and Admins
    const standardRoutes = ["/finance/accounts", "/finance/expenses", "/notifications", "/clients", "/loans", "/payments", "/reports"]; // Everyone authenticated (with internal page logic)

    const isPlatformRoute = platformRoutes.some(p => pathname.startsWith(p));
    const isManagementRoute = managementRoutes.some(p => pathname.startsWith(p));
    const isStandardRoute = standardRoutes.some(p => pathname.startsWith(p));

    console.log("PERMISSION CHECK:", {
      role,
      pathname,
      isPlatformRoute,
      isManagementRoute,
      isStandardRoute,
      subStatus: (window as any).__subscriptionStatus || "active"
    });

    // 1. Platfform Routes (admin_geral only)
    if (isPlatformRoute && role !== "admin_geral") {
      console.warn("REDIRECT: Platform route restricted to admin_geral", { pathname, role });
      router.push("/");
      return;
    }

    // 2. Management Routes (admin_geral and gestor only)
    if (isManagementRoute && role !== "admin_geral" && role !== "gestor") {
      console.warn("REDIRECT: Management route restricted to gestor/admin", { pathname, role });
      router.push("/");
      return;
    }

    // 3. Verificação de Assinatura (Bloqueia todos exceto Admin Geral se expirado/cancelado)
    const subStatus = (window as any).__subscriptionStatus || "active";
    if (
      role !== "admin_geral" &&
      (subStatus === "past_due" || subStatus === "canceled")
    ) {
      console.warn("REDIRECT: Inactive subscription - account blocked", { subStatus, role });
      router.push("/billing/blocked");
      return;
    }

    // 4. Fallback: If it's a known restricted route that didn't pass above, or just set authorized
    setAuthorized(true);
  }, [pathname, role, isLoading, router, error]);

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full">
          <h2 className="text-2xl font-black text-slate-900 mb-4">
            Erro de Acesso
          </h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <Button
            onClick={() => (window.location.href = "/auth/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-2xl"
          >
            Voltar para o Login
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40">
        <Sidebar />
      </div>

      <main className="md:pl-72 flex flex-col min-h-screen">
        <Header onMenuClick={() => { }} role={role} />
        <InstitutionCompletionBanner role={role} />
        <div className="flex-1 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
