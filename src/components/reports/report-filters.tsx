"use client";

import * as React from "react";
import { CalendarIcon, Filter, X } from "lucide-react";
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
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  status: string;
  setStatus: (status: string) => void;
  onClear: () => void;
}

export function ReportFilters({
  dateRange,
  setDateRange,
  status,
  setStatus,
  onClear,
}: ReportFiltersProps) {
  const presets = [
    {
      label: "Hoje",
      getValue: () => {
        const today = new Date();
        return { from: today, to: today };
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

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 text-slate-500 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-semibold">Filtros</span>
      </div>

      {/* Date Filters: Split Inputs */}
      <div className="flex items-end gap-3">
        {/* Data Inicial */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Data Inicial
          </label>
          <Input
            type="date"
            className="w-[140px] bg-slate-50 border-slate-200 focus-visible:ring-blue-600 block"
            value={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const date = e.target.value
                ? new Date(e.target.value)
                : undefined;
              setDateRange({ from: date, to: dateRange?.to });
            }}
            onClick={(e) => e.currentTarget.showPicker()}
          />
        </div>

        {/* Data Final */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
            Data Final
          </label>
          <Input
            type="date"
            className="w-[140px] bg-slate-50 border-slate-200 focus-visible:ring-blue-600 block"
            value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const date = e.target.value
                ? new Date(e.target.value)
                : undefined;
              setDateRange({ from: dateRange?.from, to: date });
            }}
            min={
              dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined
            }
            onClick={(e) => e.currentTarget.showPicker()}
          />
        </div>

        {/* Presets */}
        <div className="">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="start">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Períodos Rápidos
              </div>
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
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status Filter */}
      <div className="w-[180px]">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="overdue">Em Atraso</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1" />

      {/* Clear Filters */}
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-400 hover:text-slate-600"
        onClick={onClear}
      >
        <X className="w-4 h-4 mr-2" />
        Limpar
      </Button>
    </div>
  );
}
