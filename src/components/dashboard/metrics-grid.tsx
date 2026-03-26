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
      title: "Total Desembolsado",
      value: data.totalLent || 0,
      subValue: `${data.totalLoansCount || 0} contratos totais`,
      icon: Briefcase,
      color: "slate",
      trend: "neutral"
    },
    {
      title: "Carteira Ativa",
      value: data.receivables || 0,
      subValue: `Capital em circulação`,
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
          blue: "border-blue-100 bg-blue-50/30 text-blue-600",
          slate: "border-slate-100 bg-slate-50/30 text-slate-600",
          indigo: "border-indigo-100 bg-indigo-50/30 text-indigo-600",
          rose: "border-rose-100 bg-rose-50/30 text-rose-600"
        }[card.color] || "border-slate-100 bg-slate-50/30 text-slate-600";

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
               "p-8 rounded-[2rem] bg-white transition-all flex flex-col h-full relative overflow-hidden shadow-sm border border-slate-100 hover:shadow-md",
            )}>
              
              {/* Top Row: Icon and Trend */}
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={cn(
                  "p-4 rounded-2xl border transition-all shadow-sm",
                  theme
                )}>
                  <card.icon className="h-6 w-6" />
                </div>
                {card.trend !== "neutral" && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-tight border shadow-sm",
                    card.trend === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-slate-400 border-slate-100"
                  )}>
                    {card.trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {card.trend === "up" ? "Alta" : "Risco"}
                  </div>
                )}
              </div>

              {/* Middle Row: Title and Value */}
              <div className="space-y-4 relative z-10 flex-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-1">
                    {card.title}
                  </p>
                  <AutoScalingAmount
                    amount={typeof card.value === 'number' ? card.value : 0}
                    baseSize="4xl"
                    className="text-slate-900 font-black tracking-tighter leading-none"
                    showCurrency={!privacyMode}
                  />
                </div>
              </div>

              {/* Bottom Row: Subtitle and Visual Accent */}
              <div className="pt-6 mt-6 border-t border-slate-50 relative z-10">
                <p className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  {card.subValue}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
