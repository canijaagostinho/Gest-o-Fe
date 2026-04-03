"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Users,
  Activity,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function GlobalDashboard() {
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    activeInstitutions: 0,
    pendingInstitutions: 0,
    totalManagers: 0,
    recentInstitutions: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      const supabase = createClient();

      // Fetch institutions summary - Filter out deleted ones
      const { data: insts } = await supabase
        .from("institutions")
        .select("*")
        .not("name", "ilike", "%_DELETED_%")
        .order("created_at", { ascending: false });

      // Fetch manager count
      const { count: managersCount } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .not("institution_id", "is", null);

      if (insts) {
        setStats({
          totalInstitutions: insts.length,
          activeInstitutions: insts.filter((i: any) => i.status === "active")
            .length,
          pendingInstitutions: insts.filter((i: any) => i.status === "pending")
            .length,
          totalManagers: managersCount || 0,
          recentInstitutions: insts.slice(0, 5),
        });
      }
      setLoading(false);
    };
    fetchGlobalData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) return null;

  return (
    <div className="space-y-12">
      {/* Header / Hero Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-1">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-2">
            Ecossistema Global
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Estatísticas em tempo real do Gestão Flex.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            asChild
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 sm:px-8 h-12 font-black shadow-xl shadow-blue-200 transition-all hover:-translate-y-1"
          >
            <Link href="/institutions/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Instituição
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl px-6 sm:px-8 h-12 font-black shadow-sm"
          >
            <Link href="/users/new">
              <Users className="h-4 w-4 mr-2" />
              Novo Gestor
            </Link>
          </Button>
        </div>
      </div>

      {/* Global KPIs */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: "Instituições", value: stats.totalInstitutions, icon: Building2, color: "blue", suffix: "Rede" },
          { label: "Ativas", value: stats.activeInstitutions, icon: Activity, color: "emerald", suffix: "Operando" },
          { label: "Pendentes", value: stats.pendingInstitutions, icon: Activity, color: "amber", suffix: "Aguardando" },
          { label: "Total Gestores", value: stats.totalManagers, icon: Users, color: "indigo", suffix: "Usuários" }
        ].map((kpi, idx) => (
          <motion.div key={idx} variants={item}>
            <Card className="relative overflow-hidden group p-6 sm:p-8 border-none shadow-xl bg-white rounded-[2rem] sm:rounded-[2.5rem] transition-all hover:shadow-2xl">
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 rounded-bl-[5rem] -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 transition-all group-hover:scale-110 opacity-10",
                kpi.color === "blue" ? "bg-blue-500" :
                kpi.color === "emerald" ? "bg-emerald-500" :
                kpi.color === "amber" ? "bg-amber-500" : "bg-indigo-500"
              )} />
              
              <div className="flex flex-col gap-6 sm:gap-8 relative z-10">
                <div className={cn(
                  "p-3 sm:p-4 w-fit rounded-xl sm:rounded-2xl border transition-all group-hover:rotate-6 shadow-sm",
                  kpi.color === "blue" ? "bg-blue-50 border-blue-100 text-blue-600" :
                  kpi.color === "emerald" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                  kpi.color === "amber" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                )}>
                  <kpi.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">
                    {kpi.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={cn(
                      "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter",
                      kpi.color === "emerald" ? "text-emerald-500" :
                      kpi.color === "amber" ? "text-amber-500" : "text-slate-900"
                    )}>
                      {kpi.value}
                    </p>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-none">{kpi.suffix}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* List of Institutions */}
      <Card className="border-none shadow-2xl bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden">
        <CardHeader className="px-6 sm:px-12 pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
              Instituições Recentes
            </CardTitle>
            <CardDescription className="text-sm sm:base font-medium text-slate-400 mt-1">
              Últimas adesões à rede de microcrédito.
            </CardDescription>
          </div>
          <Button variant="ghost" className="hidden sm:flex rounded-2xl font-black text-sm uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-6 h-12">
            Ver Todas
          </Button>
        </CardHeader>
        <CardContent className="px-4 sm:px-12 pb-8 sm:pb-12">
          <div className="grid gap-3 sm:gap-6">
            {stats.recentInstitutions.map((inst, idx) => (
              <Link key={inst.id} href={`/institutions/${inst.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center justify-between p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className={cn(
                      "h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl shadow-xl transition-transform group-hover:scale-110 group-hover:-rotate-3",
                      idx === 0 ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-200" :
                      idx === 1 ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200" :
                      "bg-white border-2 border-slate-100 text-slate-400 shadow-slate-100"
                    )}>
                      {inst.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-base sm:text-xl group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">
                        {inst.name}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                          <Activity className="h-3 w-3" />
                          <span className="hidden xs:inline">Adesão:</span> {new Date(inst.created_at).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">ID: {inst.id.split('-')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-8">
                    <div className="hidden md:flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Status</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-[0.2em] border-2 shadow-sm",
                          inst.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20"
                            : "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20"
                        )}
                      >
                        {inst.status === "active" ? "Ativa" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 shadow-sm transition-all group-hover:rotate-[360deg] duration-700">
                      <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
