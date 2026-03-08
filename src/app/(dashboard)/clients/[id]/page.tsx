"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  User,
  CreditCard,
  Banknote,
  FileText,
  History,
  MoreHorizontal,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  BadgeCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
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

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [client, setClient] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: clientData } = await supabase
          .from("clients")
          .select("*")
          .eq("id", id)
          .single();

        const { data: loansData } = await supabase
          .from("loans")
          .select("*, installments(status, due_date)")
          .eq("client_id", id)
          .order("created_at", { ascending: false });

        const { data: paymentsData } = await supabase
          .from("payments")
          .select("*, loans(id)")
          .in("loan_id", loansData?.map((l: any) => l.id) || [])
          .order("payment_date", { ascending: false });

        setClient(clientData);
        setLoans(loansData || []);
        setPayments(paymentsData || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, supabase]);

  // Combine for Timeline
  const timeline = [
    ...loans.map((l) => ({
      type: "loan",
      date: new Date(l.created_at),
      data: l,
    })),
    ...payments.map((p) => ({
      type: "payment",
      date: new Date(p.payment_date),
      data: p,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">Carregando perfil...</div>
    );
  if (!client)
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Cliente não encontrado.
      </div>
    );

  const classificationColors: Record<string, string> = {
    Regular: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Em risco": "bg-orange-50 text-orange-700 border-orange-100",
    Inadimplente: "bg-red-50 text-red-700 border-red-100",
  };

  // Determine dynamic status
  const getDynamicStatus = (loan: any) => {
    if (!loan) return "pending";
    if (loan.status === "cancelled" || loan.status === "completed") {
      return loan.status;
    }
    if (loan.installments && Array.isArray(loan.installments)) {
      const today = new Date().toISOString().split("T")[0];
      const hasOverdue = loan.installments.some(
        (i: any) => i.status !== "paid" && i.due_date < today,
      );
      if (hasOverdue) return "delinquent";
    }
    return loan.status;
  };

  const initials = client.full_name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleExportStatement = async () => {
    const { toast } = await import("sonner");
    const { PDFService } = await import("@/services/pdf-service");

    toast.promise(
      async () => {
        // 1. Fetch Institution Data
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data: userData } = await supabase
          .from("users")
          .select("institution_id")
          .eq("id", user.id)
          .single();

        if (!userData?.institution_id)
          throw new Error("Instituição não encontrada");

        const { data: institution } = await supabase
          .from("institutions")
          .select("*")
          .eq("id", userData.institution_id)
          .single();

        // 2. Prepare Data
        const totalBorrowed = loans.reduce(
          (acc, l) => acc + Number(l.loan_amount),
          0,
        );
        const totalPaid = loans.reduce(
          (acc, l) => acc + Number(l.amount_paid || 0),
          0,
        );
        const debt = totalBorrowed - totalPaid;

        // 3. Generate PDF
        const pdf = new PDFService({
          name: institution.name,
          address: institution.address,
          nuit: institution.nuit,
          email: institution.email,
          phone: institution.phone,
          logo_url: institution.logo_url,
          primary_color: institution.primary_color,
        });

        await pdf.generateClientStatement(
          {
            full_name: client.full_name,
            document_id: client.document_id || client.id_number,
            phone: client.phone,
            email: client.email,
            address: client.address,
          },
          loans.map((l) => ({
            id: l.id,
            amount: l.loan_amount,
            amount_paid: l.amount_paid || 0,
            status: l.status,
            start_date: new Date(l.created_at),
          })),
          { totalBorrowed, totalPaid, debt },
        );
      },
      {
        loading: "Gerando ficha...",
        success: "Ficha baixada!",
        error: (err) => `Erro: ${err.message}`,
      },
    );
  };

  return (
    <div className="flex-1 space-y-6 pt-2 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/clients">
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
              CLIENTE
            </span>
            <span className="text-xs font-medium text-slate-300">|</span>
            <span className="text-xs font-mono text-slate-500">
              CÓD: {client.code || "-"}
            </span>
            <span className="text-xs font-medium text-slate-300">|</span>
            <span className="text-xs font-mono text-slate-500">
              ID: {client.id_number}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {client.full_name}
          </h2>
        </div>
        <Button
          variant="outline"
          className="rounded-full shadow-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
          onClick={handleExportStatement}
        >
          <Download className="mr-2 h-4 w-4" /> Exportar Ficha
        </Button>
        <Link href="/loans/new">
          <Button className="bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Novo Empréstimo
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1 w-full justify-start h-auto">
          <TabsTrigger
            value="overview"
            className="px-6 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="px-6 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            Empréstimos
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="px-6 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            Histórico Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Foto do Perfil
                      </p>
                      <p className="text-xs text-slate-500">
                        Gerado automaticamente
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Foto do Perfil
                      </p>
                      <p className="text-xs text-slate-500">
                        Gerado automaticamente
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats Summary */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-2">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Total Tomado
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(
                          loans.reduce(
                            (acc, curr) => acc + Number(curr.loan_amount),
                            0,
                          ),
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Maior Atraso
                      </p>
                      <p className="text-lg font-bold text-amber-600">0 dias</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium uppercase">
                      Status
                    </p>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block",
                        classificationColors[client.classification] ||
                          "bg-slate-50 text-slate-700 border-slate-100",
                      )}
                    >
                      {client.classification}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium uppercase">
                      Telefone
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {client.phone || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium uppercase">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {client.email || "-"}
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-slate-500 font-medium uppercase">
                      Endereço
                    </p>
                    <p className="text-sm text-slate-900">
                      {client.address || "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Risk & Stats */}
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-widest">
                    Score de Crédito
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-6">
                  <div className="relative mb-4">
                    <div className="h-24 w-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-slate-800">
                      <span className="text-5xl font-black text-emerald-400">
                        A+
                      </span>
                    </div>
                    <div className="absolute -bottom-2 px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-bold text-white shadow-lg">
                      950 PTS
                    </div>
                  </div>
                  <div className="text-center space-y-1 mt-2">
                    <p className="text-lg font-semibold text-white">
                      Excelente Pagador
                    </p>
                    <p className="text-xs text-slate-400">
                      Risco muito baixo de inadimplência.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Empréstimos Contratados
              </CardTitle>
              <CardDescription>
                Histórico completo de contratos ativos e finalizados.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loans.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(loan.loan_amount)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {loan.term}x parcelas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-slate-400">
                            Data de Início
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            {formatDate(loan.created_at)}
                          </p>
                        </div>
                        {(() => {
                          const dynamicStatus = getDynamicStatus(loan);
                          return (
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                dynamicStatus === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : dynamicStatus === "completed"
                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                    : dynamicStatus === "delinquent"
                                      ? "bg-rose-50 text-rose-700 border-rose-100"
                                      : dynamicStatus === "cancelled"
                                        ? "bg-slate-100 text-slate-600 border-slate-200"
                                        : "bg-amber-50 text-amber-700 border-amber-100",
                              )}
                            >
                              {dynamicStatus === "delinquent"
                                ? "Atrasado"
                                : dynamicStatus === "completed"
                                  ? "Pago"
                                  : dynamicStatus === "pending"
                                    ? "Pendente"
                                    : dynamicStatus === "cancelled"
                                      ? "Cancelado"
                                      : dynamicStatus}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                  <FileText className="h-12 w-12 text-slate-100 mb-2" />
                  Nenhum empréstimo registrado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Linha do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative pl-4 border-l border-slate-100 ml-2">
                {timeline.length > 0 ? (
                  timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-6 group">
                      <div
                        className={cn(
                          "absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 bg-white",
                          item.type === "loan"
                            ? "border-blue-500"
                            : "border-emerald-500",
                        )}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.type === "loan"
                              ? "Empréstimo Aprovado"
                              : "Pagamento Confirmado"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.type === "loan"
                              ? `Contrato #${item.data.id.substring(0, 8)} - ${formatCurrency(item.data.loan_amount)}`
                              : `Parcela recebida - ${formatCurrency(item.data.amount_paid)}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-slate-400">
                            {formatDate(item.date.toISOString())}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p>Nenhuma atividade registrada.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
