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
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#f1f5f9"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
                tickFormatter={(val) => `MT ${val / 1000}k`}
                dx={-10}
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
                type="monotone"
                dataKey="receita"
                name="Receita"
                stroke="#3b82f6"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#colorReceita)"
                animationDuration={2000}
                style={{ filter: "url(#glow)" }}
                activeDot={{ r: 8, strokeWidth: 0, fill: "#3b82f6" }}
              />
              <Area
                type="monotone"
                dataKey="despesa"
                name="Despesa"
                stroke="#f43f5e"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#colorDespesa)"
                animationDuration={2000}
                style={{ filter: "url(#glow)" }}
                activeDot={{ r: 8, strokeWidth: 0, fill: "#f43f5e" }}
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
                  <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient
                    id="colorBarReceita"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f8fafc", opacity: 0.4 }}
                />
                <Bar
                  dataKey="receita"
                  fill="url(#colorBarReceita)"
                  radius={[20, 20, 20, 20]}
                  barSize={32}
                  style={{ filter: "url(#barGlow)" }}
                  animationDuration={2000}
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
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
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
                  strokeWidth={5}
                  style={{ filter: "url(#glow)" }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#10b981" }}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
