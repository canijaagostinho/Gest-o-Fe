"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { depositAction } from "@/app/actions/transaction-actions";
import { Wallet, Loader2 } from "lucide-react";

const formSchema = z.object({
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "O valor deve ser superior a zero")
  ),
  description: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
});

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountName: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  accountId,
  accountName,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: 0,
      description: "Depósito em conta",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const result = await depositAction(accountId, values.amount, values.description);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Depósito realizado com sucesso!");
      form.reset();
      router.refresh(); // Refresh detail page
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar depósito.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">Adicionar Valor</DialogTitle>
          </div>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Aumentar o saldo da conta <span className="text-slate-900 font-bold">"{accountName}"</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-widest text-slate-400">Valor do Depósito (MZN)</FormLabel>
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
                      placeholder="Ex: Ajuste de saldo, Entrada externa..."
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
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Depósito
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
