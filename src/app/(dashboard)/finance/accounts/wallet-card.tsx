"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Eye, Wallet } from "lucide-react";
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
}

export const WalletCard: React.FC<WalletCardProps> = ({ data, userRole }) => {
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

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <Card className="flex flex-col justify-between overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group bg-white dark:bg-zinc-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 shadow-sm">
              {(data as any).bank_provider &&
              (data as any).bank_provider !== "outro" ? (
                <img
                  src={`/logos/providers/${(data as any).bank_provider}.png`}
                  alt={(data as any).bank_provider}
                  className="w-full h-full object-contain"
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
                <Wallet className="w-4 h-4 text-primary" />
              </div>
            </div>
            {data.name}
          </CardTitle>
          {data.is_default ? (
            <Badge
              variant="default"
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Principal
            </Badge>
          ) : (
            <Badge variant="secondary">Secundária</Badge>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Saldo Disponível
            </span>
            <span
              className="text-xl font-bold tracking-tight text-primary truncate"
              title={formatCurrency(Number(data.balance))}
            >
              {formatCurrency(Number(data.balance))}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/20 p-2 px-4 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => router.push(`/finance/accounts/${data.id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Detalhes
          </Button>
          <div className="h-4 w-[1px] bg-border" />
          {userRole !== "operador" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/finance/accounts/${data.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-20 cursor-not-allowed"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
};
