"use client";

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

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorEmprestado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E2E8F0"
        />
        <XAxis
          dataKey="name"
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `MT ${value}`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="emprestado"
          stroke="#2563EB"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorEmprestado)"
          name="Emprestado"
        />
        <Area
          type="monotone"
          dataKey="recebido"
          stroke="#10B981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRecebido)"
          name="Recebido"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
