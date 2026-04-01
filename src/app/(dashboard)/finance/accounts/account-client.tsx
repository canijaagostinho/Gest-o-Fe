"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus, Wallet, TrendingUp, Landmark, Smartphone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { AccountSheet } from "./account-sheet";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletCard } from "./wallet-card";
import { motion } from "framer-motion";
import { AutoScalingAmount } from "@/components/ui/auto-scaling-amount";

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
  const activeWallets = data.filter(a => Number(a.balance) > 0).length;
  const totalBalance = data.reduce((acc, curr) => acc + Number(curr.balance), 0);
  
  // Categorization
  const categories = {
    mobile: data.filter(a => ["mpesa", "emola", "mkesh", "conta_movel"].includes(a.bank_provider?.toLowerCase())),
    banks: data.filter(a => !["mpesa", "emola", "mkesh", "conta_movel", "cash"].includes(a.bank_provider?.toLowerCase()) && a.bank_provider !== "outro"),
    cash: data.filter(a => a.bank_provider?.toLowerCase() === "cash" || a.bank_provider === "outro"),
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Canais</h2>
          {!["operador", "agente", "cliente"].includes(userRole) && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Fluxo de Caixa & Disponibilidade</p>
          )}
        </div>
        {userRole !== "operador" && (
          <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-12 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 px-8">
            <Plus className="mr-2 h-5 w-5" /> Nova Carteira
          </Button>
        )}
      </div>

      {/* KPI Panel - Professional Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border-none rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group md:col-span-2">
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-blue-400/20 transition-all duration-700" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -ml-20 -mb-20 group-hover:bg-indigo-500/10 transition-all duration-700" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl ring-1 ring-blue-500/30">
                        <Wallet className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Liquidez Consolidada</span>
                </div>
                <div className="space-y-1">
                    <AutoScalingAmount 
                        amount={totalBalance} 
                        baseSize="7xl" 
                        className="text-white"
                    />
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Disponibilidade em {activeWallets} de {totalWallets} canais ativos
                    </p>
                </div>
              </div>
              
              <div className="flex gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Carteiras</p>
                    <p className="text-xl font-black text-white">{totalWallets}</p>
                 </div>
                 <div className="w-px h-10 bg-white/10 mx-2" />
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ativas</p>
                    <p className="text-xl font-black text-emerald-400">{activeWallets}</p>
                 </div>
              </div>
           </div>
        </Card>

        <Card className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-center gap-4 relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />
            <div className="relative z-10 space-y-2">
                <div className="p-3 bg-emerald-50 w-fit rounded-2xl text-emerald-600">
                    <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moeda de Liquidação</p>
                    <div className="flex items-center gap-2 mt-1">
                      <h4 className="text-4xl font-black text-slate-900 tracking-tighter">MZN</h4>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">Oficial</Badge>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Meticais de Moçambique</p>
                </div>
            </div>
        </Card>
      </div>

      {/* Categorized Sections */}
      <div className="space-y-12">
        {/* Mobile Money Section */}
        {categories.mobile.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="w-2 h-8 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
              <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Carteiras Móveis</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">M-Pesa, e-Mola, mKesh</p>
              </div>
              <Badge className="ml-auto bg-rose-50 text-rose-600 border-rose-100 font-black text-[10px] px-4 py-1.5 rounded-2xl shadow-sm italic transition-all hover:scale-105 uppercase tracking-widest">{categories.mobile.length} canais ativos</Badge>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.mobile.map((account) => (
                <WalletCard key={account.id} data={account} userRole={userRole} totalBalance={totalBalance} />
              ))}
            </div>
          </section>
        )}

        {/* Bank Accounts Section */}
        {categories.banks.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Canais Bancários</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Instituições Financeiras & Internet Banking</p>
               </div>
              <Badge className="ml-auto bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px] px-4 py-1.5 rounded-2xl shadow-sm italic transition-all hover:scale-105 uppercase tracking-widest">{categories.banks.length} bancos</Badge>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.banks.map((account) => (
                <WalletCard key={account.id} data={account} userRole={userRole} totalBalance={totalBalance} />
              ))}
            </div>
          </section>
        )}

        {/* Cash/Other Section */}
        {(categories.cash.length > 0 || userRole !== "operador") && (
          <section className="space-y-6 text-slate-900">
            <div className="flex items-center gap-4 px-2">
              <div className="w-2 h-8 bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Caixa Físico & Outros</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Tesouraria & Disponibilidade Imediata</p>
               </div>
              <Badge className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] px-4 py-1.5 rounded-2xl shadow-sm italic transition-all hover:scale-105 uppercase tracking-widest">{categories.cash.length} caixas</Badge>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.cash.map((account) => (
                <WalletCard key={account.id} data={account} userRole={userRole} totalBalance={totalBalance} />
              ))}
              
              {/* New Wallet Invitation */}
              {userRole !== "operador" && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOpen(true)}
                  className="group relative flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer min-h-[200px]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <Plus className="h-8 w-8 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-slate-900 tracking-tight">Novo Canal</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Acrescentar ativos</p>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        )}
      </div>

      <AccountSheet isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};
