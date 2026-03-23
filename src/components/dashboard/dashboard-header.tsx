"use client";

import { Search, Bell, Plus, Banknote, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  user: any;
  notificationsCount?: number;
}

export function DashboardHeader({ user, notificationsCount = 0 }: DashboardHeaderProps) {
  const userName = user?.full_name?.split(" ")[0] || "Gestor";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 px-2">
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Olá, {userName} 👋
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Bem-vindo de volta ao GestãoFlex.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Global Search */}
        <div className="relative flex-1 md:w-64 lg:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Buscar clientes, contratos..." 
            className="pl-10 h-11 bg-white border-slate-200 rounded-2xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button asChild className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 font-bold shadow-lg shadow-blue-500/20 shrink-0">
            <Link href="/loans/new">
              <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
              Novo Empréstimo
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-11 border-slate-200 hover:bg-slate-50 rounded-2xl px-4 font-bold shadow-sm hidden sm:flex shrink-0">
            <Link href="/payments">
              <Banknote className="mr-2 h-4 w-4 text-emerald-600" />
              Receber
            </Link>
          </Button>

          {/* Notifications */}
          <div className="relative mx-1">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-slate-100 text-slate-500 relative">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-rose-500 border-2 border-white rounded-full text-[10px] font-black text-white flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </Button>
          </div>

          <Avatar className="h-11 w-11 border-2 border-white shadow-md ring-1 ring-slate-100 cursor-pointer hover:ring-blue-500 transition-all">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-sm">
                {userInitial}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
