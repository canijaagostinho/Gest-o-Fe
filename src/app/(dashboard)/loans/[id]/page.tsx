"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  Calendar,
  Users,
  Banknote,
  FileText,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag,
  Ban,
  Trash2,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { calculateLateFee } from "@/lib/loan-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoanPaymentModal } from "@/components/loans/loan-payment-modal";
import {
  payInstallmentAction,
  cancelLoanAction,
} from "@/app/actions/loan-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LoanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loan, setLoan] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const refreshData = async () => {
    // Re-fetch data logic (simplified specifically for the modal callback)
    // In a real app we might just router.refresh() but since we're using client-side fetching in this component...
    // Actually, let's just re-run the fetch effect or update state manually.
    // For now, let's trigger a router refresh to sync server components if any, and re-fetch here.
    router.refresh();
    // Re-fetch locally
    const { data: installmentsData } = await supabase
      .from("installments")
      .select("*, loans(*)")
      .eq("loan_id", id)
      .order("installment_number", { ascending: true });
    setInstallments(installmentsData || []);

    // Also update loan status if needed
    const { data: loanData } = await supabase
      .from("loans")
      .select("*")
      .eq("id", id)
      .single();
    setLoan(loanData);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Loan
        const { data: loanData, error: loanError } = await supabase
          .from("loans")
          .select("*")
          .eq("id", id)
          .single();

        if (loanError) throw loanError;
        setLoan(loanData);

        // Fetch Client
        if (loanData.client_id) {
          const { data: clientData } = await supabase
            .from("clients")
            .select("*")
            .eq("id", loanData.client_id)
            .single();
          setClient(clientData);
        }

        // Fetch Installments
        const { data: installmentsData } = await supabase
          .from("installments")
          .select("*, loans(*)")
          .eq("loan_id", id)
          .order("installment_number", { ascending: true });
        setInstallments(installmentsData || []);

        // Fetch Settings for Fine/Mora
        if (loanData.institution_id) {
          const { data: settingsData } = await supabase
            .from("settings")
            .select("*")
            .eq("institution_id", loanData.institution_id)
            .maybeSingle();
          setSettings(settingsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, supabase]);

  const handleOpenPaymentModal = (installment: any) => {
    setSelectedInstallment(installment);
    setIsPaymentModalOpen(true);
  };

  const handleDownloadGuide = async (installment: any) => {
    const { PDFService } = await import("@/services/pdf-service");

    toast.promise(
      async () => {
        const pdf = new PDFService({
          name: settings?.institution?.name || "Instituição",
          address: settings?.institution?.address,
          nuit: settings?.institution?.nuit,
          email: settings?.institution?.email,
          phone: settings?.institution?.phone,
          logo_url: settings?.institution?.logo_url,
          primary_color: settings?.institution?.primary_color,
        });

        await pdf.generateInstallmentGuide(
          loan,
          installment,
          {
            full_name: client.full_name,
            document_id: client.id_number,
            phone: client.phone,
            email: client.email,
            address: client.address,
          }
        );
      },
      {
        loading: "Gerando guia de pagamento...",
        success: "Guia baixada com sucesso!",
        error: "Erro ao gerar guia de pagamento",
      }
    );
  };

  const handleGenericPayment = () => {
    // Find first unpaid installment
    const nextUnpaid = installments.find((i) => i.status !== "paid");
    if (nextUnpaid) {
      handleOpenPaymentModal(nextUnpaid);
    } else {
      toast.info("Todas as parcelas já foram pagas!");
    }
  };

  const handleRenegotiate = () => {
    // Calculate outstanding balance (Principal + Interest + Unpaid Fines)
    // Note: For simplicity, we'll take total_to_pay - paid_amount.
    // Ideally we should recalculate based on current debt.

    let totalPaid = 0;
    installments.forEach((i: any) => {
      if (i.status === "paid") {
        totalPaid += Number(i.amount_paid || 0);
      }
    });

    const outstanding = (loan.total_to_pay || 0) - totalPaid;

    // Push to new loan page with params
    const params = new URLSearchParams();
    if (loan.client_id) params.set("client_id", loan.client_id);
    if (outstanding > 0) params.set("amount", outstanding.toString());
    params.set("refinance_loan_id", loan.id);

    router.push(`/loans/new?${params.toString()}`);
  };

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelLoan = async () => {
    try {
      setIsCancelling(true);
      const result = await cancelLoanAction(id);
      if (result.success) {
        toast.success("Empréstimo cancelado com sucesso");
        refreshData();
      } else {
        toast.error(result.error || "Erro ao cancelar empréstimo");
      }
    } catch (error: any) {
      toast.error("Erro inesperado: " + error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando detalhes...
      </div>
    );
  if (!loan)
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Empréstimo não encontrado.
      </div>
    );

  // Calculate progress based on value (consistent with Clients page)
  const totalOwed = installments.reduce(
    (acc: number, inst: any) => acc + Number(inst.amount),
    0,
  );
  const totalPaidCalculated = installments.reduce(
    (acc: number, inst: any) => acc + Number(inst.amount_paid || 0),
    0,
  );
  const progressPercentage =
    totalOwed > 0 ? (totalPaidCalculated / totalOwed) * 100 : 0;
  const paidInstallments = installments.filter(
    (i: any) => i.status === "paid",
  ).length;

  // Find next pending installment index for "Current" pulse effect
  // Logic: First 'pending' or 'overdue' one.
  const currentInstallmentIndex = installments.findIndex(
    (i: any) => i.status === "pending" || i.status === "overdue",
  );

  // Determine dynamic status
  const getDynamicStatus = () => {
    if (!loan) return "pending";
    if (loan.status === "cancelled" || loan.status === "completed") {
      return loan.status;
    }
    if (installments && Array.isArray(installments)) {
      const today = new Date().toISOString().split("T")[0];
      const hasOverdue = installments.some(
        (i: any) => i.status !== "paid" && i.due_date < today,
      );
      if (hasOverdue) return "delinquent";
    }
    return loan.status;
  };

  const dynamicStatus = getDynamicStatus();

  return (
    <div className="flex-1 space-y-6 pt-2 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/loans">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3 text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              EMPRÉSTIMO
            </span>
            <span className="text-xs font-medium text-slate-300">|</span>
            <span className="text-xs font-mono text-slate-500">
              #{loan.id.slice(0, 8)}
            </span>
            {dynamicStatus === "active" && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                Ativo
              </Badge>
            )}
            {dynamicStatus === "completed" && (
              <Badge className="bg-blue-500 hover:bg-blue-600">Quitado</Badge>
            )}
            {dynamicStatus === "delinquent" && (
              <Badge className="bg-rose-500 hover:bg-rose-600">Atrasado</Badge>
            )}
            {dynamicStatus === "cancelled" && (
              <Badge className="bg-slate-500 hover:bg-slate-600">
                Cancelado
              </Badge>
            )}
            {dynamicStatus === "pending" && (
              <Badge className="bg-amber-500 hover:bg-amber-600">
                Pendente
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(loan.loan_amount)}
            </h2>
            <span className="text-lg text-slate-400 font-medium">
              para {client?.full_name}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full">
              Ações <MoreHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Gerenciar Empréstimo</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleGenericPayment}>
              <Banknote className="mr-2 h-4 w-4" /> Registrar Pagamento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRenegotiate}>
              <Flag className="mr-2 h-4 w-4" /> Renegociar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-600">
              <Ban className="mr-2 h-4 w-4" /> Declarar Inadimplência
            </DropdownMenuItem>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-rose-600 font-bold"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Cancelar Empréstimo
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá cancelar o empréstimo e todas as parcelas
                    pendentes. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Não, manter ativo</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelLoan}
                    className="bg-rose-600 hover:bg-rose-700"
                    disabled={isCancelling}
                  >
                    {isCancelling
                      ? "Cancelando..."
                      : "Sim, cancelar empréstimo"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Timeline & Details) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Visual Segmented Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <h3 className="text-sm font-semibold text-slate-700">
                Progresso do Contrato
              </h3>
              <span className="text-xs text-slate-500">
                {paidInstallments} de {installments.length} Pagas (
                {Math.round(progressPercentage)}%)
              </span>
            </div>
            <div className="flex w-full h-8 rounded-full overflow-hidden gap-1 bg-slate-100 p-1">
              {installments.map((inst: any, idx: number) => {
                // Determine Status Color
                let colorClass = "bg-slate-200"; // Default/Future
                if (inst.status === "paid") colorClass = "bg-emerald-500";
                else if (inst.status === "overdue") colorClass = "bg-rose-500";
                else if (idx === currentInstallmentIndex)
                  colorClass = "bg-blue-500 animate-pulse"; // Current

                return (
                  <div
                    key={inst.id}
                    className={cn(
                      "h-full flex-1 rounded-sm transition-all relative group",
                      colorClass,
                    )}
                    title={`Parcela ${inst.installment_number}: ${formatCurrency(inst.amount)}`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                      {inst.installment_number}ª - {formatDate(inst.due_date)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span>Início</span>
              <span>Fim</span>
            </div>
          </div>

          {/* Installments Table */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Detalhamento das Parcelas
                </CardTitle>
              </div>
            </CardHeader>
            <div className="">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px]">#</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Multa</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((inst: any) => {
                    const isOverdue =
                      inst.status === "overdue" ||
                      (inst.status === "pending" &&
                        new Date(inst.due_date) < new Date());
                    const isPaid = inst.status === "paid";

                    const lateFeeResult =
                      isOverdue && !isPaid
                        ? calculateLateFee(
                            inst.amount,
                            new Date(inst.due_date),
                            new Date(),
                            Number(
                              loan?.late_fee_rate ??
                                settings?.default_fine_rate ??
                                2,
                            ),
                            Number(
                              loan?.mora_rate ??
                                settings?.default_mora_rate ??
                                1,
                            ),
                          )
                        : {
                            totalFine: 0,
                            fixedFine: 0,
                            dailyMora: 0,
                            daysOverdue: 0,
                          };

                    const fine = lateFeeResult.totalFine;
                    const totalAmount = inst.amount + fine;

                    return (
                      <TableRow key={inst.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">
                          {inst.installment_number}
                        </TableCell>
                        <TableCell>{formatDate(inst.due_date)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(inst.amount)}
                        </TableCell>
                        <TableCell className="text-rose-600 font-medium">
                          {fine > 0 ? (
                            <div className="flex flex-col">
                              <span>+ {formatCurrency(fine)}</span>
                              <span className="text-[10px] text-slate-400">
                                (F: {formatCurrency(lateFeeResult.fixedFine)} +
                                M: {formatCurrency(lateFeeResult.dailyMora)})
                              </span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">
                          {formatCurrency(totalAmount)}
                        </TableCell>
                        <TableCell>
                          {isPaid ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                              Pago
                            </Badge>
                          ) : isOverdue ? (
                            <div className="flex flex-col">
                              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none w-fit">
                                Atrasado
                              </Badge>
                              <span className="text-[10px] text-rose-500 font-medium mt-1">
                                {Math.floor(
                                  (new Date().getTime() -
                                    new Date(inst.due_date).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                                dias
                              </span>
                            </div>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-500 border-slate-200"
                            >
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isPaid && (
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDownloadGuide(inst)}
                              >
                                <FileText className="h-4 w-4 text-slate-400" />
                                <span className="sr-only">Boleto</span>
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleOpenPaymentModal(inst)}
                              >
                                Pagar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-widest">
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-slate-400 text-xs text-shadow-sm">
                  Valor Total a Pagar
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(loan.total_to_pay || 0)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs">Principal</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(loan.loan_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Juros Totais</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {formatCurrency(
                      (loan.total_to_pay || 0) - loan.loan_amount,
                    )}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">Saldo Devedor</span>
                  {/* Calculated mockup */}
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(
                      (loan.total_to_pay || 0) -
                        (loan.total_to_pay / installments.length) *
                          paidInstallments,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Detalhes do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">Data de Início</span>
                <span className="text-sm font-medium">
                  {formatDate(loan.created_at)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">Taxa de Juros</span>
                <span className="text-sm font-medium">
                  {loan.interest_rate}% / período
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">Frequência</span>
                <span className="text-sm font-medium capitalize">
                  {loan.payment_frequency === "monthly"
                    ? "Mensal"
                    : loan.payment_frequency === "weekly"
                      ? "Semanal"
                      : loan.payment_frequency === "daily"
                        ? "Diário"
                        : loan.payment_frequency}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">Tipo de Juros</span>
                <span className="text-sm font-medium capitalize">
                  {loan.interest_type === "simple" ? "Simples" : "Composto"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LoanPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        installment={selectedInstallment}
        settings={settings}
        onSuccess={refreshData}
      />
    </div>
  );
}
