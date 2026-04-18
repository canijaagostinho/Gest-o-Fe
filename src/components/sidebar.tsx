"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Banknote,
  FileText,
  Settings,
  Briefcase,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Building2,
  Wallet,
  Bell,
  TrendingDown,
  UserCog,
  ShieldCheck,
  Plus,
  Activity,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const adminGeralRoutes = [
  {
    label: "Visão Global",
    items: [
      {
        label: "Painel Global",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
      },
      {
        label: "Logs de Auditoria",
        icon: Briefcase,
        href: "/audit-logs",
        color: "text-emerald-500",
      },
    ],
  },
  {
    label: "Administração",
    items: [
      {
        label: "Instituições",
        icon: Building2,
        href: "/institutions",
        color: "text-violet-500",
      },
      {
        label: "Nova Instituição",
        icon: Plus,
        href: "/institutions/new",
        color: "text-blue-500",
      },
      {
        label: "Usuários do Sistema",
        icon: Users,
        href: "/users",
        color: "text-pink-700",
      },
    ],
  },
  {
    label: "Sistema e Configurações",
    items: [
      {
        label: "Relatórios Consolidados",
        icon: FileText,
        href: "/reports",
        color: "text-orange-700",
      },
      {
        label: "Planos de Assinatura",
        icon: CreditCard,
        href: "/settings/plans",
        color: "text-emerald-500",
      },
    ],
  },
];

const institutionalRoutes = [
  {
    label: "Operar",
    items: [
      {
        label: "Painel de Controle",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-blue-500",
      },
      {
        label: "Gestão de Clientes",
        icon: Users,
        href: "/clients",
        color: "text-blue-500",
      },
      {
        label: "Novos Empréstimos",
        icon: CreditCard,
        href: "/loans",
        color: "text-blue-500",
      },
      {
        label: "Cobranças e Pagamentos",
        icon: Banknote,
        href: "/payments",
        color: "text-blue-500",
      },
      {
        label: "Garantias (Collateral)",
        icon: ShieldCheck,
        href: "/collateral",
        color: "text-blue-500",
      },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        label: "Carteiras e Contas",
        icon: Wallet,
        href: "/finance/accounts",
        color: "text-blue-500",
      },
      {
        label: "Fluxo de Caixa",
        icon: TrendingDown,
        href: "/finance/expenses",
        color: "text-blue-500",
      },
      {
        label: "Relatórios de Performance",
        icon: FileText,
        href: "/reports",
        color: "text-blue-500",
      },
    ],
  },
  {
    label: "Administração",
    items: [
      {
        label: "Agentes e Equipe",
        icon: UserCog,
        href: "/agents",
        color: "text-blue-500",
      },
      {
        label: "Monitoramento de Risco",
        icon: Activity,
        href: "/monitoring",
        color: "text-blue-500",
      },
      {
        label: "Notificações",
        icon: Bell,
        href: "/notifications",
        color: "text-blue-500",
      },
      {
        label: "Assinatura do Plano",
        icon: CreditCard,
        href: "/settings/plans",
        color: "text-blue-500",
      },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  // Exclusive Accordion State: Only one group open at a time
  const [openGroup, setOpenGroup] = useState<string | null>("Principal");

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [institutionData, setInstitutionData] = useState<{
    name: string;
    acronym?: string;
    logo_url?: string;
    primary_color?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Optimized query: Fetch profile and joined institution data in one go
          const { data: profile } = await supabase
            .from("users")
            .select("*, role:roles(name), institution:institutions(*)")
            .eq("id", user.id)
            .single();

          if (profile) {
            type InstitutionType = { name: string; acronym?: string; logo_url?: string; primary_color?: string };
            const profileWithRole = profile as { role: { name: string } | null; institution?: InstitutionType };
            const role = profileWithRole.role?.name || "gestor";
            setUserRole(role);

            // Set institution data if available and not admin_geral
            if (role !== "admin_geral" && profileWithRole.institution) {
              setInstitutionData(profileWithRole.institution);
            }
          }
        }
      } catch (error) {
        console.error("Sidebar fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const routeGroups = useMemo(() => {
    let groups =
      userRole === "admin_geral" ? adminGeralRoutes : institutionalRoutes;

    // Filter routes for non-managers (Operador, Agente, Cliente)
    const restrictedRoles = ["operador", "agente", "cliente"];
    if (userRole && restrictedRoles.includes(userRole)) {
      const blockedRoutes = [
        "/agents", 
        "/monitoring", 
        "/settings/plans", 
        "/reports",
        "/finance/expenses" // Hide 'Fluxo de Caixa'
      ];
      groups = groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item: { href: string }) => !blockedRoutes.includes(item.href),
          ),
        }))
        .filter((group) => group.items.length > 0);
    }
    return groups;
  }, [userRole]);

  // Initialize Default State once role is loaded
  useEffect(() => {
    if (!userRole) return;
    // Default to second group open (usually Operacional or Gestão)
    // If we want "Principal and Operacional" open by default:
    if (routeGroups.length > 1) {
      setOpenGroup(routeGroups[1].label);
    }
  }, [userRole, routeGroups]);

  // Auto-expand active group on navigation
  useEffect(() => {
    const activeGroupIndex = routeGroups.findIndex((g: { items: Array<{ href: string }> }) =>
      g.items.some((i) => i.href === pathname),
    );
    if (activeGroupIndex !== -1) {
      setOpenGroup(routeGroups[activeGroupIndex].label);
    }
  }, [pathname, routeGroups]);

  if (isLoading) {
    return (
      <div className="space-y-4 py-8 flex flex-col h-full bg-[#0F172A] border-r border-slate-800 relative z-50">
        <div className="px-6 py-2">
          <div className="h-12 w-12 bg-slate-800 rounded-[1.25rem] animate-pulse" />
        </div>
        <div className="px-3 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-800/50 rounded-2xl animate-pulse mx-3"
            />
          ))}
        </div>
      </div>
    );
  }

  // Determine what to display in header
  const displayName = institutionData?.name || "Gestão Flex";
  const displaySubtitle = institutionData?.acronym || "";
  const displayLogo = institutionData?.logo_url || "/logo-premium.png";
  const displayColor = institutionData?.primary_color || "#1E3A8A"; // Default deep corporate blue
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[#111827] border-r border-white/5 relative z-50 shadow-2xl">
      <div className="p-6 relative bg-[#1F2937]/30 border-b border-white/5 backdrop-blur-xl mb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-4 group relative z-10 transition-transform active:scale-95"
        >
          {displayLogo ? (
            <div className="relative">
              <div className="relative h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden shadow-2xl group-hover:shadow-blue-500/30 transition-all duration-300 ring-1 ring-white/20 bg-white">
                <Image
                  src={displayLogo}
                  alt={`Logotipo da instituição ${displayName}`}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-[#0F172A] shadow-lg shadow-emerald-500/20" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:from-blue-500 group-hover:to-indigo-600 transition-all duration-300 ring-1 ring-white/20 relative">
              {firstLetter}
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-[#0F172A] shadow-lg shadow-emerald-500/20" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <span className="text-lg font-black text-white tracking-tight font-heading group-hover:text-blue-400 transition-colors truncate max-w-[150px]">
              {displayName}
            </span>
            {displaySubtitle && (
              <div className="flex items-center gap-1.5 ">
                <span className="text-[9px] font-bold text-blue-500/80 uppercase tracking-[0.2em] leading-none group-hover:text-blue-400 transition-colors">
                  {displaySubtitle}
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 overflow-y-auto min-h-0 no-scrollbar pb-8">
        <div className="space-y-8">
          {routeGroups.map((group) => {
            const isOpen = group.label === openGroup;

            return (
              <SidebarGroup
                key={group.label}
                group={group}
                pathname={pathname}
                isOpen={isOpen}
                onToggle={() => {
                  setOpenGroup(isOpen ? null : group.label);
                }}
                onClose={onClose}
              />
            );
          })}
        </div>

        {/* Standalone Settings at the bottom of scroll area - Restricted to non-operators */}
        <div className="mt-8 pt-4 border-t border-white/5">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "text-sm group flex p-4 w-full justify-start font-bold cursor-pointer rounded-2xl transition-all duration-300 relative",
              pathname === "/settings"
                ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/10 hover:border-white/5",
            )}
          >
            <div className="flex items-center flex-1 relative z-10 pl-2">
              <div
                className={cn(
                  "p-1 mr-3 transition-all duration-300",
                  pathname === "/settings"
                    ? "text-white"
                    : "text-slate-500 group-hover:text-blue-400",
                )}
              >
                <Settings className="h-5 w-5" />
              </div>
              <span>Configurações</span>
            </div>
          </Link>
        </div>
      </div>

      {userRole !== "admin_geral" && (
        <div className="px-4 pb-6 mt-auto">
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative group cursor-pointer mt-6">
                <div className="relative flex items-center bg-white/10 border border-white/10 rounded-2xl p-4 shadow-2xl hover:bg-white/15 hover:border-white/20 transition-all backdrop-blur-xl">
                  <div className="bg-blue-500/20 p-2.5 rounded-xl group-hover:bg-blue-500/30 transition-colors ring-1 ring-blue-500/30">
                    <Headphones className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-bold text-white tracking-tight">
                      Precisa de Ajuda?
                    </p>
                    <div className="flex items-center mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Suporte Online
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-none bg-white p-0 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl ring-1 ring-slate-200">
              <div className="bg-slate-50 p-6 sm:p-8 space-y-2 text-center border-b border-slate-100">
                <div className="mx-auto bg-white ring-1 ring-slate-200 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm">
                  <Headphones className="h-10 w-10 text-blue-800" />
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                  Central de Ajuda
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500">
                  Conte com a nossa equipe especializada para
                  <br />
                  tirar qualquer dúvida.
                </DialogDescription>
              </div>

              <div className="p-6 sm:p-8 space-y-4 bg-white">
                {/* WhatsApp Pill */}
                <button
                  onClick={() =>
                    window.open("https://wa.me/258834646942", "_blank")
                  }
                  className="group relative flex items-center w-full bg-white rounded-2xl p-2 pr-8 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-emerald-500/50"
                >
                  <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-3 sm:ml-5 text-left flex-1">
                    <p className="text-base font-black text-slate-800 tracking-tight leading-none">
                      WhatsApp
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-widest leading-none">
                      Resposta Rápida
                    </p>
                  </div>
                </button>

                {/* Email Pill */}
                <button
                  onClick={() =>
                    (window.location.href = "mailto:suporte@gestaoflex.mz")
                  }
                  className="group relative flex items-center w-full bg-white rounded-2xl p-2 pr-8 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-blue-500/50"
                >
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-all">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="ml-3 sm:ml-5 text-left flex-1">
                    <p className="text-base font-black text-slate-800 tracking-tight leading-none">
                      Email
                    </p>
                    <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-widest leading-none">
                      suporte@gestaoflex.mz
                    </p>
                  </div>
                </button>

                {/* Calls Pill */}
                <button
                  onClick={() => (window.location.href = "tel:+258834646942")}
                  className="group relative flex items-center w-full bg-white rounded-2xl p-2 pr-8 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-slate-400"
                >
                  <div className="p-3 sm:p-4 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-all">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="ml-3 sm:ml-5 text-left flex-1">
                    <p className="text-base font-black text-slate-800 tracking-tight leading-none">
                      Ligar Agora
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest leading-none">
                      +258 83 464 6942
                    </p>
                  </div>
                </button>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <div className="inline-flex items-center px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                      Seg - Sex: 08h - 18h
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

interface RouteItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  subItems?: RouteItem[];
}

interface SidebarGroupType {
  label: string;
  items: RouteItem[];
}

interface SidebarGroupProps {
  group: SidebarGroupType;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

function SidebarGroup({
  group,
  pathname,
  isOpen,
  onToggle,
  onClose,
}: SidebarGroupProps) {
  return (
    <div className="space-y-1 relative">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors group/header"
      >
        <span>{group.label}</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-300 text-slate-600",
            isOpen && "rotate-90 text-blue-500",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pb-2">
              {group.items.map((route) => {
                const isActive = pathname === route.href;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={onClose}
                    className={cn(
                      "text-sm group flex p-4 w-full justify-start font-bold cursor-pointer rounded-2xl transition-all duration-300 relative",
                      isActive
                        ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                        : "text-slate-400 hover:text-white border border-transparent hover:bg-white/10 hover:border-white/5 shadow-none",
                    )}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-700 rounded-r-md" />
                    )}

                    <div className="flex items-center flex-1 relative z-10 pl-2">
                      <div
                        className={cn(
                          "p-1 mr-3 transition-all duration-300",
                          isActive
                            ? "text-white"
                            : "text-slate-500 group-hover:text-blue-400",
                        )}
                      >
                        <route.icon className="h-5 w-5" />
                      </div>
                      <span className="transition-all duration-300 tracking-wide">
                        {route.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
