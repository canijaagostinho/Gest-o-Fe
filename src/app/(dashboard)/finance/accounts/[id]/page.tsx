"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Wallet,
  History,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";

function BalanceDisplay({ amount }: { amount: number }) {
  const formatted = formatCurrency(amount); // Returns "MZN 4.988.000,00" or similar
  // Separate currency symbol from amount
  const currencyMatch = formatted.match(/^[^\d]*/);
  const currencySymbol = currencyMatch ? currencyMatch[0].trim() : "";
  const numericPart = formatted.replace(currencySymbol, "").trim();

  const parts = numericPart.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1] || "00";

  // Scaling logic for integer part
  let fontSize = "text-4xl";
  if (integerPart.length > 12) fontSize = "text-2xl";
  else if (integerPart.length > 9) fontSize = "text-3xl";

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
        {currencySymbol} - MOEDA NACIONAL
      </span>
      <div className="flex items-baseline font-black tracking-tighter">
        <span className={`${fontSize} transition-all duration-300`}>
          {integerPart}
        </span>
        <span className="text-lg opacity-60 ml-1 font-bold">
          ,{decimalPart}
        </span>
      </div>
    </div>
  );
}

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: accountData } = await supabase
          .from("accounts")
          .select("*")
          .eq("id", id)
          .single();

        // Fetch recent payments/transactions associated with this account
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("*, loans(id, clients(full_name))")
          .eq("account_id", id)
          .order("payment_date", { ascending: false });

        setAccount(accountData);
        setTransactions(paymentsData || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, supabase]);

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando detalhes da conta...
      </div>
    );
  if (!account)
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Conta não encontrada.
      </div>
    );

  return (
    <div className="flex-1 space-y-6 pt-2 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/finance/accounts">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3 text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              CARTEIRA
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {account.name}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-none shadow-2xl bg-blue-600 text-white relative overflow-hidden group min-h-[180px] flex flex-col justify-center">
          {/* Background Gradient Layer for Maximum Reliability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0052D4] via-[#4364F7] to-[#6FB1FC] z-0" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700 z-10" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-blue-400/20 rounded-full blur-[80px] z-10" />

          <CardHeader className="relative z-20 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black text-blue-50 uppercase tracking-[0.3em] opacity-80">
              Saldo da Carteira
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>

          <CardContent className="relative z-20 pt-4 pb-6 mt-auto">
            <div className="flex flex-col">
              <BalanceDisplay amount={account.balance} />
              <div className="flex items-center mt-6 space-x-2 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <p className="text-[9px] text-white font-bold uppercase tracking-wider">
                  Conta em Tempo Real
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-slate-400" />
              Histórico de Transações
            </CardTitle>
            <CardDescription>
              Últimas movimentações nesta conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Recebimento - {t.loans?.clients?.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(t.payment_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">
                        +{formatCurrency(t.amount_paid)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Wallet className="h-12 w-12 text-slate-100 mb-2" />
                Nenhuma transação encontrada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
