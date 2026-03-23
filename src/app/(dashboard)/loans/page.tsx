"use client";

import { createClient } from "@/utils/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, TrendingUp, AlertTriangle, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LoanExportActions } from "@/components/loans/loan-export-actions";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutoScalingAmount } from "@/components/ui/auto-scaling-amount";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useSearchParams } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";

import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("operador");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const supabase = createClient();

  useEffect(() => {
    const fetchLoans = async () => {
      const { data, error } = await supabase
        .from("loans")
        .select(
          "*, clients(full_name), loan_collateral(*), installments(status, due_date)",
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLoans(data);
      }

      // Fetch user role
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("role:roles(name)")
          .eq("id", authUser.id)
          .single();

        if (profile?.role) {
          setUserRole((profile.role as any).name);
        }
      }

      setLoading(false);
    };
    fetchLoans();
  }, [supabase]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  const filteredLoans = loans.filter((loan: any) => {
    // Status Filter
    if (statusFilter && loan.status !== statusFilter) {
      return false;
    }

    // Search Filter (Client Name)
    if (searchQuery) {
      const clientName = loan.clients?.full_name?.toLowerCase() || "";
      if (!clientName.includes(searchQuery)) {
        return false;
      }
    }

    if (!dateRange?.from) return true;

    const loanDate = new Date(loan.created_at);
    const start = new Date(dateRange.from);
    start.setHours(0, 0, 0, 0);

    if (dateRange.to) {
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      return loanDate >= start && loanDate <= end;
    }

    return loanDate >= start;
  });

  const presets = [
    {
      label: "Hoje",
      getValue: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      label: "Ontem",
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return { from: yesterday, to: yesterday };
      },
    },
    {
      label: "Esta Semana",
      getValue: () => {
        const today = new Date();
        return {
          from: startOfWeek(today, { locale: ptBR }),
          to: endOfWeek(today, { locale: ptBR }),
        };
      },
    },
    {
      label: "Este Mês",
      getValue: () => {
        const today = new Date();
        return { from: startOfMonth(today), to: endOfMonth(today) };
      },
    },
    {
      label: "Mês Passado",
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
    },
    {
      label: "Este Ano",
      getValue: () => {
        const today = new Date();
        return { from: startOfYear(today), to: endOfYear(today) };
      },
    },
  ];

  // Calculate Portfolio KPIs
  const todayStr = new Date().toISOString().split("T")[0];
  const activeLoans = loans.filter((l) => l.status === "active");
  const activePortfolio = activeLoans.reduce(
    (acc, curr) => acc + (Number(curr.loan_amount) || 0),
    0,
  );
  const delinquentLoans = loans.filter((l) =>
    l.installments?.some(
      (inst: any) => inst.status === "pending" && inst.due_date < todayStr,
    ),
  );
  const creditRisk =
    loans.length > 0 ? (delinquentLoans.length / loans.length) * 100 : 0;
  const averageTicket =
    activeLoans.length > 0 ? activePortfolio / activeLoans.length : 0;

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="space-y-4">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Sincronizando Carteira...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 space-y-10 p-8 pt-6 pb-20"
    >
      {/* Header: Title & Main Action */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Carteira de Crédito
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Gestão Estratégica de Contratos & Ativos
          </p>
        </div>
        <Link href="/loans/new">
          <Button className="bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest">
            <Plus className="mr-2 h-5 w-5" /> Novo Empréstimo
          </Button>
        </Link>
      </div>

      {/* Portfolio Performance Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* KPI 1: Active Portfolio */}
         <Card className="bg-blue-600 border-none rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl ring-1 ring-white/20">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100">Carteira Ativa</span>
                </div>
                <div>
                    <AutoScalingAmount 
                        amount={activePortfolio} 
                        baseSize="4xl" 
                        className="text-white"
                        decimalSize="sm"
                    />
                    <p className="text-[10px] font-bold text-blue-100 mt-2 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {activeLoans.length} contratos em operação
                   </p>
                </div>
            </div>
         </Card>

         {/* KPI 2: Credit Risk */}
         <Card className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all duration-700" />
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-xl text-rose-600 ring-1 ring-rose-100">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Risco de Crédito</span>
                </div>
                <div>
                   <h3 className="text-4xl font-black tracking-tighter text-slate-900 truncate">
                      {creditRisk.toFixed(1)}%
                   </h3>
                   <p className="text-[10px] font-bold text-rose-600 mt-2 uppercase tracking-wider">
                      {delinquentLoans.length} contratos com atraso alto
                   </p>
                </div>
            </div>
         </Card>

         {/* KPI 3: Average Ticket */}
         <Card className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 ring-1 ring-indigo-100">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ticket Médio</span>
                </div>
                <div>
                    <AutoScalingAmount 
                        amount={averageTicket} 
                        baseSize="4xl" 
                        className="text-slate-900"
                        decimalSize="sm"
                    />
                    <p className="text-[10px] font-bold text-indigo-600 mt-2 uppercase tracking-wider">
                      Valor médio por operação
                   </p>
                </div>
            </div>
         </Card>
      </div>

      {/* Toolbar: Filters & Exports */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Date Filters */}
        <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <div className="space-y-1.5 min-w-[140px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Status
            </label>
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams.toString());
                if (value && value !== "all") {
                  params.set("status", value);
                } else {
                  params.delete("status");
                }
                router.push(`/loans?${params.toString()}`);
              }}
            >
              <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 focus:ring-blue-600 h-11">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Liquidados</SelectItem>
                <SelectItem value="delinquent">Inadimplentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Inicial */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Data Inicial
            </label>
            <Input
              type="date"
              className="w-[150px] bg-slate-50 border-slate-200 focus-visible:ring-blue-600 block h-11"
              value={
                dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
              }
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value)
                  : undefined;
                setDateRange((prev) => ({ from: date, to: prev?.to }));
              }}
              onClick={(e) => e.currentTarget.showPicker()}
            />
          </div>

          {/* Data Final */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Data Final
            </label>
            <Input
              type="date"
              className="w-[150px] bg-slate-50 border-slate-200 focus-visible:ring-blue-600 block h-11"
              value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value)
                  : undefined;
                setDateRange((prev) => ({ from: prev?.from, to: date }));
              }}
              min={
                dateRange?.from
                  ? format(dateRange.from, "yyyy-MM-dd")
                  : undefined
              }
              onClick={(e) => e.currentTarget.showPicker()}
            />
          </div>

          {/* Presets */}
          <div className="pb-0.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 px-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <span className="text-xs font-medium">Filtros Rápidos</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="start">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    className="justify-start font-normal text-sm h-8 px-2 w-full text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => setDateRange(preset.getValue())}
                  >
                    {preset.label}
                  </Button>
                ))}
                <div className="border-t border-slate-100 my-1 pt-1">
                  <Button
                    variant="ghost"
                    className="justify-start font-normal text-sm h-8 px-2 w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDateRange(undefined)}
                  >
                    Limpar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Exports */}
        <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
          <LoanExportActions />
        </div>
      </div>

      <div className="mt-6">
        <DataTable columns={getColumns(userRole)} data={filteredLoans} />
      </div>
    </motion.div>
  );
}
