"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Eye, Wallet, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountColumn } from "./columns";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertModal } from "@/components/modals/alert-modal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAccountAction } from "@/app/actions/account-actions";
import { motion } from "framer-motion";
import { AutoScalingAmount } from "@/components/ui/auto-scaling-amount";
import { getColorConfig } from "@/lib/colors-config";

interface WalletCardProps {
  data: AccountColumn;
  userRole: string;
  totalBalance: number;
}

export const WalletCard: React.FC<WalletCardProps> = ({ data, userRole, totalBalance }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    try {
      setLoading(true);
      const result = await deleteAccountAction(data.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Carteira removida com sucesso.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover carteira.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const balanceNum = Number(data.balance);
  const participation = totalBalance > 0 ? (balanceNum / totalBalance) * 100 : 0;
  
  // Intelligent provider detection
  const rawProvider = (data as any).bank_provider?.toLowerCase() || "outro";
  const nameLower = data.name.toLowerCase();
  let provider = rawProvider;
  
  if (provider === "outro") {
    if (nameLower.includes("mpesa")) provider = "mpesa";
    else if (nameLower.includes("emola")) provider = "emola";
    else if (nameLower.includes("mkesh")) provider = "mkesh";
    else if (nameLower.includes("bci")) provider = "bci";
    else if (nameLower.includes("bim") || nameLower.includes("bcp")) provider = "bim";
    else if (nameLower.includes("moza")) provider = "moza";
    else if (nameLower.includes("standard")) provider = "standard";
    else if (nameLower.includes("caixa") || nameLower.includes("cash") || nameLower.includes("tesouraria")) provider = "cash";
  }

  const isMobileMoney = ["mpesa", "emola", "mkesh", "conta_movel"].includes(provider);
  const isCash = provider === "cash" || provider === "outro";
  const colors = getColorConfig(provider);

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onConfirm} loading={loading} />
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className={cn(
            "flex flex-col justify-between overflow-hidden border-2 rounded-[2.5rem] transition-all duration-500 group bg-white shadow-xl relative bg-gradient-to-br ring-4",
            colors.borderThick,
            colors.ring,
            colors.shadow,
            colors.bg,
            data.is_default && "ring-blue-500/10 border-blue-500/50 shadow-blue-500/10"
        )}>
          {/* Top Info Bar */}
          <div className="px-6 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={cn(
                    "w-2.5 h-2.5 rounded-full ring-4 ring-offset-2",
                    balanceNum > 0 ? "bg-emerald-500 ring-emerald-50" : "bg-rose-500 ring-rose-50"
                )} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {balanceNum > 0 ? "Disponível" : "Sem Saldo"}
                </span>
            </div>
            {data.is_default && (
                <Badge className="bg-blue-600 text-white border-none font-black text-[9px] px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">
                    <Zap className="w-2.5 h-2.5 mr-1 fill-white" /> Principal
                </Badge>
            )}
          </div>

          <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-4 px-6">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm transition-transform group-hover:scale-110",
                colors.badge,
                data.is_default ? "bg-white" : ""
            )}>
              {provider !== "outro" && provider !== "cash" ? (
                <img
                  src={`/logos/providers/${provider}.png`}
                  alt={provider}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className={cn(provider !== "outro" && provider !== "cash" ? "hidden" : "block")}>
                <Wallet className="w-6 h-6 opacity-40 text-slate-900" />
              </div>
            </div>
            
            <div className="flex flex-col min-w-0">
              <h3 className="text-xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {data.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-[10px] font-black uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-lg border", colors.text, colors.border)}>
                    {provider}
                </span>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className={cn("text-[11px] font-black px-2 py-0.5 rounded-lg border bg-white/50", colors.text, colors.border)}>
                    {participation.toFixed(1)}% da carteira
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo em Meticais</p>
                <AutoScalingAmount 
                  amount={balanceNum} 
                  baseSize="5xl"
                  className="text-slate-900"
                />
            </div>
            
            {/* Liquidness Bar */}
            <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Tipo de Liquidez</span>
                    <span className={cn(
                        "px-2 rounded bg-slate-50",
                        isMobileMoney ? "text-rose-600" : isCash ? "text-slate-600" : "text-blue-600"
                    )}>
                        {isMobileMoney ? "Móvel" : isCash ? "Papel Moeda" : "Bancária"}
                    </span>
                </div>
                <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(participation * 5, 100)}%` }}
                        className={cn(
                            "h-full rounded-full transition-all",
                            isMobileMoney ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : isCash ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                        )}
                    />
                </div>
            </div>
          </CardContent>

          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-100 font-black text-[10px] uppercase h-11 tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                onClick={() => router.push(`/finance/accounts/${data.id}?action=transfer`)}
              >
                Transferir
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl bg-blue-50 border-none text-blue-600 font-black text-[10px] uppercase h-11 tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                onClick={() => router.push(`/finance/accounts/${data.id}?action=deposit`)}
              >
                Adicionar
              </Button>
            </div>
            
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-2"
                    onClick={() => router.push(`/finance/accounts/${data.id}`)}
                >
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    Gerenciar
                </Button>

                {userRole !== "operador" && (
                    <div className="flex items-center gap-1">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-blue-600 rounded-xl"
                            onClick={() => router.push(`/finance/accounts/${data.id}/edit`)}
                        >
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-rose-600 rounded-xl"
                            onClick={() => setOpen(true)}
                        >
                            <Trash className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  );
};
