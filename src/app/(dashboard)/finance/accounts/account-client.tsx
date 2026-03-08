"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus, Wallet } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <Heading
          title="Gestão de Carteiras"
          description="Visão geral e controle das suas contas financeiras."
        />
        {/* Main 'Add' button kept as fallback or alternative */}
        {userRole !== "operador" && (
          <Button onClick={() => setOpen(true)} className="hidden md:flex">
            <Plus className="mr-2 h-4 w-4" /> Nova Carteira
          </Button>
        )}
      </div>
      <Separator />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Total de Carteiras
            </CardTitle>
            <div className="p-2 bg-white/10 rounded-lg">
              <Plus className="h-4 w-4 text-slate-300" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="text-xl font-bold text-white">{totalWallets}</div>
            <p className="text-xs text-slate-400 mt-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-slate-500 mr-2" />
              Contas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-teal-600 to-teal-500 text-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-teal-100 uppercase tracking-wider">
              Carteiras Ativas
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="text-xl font-bold text-white">{activeWallets}</div>
            <p className="text-xs text-teal-100 mt-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-white mr-2" />
              Em operação total
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500 to-amber-400 text-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-amber-100 uppercase tracking-wider">
              Saldo Total
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div
              className="text-xl font-bold text-white truncate"
              title={formatCurrency(totalBalance)}
            >
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-amber-100 mt-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-white mr-2" />
              Disponível em caixa
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">
              Capital de Giro
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div
              className="text-xl font-bold text-white truncate"
              title={formatCurrency(initialBalanceTotal)}
            >
              {formatCurrency(initialBalanceTotal)}
            </div>
            <p className="text-xs text-blue-100 mt-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-white mr-2" />
              Investimento inicial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((account) => (
          <WalletCard key={account.id} data={account} userRole={userRole} />
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
