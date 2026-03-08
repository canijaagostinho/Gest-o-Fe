"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { payInstallmentAction } from "@/app/actions/loan-actions";
import { calculateLateFee } from "@/lib/loan-utils";

interface LoanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: any;
  settings: any;
  onSuccess?: () => void;
}

export function LoanPaymentModal({
  isOpen,
  onClose,
  installment,
  settings,
  onSuccess,
}: LoanPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Dinheiro");

  // Calculate initial values
  const fineResult = installment
    ? calculateLateFee(
        installment.amount,
        new Date(installment.due_date),
        new Date(),
        Number(
          installment.loans?.late_fee_rate ?? settings?.default_fine_rate ?? 2,
        ),
        Number(
          installment.loans?.mora_rate ?? settings?.default_mora_rate ?? 1,
        ),
      )
    : { totalFine: 0 };

  const fine = fineResult.totalFine;
  const totalOriginal = installment ? installment.amount : 0;
  const suggestedTotal = totalOriginal + fine;

  useEffect(() => {
    if (isOpen && installment) {
      setAmountPaid(suggestedTotal.toString());
    }
  }, [isOpen, installment, suggestedTotal]);

  if (!installment) return null;

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const result = await payInstallmentAction(
        installment.id,
        Number(amountPaid),
        new Date(),
        paymentMethod,
      );
      if (result.success) {
        toast.success("Pagamento registrado com sucesso!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao processar pagamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Confirmar pagamento da parcela #{installment.installment_number}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Vencimento</Label>
            <div className="col-span-3 font-medium">
              {formatDate(installment.due_date)}
            </div>
          </div>

          {fine > 0 && (
            <div className="grid grid-cols-4 items-center gap-4 text-rose-600">
              <Label className="text-right">Multa (Atraso)</Label>
              <div className="col-span-3 font-medium">
                + {formatCurrency(fine)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total Devido</Label>
            <div className="col-span-3 font-bold">
              {formatCurrency(suggestedTotal)}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Valor Pago
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="method" className="text-right">
              Método
            </Label>
            <div className="col-span-3">
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                  <SelectItem value="e-Mola">e-Mola</SelectItem>
                  <SelectItem value="mKesh">mKesh</SelectItem>
                  <SelectItem value="Transferência Bancária">
                    Transferência Bancária
                  </SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
