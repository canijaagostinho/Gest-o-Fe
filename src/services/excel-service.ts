import * as XLSX from "xlsx";
import {
  RegulatoryReportData,
  MonthlyPortfolioItem,
} from "@/app/actions/regulatory-report";

export class ExcelService {
  private static CURRENCY_FORMAT = '#,##0.00 "MT"';
  private static PERCENT_FORMAT = "0.00%";

  public static generateRegulatoryExcel(data: RegulatoryReportData) {
    const wb = XLSX.utils.book_new();
    const wsData: (string | number | Date | null)[][] = [];

    // --- HEADER ---
    wsData.push(["MODELO DE REPORTE TRIMESTRAL (XdM)"]);
    const d1 = new Date(data.period.startDate).toLocaleDateString("pt-MZ");
    const d2 = new Date(data.period.endDate).toLocaleDateString("pt-MZ");
    wsData.push([`PERÍODO DE SELECÇÃO: ${d1} A ${d2}`]);
    wsData.push([]);

    wsData.push(["INSTITUIÇÃO:", data.institution.name.toUpperCase()]);
    wsData.push(["NUIT:", data.institution.nuit]);
    wsData.push(["UNIDADE MONETÁRIA:", "Meticais (MZN)"]);
    wsData.push([]);

    // --- 1. DADOS DA INSTITUIÇÃO ---
    wsData.push(["1. DADOS DA INSTITUIÇÃO"]);
    wsData.push([
      "1.1 Endereço da Sede",
      `${data.institution.address}${data.institution.neighborhood ? `, Bairro ${data.institution.neighborhood}` : ""}`,
    ]);
    wsData.push(["1.2 Província", data.institution.province]);
    wsData.push(["1.3 Cidade/Distrito", data.institution.district]);
    wsData.push(["1.4 Telefone", data.institution.phone]);
    wsData.push(["1.5 Email", data.institution.email]);
    wsData.push([
      "1.6 Início de Actividades",
      data.institution.foundation_date
        ? new Date(data.institution.foundation_date)
        : "",
    ]);
    wsData.push(["1.7 Nº de Trabalhadores", data.institution.employees]);
    wsData.push(["1.8 Responsável", data.institution.responsible_name]);
    wsData.push([]);

    // --- 2. INFORMAÇÕES SOBRE A ACTIVIDADE ---
    wsData.push(["2. INFORMAÇÕES SOBRE A ACTIVIDADE"]);
    wsData.push([
      "2.1 CARTEIRA DE CRÉDITO",
      "Capital (1)",
      "Juro (2)",
      "TOTAL (3)",
    ]);
    wsData.push([
      "Montante de créditos concedidos no período",
      data.financials.disbursed,
      0,
      data.financials.disbursed,
    ]);
    wsData.push([
      "Montante de créditos reembolsados no período",
      data.financials.recovered * 0.8,
      data.financials.recovered * 0.2,
      data.financials.recovered,
    ]);
    wsData.push([
      "Montante da carteira de crédito activa/vigente",
      data.portfolio.gross_portfolio,
      0,
      data.portfolio.gross_portfolio,
    ]);
    wsData.push([]);

    // 2.1.3 Breakdown by Sector
    wsData.push([
      "2.1.3 Créditos concedidos por sector de actividade/finalidade",
      "",
      "Montante (4)",
    ]);
    let totalSector = 0;
    Object.entries(data.portfolio_sectors || {}).forEach(([sector, amount]) => {
      wsData.push([sector, "", amount]);
      totalSector += amount;
    });
    wsData.push(["TOTAL POR SECTOR", "", totalSector]);
    wsData.push([]);

    // 2.1.5 Estrutura da Carteira em Risco
    wsData.push([
      "2.1.5 Estrutura da Carteira em Risco",
      "Capital (12)",
      "Juro (13)",
      "TOTAL",
    ]);
    const r = data.portfolio_risk!;
    wsData.push([
      "Classe I (de 1 até 30 dias)",
      r.class_1.capital,
      r.class_1.interest,
      r.class_1.total,
    ]);
    wsData.push([
      "Classe II (de 31 até 90 dias)",
      r.class_2.capital,
      r.class_2.interest,
      r.class_2.total,
    ]);
    wsData.push([
      "Classe III (de 91 a 365 dias)",
      r.class_3.capital,
      r.class_3.interest,
      r.class_3.total,
    ]);
    wsData.push([
      "Classe IV (mais de 365 dias)",
      r.class_4.capital,
      r.class_4.interest,
      r.class_4.total,
    ]);
    wsData.push([
      "TOTAL EM RISCO",
      r.total.capital,
      r.total.interest,
      r.total.total,
    ]);
    wsData.push([]);

    // 2.2 TAXAS DE JURO
    wsData.push(["2.2 TAXAS DE JURO E PRAZOS", "Mínimo", "Máximo"]);
    wsData.push([
      "Taxa de juro mensal (%)",
      `${data.interest_rates.min}%`,
      `${data.interest_rates.max}%`,
    ]);
    wsData.push(["Prazo (Meses)", data.terms.min, data.terms.max]);
    wsData.push([]);

    // 3. Situation Financeira
    wsData.push(["3. SITUAÇÃO FINANCEIRA DA OPERADORA"]);
    wsData.push(["Descrição", "Mês 1", "Mês 2", "Mês 3"]);
    const f = data.financial_position!;
    wsData.push(["Caixa", f.month_1.cash, f.month_2.cash, f.month_3.cash]);
    wsData.push(["Bancos", f.month_1.banks, f.month_2.banks, f.month_3.banks]);
    wsData.push([
      "Outros Activos",
      f.month_1.other,
      f.month_2.other,
      f.month_3.other,
    ]);
    wsData.push([
      "TOTAL DO ATIVO AUTOMÁTICO",
      f.month_1.total,
      f.month_2.total,
      f.month_3.total,
    ]);
    wsData.push([]);

    // Signatures
    wsData.push([]);
    wsData.push([]);
    wsData.push([
      "__________________________",
      "",
      "",
      "__________________________",
    ]);
    wsData.push(["DIRECÇÃO/GERÊNCIA", "", "", "CONTABILIDADE"]);

    // Create Sheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply formatting
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    let currentSection = 0;

    for (let R = range.s.r; R <= range.e.r; ++R) {
      // Read first column to detect section
      const firstCellRef = XLSX.utils.encode_cell({ r: R, c: 0 });
      const firstCellValue = ws[firstCellRef]?.v?.toString() || "";

      if (firstCellValue.startsWith("1.")) currentSection = 1;
      if (firstCellValue.startsWith("2.")) currentSection = 2;
      if (firstCellValue.startsWith("3.")) currentSection = 3;

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];
        if (!cell) continue;

        // 1. Core Date Formatting (Apply to everything that is a Date)
        if (cell.v instanceof Date) {
          cell.z = "dd/mm/yyyy";
          continue; // Skip currency if it's a date
        }

        // 2. Section-Specific Formatting
        if (typeof cell.v === "number") {
          // Only format currency in Sections 2 and 3, and only for Column 1 onwards
          // This prevents Column A (labels) or Section 1 (Institutional) from getting MT
          if (currentSection >= 2 && C >= 1) {
            cell.z = this.CURRENCY_FORMAT;
          }
        }
      }
    }

    // Column widths
    ws["!cols"] = [{ wch: 55 }, { wch: 22 }, { wch: 22 }, { wch: 22 }];

    // Merges for titles
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Period
    ];

    // Append and download
    XLSX.utils.book_append_sheet(wb, ws, "Reporte XdM");
    const f1 = data.period.startDate.split("T")[0];
    const f2 = data.period.endDate.split("T")[0];
    XLSX.writeFile(
      wb,
      `Reporte_XdM_${data.institution.name}_${f1}_a_${f2}.xlsx`,
    );
  }

  public static generateMonthlyPortfolioExcel(
    data: MonthlyPortfolioItem[],
    institutionName: string,
    date: Date,
  ) {
    const wb = XLSX.utils.book_new();
    const wsData: (string | number | Date | null)[][] = [];

    // 1. Header (Institutional Layout)
    wsData.push([institutionName.toUpperCase()]);
    wsData.push([`RELATÓRIO DE CARTEIRA DE CRÉDITO MENSAL`]);
    wsData.push([
      `REF: ${date.toLocaleDateString("pt-MZ", { month: "long", year: "numeric" }).toUpperCase()}`,
    ]);
    wsData.push([]);

    // 2. Columns (14 Numbered Columns)
    const headers = [
      "Nº OP. (1)",
      "COD. CLIENTE (2)",
      "NOME COMPLETO (3)",
      "DATA DESEMBOLSO (4)",
      "VALOR CONCEDIDO (5)",
      "FINALIDADE/SECTOR (6)",
      "VALOR PRESTAÇÃO (7)",
      "PERIODICIDADE (8)",
      "PRAZO (9)",
      "TAXA (%) (10)",
      "CAPITAL EM DÍVIDA (11)",
      "CAPITAL EM ATRASO (12)",
      "DIAS ATRASO (13)",
      "PROVISÕES (14)",
    ];
    wsData.push(headers);

    let totalDisbursed = 0;
    let totalOutstanding = 0;
    let totalArrears = 0;

    data.forEach((item) => {
      wsData.push([
        item.contract_number,
        item.client_code || "N/A",
        item.client_name,
        new Date(item.disbursement_date),
        item.amount,
        item.purpose,
        item.installment_value,
        item.payment_frequency,
        item.term,
        item.interest_rate / 100, // Format as percent later
        item.outstanding_balance,
        item.arrears_amount,
        item.days_overdue,
        item.provisions > 0 ? item.provisions : 0,
      ]);

      totalDisbursed += item.amount;
      totalOutstanding += item.outstanding_balance;
      totalArrears += item.arrears_amount;
    });

    // 3. Totals (Footer)
    wsData.push([]);
    wsData.push([
      "TOTAIS GERAIS",
      "",
      "",
      "",
      totalDisbursed,
      "",
      "",
      "",
      "",
      "",
      totalOutstanding,
      totalArrears,
      "",
      "",
    ]);

    wsData.push([]);
    wsData.push([
      `Documento gerado automaticamente em: ${new Date().toLocaleString("pt-MZ")}`,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply formatting to cells
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];
        if (!cell) continue;

        // Header styling (Row 4 is headers index 4)
        if (R === 4) {
          // SheetJS basic styles aren't supported in all viewers without Pro,
          // but we ensure the content is clean.
        }

        // Value formatting
        if (typeof cell.v === "number") {
          // Columns 4, 6, 10, 11, 13 (Amounts)
          if ([4, 6, 10, 11, 13].includes(C) && R > 4) {
            cell.z = this.CURRENCY_FORMAT;
          }
          // Column 9 (Interest Rate)
          if (C === 9 && R > 4) {
            cell.z = this.PERCENT_FORMAT;
          }
        }

        // Date formatting (Column 3)
        if (cell.v instanceof Date) {
          cell.z = "dd/mm/yyyy";
        }
      }
    }

    // Column widths
    ws["!cols"] = [
      { wch: 15 }, // 1. Op Number
      { wch: 15 }, // 2. Client Code
      { wch: 40 }, // 3. Name
      { wch: 15 }, // 4. Disb Date
      { wch: 20 }, // 5. Disb Amount
      { wch: 25 }, // 6. Purpose
      { wch: 18 }, // 7. Installment
      { wch: 15 }, // 8. Frequency
      { wch: 10 }, // 9. Term
      { wch: 10 }, // 10. Rate
      { wch: 20 }, // 11. Outstanding
      { wch: 20 }, // 12. Arrears
      { wch: 12 }, // 13. Days
      { wch: 15 }, // 14. Provisions
    ];

    // Merges for main headers
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 13 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Carteira Mensal");
    XLSX.writeFile(
      wb,
      `Carteira_Credito_Mensal_${date.getMonth() + 1}_${date.getFullYear()}.xlsx`,
    );
  }
}
