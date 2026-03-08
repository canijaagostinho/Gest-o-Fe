"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Building2,
  CreditCard,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function GlobalReports() {
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    paidFees: 0,
    pendingFees: 0,
    totalRevenue: 0,
    institutions: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        const total = data.length;
        const paid = data.filter((i: any) => i.fee_status === "paid").length;
        const pending = data.filter(
          (i: any) => i.fee_status === "pending",
        ).length;
        const revenue = data.reduce(
          (acc: number, curr: any) =>
            acc + (Number(curr.monthly_fee_amount) || 0),
          0,
        );

        setStats({
          totalInstitutions: total,
          paidFees: paid,
          pendingFees: pending,
          totalRevenue: revenue,
          institutions: data,
        });
      }
      setLoading(false);
    };
    fetchGlobalStats();
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

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-slate-100 animate-pulse rounded-[2rem]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Instituições
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {stats.totalInstitutions}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] p-6 text-emerald-600">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Taxas Pagas
                </p>
                <p className="text-3xl font-black">{stats.paidFees}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] p-6 text-amber-600">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Taxas Pendentes
                </p>
                <p className="text-3xl font-black">{stats.pendingFees}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-slate-900 rounded-[2rem] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Receita Mensal
                </p>
                <p className="text-3xl font-black">
                  MT {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Institution Status Table */}
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">
                Status de Pagamento das Instituições
              </CardTitle>
              <CardDescription>
                Controle financeiro do ecossistema SaaS.
              </CardDescription>
            </div>
            <Button variant="outline" className="rounded-xl font-bold">
              <Download className="w-4 h-4 mr-2" />
              Exportar Cobranças
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Instituição
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Plano
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Valor Mensal
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status da Taxa
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Último Pagamento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.institutions.map((inst: any) => (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5 font-bold text-slate-900">
                      {inst.name}
                    </td>
                    <td className="px-8 py-5">
                      <Badge
                        variant="outline"
                        className="rounded-lg font-bold uppercase text-[10px] border-slate-200"
                      >
                        {inst.subscription_plan}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 font-medium">
                      MT {Number(inst.monthly_fee_amount || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      {inst.fee_status === "paid" ? (
                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none rounded-lg px-3 py-1 font-bold">
                          Pago
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-none rounded-lg px-3 py-1 font-bold">
                          Pendente
                        </Badge>
                      )}
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      {inst.last_fee_payment
                        ? new Date(inst.last_fee_payment).toLocaleDateString()
                        : "---"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
