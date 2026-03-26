"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
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
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2, Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const formSchema = z.object({
  loan_id: z.string().uuid({
    message: "Selecione um empréstimo.",
  }),
  amount: z.coerce.number().positive({
    message: "O valor deve ser maior que zero.",
  }),
  payment_date: z.string().min(1, {
    message: "Selecione a data.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function PaymentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState<
    {
      id: string;
      loan_amount: number;
      contract_number: string;
      client_id: string;
      institution_id: string;
      clients: { name: string; code: string };
    }[]
  >([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    institution_id: string;
  } | null>(null);
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      loan_id: "",
      amount: 0,
      payment_date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    async function loadInitialData() {
      setLoadingLoans(true);

      // Get current user and their institution
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, institution_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }
      }

      // Get active loans
      const { data, error } = await supabase
        .from("loans")
        .select("id, loan_amount, contract_number, client_id, institution_id, clients(name, code)")
        .eq("status", "active");

      if (error) {
        toast.error("Erro ao carregar empréstimos ativos");
      } else {
        setLoans((data as any) || []);
      }
      setLoadingLoans(false);
    }
    loadInitialData();
  }, [supabase]);

  async function onSubmit(values: FormValues) {
    if (!userProfile) {
      toast.error("Erro de autenticação: perfil não encontrado");
      return;
    }

    const selectedLoan = loans.find((l) => l.id === values.loan_id);
    if (!selectedLoan) {
      toast.error("Empréstimo não encontrado");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("payments").insert({
        loan_id: values.loan_id,
        client_id: selectedLoan.client_id,
        amount_paid: values.amount,
        payment_date: values.payment_date,
        recorded_by: userProfile.id,
        institution_id:
          userProfile.institution_id || selectedLoan.institution_id,
      });

      if (error) {
        toast.error("Erro ao registar pagamento: " + error.message);
        console.error("Payment insert error:", error);
        return;
      }

      toast.success("Pagamento registado!");
      router.push("/payments");
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registo de Pagamento</CardTitle>
        <CardDescription>Insira os detalhes do valor recebido.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="loan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empréstimo Ativo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between h-11 px-3 py-2 text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={loadingLoans}
                        >
                          {field.value
                            ? (() => {
                                const selected = loans.find((l) => l.id === field.value);
                                return selected 
                                  ? `${selected.clients.name} (${selected.clients.code || 'S/C'}) - ${selected.contract_number || 'N/A'}`
                                  : "Selecione um empréstimo..."
                              })()
                            : "Pesquisar cliente ou código..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Pesquisar por nome, código ou contrato..." />
                        <CommandList>
                          <CommandEmpty>Nenhum empréstimo encontrado.</CommandEmpty>
                          <CommandGroup>
                            {loans.map((loan) => (
                              <CommandItem
                                key={loan.id}
                                value={`${loan.clients.name} ${loan.clients.code} ${loan.contract_number}`}
                                onSelect={() => {
                                  form.setValue("loan_id", loan.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    loan.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col text-left">
                                  <span className="font-bold">{loan.clients.name}</span>
                                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                    Cód: {loan.clients.code || "---"} • Contrato: {loan.contract_number || "---"} • MZN {loan.loan_amount}
                                  </span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Pago (MZN)</FormLabel>
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
                    <FormLabel>Data do Pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || loadingLoans}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registar Pagamento
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
