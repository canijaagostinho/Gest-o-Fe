"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  Wallet, 
  Zap, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountColumn } from "./columns"; // Import type from columns
import { formatCurrency } from "@/lib/utils";
import { AlertModal } from "@/components/modals/alert-modal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAccountAction } from "@/app/actions/account-actions";

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

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Carteira removida com sucesso.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover carteira.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const participation = totalBalance > 0 ? (Number(data.balance) / totalBalance) * 100 : 0;
  const isHighLiquidity = ["mpesa", "emola", "mkesh", "conta_movel", "cash"].includes((data as any).bank_provider?.toLowerCase());

  // Simple Sparkline generator (Visual representation)
  const generatePath = () => {
    // Generate semi-random deterministic points based on ID for visual variety
    const seed = data.id.charCodeAt(0) + data.id.charCodeAt(1);
    const points = [
        30 + (seed % 20), 
        25 + (seed % 15), 
        35 + (seed % 25), 
        20 + (seed % 10), 
        45 + (seed % 30), 
        38 + (seed % 20), 
        42 + (seed % 25)
    ];
    const width = 100;
    const height = 40;
    const step = width / (points.length - 1);
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - p}`).join(' ');
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <Card className="flex flex-col justify-between overflow-hidden border border-slate-200 rounded-[2rem] hover:shadow-xl transition-all duration-500 group bg-white shadow-sm relative">
        {/* Animated Background Pulse for High Liquidity */}
        {isHighLiquidity && (
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-all duration-700 pointer-events-none" />
        )}

        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-6 px-6">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 shadow-sm transition-transform group-hover:scale-110">
              {(data as any).bank_provider &&
              (data as any).bank_provider !== "outro" ? (
                <img
                  src={`/logos/providers/${(data as any).bank_provider}.png`}
                  alt={(data as any).bank_provider}
                  className="w-full h-full object-contain p-1.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={
                  (data as any).bank_provider &&
                  (data as any).bank_provider !== "outro"
                    ? "hidden"
                    : "block"
                }
              >
                <Wallet className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="tracking-tight">{data.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {(data as any).bank_provider || "Carteira"}
                </span>
                <span className="text-[9px] text-slate-300">•</span>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1 rounded">
                    {participation.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardTitle>
          <div className="flex flex-col items-end gap-2">
            {data.is_default ? (
                <Badge className="bg-slate-900 border-none hover:bg-slate-800 font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-widest shadow-lg shadow-amber-900/10 flex items-center gap-1.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> 
                    <span className="text-amber-400">Principal</span>
                </Badge>
            ) : (
                <Badge className="bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 font-bold px-3 rounded-full text-[9px] uppercase tracking-wider">Secundária</Badge>
            )}
            
            <div className="flex items-center gap-1">
                {isHighLiquidity ? (
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-emerald-100 text-emerald-600 bg-emerald-50/50 px-1.5 py-0">Alta Liquidez</Badge>
                ) : (
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-slate-100 text-slate-400 px-1.5 py-0">Banco</Badge>
                )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-2">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Saldo em Conta
                </span>
                <span
                className="text-3xl font-black tracking-tighter text-slate-900 truncate"
                title={formatCurrency(Number(data.balance))}
                >
                {formatCurrency(Number(data.balance))}
                </span>
            </div>
            
            {/* Sparkline Visualization */}
            <div className="h-10 w-24 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 100 40" className="w-full h-full">
                    <path
                        d={generatePath()}
                        fill="none"
                        stroke={Number(data.balance) > 0 ? "#10b981" : "#ef4444"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
          </div>
        </CardContent>

        <div className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 font-bold text-xs h-10 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                onClick={(e) => {
                  router.push(`/finance/accounts/${data.id}?action=transfer`);
                }}
              >
                Transferir
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 font-bold text-xs h-10 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                onClick={(e) => {
                  router.push(`/finance/accounts/${data.id}?action=deposit`);
                }}
              >
                Adicionar
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                    onClick={() => router.push(`/finance/accounts/${data.id}`)}
                >
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    Ver Detalhes
                </Button>

                {userRole !== "operador" && (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                        <DropdownMenuItem
                        onClick={() => router.push(`/finance/accounts/${data.id}/edit`)}
                        className="font-bold text-xs"
                        >
                        <Edit className="mr-2 h-3.5 w-3.5" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        onClick={() => setOpen(true)}
                        className="text-red-600 focus:text-red-600 font-bold text-xs"
                        >
                        <Trash className="mr-2 h-3.5 w-3.5" /> Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
      </Card>
    </>
  );
};
