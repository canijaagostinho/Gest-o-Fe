"use client";

import { AlertCircle, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface Alert {
  type: "error" | "warning" | "success";
  message: string;
  href: string;
  count: number;
  detail?: string;
  subDetail?: string;
}

interface SmartAlertsProps {
  alerts: Alert[];
}

export function SmartAlerts({ alerts }: SmartAlertsProps) {
  if (alerts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 p-5 rounded-[2rem] bg-white border border-slate-100 flex items-center gap-4 shadow-sm"
      >
        <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 tracking-tight">Excelente! Nenhuma pendência Crítica.</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seu radar está limpo no momento</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 mb-10 h-min">
      {alerts.map((alert, i) => (
        <Link key={i} href={alert.href} className="block w-full">
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            className={cn(
              "flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all cursor-pointer group shadow-sm",
              alert.type === "error" && "bg-rose-50 border-rose-100 hover:border-rose-300",
              alert.type === "warning" && "bg-amber-50 border-amber-100 hover:border-amber-300",
              alert.type === "success" && "bg-emerald-50 border-emerald-100 hover:border-emerald-300"
            )}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn(
                "p-3 rounded-2xl shadow-inner shrink-0",
                alert.type === "error" && "bg-rose-500 text-white",
                alert.type === "warning" && "bg-amber-500 text-white",
                alert.type === "success" && "bg-emerald-500 text-white"
              )}>
                {alert.type === "error" && <AlertCircle className="h-5 w-5" />}
                {alert.type === "warning" && <Clock className="h-5 w-5" />}
                {alert.type === "success" && <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  "text-sm font-black tracking-tight leading-tight",
                  alert.type === "error" && "text-rose-900",
                  alert.type === "warning" && "text-amber-900",
                  alert.type === "success" && "text-emerald-900"
                )}>
                  {alert.detail || `${alert.count} ${alert.message}`}
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  {alert.subDetail || "Ver detalhes"}
                </span>
              </div>
            </div>
            <ChevronRight className={cn(
              "h-5 w-5 ml-4 shrink-0 transition-transform group-hover:translate-x-1",
              alert.type === "error" && "text-rose-400",
              alert.type === "warning" && "text-amber-400",
              alert.type === "success" && "text-emerald-400"
            )} />
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
