"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { ShieldCheck, Banknote } from "lucide-react";

interface PriorityItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: "overdue" | "upcoming";
}

interface PriorityListsProps {
  overdueItems: PriorityItem[];
  upcomingItems: PriorityItem[];
}

export function PriorityLists({ overdueItems, upcomingItems }: PriorityListsProps) {
  const hasOverdue = overdueItems.length > 0;
  const hasUpcoming = upcomingItems.length > 0;

  return (
    <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Overdue Section */}
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-rose-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Em Atraso
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ações de cobrança imediatas</p>
            </div>
            {hasOverdue && (
              <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] py-1 px-3">
                {overdueItems.length} PRIORIDADES
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {hasOverdue ? (
              overdueItems.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-rose-100 hover:bg-rose-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xs">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{item.name}</p>
                      <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-tighter">Há {item.date} dias</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{formatCurrency(item.amount)}</p>
                    <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline mt-1">Cobrar</button>
                  </div>
                </div>
              ))
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <ShieldCheck className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900">Tudo em dia 🎉</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                            Nenhum cliente com pagamento em atraso no momento.
                        </p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Próximos 7 Dias
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previsão de recebíveis</p>
            </div>
            {hasUpcoming && (
              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] py-1 px-3">
                {upcomingItems.length} AGENDADOS
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {hasUpcoming ? (
              upcomingItems.map((item) => {
                const date = new Date(item.date);
                const day = date.getDate();
                const month = date.toLocaleDateString('pt-MZ', { month: 'short' }).replace('.', '');
                
                return (
                  <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                        <span className="text-xs font-black text-slate-900 leading-none">{day}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{month}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Parcela Pendente</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(item.amount)}</p>
                      <button className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline mt-1">Baixar</button>
                    </div>
                  </div>
                );
              })
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                        <Banknote className="h-8 w-8 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-slate-500">Nenhum agendamento</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                            Sem pagamentos previstos para o período selecionado.
                        </p>
                    </div>
                </div>
            )}
          </div>
        </div>

      </div>
    </Card>
  );
}
