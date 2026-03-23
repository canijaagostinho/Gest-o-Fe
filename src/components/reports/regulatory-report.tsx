"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getRegulatoryData,
  getMonthlyCreditPortfolio,
  RegulatoryReportData,
  MonthlyPortfolioItem,
} from "@/app/actions/regulatory-report";
import { PDFService } from "@/services/pdf-service";
import { ExcelService } from "@/services/excel-service";
import { toast } from "sonner";
import {
  FileText,
  Table,
  Loader2,
  Download,
  Building2,
  TrendingUp,
  Wallet,
  AlertTriangle,
  FileSpreadsheet,
  Banknote,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { MonthlyPortfolioTable } from "./monthly-portfolio-table";
import { DateRange } from "react-day-picker";
import { AutoScalingAmount } from "@/components/ui/auto-scaling-amount";

export function RegulatoryReport({
  onlyRegulatory,
  onlyPayments,
  dateRange,
}: {
  onlyRegulatory?: boolean;
  onlyPayments?: boolean;
  dateRange?: DateRange;
}) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<RegulatoryReportData | null>(
    null,
  );
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserInstitution() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("institution_id")
          .eq("id", user.id)
          .single();
        if (profile?.institution_id) {
          setInstitutionId(profile.institution_id);
        }
      }
    }
    fetchUserInstitution();
  }, [supabase]);

  const handleGenerate = async () => {
    if (!institutionId || !dateRange?.from || !dateRange?.to) {
      toast.error("Instituição ou período não selecionado");
      return;
    }

    setLoading(true);
    try {
      const startStr = dateRange.from.toISOString().split("T")[0];
      const endStr = dateRange.to.toISOString().split("T")[0];
      const data = await getRegulatoryData(institutionId, startStr, endStr);
      setReportData(data);
      toast.success("Dados gerados com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao gerar relatório: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
    try {
      const pdfService = new PDFService({
        name: reportData.institution.name,
        nuit: reportData.institution.nuit,
        address: reportData.institution.address,
        email: reportData.institution.email,
        phone: reportData.institution.phone,
      });
      await pdfService.generateRegulatoryReport(reportData);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    try {
      ExcelService.generateRegulatoryExcel(reportData);
      toast.success("Relatório Excel gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar Excel");
      console.error(error);
    }
  };

  return (
    <div className="flex-1 space-y-6 pt-2">
      {!onlyPayments && (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Relatório Trimestral (XdM)
              </h2>
              <p className="text-blue-700 text-lg font-black tracking-tight uppercase">
                Modelo Oficial Banco de Moçambique
              </p>
              <p className="text-slate-500 text-sm font-bold">
                Requisitos de Capital e Solvabilidade
              </p>
            </div>
          </div>

          <Card className="border-none shadow-sm bg-blue-50/10 border border-blue-100/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800">
                Processamento do Relatório XdM
              </CardTitle>
              <CardDescription className="text-xs">
                Clique para consolidar os indicadores com base no período
                selecionado acima.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !institutionId}
                  className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-5 w-5" />
                  )}
                  Gerar Relatórios
                </Button>
              </div>
            </CardContent>
          </Card>

          {reportData && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={handleExportPDF}
                >
                  <FileText className="mr-2 h-4 w-4 text-red-600" /> PDF
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />{" "}
                  Excel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-md bg-white rounded-2xl ring-1 ring-slate-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                      Carteira Bruta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AutoScalingAmount 
                      amount={reportData.portfolio.gross_portfolio} 
                      baseSize="3xl"
                      className="text-blue-900"
                    />
                    <p className="text-[10px] font-bold text-blue-600/80 mt-1 uppercase tracking-wider">
                      {reportData.portfolio.active_clients} clientes ativos
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                      Total Recuperado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AutoScalingAmount 
                      amount={reportData.financials.recovered} 
                      baseSize="3xl"
                      className="text-emerald-900"
                    />
                    <p className="text-[10px] font-bold text-emerald-600/80 mt-1 uppercase tracking-wider">
                      Neste trimestre
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">
                      Qualidade da Carteira
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-xl font-black text-amber-900 break-all leading-tight">
                      {reportData.portfolio.par_30.toFixed(2)}%
                    </div>
                    <p className="text-[10px] font-bold text-amber-600/80 mt-1 uppercase tracking-wider">
                      Rácio PAR 30
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-slate-50/50 rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                      Funcionários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-xl font-black text-slate-900">
                      {reportData.institution.employees}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600/80 mt-1 uppercase tracking-wider">
                      Efetivo da Instituição
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {(!onlyRegulatory || onlyPayments) && (
        <div
          className={onlyPayments ? "" : "mt-12 pt-8 border-t border-slate-100"}
        >
          <MonthlyReportSection
            institutionId={institutionId}
            dateRange={dateRange}
          />
        </div>
      )}
    </div>
  );
}

function MonthlyReportSection({
  institutionId,
  dateRange,
}: {
  institutionId: string | null;
  dateRange?: DateRange;
}) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<MonthlyPortfolioItem[]>(
    [],
  );
  const [institutionInfo, setInstitutionInfo] = useState<any>(null);

  const handleFetchData = async () => {
    if (!institutionId || !dateRange?.from || !dateRange?.to) {
      toast.error("Instituição ou período não selecionado");
      return;
    }

    setLoading(true);
    try {
      const startStr = dateRange.from.toISOString().split("T")[0];
      const endStr = dateRange.to.toISOString().split("T")[0];
      const { data, institution } = await getMonthlyCreditPortfolio(
        institutionId,
        startStr,
        endStr,
        statusFilter,
        purposeFilter,
      );
      setPortfolioData(data);
      setInstitutionInfo(institution);

      if (data.length === 0) {
        toast.warning("Sem dados para os filtros selecionados");
      } else {
        toast.success(`${data.length} operações encontradas`);
      }
    } catch (error: any) {
      toast.error("Erro ao buscar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    if (portfolioData.length === 0) {
      toast.error("Gere os dados primeiro");
      return;
    }

    try {
      const reportDate = dateRange?.to || new Date();

      if (format === "excel") {
        ExcelService.generateMonthlyPortfolioExcel(
          portfolioData,
          institutionInfo?.name || "Relatório Institucional",
          reportDate,
        );
        toast.success("Carteira Excel exportada!");
      } else {
        const pdfService = new PDFService(institutionInfo);
        await pdfService.generateMonthlyPortfolioReport(
          portfolioData,
          reportDate,
          institutionInfo?.name || "Relatório Institucional",
        );
        toast.success("Carteira PDF exportada!");
      }
    } catch (error: any) {
      toast.error("Erro ao exportar: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white border border-slate-100">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Banknote className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-800 tracking-tight">
                Relatório de Pagamentos / Carteira Mensal
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Modelo Oficial BM - 13 Colunas Técnicas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-end bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 p-1 uppercase tracking-widest leading-none">
                  Filtrar por Estado
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="Selecione o estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Estados</SelectItem>
                    <SelectItem value="active">Apenas Ativos</SelectItem>
                    <SelectItem value="liquidated">
                      Apenas Liquidados
                    </SelectItem>
                    <SelectItem value="arrears">
                      Com Crédito em Atraso
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 p-1 uppercase tracking-widest leading-none">
                  Finalidade do Crédito
                </label>
                <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                  <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="Selecione a finalidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Finalidades</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Habitação">Habitação</SelectItem>
                    <SelectItem value="Consumo">Consumo</SelectItem>
                    <SelectItem value="Investimento">Investimento</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <Button
                onClick={handleFetchData}
                disabled={loading || !institutionId}
                className="h-11 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold flex-1 lg:flex-none shadow-lg shadow-blue-100"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="mr-2 h-4 w-4" />
                )}
                Gerar Dados
              </Button>
            </div>
          </div>

          {portfolioData.length > 0 && (
            <div className="mt-8 space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-white px-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Visualização Técnica (13 Colunas)
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExport("excel")}
                    className="h-9 rounded-lg border-slate-200 text-emerald-600 font-bold hover:bg-emerald-50"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport("pdf")}
                    className="h-9 rounded-lg border-slate-200 text-red-600 font-bold hover:bg-red-50"
                  >
                    <FileText className="mr-2 h-4 w-4" /> PDF
                  </Button>
                </div>
              </div>

              <MonthlyPortfolioTable data={portfolioData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
