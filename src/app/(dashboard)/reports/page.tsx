"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  AlertCircle,
  PieChart as PieIcon,
  LayoutGrid,
  Calendar,
  Banknote,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "@/components/reports/report-filters";
import { FinancialReport } from "@/components/reports/financial-report";
import { DelinquentClientsReport } from "@/components/reports/delinquent-clients-report";
import { PortfolioEvolutionReport } from "@/components/reports/portfolio-evolution-report";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";
import { GlobalReports } from "@/components/reports/global-reports";
import { RegulatoryReport } from "@/components/reports/regulatory-report";

export default function ReportsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [status, setStatus] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [institutionData, setInstitutionData] = useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*, role:roles(name), institution_id")
          .eq("id", user.id)
          .single();

        setUserRole((profile?.role as any)?.name);

        if (profile?.institution_id) {
          const { data: institution } = await supabase
            .from("institutions")
            .select("*")
            .eq("id", profile.institution_id)
            .single();
          setInstitutionData(institution);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleClearFilters = () => {
    setDateRange(undefined);
    setStatus("all");
    toast("Filtros limpos", {
      description: "Todos os filtros foram redefinidos para o padrão.",
    });
  };

  const handleGlobalExport = async (format: "pdf" | "excel") => {
    setIsExporting(true);

    // In a real scenario, this would come from a specific query filtering by dateRange
    const summary = {
      totalLent: 0,
      totalReceived: 0,
      balance: 0,
      period:
        "Relatório de Atividades - " +
        new Date().toLocaleString("pt-MZ", { month: "long", year: "numeric" }),
    };

    const reportItems: any[] = [];

    try {
      if (format === "pdf") {
        if (!institutionData) {
          toast.error("Erro: Dados da instituição não carregados.");
          setIsExporting(false);
          return;
        }

        const { PDFService } = await import("@/services/pdf-service");
        const pdf = new PDFService({
          name: institutionData.name,
          address: institutionData.address,
          nuit: institutionData.nuit || undefined, // Handle missing fields safely
          email: institutionData.email,
          phone: institutionData.phone,
          website: institutionData.website,
          logo_url: institutionData.logo_url,
          primary_color: institutionData.primary_color,
        });

        await pdf.generateFinancialReport(
          {
            totalLent: summary.totalLent,
            totalReceived: summary.totalReceived,
            balance: summary.balance,
          },
          reportItems,
          summary.period,
        );

        toast.success("Relatório gerado!", {
          description: "O download do PDF deve iniciar automaticamente.",
        });
      } else {
        const excelData = reportItems.map((row) => ({
          Data: row.date.toLocaleDateString(),
          Descrição: row.description,
          Tipo: row.type === "in" ? "Entrada" : "Saída",
          Valor: row.value,
        }));
        exportToExcel(
          excelData,
          `gestaoflex_dados_${new Date().getTime()}.xlsx`,
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro na exportação", {
        description: "Não foi possível gerar o arquivo. " + error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const isGeneralAdmin = userRole === "admin_geral";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              {isGeneralAdmin
                ? "Estatísticas do Ecossistema"
                : "Inteligência Institucional"}
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            {isGeneralAdmin ? "Relatórios Globais" : "Relatórios Estratégicos"}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isGeneralAdmin
              ? "Visão executiva de todas as instituições e receita da plataforma."
              : "Análise consolidada e exportação de indicadores chave."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 shadow-sm bg-white hover:bg-slate-50 text-slate-700 h-11 px-6 font-bold"
            onClick={() => handleGlobalExport("excel")}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg h-11 px-6 font-bold"
            onClick={() => handleGlobalExport("pdf")}
            disabled={isExporting}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isExporting ? "Gerando..." : "Gerar PDF"}
          </Button>
        </div>
      </div>

      {isGeneralAdmin ? (
        <GlobalReports />
      ) : (
        <>
          {/* Filters Component */}
          <ReportFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            status={status}
            setStatus={setStatus}
            onClear={handleClearFilters}
          />

          {/* Main Reports Tabs */}
          <Tabs defaultValue="financial" className="space-y-8">
            <div className="w-full">
              <TabsList className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm h-auto flex flex-wrap gap-1">
                <TabsTrigger
                  value="financial"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm transition-all"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Financeiro
                </TabsTrigger>
                <TabsTrigger
                  value="delinquency"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm transition-all"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Inadimplência
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm transition-all"
                >
                  <PieIcon className="w-4 h-4 mr-2" />
                  Evolução da Carteira
                </TabsTrigger>
                <TabsTrigger
                  value="regulatory"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm transition-all"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Regulamentar (XdM)
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm transition-all"
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Relatório de Pagamentos
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Financial Tab Content */}
            <TabsContent value="financial" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FinancialReport
                  dateRange={dateRange}
                  status={status}
                  institutionData={institutionData}
                />
              </motion.div>
            </TabsContent>

            {/* Delinquency Tab Content */}
            <TabsContent value="delinquency" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <DelinquentClientsReport
                  dateRange={dateRange}
                  status={status}
                  institutionData={institutionData}
                />
              </motion.div>
            </TabsContent>

            {/* Portfolio Tab Content */}
            <TabsContent value="portfolio" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <PortfolioEvolutionReport
                  dateRange={dateRange}
                  status={status}
                  institutionData={institutionData}
                />
              </motion.div>
            </TabsContent>

            {/* Regulatory Tab Content */}
            <TabsContent value="regulatory" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <RegulatoryReport onlyRegulatory={true} dateRange={dateRange} />
              </motion.div>
            </TabsContent>

            {/* Payments Tab Content */}
            <TabsContent value="payments" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <RegulatoryReport onlyPayments={true} dateRange={dateRange} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Helper Info */}
      <Card className="bg-slate-900 border-none shadow-2xl p-8 rounded-[2.5rem] relative overflow-hidden text-white group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold">
              {isGeneralAdmin
                ? "Dúvidas sobre o faturamento?"
                : "Precisa de um relatório personalizado?"}
            </h3>
            <p className="text-slate-400 text-sm">
              {isGeneralAdmin
                ? "Consulte nossa equipe financeira para detalhes sobre taxas de adesão e assinaturas."
                : "Nossa equipe pode gerar extrações customizadas para as necessidades específicas da sua instituição."}
            </p>
          </div>
          <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-8 h-12 font-bold shrink-0">
            Contatar Suporte
          </Button>
        </div>
      </Card>
    </div>
  );
}
