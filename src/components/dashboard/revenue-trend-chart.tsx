"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const data: any[] = [];

export function RevenueTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748B", fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748B", fontSize: 12 }}
          tickFormatter={(val) => `MT ${val / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          formatter={(value: any) => formatCurrency(value)}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" />
        <Bar
          dataKey="receita"
          name="Receita Real"
          barSize={20}
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
        <Line
          type="monotone"
          dataKey="meta"
          name="Meta Projetada"
          stroke="#f59e0b"
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
