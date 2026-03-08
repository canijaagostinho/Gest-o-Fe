"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ChevronRight,
  ChevronLeft,
  Save,
  CreditCard,
  Calculator,
  Calendar,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Wallet,
  ShieldCheck,
  UploadCloud,
  X,
  Loader2,
  Plus,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createClient } from "@/utils/supabase/client";
import { calculateLoan, Frequency, InterestType } from "@/lib/loan-utils";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LoanSimulator } from "@/components/loans/loan-simulator";
// Import Actions
import { createLoanAction } from "@/app/actions/loan-actions";
import { getAccountsAction } from "@/app/actions/account-actions";

const loanSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  loan_amount: z.coerce.number().min(100, "Valor mínimo de 100"),
  interest_rate: z.coerce.number().min(0, "Taxa inválida"),
  term: z.coerce.number().min(1, "Prazo mínimo de 1 parcela"),
  payment_frequency: z.enum([
    "daily",
    "weekly",
    "bi-weekly",
    "monthly",
    "quarterly",
    "semi-annually",
    "yearly",
  ]),
  interest_type: z.enum(["simple", "compound"]),
  processing_fee: z.coerce.number().min(0, "Taxa deve ser positiva").optional(),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  purpose: z.string().min(3, "Finalidade é obrigatória"),
  contract_number: z.string().min(1, "Número da operação é obrigatório"),
  processing_fee_type: z.enum(["amount", "percentage"]).default("amount"),
  account_id: z.string().min(1, "Selecione a conta de desembolso"),

  // Collateral Fields (Optional)
  collateral_type: z.string().optional(),
  collateral_description: z.string().optional(),
  collateral_value: z.coerce.number().optional(),
  collateral_location: z.string().optional(),
  late_fee_rate: z.coerce.number().min(0, "Taxa inválida"),
  mora_rate: z.coerce.number().min(0, "Taxa diária inválida"),
});
const STEPS = [
  { id: 1, name: "Cliente", icon: User },
  { id: 2, name: "Simulação", icon: Calculator },
  { id: 3, name: "Garantia", icon: ShieldCheck },
  { id: 4, name: "Revisão", icon: FileText },
];

export default function NewLoanPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(searchParams || Promise.resolve({})) as any;

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]); // Accounts State
  const [simulation, setSimulation] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const supabase = createClient();
  const form = useForm<z.infer<typeof loanSchema>>({
    resolver: zodResolver(loanSchema) as any,
    defaultValues: {
      client_id: (params.client_id as string) || "",
      loan_amount: Number(params.amount) || 1000,
      interest_rate: 10,
      term: 4,
      payment_frequency: "monthly",
      interest_type: "simple",
      processing_fee: 0,
      start_date: new Date().toISOString().split("T")[0],
      purpose: "Comercial",
      contract_number: "",
      processing_fee_type: "amount",
      account_id: "",
      collateral_type: "",
      collateral_description: "",
      collateral_value: 0,
      collateral_location: "",
      late_fee_rate: 2,
      mora_rate: 1,
    },
    shouldUnregister: false,
  });

  // Auto-advance if client_id is present
  useEffect(() => {
    if (params.client_id) {
      setStep(2);
    }
  }, [params.client_id]);

  const watchAll = form.watch();

  // Mock Client Risk Data (since we don't have it fully backend yet)
  const getClientRisk = (id: string) => {
    if (!id) return null;
    // Randomize for demo or simple static logic
    return { score: "A+", status: "Bom Pagador", maxDelay: 0 };
  };
  const selectedClient = clients.find((c) => c.id === watchAll.client_id);
  const clientRisk = getClientRisk(watchAll.client_id);

  // Update simulation
  useEffect(() => {
    const amount = Number(watchAll.loan_amount);
    const rate = Number(watchAll.interest_rate);
    const term = Number(watchAll.term);

    if (amount > 0 && rate >= 0 && term > 0 && watchAll.start_date) {
      const result = calculateLoan(
        amount,
        rate,
        term,
        watchAll.payment_frequency as Frequency,
        watchAll.interest_type as InterestType,
        new Date(watchAll.start_date),
      );
      setSimulation(result);
    } else {
      setSimulation(null);
    }
  }, [
    watchAll.loan_amount,
    watchAll.interest_rate,
    watchAll.term,
    watchAll.payment_frequency,
    watchAll.interest_type,
    watchAll.start_date,
  ]);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch User Settings for Defaults
      const { data: profile } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();

      if (profile?.institution_id) {
        const { data: settings } = await supabase
          .from("settings")
          .select("default_interest_rate, default_fine_rate, default_mora_rate")
          .eq("institution_id", profile.institution_id)
          .maybeSingle();

        if (settings) {
          form.setValue(
            "interest_rate",
            Number(settings.default_interest_rate),
          );
          form.setValue("late_fee_rate", Number(settings.default_fine_rate));
          form.setValue("mora_rate", Number(settings.default_mora_rate));
        }
      }

      // 2. Fetch Clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, full_name, id_number")
        .eq("status", "active")
        .order("full_name", { ascending: true });

      if (clientsData && clientsData.length > 0) {
        setClients(clientsData);
      } else {
        setClients([]);
      }

      // 3. Fetch Accounts
      const res = await getAccountsAction();
      if (res.success && res.data) {
        setAccounts(res.data);
        const defaultAcc = res.data.find((a: any) => a.is_default);
        if (defaultAcc) {
          form.setValue("account_id", defaultAcc.id);
        }
      }
    }
    fetchData();
  }, [supabase, form]);

  const nextStep = async () => {
    if (step === 1) {
      const valid = await form.trigger("client_id");
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await form.trigger([
        "loan_amount",
        "interest_rate",
        "term",
        "start_date",
        "contract_number",
        "purpose",
      ]);
      if (valid) setStep(3);
    } else if (step === 3) {
      // Step 3 is optional collateral, but if fields are filled, validate them?
      // For now, just proceed
      setStep(4);
    }
  };

  const prevStep = () => {
    setStep(Math.max(1, step - 1));
  };

  async function onSubmit(values: z.infer<typeof loanSchema>) {
    try {
      setLoading(true);

      if (!simulation) {
        console.error("Simulation data missing");
        toast.error(
          "Erro: Dados da simulação não encontrados. Por favor, revise os valores.",
        );
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        throw new Error("Não autenticado");
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();
      if (userError || !userData?.institution_id) {
        console.error("Institution not found", userError);
        throw new Error("Instituição não encontrada");
      }

      // Calculate final processing fee value
      let finalProcessingFee = Number(values.processing_fee || 0);
      if (values.processing_fee_type === "percentage") {
        finalProcessingFee =
          (Number(values.loan_amount) * finalProcessingFee) / 100;
      }

      // Upload Files if any - DISABLED TEMPORARILY
      const uploadedDocuments: { name: string; url: string }[] = [];
      /* 
            if (files.length > 0) {
               ... (logic removed)
            }
            */

      // Prepare Collateral Object
      let collateralData = undefined;
      if (
        values.collateral_type &&
        values.collateral_type !== "none" &&
        values.collateral_type !== ""
      ) {
        collateralData = {
          type: values.collateral_type,
          description: values.collateral_description || "",
          value: values.collateral_value || 0,
          location: values.collateral_location,
          documents: uploadedDocuments,
        };
      }

      // Call Server Action
      const result = await createLoanAction({
        collateral: collateralData,
        client_id: values.client_id,
        loan_amount: values.loan_amount,
        interest_rate: values.interest_rate,
        term: values.term,
        payment_frequency: values.payment_frequency,
        interest_type: values.interest_type,
        processing_fee: finalProcessingFee,
        start_date: values.start_date,
        purpose: values.purpose,
        contract_number: values.contract_number,
        account_id: values.account_id,
        user_id: user.id,
        institution_id: userData.institution_id,
        total_to_pay: simulation.totalToPay,
        installment_amount: simulation.installmentAmount,
        installments: simulation.installments,
        late_fee_rate: values.late_fee_rate,
        mora_rate: values.mora_rate,
      });

      if (!result.success) {
        console.error("Action returned failure:", result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Contrato gerado com sucesso!");
      router.push("/loans");
      router.refresh();
    } catch (error: any) {
      console.error("Catch block error:", error);
      toast.error(error?.message || "Erro desconhecido ao criar empréstimo");
    } finally {
      setLoading(false);
    }
  }

  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
    const errorFields = Object.keys(errors)
      .map((key) => {
        if (key === "account_id") return "Conta de Desembolso (Caixa)";
        if (key === "client_id") return "Cliente";
        return key;
      })
      .join(", ");

    toast.error(`Verifique os campos obrigatórios: ${errorFields}`);

    if (errors.account_id && accounts.length === 0) {
      toast.error(
        "Você não possui nenhuma Conta/Caixa cadastrada para desembolsar o valor.",
      );
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/loans">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Novo Contrato
            </h2>
            <p className="text-slate-500">
              Assistente de Criação de Empréstimo.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-3xl mx-auto mb-12">
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 -z-10"></div>
          <div
            className={cn(
              "absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 -z-10 transition-all duration-300",
              step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full",
            )}
          ></div>

          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              className="flex flex-col items-center bg-white px-2"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold mb-2 transition-all",
                  step >= s.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-400",
                )}
              >
                {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : s.id}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  step >= s.id ? "text-blue-600" : "text-slate-400",
                )}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Wizard Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px] flex flex-col justify-between">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="flex-1">
                  {/* STEP 1: CLIENT SELECTION */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                          <User className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Quem é o cliente?
                        </h3>
                        <p className="text-slate-500">
                          Selecione o tomador do empréstimo para iniciar.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="client_id"
                        render={({ field }) => (
                          <FormItem className="max-w-md mx-auto flex flex-col">
                            <FormLabel>Buscar Cliente</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between h-11 bg-white border-slate-200 text-slate-900 rounded-xl",
                                      !field.value && "text-slate-500",
                                    )}
                                  >
                                    {field.value
                                      ? clients.find(
                                          (c) => c.id === field.value,
                                        )?.full_name
                                      : "Pesquise por nome, código..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[400px] p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput placeholder="Procurar por nome ou código..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      Nenhum cliente encontrado.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {clients.map((c) => (
                                        <CommandItem
                                          value={`${c.full_name} ${c.id_number} ${c.id}`}
                                          key={c.id}
                                          onSelect={() => {
                                            form.setValue("client_id", c.id);
                                            // Close popover logic would need to be added manually without a state variable,
                                            // but since it's a form setValue, it updates correctly.
                                            // We'll keep it simple: the popover manages its own open state via PopoverTrigger.
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              c.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          {c.full_name} ({c.id_number})
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

                      {selectedClient && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="max-w-md mx-auto mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold border border-slate-100">
                              {selectedClient.full_name
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {selectedClient.full_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {selectedClient.id_number}
                              </p>
                            </div>
                            <div className="ml-auto text-right">
                              <div className="inline-flex items-center px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">
                                Score {clientRisk?.score}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 2: SIMULATION */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center space-x-2 text-blue-600 mb-6 font-semibold">
                        <Calculator className="w-5 h-5" />
                        <span>Simule as condições</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="loan_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor do Empréstimo</FormLabel>
                              <FormControl>
                                <div
                                  className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 hover:border-blue-400 transition-all cursor-text"
                                  onClick={() =>
                                    document
                                      .getElementById("loan_amount_input")
                                      ?.focus()
                                  }
                                >
                                  <span className="mr-2.5 text-sm font-bold text-slate-500 select-none">
                                    MT
                                  </span>
                                  <input
                                    id="loan_amount_input"
                                    type="number"
                                    className="flex-1 border-0 bg-transparent p-0 text-base font-medium placeholder:text-muted-foreground focus:ring-0 outline-none w-full"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="processing_fee_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Taxa</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="amount">
                                      Valor Fixo (MT)
                                    </SelectItem>
                                    <SelectItem value="percentage">
                                      Percentagem (%)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="processing_fee"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Taxa de Processo</FormLabel>
                                <FormControl>
                                  <div
                                    className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 hover:border-blue-400 transition-all cursor-text"
                                    onClick={() =>
                                      document
                                        .getElementById("processing_fee_input")
                                        ?.focus()
                                    }
                                  >
                                    <span className="mr-2.5 text-sm font-bold text-slate-500 flex-shrink-0 select-none">
                                      {form.watch("processing_fee_type") ===
                                      "amount"
                                        ? "MT"
                                        : "%"}
                                    </span>
                                    <input
                                      id="processing_fee_input"
                                      type="number"
                                      className="flex-1 border-0 bg-transparent p-0 text-base font-medium placeholder:text-muted-foreground focus:ring-0 outline-none w-full"
                                      placeholder="0.00"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Valor descontado no ato
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="term"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Parcelas</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="text-lg font-semibold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="interest_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Taxa de Juros (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Por período
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payment_frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequência</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="daily">Diário</SelectItem>
                                  <SelectItem value="weekly">
                                    Semanal
                                  </SelectItem>
                                  <SelectItem value="bi-weekly">
                                    Quinzenal
                                  </SelectItem>
                                  <SelectItem value="monthly">
                                    Mensal
                                  </SelectItem>
                                  <SelectItem value="quarterly">
                                    Trimestral
                                  </SelectItem>
                                  <SelectItem value="semi-annually">
                                    Semestral
                                  </SelectItem>
                                  <SelectItem value="yearly">Anual</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Finalidade do Crédito</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Comercial">
                                  Comercial
                                </SelectItem>
                                <SelectItem value="Habitação">
                                  Habitação
                                </SelectItem>
                                <SelectItem value="Consumo">Consumo</SelectItem>
                                <SelectItem value="Investimento">
                                  Investimento
                                </SelectItem>
                                <SelectItem value="Emergência">
                                  Emergência
                                </SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contract_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Número da Operação (Nº Contrato)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: CR-2024-001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primeiro Pagamento</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: COLLATERAL */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center space-x-2 text-teal-600 mb-6 font-semibold">
                        <ShieldCheck className="w-5 h-5" />
                        <span>Garantia (Opcional)</span>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="collateral_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Bem</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      Nenhuma
                                    </SelectItem>
                                    <SelectItem value="vehicle">
                                      Veículo
                                    </SelectItem>
                                    <SelectItem value="real_estate">
                                      Imóvel
                                    </SelectItem>
                                    <SelectItem value="other">
                                      Outros
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="collateral_value"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor Estimado (MT)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-6">
                          <FormField
                            control={form.control}
                            name="collateral_description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição Detalhada</FormLabel>
                                <FormControl>
                                  <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Marca, Modelo, Nº de Série, Cor, etc."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-6">
                          <FormField
                            control={form.control}
                            name="collateral_location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Localização / Endereço</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Onde o bem está localizado ou registrado"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="font-semibold text-slate-700">
                            Documentos e Fotos
                          </FormLabel>
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none"
                          >
                            Em Breve
                          </Badge>
                        </div>

                        <div className="border-2 border-dashed border-slate-100 rounded-xl p-8 text-center bg-slate-50/50">
                          <UploadCloud className="mx-auto h-10 w-10 text-slate-200 mb-2" />
                          <p className="text-sm font-medium text-slate-500">
                            Upload de documentos desativado temporariamente
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Estamos aprimorando a segurança do armazenamento.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: REVIEW */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                          <Wallet className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Desembolso e Contrato
                        </h3>
                        <p className="text-slate-500">
                          Selecione onde liberar o dinheiro e confirme o
                          contrato.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                          <span className="text-slate-500">Cliente</span>
                          <span className="font-bold text-slate-900">
                            {selectedClient?.full_name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                          <span className="text-slate-500">Nº da Operação</span>
                          <span className="font-bold text-slate-900">
                            {watchAll.contract_number}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                          <span className="text-slate-500">Valor Liberado</span>
                          <span className="font-bold text-slate-900 text-lg">
                            {formatCurrency(Number(watchAll.loan_amount))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                          <span className="text-slate-500">Total a Pagar</span>
                          <span className="font-bold text-emerald-600 text-lg">
                            {formatCurrency(simulation?.totalToPay)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                          <span className="text-slate-500">Data Final</span>
                          <span className="font-medium text-slate-900">
                            {simulation?.installments.length > 0 &&
                              formatDate(
                                simulation.installments[
                                  simulation.installments.length - 1
                                ].dueDate.toISOString(),
                              )}
                          </span>
                        </div>

                        <div className="pt-6 mt-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100 shadow-inner">
                          <FormField
                            control={form.control}
                            name="account_id"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between mb-2">
                                  <FormLabel className="text-blue-900 font-bold">
                                    Conta de Desembolso (Caixa)
                                  </FormLabel>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-100 text-blue-700 border-blue-200"
                                  >
                                    OBRIGATÓRIO
                                  </Badge>
                                </div>
                                {accounts.length === 0 ? (
                                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm shadow-sm">
                                    <div className="font-bold flex items-center mb-1">
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Nenhuma conta encontrada
                                    </div>
                                    <p className="mb-2">
                                      Você precisa cadastrar uma conta/caixa
                                      para desembolsar o dinheiro.
                                    </p>
                                    <Link
                                      href="/finance/accounts"
                                      className="text-blue-600 hover:underline font-bold inline-flex items-center"
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Criar
                                      Nova Conta
                                    </Link>
                                  </div>
                                ) : (
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-14 w-full bg-white border-blue-200 focus:ring-4 focus:ring-blue-500/10 text-lg font-medium shadow-sm transition-all hover:border-blue-400 rounded-xl px-4">
                                        <div className="flex items-center gap-3 w-full">
                                          <Wallet className="h-5 w-5 text-blue-600 shrink-0" />
                                          <SelectValue placeholder="Selecione a conta para desembolso..." />
                                        </div>
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-blue-100 shadow-xl p-1">
                                      {accounts.map((account) => (
                                        <SelectItem
                                          key={account.id}
                                          value={account.id}
                                          className="py-3 px-4 rounded-lg focus:bg-blue-50 cursor-pointer mb-1 last:mb-0"
                                        >
                                          <div className="flex items-center justify-between w-full min-w-[300px] gap-8">
                                            <span className="font-bold text-slate-900">
                                              {account.name}
                                            </span>
                                            <span className="text-sm font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                              {formatCurrency(account.balance)}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                <FormDescription className="text-blue-600/70 text-[10px] mt-2">
                                  O valor do empréstimo será debitado desta
                                  conta para o cliente.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between pt-6 border-t border-slate-50 mt-auto">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-600 hover:bg-blue-700 rounded-full px-8"
                    >
                      Próximo <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      disabled={loading || !watchAll.account_id}
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 shadow-lg shadow-emerald-200"
                    >
                      {loading ? "Processando..." : "Aprovar e Gerar Contrato"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Simulation Column - Always Visible in Step 2 & 3 */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <LoanSimulator
                  simulation={simulation}
                  loading={false}
                  frequency={watchAll.payment_frequency}
                  interestRate={Number(watchAll.interest_rate)}
                  term={Number(watchAll.term)}
                  principal={Number(watchAll.loan_amount)}
                  processingFee={Number(watchAll.processing_fee || 0)}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-900/5 p-8 rounded-2xl border border-blue-100/50 text-center h-[200px] flex flex-col items-center justify-center text-blue-800"
              >
                <Info className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">A simulação aparecerá aqui.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
