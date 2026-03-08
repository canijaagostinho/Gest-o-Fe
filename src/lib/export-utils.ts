import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Export data to a PDF file with a table
 */
export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  fileName: string = "relatorio.pdf",
) => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-MZ")}`, 14, 30);

  // Add Table
  doc.autoTable({
    startY: 40,
    head: [headers],
    body: data,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // blue-600
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    margin: { top: 40 },
  });

  doc.save(fileName);
};

/**
 * Export data to an Excel file with basic formatting
 */
export const exportToExcel = (
  data: any[],
  fileName: string = "relatorio.xlsx",
  sheetName: string = "Relatório",
) => {
  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Auto-calculate column widths
  const objectMaxLength: number[] = [];
  data.forEach((row) => {
    Object.values(row).forEach((val, i) => {
      const columnValue = val ? val.toString() : "";
      objectMaxLength[i] = Math.max(
        objectMaxLength[i] || 10,
        columnValue.length + 2,
      );
    });
  });

  worksheet["!cols"] = objectMaxLength.map((w) => ({ wch: Math.min(w, 50) }));

  // Apply number formats for currency-like values
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
      if (!cell) continue;

      if (typeof cell.v === "number") {
        // If the number is large or has decimals, default to a cleaner format
        if (Math.abs(cell.v) > 100) {
          cell.z = "#,##0.00";
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

/**
 * Trigger print for a specific section
 */
export const printReport = (elementId: string) => {
  const printContents = document.getElementById(elementId)?.innerHTML;
  if (!printContents) return;

  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // Reload to restore React bindings
};
