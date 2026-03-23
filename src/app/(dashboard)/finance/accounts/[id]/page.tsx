import { Suspense } from "react";
import { ChevronLeft, Wallet, History, ArrowDownLeft } from "lucide-react";
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
import { createClient } from "@/utils/supabase/server";
import { AutoScalingAmount } from "@/components/ui/auto-scaling-amount";
import { getColorConfig } from "@/lib/colors-config";
import { AccountDetailContent } from "./detail-content";

// Remove custom BalanceDisplay as we'll use AutoScalingAmount

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch data on the server
  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!account) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Conta não encontrada.
      </div>
    );
  }

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
        {/* Account Balance Card with Premium Colors */}
        {(() => {
          const provider = (account as any).bank_provider?.toLowerCase() || "outro";
          const colors = getColorConfig(provider);
          
          return (
            <Card className={cn(
              "md:col-span-1 border-none shadow-2xl relative overflow-hidden group min-h-[200px] flex flex-col justify-center rounded-[2.5rem] transition-all duration-500 bg-gradient-to-br",
              colors.gradient
            )}>
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700 z-10" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-white/5 rounded-full blur-[80px] z-10" />

              <CardHeader className="relative z-20 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-80">
                  Saldo Disponível
                </CardTitle>
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
              </CardHeader>

              <CardContent className="relative z-20 pt-8 pb-6 mt-auto">
                <div className="flex flex-col space-y-4">
                  <AutoScalingAmount 
                    amount={account.balance} 
                    baseSize="5xl" 
                    className="text-white"
                  />
                  <div className="flex items-center space-x-2 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]" />
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">
                      Monitoramento Ativo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

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
            {transactions && transactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-full ${t.type === 'credit' ? 'bg-emerald-50' : 'bg-red-50'} flex items-center justify-center`}>
                        {t.type === 'credit' ? (
                            <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                        ) : (
                            <ArrowDownLeft className="h-5 w-5 text-red-600 rotate-180" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {t.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(t.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
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

      {/* Client component for the Modals and SearchParams handling */}
      <Suspense fallback={null}>
        <AccountDetailContent 
          id={id} 
          accountName={account.name} 
          accountBalance={account.balance} 
        />
      </Suspense>
    </div>
  );
}
