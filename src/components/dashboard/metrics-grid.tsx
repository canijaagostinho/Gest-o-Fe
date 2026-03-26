"use client";

import { Wallet, Briefcase, Clock, AlertTriangle, ArrowUpRight, TrendingDown } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AutoScalingAmount } from "@/components/ui/auto-scaling-amount";

interface MetricsGridProps {
  data: {
    totalBalance: number;
    totalLent: number;
    receivables: number;
    delinquencyAmount: number;
    growthRate: number;
    overdueCount: number;
    lentCount: number;
    receivablesCount: number;
    delinquencyRate: number;
  };
  privacyMode: boolean;
  maskValue: (v: any) => any;
}

export function MetricsGrid({ data, privacyMode, maskValue }: MetricsGridProps) {
  const cards = [
    {
      title: "Saldo Consolidado",
      value: data.totalBalance || 0,
      subValue: `Crescimento: ${data.growthRate > 0 ? '+' : ''}${(data.growthRate || 0).toFixed(1)}%`,
      icon: Wallet,
      color: "blue",
      trend: data.growthRate >= 0 ? "up" : "down"
    },
    {
      title: "Carteira Ativa",
      value: data.totalLent || 0,
      subValue: `${data.lentCount || 0} contratos ativos`,
      icon: Briefcase,
      color: "slate",
      trend: "neutral"
    },
    {
      title: "A Receber (30 d)",
      value: data.receivables || 0,
      subValue: `${data.receivablesCount || 0} recebimentos`,
      icon: Clock,
      color: "indigo",
      trend: "up"
    },
    {
      title: "Inadimplência",
      value: data.delinquencyAmount || 0,
      subValue: `${(data.delinquencyRate || 0).toFixed(1)}% risco total`,
      icon: AlertTriangle,
      color: "rose",
      trend: data.delinquencyAmount > 0 ? "down" : "up"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-2">
      {cards.map((card, i) => {
        const theme = {
          blue: "from-blue-600 to-indigo-700 shadow-blue-200/50 hover:shadow-blue-300/60",
          slate: "from-slate-800 to-slate-950 shadow-slate-200/50 hover:shadow-slate-300/60",
          indigo: "from-indigo-600 to-violet-700 shadow-indigo-200/50 hover:shadow-indigo-300/60",
          rose: "from-rose-500 to-orange-600 shadow-rose-200/50 hover:shadow-rose-300/60"
        }[card.color] || "from-slate-700 to-slate-900 shadow-slate-200/50 hover:shadow-slate-300/60";

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
            className="group relative h-full"
          >
            <div className={cn(
              "p-10 rounded-[3rem] bg-gradient-to-br transition-all flex flex-col h-full relative overflow-hidden text-white shadow-2xl border border-white/10",
              theme
            )}>
              {/* Decorative Glow */}
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/20 transition-all duration-700" />
              
              {/* Top Row: Icon and Trend */}
              <div className="flex items-start justify-between mb-10 relative z-10">
                <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-inner group-hover:rotate-12 transition-transform duration-500 ring-4 ring-white/5">
                  <card.icon className="h-7 w-7 text-white" />
                </div>
                {card.trend !== "neutral" && (
                  <div className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border shadow-lg",
                    card.trend === "up" ? "bg-emerald-500/30 text-emerald-200 border-emerald-500/40" : "bg-white/10 text-white/80 border-white/20"
                  )}>
                    {card.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {card.trend === "up" ? "Alta" : "Risco"}
                  </div>
                )}
              </div>

              {/* Middle Row: Title and Value */}
              <div className="space-y-6 relative z-10 flex-1">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                    {card.title}
                  </p>
                  <AutoScalingAmount
                    amount={typeof card.value === 'number' ? card.value : 0}
                    baseSize="5xl"
                    className="text-white font-black tracking-tighter leading-none"
                    showCurrency={!privacyMode}
                  />
                </div>
              </div>

              {/* Bottom Row: Subtitle and Visual Accent */}
              <div className="pt-8 mt-8 border-t border-white/10 relative z-10">
                <p className="text-xs font-bold text-white/60 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  {card.subValue}
                </p>
              </div>

              {/* Grid Background Overlay */}
              <div className="absolute inset-0 bg-[url('/grid-white.svg')] opacity-[0.05] pointer-events-none" />
              
              {/* Bottom Glass Glow */}
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
