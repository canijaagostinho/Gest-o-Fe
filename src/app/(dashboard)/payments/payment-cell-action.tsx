"use client";

import { useState } from "react";
import { MoreHorizontal, FileText, Ban, Clipboard } from "lucide-react";
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
import { voidPaymentAction } from "@/app/actions/payment-actions";
import { Payment } from "./columns";

interface PaymentCellActionProps {
  data: Payment;
  userRole?: string;
}

export function PaymentCellAction({ data, userRole }: PaymentCellActionProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onVoid = async () => {
    try {
      setLoading(true);
      const result = await voidPaymentAction(data.id);

      if (result.success) {
        toast.success("Pagamento anulado com sucesso.");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao anular pagamento.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleDownloadReceipt = async () => {
    const { createClient } = await import("@/utils/supabase/client");
    const { PDFService } = await import("@/services/pdf-service");

    toast.promise(
      async () => {
        const supabase = createClient();

        // 1. Fetch Payment
        const { data: fullPayment, error: paymentError } = await supabase
          .from("payments")
          .select("*")
          .eq("id", data.id)
          .single();

        if (paymentError || !fullPayment)
          throw new Error(paymentError?.message || "Pagamento não encontrado.");

        // 2. Fetch Loan + Client + Institution
        const { data: loanData, error: loanError } = await supabase
          .from("loans")
          .select(
            `
                    *,
                    institution:institutions (*),
                    client:clients (*)
                `,
          )
          .eq("id", fullPayment.loan_id)
          .single();

        if (loanError || !loanData)
          throw new Error(
            loanError?.message || "Empréstimo vinculado não encontrado.",
          );

        const institution = loanData.institution;
        const client = loanData.client;

        if (!institution)
          throw new Error("Instituição não encontrada para este empréstimo.");
        if (!client)
          throw new Error("Cliente não encontrado para este empréstimo.");

        const pdf = new PDFService({
          name: institution.name,
          address: institution.address,
          nuit: institution.nuit,
          email: institution.email,
          phone: institution.phone,
          logo_url: institution.logo_url,
          primary_color: institution.primary_color,
        });

        await pdf.generatePaymentReceipt(
          {
            id: fullPayment.id,
            amount: Number(fullPayment.amount_paid),
            date: new Date(fullPayment.payment_date),
            method: fullPayment.payment_method || "Dinheiro",
            reference: fullPayment.notes,
          },
          {
            full_name: client.full_name,
            document_id: client.id_number,
            phone: client.phone,
            email: client.email,
            address: client.address,
          },
        );
      },
      {
        loading: "Gerando recibo...",
        success: "Recibo baixado!",
        error: (err) => `Erro: ${err.message}`,
      },
    );
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-2xl bg-white border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900">
              Anular Pagamento?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-base">
              Esta ação marcará o pagamento de{" "}
              <span className="font-bold text-slate-900">
                {new Intl.NumberFormat("pt-MZ", {
                  style: "currency",
                  currency: "MZN",
                }).format(data.amount_paid)}
              </span>{" "}
              como anulado. Isso não exclui o registo, mas invalida a transação
              financeiramente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onVoid}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-rose-200 border-none"
            >
              {loading ? "Processando..." : "Confirmar Anulação"}
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
            Opções de Pagamento
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(data.id)}
            className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50 group"
          >
            <Clipboard className="mr-2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
            Copiar ID
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-50 my-1" />

          <DropdownMenuItem
            onClick={handleDownloadReceipt}
            className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50 group"
          >
            <FileText className="mr-2 h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />{" "}
            Ver Recibo
          </DropdownMenuItem>

          {userRole !== "operador" && (
            <>
              <DropdownMenuSeparator className="bg-slate-50 my-1" />
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                disabled={data.status === "voided"}
                className="rounded-xl flex items-center font-bold text-rose-600 cursor-pointer hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600 disabled:opacity-50"
              >
                <Ban className="mr-2 h-4 w-4" /> Anular Transação
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
