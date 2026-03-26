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
  CreditCard,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

      // Fetch institutions summary
      const { data: insts } = await supabase
        .from("institutions")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch manager count
      const { count: managersCount } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .not("institution_id", "is", null); // Assuming institutions exist for managers

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

  return (
    <div className="space-y-10">
      {/* Header / Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Painel de Controle Global
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">
            Estatísticas em tempo real de todo o ecossistema Gestão Flex.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-lg shadow-blue-200"
          >
            <Link href="/institutions/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Instituição
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-full px-6 font-bold"
          >
            <Link href="/users/new">
              <Users className="h-4 w-4 mr-2" />
              Novo Administrador
            </Link>
          </Button>
        </div>
      </div>

      {/* Global KPIs */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50/50 rounded-bl-[4rem] -mr-4 -mt-4 transition-all group-hover:bg-sky-100/50" />
            <div className="flex items-center gap-5 relative">
              <div className="p-4 bg-sky-50 border border-sky-100/50 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                <Building2 className="h-7 w-7 text-sky-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  Instituições
                </p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {stats.totalInstitutions}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-[4rem] -mr-4 -mt-4 transition-all group-hover:bg-emerald-100/50" />
            <div className="flex items-center gap-5 relative">
              <div className="p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                <Activity className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  Ativas
                </p>
                <p className="text-4xl font-black text-emerald-600 tracking-tighter">
                  {stats.activeInstitutions}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-bl-[4rem] -mr-4 -mt-4 transition-all group-hover:bg-amber-100/50" />
            <div className="flex items-center gap-5 relative">
              <div className="p-4 bg-amber-50 border border-amber-100/50 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                <Activity className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  Pendentes
                </p>
                <p className="text-4xl font-black text-amber-600 tracking-tighter">
                  {stats.pendingInstitutions}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[4rem] -mr-4 -mt-4 transition-all group-hover:bg-indigo-100/50" />
            <div className="flex items-center gap-5 relative">
              <div className="p-4 bg-indigo-50 border border-indigo-100/50 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                <Users className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  Total Gestores
                </p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {stats.totalManagers}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* List of Institutions */}
      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-xl font-black">
            Instituições Recentes
          </CardTitle>
          <CardDescription>
            Acompanhe o crescimento da rede de microcrédito.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-4">
            {stats.recentInstitutions.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
                    {inst.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{inst.name}</p>
                    <p className="text-xs text-slate-500">
                      Desde {new Date(inst.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    className={
                      inst.status === "active"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-700"
                    }
                  >
                    {inst.status === "active" ? "Ativa" : "Pendente"}
                  </Badge>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
