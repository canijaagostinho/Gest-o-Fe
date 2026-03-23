"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RiskChart } from "@/components/dashboard/risk-chart";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

interface ChartsSectionProps {
  overviewData: any[];
  delinquencyData?: any;
}

export function ChartsSection({ overviewData }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
      {/* Main Evolution Chart */}
      <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden group">
        <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Fluxo de Caixa</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold text-slate-400 ml-10">Entradas vs. Saídas operacionais</CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Emprestado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Recebido</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[350px] w-full">
            <OverviewChart data={overviewData} />
          </div>
        </CardContent>
        {/* Abstract Background */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl" />
      </Card>

      {/* Distribution/Risk Chart */}
      <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden group">
        <CardHeader className="p-0 mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight text-center lg:text-left">Risco da Carteira</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold text-slate-400 ml-10">Distribuição por status</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex flex-col items-center justify-center h-full">
          <div className="h-[250px] w-full relative">
            <RiskChart />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativos</p>
              <p className="text-xl font-black text-slate-900">84%</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Em Risco</p>
              <p className="text-xl font-black text-rose-600">16%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
