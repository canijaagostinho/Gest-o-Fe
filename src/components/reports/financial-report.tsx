"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
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
import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { InstitutionProfile, PDFService } from "@/services/pdf-service";
import { exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";

// Unused mock data removed

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
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

import { getFinancialMetricsAction } from "@/app/actions/financial-actions";

export function FinancialReport({
  dateRange,
  status,
  institutionData,
}: {
  dateRange: DateRange | undefined;
  status: string;
  institutionData?: InstitutionProfile;
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [reportData, setReportData] = React.useState<{
    totalReceived: number;
    totalLent: number;
    netProfit: number;
    chartData: any[];
  }>({
    totalReceived: 0,
    totalLent: 0,
    netProfit: 0,
    chartData: [],
  });

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const result = await getFinancialMetricsAction(
        dateRange?.from,
        dateRange?.to,
      );
      if (result.success && result.data) {
        setReportData(result.data);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [dateRange]);

  const handleExport = async (type: "pdf" | "excel") => {
    try {
      if (type === "excel") {
        exportToExcel(reportData.chartData, "relatorio_financeiro.xlsx");
        toast.success("Excel gerado com sucesso!");
      } else if (type === "pdf") {
        if (!institutionData) {
          toast.error("Dados da instituição não disponíveis para PDF");
          return;
        }
        toast.info("Gerando PDF...");
        const pdf = new PDFService(institutionData);

        // Map chart data to transaction-like items for the PDF Table
        const pdfItems = reportData.chartData.map((d: any) => ({
          date: new Date(), // Mock date since chart is monthly
          description: `Movimento de ${d.name}`,
          value: d.receita,
          type: "in" as "in" | "out",
        }));

        await pdf.generateFinancialReport(
          {
            totalLent: reportData.totalLent,
            totalReceived: reportData.totalReceived,
            balance: reportData.netProfit,
          },
          pdfItems,
          `Relatório Financeiro - ${new Date().getFullYear()}`,
        );
        toast.success("PDF gerado com sucesso!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar relatório");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Recebido Total
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(reportData.totalReceived)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Total de pagamentos registados
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-rose-50 to-white">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Desembolsado (Empréstimos)
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(reportData.totalLent)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Capital total entregue a clientes
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Saldo de Caixa
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(reportData.netProfit)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Diferença entre entradas e saídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fluxo Financeiro</CardTitle>
            <CardDescription>
              Comparativo mensal de entradas e saídas.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200"
              onClick={() => handleExport("excel")}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
              onClick={() => handleExport("pdf")}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reportData.chartData}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                tickFormatter={(val) => `MT ${val / 1000}k`}
                dx={-10}
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
                type="natural"
                dataKey="receita"
                name="Receita"
                stroke="#3b82f6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorReceita)"
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="natural"
                dataKey="despesa"
                name="Despesa"
                stroke="#ef4444"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorDespesa)"
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown by Category */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-wider text-slate-500 font-bold">
              Distribuição de Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.chartData}>
                <defs>
                  <linearGradient
                    id="colorBarReceita"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f8fafc", radius: 12 }}
                />
                <Bar
                  dataKey="receita"
                  fill="url(#colorBarReceita)"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-wider text-slate-500 font-bold">
              Análise de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.chartData}>
                <defs>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  name="Lucro"
                  stroke="#10b981"
                  fill="url(#colorLucro)"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
