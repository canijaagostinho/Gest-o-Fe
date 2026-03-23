"use client";

import { Wallet, Briefcase, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingDown } from "lucide-react";
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
      subValue: `Mês anterior: ${data.growthRate > 0 ? '+' : ''}${(data.growthRate || 0).toFixed(1)}%`,
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
      subValue: `${data.receivablesCount || 0} recebimentos previstos`,
      icon: Clock,
      color: "indigo",
      trend: "up"
    },
    {
      title: "Inadimplência",
      value: data.delinquencyAmount || 0,
      subValue: `${(data.delinquencyRate || 0).toFixed(1)}% do total`,
      icon: AlertTriangle,
      color: "rose",
      trend: data.delinquencyAmount > 0 ? "down" : "up"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {cards.map((card, i) => {
        const theme = {
          blue: "from-blue-50/70 to-blue-100/30 border-blue-100/50 shadow-blue-100/20 text-blue-600",
          slate: "from-slate-50/70 to-slate-100/30 border-slate-100/50 shadow-slate-100/20 text-slate-600", // Updated slate theme
          indigo: "from-indigo-50/70 to-indigo-100/30 border-indigo-100/50 shadow-indigo-100/20 text-indigo-600",
          rose: "from-rose-50/70 to-rose-100/30 border-rose-100/50 shadow-rose-100/20 text-rose-600"
        }[card.color] || "from-slate-50/70 to-slate-100/30 border-slate-100/50 shadow-slate-100/20 text-slate-600";

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
            className={cn(
              "p-6 rounded-[2.5rem] bg-white border-2 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden bg-gradient-to-br",
              theme
            )}
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={cn(
                "p-3 rounded-2xl shadow-sm bg-white/80 backdrop-blur-sm border",
                card.color === "slate" ? "bg-slate-800 border-slate-700 text-blue-400" : cn("border-white/50", theme.split(" ")[theme.split(" ").length - 1])
              )}>
                <card.icon className="h-6 w-6" />
              </div>
              {card.trend !== "neutral" && (
                  <div className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                      card.trend === "up" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                  )}>
                      {card.trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {card.trend === "up" ? "Alta" : "Risco"}
                  </div>
              )}
            </div>

            <div className="space-y-1 relative z-10">
              <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest text-slate-500"
              )}>
                {card.title}
              </p>
              <AutoScalingAmount
                amount={typeof card.value === 'number' ? card.value : 0}
                baseSize="3xl"
                className="text-slate-950 font-black"
                showCurrency={!privacyMode}
              />
              <p className={cn(
                  "text-[11px] font-bold mt-2",
                  card.color === "slate" ? "text-slate-500" : "text-slate-400"
              )}>
                {card.subValue}
              </p>
            </div>
            
            {/* Soft decorative blur */}
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[40px] opacity-20 transition-all group-hover:opacity-40",
                card.color === "blue" ? "bg-blue-500" : 
                card.color === "rose" ? "bg-rose-500" : 
                card.color === "indigo" ? "bg-indigo-500" : "bg-slate-500"
            )} />
          </motion.div>
        );
      })}
    </div>
  );
}
