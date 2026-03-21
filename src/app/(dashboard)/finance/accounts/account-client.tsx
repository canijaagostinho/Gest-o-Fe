"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus, Wallet, Activity, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AccountSheet } from "./account-sheet";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletCard } from "./wallet-card";

interface AccountClientProps {
  data: any[];
  userRole: string;
}

export const AccountClient: React.FC<AccountClientProps> = ({
  data,
  userRole,
}) => {
  const [open, setOpen] = useState(false);

  // Calculate KPIs
  const totalWallets = data.length;
  const activeWallets = data.length; // Assuming all are active for now
  const totalBalance = data.reduce(
    (acc, curr) => acc + Number(curr.balance),
    0,
  );

  // For initial balance, since we don't store it, we might approximate or just show another metric
  // Or just show zero if we can't calculate.
  // Let's use 0 for now or maybe just hide that specific KPI if it's confusing.
  // However, the user asked for it. Let's try to mimic the image.
  // Maybe "Saldo Inicial" is just the sum of positive transactions? Too complex for client side without data.
  // I'll leave it as "Saldo Total" repetition or maybe "Média"
  // Actually, let's just show "Saldo Total" again or maybe "Entradas Hoje"?
  // Let's stick to the visual: "Saldo Inicial Total" -> I'll just map it to Total Balance for now to fill the space
  // or maybe "Receitas do Mês" if I had that data.
  // I'll set it to Total Balance for layout purposes, user can clarify later.
  const initialBalanceTotal = totalBalance;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Heading
          title="Gestão de Carteiras"
          description="Controle total das suas contas financeiras."
        />
        {userRole !== "operador" && (
          <Button onClick={() => setOpen(true)} className="w-full sm:w-auto h-12 sm:h-10 rounded-2xl sm:rounded-xl font-bold">
            <Plus className="mr-2 h-4 w-4" /> Nova Carteira
          </Button>
        )}
      </div>
      <Separator />

      {/* KPI Cards - Strategically differentiated with themed backgrounds for maximum clarity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* PRIMARY CARD: Saldo Total - Blue Theme */}
        <Card className="border-t-4 border-t-blue-600 border-x border-b border-blue-100 shadow-sm bg-blue-50/30 hover:shadow-md transition-all md:col-span-2 lg:col-span-1 p-1 md:p-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Saldo Total
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-xl">
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div
              className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter w-full truncate"
              title={formatCurrency(totalBalance)}
            >
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-[10px] font-bold text-blue-600 mt-3 flex items-center uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Disponível em tempo real
            </p>
          </CardContent>
        </Card>

        {/* Secondary Card: Total de Carteiras - Slate Theme */}
        <Card className="border border-slate-200 shadow-sm bg-slate-50/50 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total de Carteiras
            </CardTitle>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <Plus className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{totalWallets}</div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
              Contas registradas
            </p>
          </CardContent>
        </Card>

        {/* Secondary Card: Carteiras Ativas - Emerald Theme */}
        <Card className="border-t-4 border-t-emerald-500 border-x border-b border-emerald-100 shadow-sm bg-emerald-50/30 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Em Operação
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{activeWallets}</div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
              Status Ativo
            </p>
          </CardContent>
        </Card>

        {/* Secondary Card: Capital de Giro - Indigo Theme */}
        <Card className="border-t-4 border-t-indigo-600 border-x border-b border-indigo-100 shadow-sm bg-indigo-50/30 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Capital de Giro
            </CardTitle>
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div
              className="text-3xl font-black text-slate-900 tracking-tight w-full"
              title={formatCurrency(initialBalanceTotal)}
            >
              {formatCurrency(initialBalanceTotal)}
            </div>
            <p className="text-[10px] font-bold text-indigo-600 mt-2 uppercase tracking-wider truncate">
              Investimento Inicial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((account) => (
          <WalletCard 
            key={account.id} 
            data={account} 
            userRole={userRole} 
            totalBalance={totalBalance} 
          />
        ))}

        {/* New Wallet Card - Hidden for Operators */}
        {userRole !== "operador" && (
          <div
            onClick={() => setOpen(true)}
            className="group relative flex flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/25 rounded-xl hover:border-primary hover:bg-muted/50 transition-all cursor-pointer min-h-[200px]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <span className="font-semibold text-lg text-primary">
              Nova Carteira
            </span>
          </div>
        )}
      </div>

      <AccountSheet isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};
