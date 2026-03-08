"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
// Import Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { LoanSimulation } from "@/lib/loan-utils";

interface LoanSimulatorProps {
  simulation: LoanSimulation | null;
  loading?: boolean;
  frequency?: string;
  interestRate?: number;
  term?: number;
  principal?: number; // Added principal prop
  processingFee?: number;
}

export function LoanSimulator({
  simulation,
  loading,
  frequency,
  interestRate,
  term,
  principal = 0,
  processingFee = 0,
}: LoanSimulatorProps) {
  const totalToPay = simulation?.totalToPay || 0;
  const installmentAmount = simulation?.installmentAmount || 0;
  const netDisbursal = principal - processingFee;

  // Calculate Interest vs Principal for Pie Chart
  // Interest = TotalToPay - Principal
  const totalInterest = Math.max(0, totalToPay - principal);

  const chartData = [
    { name: "Capital", value: principal, color: "#3b82f6" }, // Blue-500
    { name: "Juros", value: totalInterest, color: "#10b981" }, // Emerald-500
  ];

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-0 overflow-hidden sticky top-24">
      {/* Header / Title */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-blue-500" />
            Simulador
          </h3>
          <div className="flex items-center space-x-2">
            {loading && (
              <span className="animate-pulse bg-slate-800 h-2 w-2 rounded-full"></span>
            )}
            <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Tempo Real
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Block 1: Financial Summary (Grid 3x2) */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Principal */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Capital Solicitado
            </p>
            <p
              className="text-lg font-bold text-white truncate"
              title={formatCurrency(principal)}
            >
              {formatCurrency(principal)}
            </p>
          </div>

          {/* Processing Fee */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold text-rose-400">
              (-) Taxa Processo
            </p>
            <p
              className="text-lg font-bold text-rose-400 truncate"
              title={formatCurrency(processingFee)}
            >
              {formatCurrency(processingFee)}
            </p>
          </div>

          {/* Net Receive (Highlighted) */}
          <div className="col-span-2 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex justify-between items-center">
              <p className="text-xs text-blue-300 uppercase tracking-wider font-bold">
                Valor a Receber
              </p>
              <span className="text-[10px] text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-500/20">
                Líquido
              </span>
            </div>
            <p
              className="text-2xl font-black text-white mt-1 break-words"
              title={formatCurrency(netDisbursal)}
            >
              {formatCurrency(netDisbursal)}
            </p>
          </div>

          {/* Totals Row */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total a Pagar
            </p>
            <p
              className="text-base font-bold text-amber-500 truncate"
              title={formatCurrency(totalToPay)}
            >
              {formatCurrency(totalToPay)}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Parcela ({term}x)
            </p>
            <p
              className="text-base font-bold text-white truncate"
              title={formatCurrency(installmentAmount)}
            >
              {formatCurrency(installmentAmount)}
            </p>
          </div>
        </div>

        {/* Transparency Formula Section */}
        {simulation && (
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-4 w-4 text-blue-500" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Transparência do Cálculo
              </h4>
            </div>
            <div className="space-y-2 text-xs text-slate-400 font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
              <div className="flex justify-between">
                <span>Capital Inicial</span>
                <span className="text-white">{formatCurrency(principal)}</span>
              </div>
              {processingFee > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>(-) Taxa de Processo</span>
                  <span>{formatCurrency(processingFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-700/50 pb-1 mb-1">
                <span className="font-bold text-blue-400">
                  (=) Líquido a Receber
                </span>
                <span className="font-bold text-blue-400">
                  {formatCurrency(netDisbursal)}
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span>
                  (+) Juros ({interestRate}% x {term})
                </span>
                <span className="text-emerald-400">
                  {formatCurrency(simulation.totalInterest)}
                </span>
              </div>
              <div className="border-t border-slate-700/50 my-1 pt-1 flex justify-between font-bold">
                <span>(=) Total a Pagar</span>
                <span className="text-amber-500">
                  {formatCurrency(totalToPay)}
                </span>
              </div>
              <div className="pt-2 flex justify-between text-slate-500 italic">
                <span>(÷) {term} Parcelas</span>
                <span>~ {formatCurrency(installmentAmount)} /mês</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart & Schedule Area */}
        <div className="grid grid-cols-1 gap-4">
          {/* Chart */}
          {simulation && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-800/50 p-4 flex items-center justify-between relative overflow-hidden">
              <div className="z-10 relative">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Composição
                </p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    Capital ({Math.round((principal / totalToPay) * 100)}%)
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                    Juros ({Math.round((totalInterest / totalToPay) * 100)}%)
                  </div>
                </div>
              </div>
              <div className="h-24 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#1e293b",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold px-2">
              <span>Cronograma Detalhado</span>
              <span>{simulation?.installments.length || 0} Parcelas</span>
            </div>

            <div className="relative pl-4 space-y-0 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {/* Timeline Line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-800"></div>

              <AnimatePresence>
                {simulation?.installments.map((inst, index) => (
                  <motion.div
                    key={inst.number}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-6 py-3 group"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={cn(
                        "absolute left-[-4px] top-1/2 -translate-y-1/2 w-[19px] h-[19px] rounded-full border-4 border-slate-900 transition-colors z-10",
                        index === 0
                          ? "bg-blue-500 hover:bg-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                          : "bg-slate-700 group-hover:bg-slate-600",
                      )}
                    ></div>

                    <div className="bg-slate-800/30 rounded-xl p-3 border border-transparent hover:border-slate-700 hover:bg-slate-800 transition-all cursor-default flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-0.5">
                          Parcela {inst.number}
                        </p>
                        <div className="flex items-center text-xs font-bold text-white">
                          <Calendar className="w-3 h-3 mr-1.5 text-slate-500" />
                          {formatDate(inst.dueDate.toISOString())}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-100/90">
                          {formatCurrency(inst.amount)}
                        </p>
                        {/* Highlight if amount differs (last installment adjustment) */}
                        {inst.amount !== installmentAmount && (
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wide block">
                            Ajuste Final
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!simulation && (
                <div className="py-12 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                    <Calculator className="h-5 w-5 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">Aguardando dados...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Block 3: Info & Warnings */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-300">
                Simulação Estimada
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Os valores apresentados são uma estimativa baseada na taxa de
                juros {interestRate}% (
                {interestRate && interestRate > 10 ? "Alta" : "Padrão"}). Multas
                por atraso e juros de mora serão calculados conforme configurado
                nas definições globais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
