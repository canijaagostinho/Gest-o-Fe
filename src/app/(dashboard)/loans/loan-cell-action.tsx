"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Ban, Clipboard, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cancelLoanAction } from "@/app/actions/loan-actions";
import { CollateralReceiptButton } from "@/components/loans/collateral-receipt-button";
import { Loan } from "./columns";
import LinkNext from "next/link";

interface LoanCellActionProps {
  data: Loan;
  userRole?: string;
}

export function LoanCellAction({ data, userRole }: LoanCellActionProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onCancel = async () => {
    try {
      setLoading(true);
      const result = await cancelLoanAction(data.id);

      if (result.success) {
        toast.success("Empréstimo cancelado com sucesso.");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao cancelar empréstimo.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-2xl bg-white border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900">
              Cancelar Empréstimo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Esta ação cancelará todas as parcelas pendentes do contrato
              <span className="font-bold border-b border-slate-200 px-1 mx-1">
                {data.id.substring(0, 8)}
              </span>
              . Apenas parcelas não pagas serão canceladas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancel}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-rose-200 border-none"
            >
              {loading ? "Processando..." : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rounded-2xl border-none shadow-2xl p-2 bg-white w-56 z-50"
        >
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
            Opções do Empréstimo
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(data.id)}
            className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50 group"
          >
            <Clipboard className="mr-2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
            Copiar ID
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-50 my-1" />

          <DropdownMenuItem asChild>
            <LinkNext
              href={`/loans/${data.id}`}
              className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50 group"
            >
              <Eye className="mr-2 h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />{" "}
              Ver Cronograma
            </LinkNext>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <LinkNext
              href="/payments/new"
              className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50 group"
            >
              <CreditCard className="mr-2 h-4 w-4 text-emerald-500 group-hover:rotate-12 transition-transform" />{" "}
              Registar Pagamento
            </LinkNext>
          </DropdownMenuItem>

          {data.loan_collateral && data.loan_collateral.length > 0 && (
            <CollateralReceiptButton loan={data} />
          )}

          {userRole !== "operador" && (
            <>
              <DropdownMenuSeparator className="bg-slate-50 my-1" />
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                disabled={
                  data.status === "completed" || data.status === "cancelled"
                }
                className="rounded-xl flex items-center font-bold text-rose-600 cursor-pointer hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600 disabled:opacity-50"
              >
                <Ban className="mr-2 h-4 w-4" /> Cancelar Empréstimo
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
