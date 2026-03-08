"use client";

import { createClient } from "@/utils/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LoanExportActions } from "@/components/loans/loan-export-actions";
import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";

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

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando empréstimos...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 space-y-6 p-8 pt-6"
    >
      {/* Header: Title & Main Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Empréstimos
          </h2>
          <p className="text-slate-500">
            Acompanhe e gira todos os contratos de microcrédito.
          </p>
        </div>
        <Link href="/loans/new">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 rounded-xl h-11 px-6 font-bold">
            <Plus className="mr-2 h-4 w-4" /> Novo Empréstimo
          </Button>
        </Link>
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
