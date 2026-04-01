"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ChevronLeft,
  Banknote,
  Calendar,
  User,
  Search,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
// Import Actions
import { createPaymentAction } from "@/app/actions/payment-actions";
import { getAccountsAction } from "@/app/actions/account-actions";

const paymentSchema = z.object({
  loan_id: z.string().min(1, "Selecione um empréstimo"),
  installment_id: z.string().min(1, "Selecione uma parcela"),
  amount_paid: z.coerce.number().min(1, "Valor inválido"),
  payment_method: z.string().min(1, "Selecione o método"),
  account_id: z.string().min(1, "Selecione a conta de destino"),
  payment_date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]); // Accounts State
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const supabase = createClient();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      loan_id: "",
      installment_id: "",
      amount_paid: 0,
      payment_method: "Dinheiro",
      account_id: "",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const watchLoanId = form.watch("loan_id");
  const watchInstallmentId = form.watch("installment_id");

  const { searchParams: queryParams } = { searchParams: new URLSearchParams(typeof window !== "undefined" ? window.location.search : "") };
  const loanIdParam = queryParams.get("loanId");
  const installmentIdParam = queryParams.get("installmentId");

  // Fetch Loans and Accounts
  useEffect(() => {
    async function loadInitialData() {
      // Loans
      const { data: loansData } = await supabase
        .from("loans")
        .select("*, clients(full_name)")
        .eq("status", "active");
      if (loansData) setLoans(loansData);

      // Pre-select via URL if exists
      if (loanIdParam) {
          form.setValue("loan_id", loanIdParam);
      }

      // Accounts
      const res = await getAccountsAction();
      if (res.success && Array.isArray(res.data)) {
        setAccounts(res.data);
        // Set default if exists
        const defaultAcc = res.data.find((a: any) => a.is_default);
        if (defaultAcc) {
          form.setValue("account_id", defaultAcc.id);
        }
      }
    }
    loadInitialData();
  }, [supabase, form, loanIdParam]);

  // Set installment from param once installments list is loaded
  useEffect(() => {
      if (installmentIdParam && installments.length > 0) {
          form.setValue("installment_id", installmentIdParam);
      }
  }, [installmentIdParam, installments, form]);

  useEffect(() => {
    async function fetchInstallments() {
      if (!watchLoanId) {
        setInstallments([]);
        return;
      }
      const { data } = await supabase
        .from("installments")
        .select("*")
        .eq("loan_id", watchLoanId)
        .neq("status", "paid")
        .order("installment_number", { ascending: true });
      if (data) setInstallments(data);

      const loan = loans.find((l) => l.id === watchLoanId);
      setSelectedLoan(loan);
    }
    fetchInstallments();
  }, [watchLoanId, loans, supabase]);

  useEffect(() => {
    if (watchInstallmentId) {
      const inst = installments.find((i) => i.id === watchInstallmentId);
      setSelectedInstallment(inst);
      if (inst) {
        const remaining = inst.amount - (inst.amount_paid || 0);
        form.setValue("amount_paid", remaining);
      }
    } else {
      setSelectedInstallment(null);
    }
  }, [watchInstallmentId, installments, form]);

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: userData } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();
      const institutionId =
        userData?.institution_id || selectedLoan.institution_id;

      if (!institutionId) throw new Error("Instituição não encontrada");

      const result = await createPaymentAction({
        loan_id: values.loan_id,
        client_id: selectedLoan.client_id,
        amount: values.amount_paid,
        payment_date: values.payment_date,
        account_id: values.account_id,
        user_id: user.id,
        institution_id: institutionId,
        installment_id: values.installment_id,
        payment_method: values.payment_method,
        notes: values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Pagamento registrado com sucesso!");
      router.push("/payments");
      router.refresh();
    } catch (error: any) {
      toast.error("Erro ao registrar pagamento: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/payments">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Novo Pagamento
            </h2>
            <p className="text-slate-500">
              Registre o recebimento de parcelas de empréstimos.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Loan Selection Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Search className="mr-2 h-5 w-5 text-blue-600" />
                  Selecionar Contrato
                </h3>

                <FormField
                  control={form.control}
                  name="loan_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Empréstimo Ativo</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? loans.find((l) => l.id === field.value)?.clients?.full_name + " - " + formatCurrency(loans.find((l) => l.id === field.value)?.loan_amount)
                                : "Selecione um contrato..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Pesquisar nome ou ID do cliente..." />
                            <CommandList>
                              <CommandEmpty>Nenhum contrato encontrado.</CommandEmpty>
                              <CommandGroup>
                                {loans.map((l) => (
                                  <CommandItem
                                    key={l.id}
                                    value={`${l.clients?.full_name} ${l.id}`}
                                    onSelect={() => {
                                      form.setValue("loan_id", l.id);
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        l.id === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{l.clients?.full_name}</span>
                                      <span className="text-xs text-slate-500">ID: {l.id.slice(0, 8)}... • {formatCurrency(l.loan_amount)}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchLoanId && (
                  <FormField
                    control={form.control}
                    name="installment_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parcela Pendente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a parcela..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {installments.map((i) => (
                              <SelectItem key={i.id} value={i.id}>
                                Parcela {i.installment_number} (
                                {formatDate(i.due_date)}) -{" "}
                                {formatCurrency(
                                  i.amount - (i.amount_paid || 0),
                                )}{" "}
                                restante
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedInstallment && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Valor Original:</span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(selectedInstallment.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Já Pago:</span>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(selectedInstallment.amount_paid || 0)}
                        </span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 flex justify-between text-base">
                        <span className="font-medium text-slate-700">
                          Saldo Devedor:
                        </span>
                        <span className="font-bold text-blue-700">
                          {formatCurrency(
                            selectedInstallment.amount -
                              (selectedInstallment.amount_paid || 0),
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Overdue / Interest Logic (Simplified for viewing) */}
                    {(() => {
                      const dueDate = new Date(selectedInstallment.due_date);
                      const today = new Date();
                      const isOverdue =
                        dueDate < today &&
                        selectedInstallment.amount -
                          (selectedInstallment.amount_paid || 0) >
                          1;
                      const diffTime = Math.abs(
                        today.getTime() - dueDate.getTime(),
                      );
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      );
                      const daysLate = isOverdue ? diffDays : 0;

                      // Mock Fine Logic
                      const fineAmount =
                        daysLate > 0
                          ? selectedInstallment.amount * 0.005 * daysLate
                          : 0;

                      if (isOverdue) {
                        return (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-red-700">
                                Parcela em Atraso ({daysLate} dias)
                              </h4>
                              <p className="text-xs text-red-600 mt-1">
                                Multa estimada: {formatCurrency(fineAmount)}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* Payment Details Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Banknote className="mr-2 h-5 w-5 text-blue-600" />
                  Dados do Recebimento
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount_paid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Pago (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meio de Pagamento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o meio de pagamento..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                          <SelectItem value="e-Mola">e-Mola</SelectItem>
                          <SelectItem value="Transferência">
                            Transferência
                          </SelectItem>
                          <SelectItem value="POS">POS / Cartão</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta de Destino (Caixa)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a conta..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name} (Saldo:{" "}
                              {formatCurrency(Number(acc.balance))})
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Pagamento parcial referente a..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
              <Link href="/payments">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-8 h-12"
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-12 h-12 shadow-lg shadow-blue-200"
                disabled={loading || !watchInstallmentId}
              >
                {loading ? "Registrando..." : "Registrar Pagamento"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
