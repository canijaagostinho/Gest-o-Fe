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
      <div className="bg-white/80 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-2xl shadow-slate-200/50 min-w-[180px]">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold text-slate-600">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-black text-slate-900">
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
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                dy={15}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                tickFormatter={(val) => `MT ${val / 1000}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#f1f5f9", strokeWidth: 2 }}
              />
              <Legend
                verticalAlign="top"
                height={48}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs font-bold text-slate-600 px-2">
                    {value}
                  </span>
                )}
              />
              <Area
                yAxisId="left"
                type="natural"
                dataKey="valor"
                name="Valor Total (MT)"
                stroke="#3b82f6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorValor)"
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                yAxisId="right"
                type="natural"
                dataKey="contratos"
                name="Contratos"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
