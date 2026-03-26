"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { createClient } from "@/utils/supabase/client";

interface RiskData {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-3 rounded-2xl shadow-2xl min-w-[160px] ring-1 ring-black/5">
        <div className="flex flex-col gap-1 text-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-70">
            {payload[0].name}
          </span>
          <span className="text-sm font-black text-slate-900">
            {payload[0].value} Contratos
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function RiskChart() {
  const [data, setData] = useState<RiskData[]>([
    { name: "Até 30 Dias", value: 0, color: "#fbbf24" },
    { name: "31-60 Dias", value: 0, color: "#f97316" },
    { name: "+90 Dias (Crítico)", value: 0, color: "#f43f5e" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRiskData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("institution_id, role:roles(name)")
        .eq("id", user.id)
        .single();

      const isAdminGeral = (userData?.role as any)?.name === "admin_geral";

      let query = supabase
        .from("installments")
        .select("*")
        .eq("status", "pending");

      if (!isAdminGeral && userData?.institution_id) {
        query = query.eq("institution_id", userData.institution_id);
      }

      const { data: installments } = await query;

      if (!installments) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const riskCounts = {
        low: 0,
        medium: 0,
        high: 0,
      };

      installments.forEach((inst: any) => {
        const dueDate = new Date(inst.due_date);
        const daysOverdue = Math.floor(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysOverdue > 0) {
          if (daysOverdue <= 30) {
            riskCounts.low++;
          } else if (daysOverdue <= 60) {
            riskCounts.medium++;
          } else {
            riskCounts.high++;
          }
        }
      });

      setData([
        { name: "Até 30 Dias", value: riskCounts.low, color: "#fbbf24" },
        { name: "31-60 Dias", value: riskCounts.medium, color: "#f97316" },
        {
          name: "+90 Dias (Crítico)",
          value: riskCounts.high,
          color: "#f43f5e",
        },
      ]);
      setLoading(false);
    }

    fetchRiskData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalValue = data.reduce(
    (sum: number, item: any) => sum + item.value,
    0,
  );

  if (totalValue === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-400 font-medium italic">
          Nenhum empréstimo em atraso
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={95}
          paddingAngle={8}
          dataKey="value"
          animationDuration={2000}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              strokeWidth={0}
              style={{ filter: "url(#pieGlow)" }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
