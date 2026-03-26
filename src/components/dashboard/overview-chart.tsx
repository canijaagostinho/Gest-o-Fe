"use client";

import { cn } from "@/lib/utils";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface OverviewChartProps {
  data: {
    name: string;
    emprestado: number;
    recebido: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-2xl min-w-[200px] ring-1 ring-black/5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 opacity-70 text-center">
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
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: `0 0 10px ${item.color}80` 
                  }}
                />
                <span className="text-[11px] font-bold text-slate-700">
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] font-black text-slate-900 tracking-tight">
                MT {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <filter id="dashboardGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="colorEmprestado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
          stroke="#94a3b8"
          fontSize={10}
          fontWeight={800}
          tickLine={false}
          axisLine={false}
          dy={15}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={10}
          fontWeight={800}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `MT ${value / 1000}k`}
          dx={-10}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#e2e8f0", strokeWidth: 2, strokeDasharray: '5 5' }}
        />
        <Area
          type="monotone"
          dataKey="emprestado"
          stroke="#3b82f6"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorEmprestado)"
          name="Emprestado"
          animationDuration={2000}
          style={{ filter: "url(#dashboardGlow)" }}
          activeDot={{ r: 8, strokeWidth: 0, fill: "#3b82f6" }}
        />
        <Area
          type="monotone"
          dataKey="recebido"
          stroke="#10b981"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorRecebido)"
          name="Recebido"
          animationDuration={2000}
          style={{ filter: "url(#dashboardGlow)" }}
          activeDot={{ r: 8, strokeWidth: 0, fill: "#10b981" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
