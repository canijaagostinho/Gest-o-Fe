"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { transferAction } from "@/app/actions/transaction-actions";
import { getAccountsAction } from "@/app/actions/account-actions";
import { ArrowRightLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  targetAccountId: z.string().min(1, "Selecione a conta de destino"),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "O valor deve ser superior a zero")
  ),
  description: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
});

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceAccountId: string;
  sourceAccountName: string;
  sourceBalance: number;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  sourceAccountId,
  sourceAccountName,
  sourceBalance,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      targetAccountId: "",
      amount: 0,
      description: "Transferência entre carteiras",
    },
  });

  useEffect(() => {
    async function fetchAccounts() {
      const result = await getAccountsAction();
      if (result.success) {
        // Filter out source account
        setAccounts(result.data.filter((acc: any) => acc.id !== sourceAccountId));
      }
    }
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, sourceAccountId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.amount > sourceBalance) {
      toast.error("Saldo insuficiente na conta de origem.");
      return;
    }

    try {
      setLoading(true);
      const result = await transferAction(
        sourceAccountId,
        values.targetAccountId,
        values.amount,
        values.description
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Transferência realizada com sucesso!");
      form.reset();
      router.refresh();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar transferência.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">Transferir Valor</DialogTitle>
          </div>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Mover fundos da conta <span className="text-slate-900 font-bold">"{sourceAccountName}"</span> para outra carteira.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="targetAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-widest text-slate-400">Carteira de Destino</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white h-12">
                        <SelectValue placeholder="Selecione a conta destino" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-slate-200">
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} className="font-medium">
                          {acc.name} (Saldo: {acc.balance.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-widest text-slate-400">Valor a Transferir (MZN)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="0.00"
                      className="text-2xl font-black py-6 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-widest text-slate-400">Descrição / Motivo</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Ex: Reposição de caixa, Transferência interna..."
                      className="rounded-xl border-slate-100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                disabled={loading}
                variant="ghost"
                type="button"
                onClick={onClose}
                className="rounded-xl font-bold"
              >
                Cancelar
              </Button>
              <Button
                disabled={loading}
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-200"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Transferência
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
