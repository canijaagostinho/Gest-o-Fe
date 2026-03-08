"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface RiskIndicatorData {
  healthy: { amount: number; count: number; percentage: number };
  warning: { amount: number; count: number; percentage: number };
  critical: { amount: number; count: number; percentage: number };
  total: { amount: number; count: number };
}

export function RiskIndicators() {
  const [data, setData] = useState<RiskIndicatorData>({
    healthy: { amount: 0, count: 0, percentage: 0 },
    warning: { amount: 0, count: 0, percentage: 0 },
    critical: { amount: 0, count: 0, percentage: 0 },
    total: { amount: 0, count: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRiskIndicators() {
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

      // Fetch all pending installments
      let query = supabase
        .from("installments")
        .select("*, loan:loans(institution_id, loan_amount)")
        .eq("status", "pending");

      // Filter by institution if not admin_geral
      if (!isAdminGeral && userData?.institution_id) {
        query = query.eq("loan.institution_id", userData.institution_id);
      }

      const { data: installments } = await query;

      if (!installments) {
        setLoading(false);
        return;
      }

      // Calculate risk categories
      const now = new Date();
      const riskData = {
        healthy: { amount: 0, count: 0 },
        warning: { amount: 0, count: 0 },
        critical: { amount: 0, count: 0 },
      };

      installments.forEach((inst: any) => {
        const dueDate = new Date(inst.due_date);
        const daysOverdue = Math.floor(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const amount = Number(inst.amount) || 0;

        if (daysOverdue > 0) {
          if (daysOverdue <= 30) {
            riskData.healthy.amount += amount;
            riskData.healthy.count++;
          } else if (daysOverdue <= 60) {
            riskData.warning.amount += amount;
            riskData.warning.count++;
          } else {
            riskData.critical.amount += amount;
            riskData.critical.count++;
          }
        }
      });

      const totalCount =
        riskData.healthy.count +
        riskData.warning.count +
        riskData.critical.count;
      const totalAmount =
        riskData.healthy.amount +
        riskData.warning.amount +
        riskData.critical.amount;

      setData({
        healthy: {
          ...riskData.healthy,
          percentage:
            totalCount > 0
              ? Math.round((riskData.healthy.count / totalCount) * 100)
              : 0,
        },
        warning: {
          ...riskData.warning,
          percentage:
            totalCount > 0
              ? Math.round((riskData.warning.count / totalCount) * 100)
              : 0,
        },
        critical: {
          ...riskData.critical,
          percentage:
            totalCount > 0
              ? Math.round((riskData.critical.count / totalCount) * 100)
              : 0,
        },
        total: {
          amount: totalAmount,
          count: totalCount,
        },
      });
      setLoading(false);
    }

    fetchRiskIndicators();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i: number) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-5 w-16 bg-slate-100 rounded ml-auto" />
                <div className="h-3 w-12 bg-slate-100 rounded ml-auto" />
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saudável (0-30D) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Saudável</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                0-30 Dias
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-emerald-600">
              {formatCurrency(data.healthy.amount)}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              {data.healthy.percentage}% do total
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm transition-all duration-500"
            style={{ width: `${data.healthy.percentage}%` }}
          />
        </div>
      </div>

      {/* Atenção (31-60D) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Atenção</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                31-60 Dias
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-amber-600">
              {formatCurrency(data.warning.amount)}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              {data.warning.percentage}% do total
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm transition-all duration-500"
            style={{ width: `${data.warning.percentage}%` }}
          />
        </div>
      </div>

      {/* Crítico (+90D) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Crítico</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                +90 Dias
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-rose-600">
              {formatCurrency(data.critical.amount)}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              {data.critical.percentage}% do total
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full shadow-sm transition-all duration-500"
            style={{ width: `${data.critical.percentage}%` }}
          />
        </div>
      </div>

      {/* Total Summary */}
      <div className="pt-6 mt-6 border-t border-slate-100">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Total em Atraso
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Todos os níveis
              </p>
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tighter">
            {formatCurrency(data.total.amount)}
          </p>
        </div>
      </div>
    </div>
  );
}
