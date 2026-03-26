"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Download, FileText, Printer, ArrowUp, Briefcase } from "lucide-react";
import { InstitutionProfile } from "@/services/pdf-service";
import { exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";

const evolutionData: any[] = [];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-5 rounded-[2rem] shadow-2xl min-w-[220px] ring-1 ring-black/5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 opacity-70">
          {label}
        </p>
        <div className="space-y-3">
          {payload.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: `0 0 15px ${item.color}80` 
                  }}
                />
                <span className="text-xs font-bold text-slate-700">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tight">
                {item.name.includes("Valor")
                  ? formatCurrency(item.value)
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function PortfolioEvolutionReport({
  dateRange,
  status,
  institutionData,
}: {
  dateRange: DateRange | undefined;
  status: string;
  institutionData?: InstitutionProfile;
}) {
  const handleExport = () => {
    try {
      exportToExcel(evolutionData, "evolucao_carteira.xlsx");
      toast.success("Excel gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Valor do Portfólio
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(0)}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl">
                <ArrowUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-2">
              +0% este mês
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Contratos Ativos
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">0</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-xl">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-[10px] text-blue-600 font-bold mt-2">
              +0 novos este mês
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Ticket Médio
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(0)}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              Crescimento de 0%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Evolução da Carteira</CardTitle>
            <CardDescription>
              Crescimento mensal em valor e volume de contratos.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
              onClick={handleExport}
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData}>
              <defs>
                <filter id="evolutionGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#f1f5f9"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}
                dy={15}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
                tickFormatter={(val) => `MT ${val / 1000}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#cbd5e1", fontSize: 10, fontWeight: 800 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Legend
                verticalAlign="top"
                height={60}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-3">
                    {value}
                  </span>
                )}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="valor"
                name="Valor Total (MT)"
                stroke="#3b82f6"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#colorValor)"
                animationDuration={2000}
                style={{ filter: "url(#evolutionGlow)" }}
                activeDot={{ r: 8, strokeWidth: 0, fill: "#3b82f6" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="contratos"
                name="Contratos"
                stroke="#10b981"
                strokeWidth={5}
                dot={{ r: 6, fill: "#10b981", strokeWidth: 3, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0, fill: "#10b981" }}
                style={{ filter: "url(#evolutionGlow)" }}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
