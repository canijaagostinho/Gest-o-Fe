"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RiskBlock {
  level: "healthy" | "attention" | "critical";
  title: string;
  subtitle: string;
  amount: number;
  clientCount: number;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

const riskBlocks: RiskBlock[] = [
  {
    level: "healthy",
    title: "Saudável",
    subtitle: "0–30 dias",
    amount: 0,
    clientCount: 0,
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50/50",
    borderColor: "hover:border-emerald-200",
  },
  {
    level: "attention",
    title: "Atenção",
    subtitle: "31–60 dias",
    amount: 0,
    clientCount: 0,
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50/50",
    borderColor: "hover:border-amber-200",
  },
  {
    level: "critical",
    title: "Crítico",
    subtitle: "+90 dias",
    amount: 0,
    clientCount: 0,
    icon: AlertCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-50/50",
    borderColor: "hover:border-rose-200",
  },
];

export function PortfolioClassification() {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] p-8">
      <CardHeader className="p-0 mb-8">
        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
          Classificação da Carteira por Atraso
        </CardTitle>
        <CardDescription className="text-sm font-medium mt-1">
          Distribuição de contratos por nível de risco e atraso.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          {riskBlocks.map((block, index) => {
            const Icon = block.icon;
            return (
              <motion.div
                key={block.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center justify-between p-6 rounded-2xl border border-slate-100 transition-all duration-300 cursor-pointer group",
                  block.bgColor,
                  block.borderColor,
                  "hover:shadow-lg hover:bg-white",
                )}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes de ${block.title}`}
              >
                {/* Left Section: Icon + Info */}
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                      block.bgColor.replace("/50", ""),
                    )}
                  >
                    <Icon className={cn("h-6 w-6", block.color)} />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-base font-black tracking-tight transition-colors",
                        block.color,
                      )}
                    >
                      {block.title}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {block.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Section: Amount + Client Count */}
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">
                    {formatCurrency(block.amount)}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    {block.clientCount}{" "}
                    {block.clientCount === 1 ? "cliente" : "clientes"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-500 uppercase tracking-wider">
                Total da Carteira
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Todos os níveis combinados
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                {formatCurrency(
                  riskBlocks.reduce((sum, block) => sum + block.amount, 0),
                )}
              </p>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {riskBlocks.reduce((sum, block) => sum + block.clientCount, 0)}{" "}
                clientes ativos
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
