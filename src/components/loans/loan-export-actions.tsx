"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PDFService, InstitutionProfile } from "@/services/pdf-service";

export function LoanExportActions() {
  const [loading, setLoading] = useState(false);

  const fetchAllLoans = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { loans: [], institution: null };

    const { data: userData } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();
    if (!userData?.institution_id) return { loans: [], institution: null };

    // Fetch institution details
    const { data: institution } = await supabase
      .from("institutions")
      .select("*")
      .eq("id", userData.institution_id)
      .single();

    // Fetch loans with client info
    const { data: loans, error } = await supabase
      .from("loans")
      .select(
        `
                *,
                clients (full_name, id_number),
                installments (status, due_date, amount, amount_paid)
            `,
      )
      .eq("institution_id", userData.institution_id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao baixar dados: " + error.message);
      return { loans: [], institution: null };
    }
    return { loans, institution };
  };

  const formatAddress = (address: string | undefined | null) => {
    if (!address) return "Endereço não informado";
    return address
      .replace(/Maputo City/gi, "Maputo Cidade")
      .replace(/Maputo Province/gi, "Província de Maputo");
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const { loans, institution } = await fetchAllLoans();
      if (!loans || !loans.length) {
        toast.warning("Nenhum dado para exportar");
        return;
      }

      // Flatten data for Excel
      const rows = loans.map((loan: any) => {
        const totalPaid = loan.installments.reduce(
          (acc: number, curr: any) => acc + (Number(curr.amount_paid) || 0),
          0,
        );

        return [
          loan.id.substring(0, 8),
          loan.clients?.full_name || "N/A",
          loan.clients?.id_number || "N/A",
          new Date(loan.start_date || loan.created_at),
          Number(loan.loan_amount),
          Number(loan.total_to_pay),
          totalPaid,
          loan.status === "active"
            ? "Ativo"
            : loan.status === "completed"
              ? "Finalizado"
              : "Inadimplente",
          loan.term,
          loan.payment_frequency,
        ];
      });

      const workbook = XLSX.utils.book_new();

      // Header labels
      const headers = [
        "CONTRATO",
        "CLIENTE",
        "DOC. IDENTIFICAÇÃO",
        "DATA INÍCIO",
        "CAPITAL (MT)",
        "TOTAL DEVIDO (MT)",
        "TOTAL PAGO (MT)",
        "ESTADO",
        "PARCELAS",
        "FREQUÊNCIA",
      ];

      // Create a custom worksheet with header
      const wsData = [
        [
          institution?.name?.toUpperCase() ||
            "SISTEMA DE GESTÃO DE MICROCRÉDITO",
        ],
        [`RELATÓRIO GERAL DE EMPRÉSTIMOS`],
        [`DATA DE EMISSÃO: ${new Date().toLocaleString("pt-MZ")}`],
        [], // Empty row
        headers,
        ...rows,
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      // Apply formatting
      const range = XLSX.utils.decode_range(worksheet["!ref"]!);
      const CURRENCY_FORMAT = '#,##0.00 "MT"';

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellRef];
          if (!cell) continue;

          // Column widths based on content
          // (Handled below via !cols)

          // Format numbers as currency for columns 4, 5, 6 (Capital, Total, Paid)
          if (typeof cell.v === "number" && R > 4) {
            if ([4, 5, 6].includes(C)) {
              cell.z = CURRENCY_FORMAT;
            }
          }

          // Format dates for column 3
          if (cell.v instanceof Date) {
            cell.z = "dd/mm/yyyy";
          }
        }
      }

      // Column widths
      worksheet["!cols"] = [
        { wch: 12 }, // Contract
        { wch: 35 }, // Client
        { wch: 20 }, // ID
        { wch: 15 }, // Start Date
        { wch: 18 }, // Capital
        { wch: 18 }, // Total
        { wch: 18 }, // Paid
        { wch: 12 }, // Status
        { wch: 10 }, // Term
        { wch: 15 }, // Frequency
      ];

      // Merges
      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Empréstimos");
      XLSX.writeFile(
        workbook,
        `Relatorio_Emprestimos_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      toast.success("Excel gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const { loans, institution } = await fetchAllLoans();
      if (!loans || !loans.length) {
        toast.warning("Nenhum dado para exportar");
        return;
      }

      const pdfService = new PDFService(institution as InstitutionProfile);
      await pdfService.generateLoanListReport(loans);

      toast.success("PDF gerado com sucesso!");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao gerar PDF: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={loading}
        className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
      >
        <FileDown className="mr-2 h-4 w-4 text-rose-500" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        disabled={loading}
        className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
        Excel
      </Button>
    </div>
  );
}
