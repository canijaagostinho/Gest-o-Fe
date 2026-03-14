"use server";

import { createClient } from "@/utils/supabase/server";
import {
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  format,
  subMonths,
} from "date-fns";

export async function getFinancialMetricsAction(
  startDate?: Date,
  endDate?: Date,
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: userData } = await supabase
      .from("users")
      .select("institution_id, role:roles(name)")
      .eq("id", user.id)
      .single();

    const institutionId = userData?.institution_id;
    const isAdminGeral = (userData?.role as any)?.name === "admin_geral";

    // Default to last 6 months if no range provided
    const finalEndDate = endDate || new Date();
    const finalStartDate = startDate || subMonths(finalEndDate, 5);

    // 1. Fetch all payments (Revenue)
    let paymentsQuery = supabase
      .from("payments")
      .select("amount_paid, payment_date, status")
      .eq("status", "paid");

    if (!isAdminGeral && institutionId) {
      paymentsQuery = paymentsQuery.eq("institution_id", institutionId);
    }

    if (startDate)
      paymentsQuery = paymentsQuery.gte(
        "payment_date",
        startDate.toISOString(),
      );
    if (endDate)
      paymentsQuery = paymentsQuery.lte("payment_date", endDate.toISOString());

    const { data: payments, error: paymentsError } = await paymentsQuery;
    if (paymentsError) throw paymentsError;

    // 2. Fetch all loans (Expenses/Lent)
    let loansQuery = supabase
      .from("loans")
      .select("loan_amount, created_at, status")
      .neq("status", "cancelled");

    if (!isAdminGeral && institutionId) {
      loansQuery = loansQuery.eq("institution_id", institutionId);
    }

    if (startDate)
      loansQuery = loansQuery.gte("created_at", startDate.toISOString());
    if (endDate)
      loansQuery = loansQuery.lte("created_at", endDate.toISOString());

    const { data: loans, error: loansError } = await loansQuery;
    if (loansError) throw loansError;

    // 3. Aggregate totals
    const totalReceived =
      payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
    const totalLent =
      loans?.reduce((sum, l) => sum + Number(l.loan_amount), 0) || 0;
    const netProfit = totalReceived - totalLent; // Simplified: In microcredit, profit is interest, but here we show cash flow balance

    // 4. Generate monthly chart data
    const months = eachMonthOfInterval({
      start: finalStartDate,
      end: finalEndDate,
    });
    const chartData = months.map((month) => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);
      const monthName = format(month, "MMM");

      const monthlyRevenue =
        payments
          ?.filter((p) => {
            const d = new Date(p.payment_date);
            return d >= mStart && d <= mEnd;
          })
          .reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;

      const monthlyExpenses =
        loans
          ?.filter((l) => {
            const d = new Date(l.created_at);
            return d >= mStart && d <= mEnd;
          })
          .reduce((sum, l) => sum + Number(l.loan_amount), 0) || 0;

      return {
        name: monthName,
        receita: monthlyRevenue,
        despesa: monthlyExpenses,
        lucro: monthlyRevenue - monthlyExpenses,
      };
    });

    return {
      success: true,
      data: {
        totalReceived,
        totalLent,
        netProfit,
        chartData,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
