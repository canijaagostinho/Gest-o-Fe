"use client";

import { CreditCard, Banknote, UserPlus, MessageSquare, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface ActionCenterProps {
  overdueToCharge: number;
}

export function ActionCenter({ overdueToCharge }: ActionCenterProps) {
  const actions = [
    {
      label: "Novo Empréstimo",
      icon: Zap,
      desc: "Simulação e análise instantânea",
      color: "blue",
      href: "/loans/new"
    },
    {
      label: "Cobrança Ativa",
      icon: MessageSquare,
      desc: "Notificar clientes em atraso",
      color: "rose",
      href: "/loans?status=overdue",
      suggestion: overdueToCharge > 0 ? `${overdueToCharge} pendências` : null
    },
    {
      label: "Cadastrar Cliente",
      icon: UserPlus,
      desc: "Adicionar novo tomador",
      color: "emerald",
      href: "/clients/new"
    },
    {
      label: "Relatórios PDF",
      icon: Banknote,
      desc: "Exportar dados consolidados",
      color: "slate",
      href: "/reports"
    }
  ];

  return (
    <div className="space-y-4">
      {actions.map((action, i) => (
        <Link key={i} href={action.href} className="block group">
          <div className="p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex items-center gap-5 relative overflow-hidden">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105",
              action.color === "blue" && "bg-blue-600",
              action.color === "rose" && "bg-rose-500",
              action.color === "emerald" && "bg-emerald-500",
              action.color === "slate" && "bg-slate-900"
            )}>
              <action.icon className="h-6 w-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                {action.label}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {action.desc}
              </p>
            </div>

            {action.suggestion && (
              <div className="px-2 py-0.5 bg-rose-50 rounded-lg border border-rose-100 flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">
                    {action.suggestion}
                  </span>
              </div>
            )}

            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100 ml-2" />
          </div>
        </Link>
      ))}
    </div>
  );
}
