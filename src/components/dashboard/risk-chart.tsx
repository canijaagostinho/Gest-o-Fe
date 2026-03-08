"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { createClient } from "@/utils/supabase/client";

interface RiskData {
  name: string;
  value: number;
  color: string;
}

export function RiskChart() {
  const [data, setData] = useState<RiskData[]>([
    { name: "Até 30 Dias", value: 0, color: "#F59E0B" },
    { name: "31-60 Dias", value: 0, color: "#F97316" },
    { name: "+90 Dias (Crítico)", value: 0, color: "#EF4444" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRiskData() {
      const supabase = createClient();

      // Get current user and their institution
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

      // Fetch all installments with their loan info
      let query = supabase
        .from("installments")
        .select("*")
        .eq("status", "pending");

      // Filter by institution if not admin_geral
      if (!isAdminGeral && userData?.institution_id) {
        query = query.eq("institution_id", userData.institution_id);
      }

      const { data: installments } = await query;

      if (!installments) {
        setLoading(false);
        return;
      }

      // Calculate days overdue for each installment
      const now = new Date();
      const riskCounts = {
        low: 0, // 0-30 days
        medium: 0, // 31-60 days
        high: 0, // 90+ days
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
        { name: "Até 30 Dias", value: riskCounts.low, color: "#F59E0B" },
        { name: "31-60 Dias", value: riskCounts.medium, color: "#F97316" },
        {
          name: "+90 Dias (Crítico)",
          value: riskCounts.high,
          color: "#EF4444",
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
        <p className="text-sm text-slate-400 font-medium">
          Nenhum empréstimo em atraso
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
