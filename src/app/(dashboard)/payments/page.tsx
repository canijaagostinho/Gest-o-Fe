"use client";

import { createClient } from "@/utils/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Banknote, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  endOfYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function PaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("operador");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const fetchPayments = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("institution_id, role:roles(name)")
        .eq("id", user.id)
        .single();

      const institutionId = userData?.institution_id;
      const isAdminGeral = (userData?.role as any)?.name === "admin_geral";
      setUserRole((userData?.role as any)?.name || "operador");

      let query = supabase
        .from("payments")
        .select(
          `
                    *,
                    loans (
                        id,
                        clients (
                            full_name
                        )
                    )
                `,
        )
        .order("payment_date", { ascending: false });

      if (!isAdminGeral && institutionId) {
        query = query.eq("institution_id", institutionId);
      }

      const { data, error } = await query;

      if (!error && data) {
        setPayments(data);
      }
      setLoading(false);
    };
    fetchPayments();
  }, [supabase]);

  const filteredPayments = payments.filter((payment: any) => {
    if (!dateRange?.from) return true;

    const paymentDate = new Date(payment.payment_date);
    const start = new Date(dateRange.from);
    start.setHours(0, 0, 0, 0);

    if (dateRange.to) {
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      return paymentDate >= start && paymentDate <= end;
    }

    return paymentDate >= start;
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
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Pagamentos
          </h2>
          <p className="text-slate-500">
            Gerencie todos os recebimentos do sistema.
          </p>
        </div>
        <Link href="/payments/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 rounded-xl h-11 px-6">
            <Plus className="mr-2 h-4 w-4" /> Novo Recebimento
          </Button>
        </Link>
      </div>

      {/* Toolbar: Filters */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Date Filters */}
        <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
          {/* Data Inicial */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              Data Inicial
            </label>
            <Input
              type="date"
              className="w-[150px] bg-slate-50 border-slate-200 focus-visible:ring-emerald-600 block h-11"
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
              className="w-[150px] bg-slate-50 border-slate-200 focus-visible:ring-emerald-600 block h-11"
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
      </div>

      <div className="mt-6">
        <DataTable columns={getColumns(userRole)} data={filteredPayments} />
      </div>
    </div>
  );
}
