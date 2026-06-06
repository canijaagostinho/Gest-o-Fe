"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ShieldCheck, Clock, DollarSign, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, overdue: 0 });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*, plan:plans(*), institution:institutions(name)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setSubscriptions(data || []);
        const total = data?.length || 0;
        const revenue = data?.reduce((sum, sub) => sum + (Number(sub.plan?.price_amount) || 0), 0) || 0;
        const now = Date.now();
        const overdue = data?.filter((sub) => {
          const due = new Date(sub.current_period_end).getTime();
          return sub.status === "past_due" || due < now;
        }).length;
        setStats({ total, revenue, overdue });
      } catch (err) {
        console.error("Erro ao buscar assinaturas", err);
        toast.error("Falha ao carregar dados de assinaturas.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 space-y-8">
      <h1 className="text-4xl font-black text-center bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
        Dashboard de Assinaturas
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-blue-400">
              <User className="mr-2 h-5 w-5" /> Total de Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-white">{stats.total}</CardContent>
        </Card>
        <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-emerald-400">
              <DollarSign className="mr-2 h-5 w-5" /> Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-white">
            {stats.revenue.toLocaleString("pt-MZ")} MTn
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-rose-400">
              <Clock className="mr-2 h-5 w-5" /> Em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-white">{stats.overdue}</CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-600">
          <CardHeader>
            <CardTitle className="text-lg text-white">Lista de Assinaturas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-400">Instituição</TableHead>
                  <TableHead className="text-slate-400">Plano</TableHead>
                  <TableHead className="text-slate-400">Valor (MTn)</TableHead>
                  <TableHead className="text-slate-400">Vencimento</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-slate-700/30 transition-colors">
                    <TableCell>{sub.institution?.name || "-"}</TableCell>
                    <TableCell>{sub.plan?.name || "-"}</TableCell>
                    <TableCell>{Number(sub.plan?.price_amount).toLocaleString("pt-MZ")}</TableCell>
                    <TableCell>{new Date(sub.current_period_end).toLocaleDateString("pt-PT")}</TableCell>
                    <TableCell className={sub.status === "active" ? "text-emerald-400" : sub.status === "past_due" ? "text-rose-400" : "text-slate-400"}>
                      {sub.status}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/subscriptions/${sub.id}`)}
                      >
                        Detalhes <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
