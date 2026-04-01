"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { Bell, Search, Menu, DollarSign, Plus, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter, usePathname } from "next/navigation";

export function Header({
  onMenuClick,
  role,
}: {
  onMenuClick?: () => void;
  role?: string | null;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const isInstitutional = role !== "admin_geral";

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isInstitutional) return;

      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();

        const { count } = await supabase
          .from("system_notifications")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false);

        setUnreadCount(count || 0);
      } catch (err) {
        console.error("Error fetching notification count:", err);
      }
    };

    fetchNotifications();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isInstitutional]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-xl shadow-sm dark:from-slate-950 dark:to-slate-900/50 dark:border-slate-800">
      <div className="h-20 px-6 md:px-10 flex items-center gap-6 max-w-7xl mx-auto">
        {/* Mobile Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo + Branding */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-900/5 group-hover:scale-105 transition-all duration-300 ring-1 ring-slate-900/5 dark:ring-white/10 bg-white">
              <Image
                src="/logo.webp"
                alt="Gestão Flex - Sistema de Microcrédito e Cobrança"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-slate-700 dark:text-slate-200 tracking-tight font-heading group-hover:text-slate-900 transition-colors">
                Gestão
              </span>
              <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent tracking-tighter">
                Flex
              </span>
            </div>
          </div>
        </Link>

        {/* Search with Brand Colors */}
        <div className="flex-1 max-w-lg hidden md:flex relative group ml-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const q = formData.get("q") as string;
              if (q !== null) {
                // List of pages that handle ?q= natively
                const searchablePages = ["/clients", "/loans", "/users"];

                if (searchablePages.includes(pathname)) {
                  const currentParams = new URLSearchParams(
                    window.location.search,
                  );
                  if (q) {
                    currentParams.set("q", q);
                  } else {
                    currentParams.delete("q");
                  }
                  router.push(`${pathname}?${currentParams.toString()}`);
                } else {
                  // If on a non-searchable page (like dashboard or settings),
                  // redirect to clients page with the query
                  if (q) {
                    router.push(`/clients?q=${encodeURIComponent(q)}`);
                  }
                }
              }
            }}
            className="w-full relative"
          >
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              name="q"
              type="search"
              defaultValue={
                typeof window !== "undefined"
                  ? new URLSearchParams(window.location.search).get("q") || ""
                  : ""
              }
              placeholder="Buscar clientes, empréstimos..."
              className="w-full h-11 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-blue-500 rounded-2xl pl-10 transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800 text-base"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center space-x-3 md:space-x-6">
          {/* Quick Actions (Desktop) - Only for Institutional Users */}
          {isInstitutional && (
            <div className="hidden lg:flex items-center space-x-3">
              <Button
                asChild
                variant="outline"
                className="h-11 border-emerald-200/50 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 rounded-2xl px-6 font-bold transition-all shadow-sm"
              >
                <Link href="/payments/new">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Registrar Pagamento
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <Link href="/loans/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Empréstimo
                </Link>
              </Button>
            </div>
          )}

          <div className="h-8 w-px bg-slate-100 hidden md:block" />

          {/* Notifications */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative rounded-2xl h-11 w-11 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Link href="/notifications/system">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </Link>
          </Button>

          <ThemeToggle />

          {/* User Profile */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
