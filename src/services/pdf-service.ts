import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import { RegulatoryReportData } from "@/app/actions/regulatory-report";

export interface InstitutionProfile {
  name: string;
  address?: string;
  nuit?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  primary_color?: string;
}

export interface ClientProfile {
  full_name: string;
  document_id?: string; // BI/Nuit
  phone?: string;
  email?: string;
  address?: string;
}

export interface PaymentReceiptData {
  id: string;
  amount: number;
  date: Date;
  method: string; // M-Pesa, Transfer, Cash
  reference?: string;
  loan_id?: string;
}

export class PDFService {
  private doc: jsPDF;
  private institution: InstitutionProfile;
  private primaryColor: [number, number, number] = [37, 99, 235]; // Default Blue-600

  constructor(institution: InstitutionProfile) {
    this.doc = new jsPDF();
    this.institution = institution;
    if (institution.primary_color) {
      this.primaryColor = this.hexToRgb(institution.primary_color);
    }
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [37, 99, 235];
  }

  private async loadImage(url: string): Promise<string> {
    if (!url) return "";
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error loading image", error);
      return "";
    }
  }

  private async drawHeader() {
    const doc = this.doc;
    const { name, nuit, address, phone, email, website, logo_url } =
      this.institution;

    // Logo
    if (logo_url) {
      const base64Img = await this.loadImage(logo_url);
      if (base64Img) {
        // Add Image (x, y, w, h)
        try {
          doc.addImage(base64Img, "PNG", 15, 10, 25, 25);
        } catch (e) {
          console.warn("Could not add image", e);
        }
      }
    }

    // Institution Info (Aligned to Logo or Left)
    const textX = logo_url ? 45 : 15;

    // Name
    const safeName = (name || "Instituição").toUpperCase();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    doc.text(safeName, textX, 20);

    // Sub-details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // Slate-600

    let currentY = 26;

    if (nuit) {
      doc.text(`NUIT: ${nuit}`, textX, currentY);
      currentY += 5;
    }

    if (address) {
      const safeAddress = String(address);
      const splitAddress = doc.splitTextToSize(safeAddress, 100);
      doc.text(splitAddress, textX, currentY);
      currentY += 5 * splitAddress.length;
    }

    if (phone) {
      doc.text(`Tel: ${phone}`, textX, currentY);
      currentY += 5;
    }

    if (email) {
      doc.text(`Email: ${email}`, textX, currentY);
      currentY += 5;
    }

    if (website) {
      doc.text(`Site: ${website}`, textX, currentY);
      currentY += 5;
    }

    // Design Line
    doc.setDrawColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    doc.setLineWidth(0.5);
    doc.line(15, currentY + 5, 195, currentY + 5);

    return currentY + 15; // Return formatted Y position for next content
  }

  private drawFooter() {
    const doc = this.doc;
    const pageHeight = doc.internal.pageSize.height;

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.1);
    doc.line(15, pageHeight - 20, 195, pageHeight - 20);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400

    // Left
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-MZ")}`,
      15,
      pageHeight - 10,
    );


  }

  public async generatePaymentReceipt(
    payment: PaymentReceiptData,
    client: ClientProfile,
  ) {
    const doc = this.doc;
    const startY = await this.drawHeader();

    const safeAmount = isNaN(Number(payment.amount))
      ? 0
      : Number(payment.amount);

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("RECIBO DE PAGAMENTO", 105, startY, { align: "center" });

    // Receipt ID Pill
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const safeId = payment.id
      ? payment.id.toString().slice(0, 8).toUpperCase()
      : "????";
    doc.text(`#${safeId}`, 105, startY + 7, { align: "center" });

    let currentY = startY + 25;

    // Two Columns Layout
    // Left: Client Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text("DADOS DO CLIENTE", 15, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42); // Slate-900

    currentY += 8;
    doc.text(client.full_name || "Cliente Sem Nome", 15, currentY);
    currentY += 6;
    if (client.document_id) {
      doc.setTextColor(100, 116, 139);
      doc.text(`ID: ${client.document_id}`, 15, currentY);
      currentY += 6;
    }
    if (client.phone) {
      doc.text(`Tel: ${client.phone}`, 15, currentY);
    }

    // Right: Payment Details (Using a Table for cleanliness)
    autoTable(doc, {
      startY: startY + 20,
      margin: { left: 100 },
      head: [["Detalhe", "Informação"]],
      body: [
        ["Valor Pago", formatCurrency(safeAmount)],
        [
          "Data",
          `${payment.date.toLocaleDateString("pt-MZ")} ${payment.date.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`,
        ],
        ["Método", payment.method],
        ["Referência", payment.reference || "-"],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [248, 250, 252], // Slate-50
        textColor: [71, 85, 105], // Slate-600
        fontStyle: "bold",
        lineColor: [226, 232, 240], // Slate-200
        lineWidth: 0.1,
      },
      styles: {
        textColor: [51, 65, 85], // Slate-700
        fontSize: 10,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 50 },
      },
    });

    // Summary / Total Box
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFillColor(241, 245, 249); // Slate-100
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, finalY, 180, 30, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("VALOR TOTAL RECEBIDO", 105, finalY + 10, { align: "center" });

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    doc.text(formatCurrency(safeAmount), 105, finalY + 22, { align: "center" });

    // Footer
    this.drawFooter();

    // Save
    doc.save(`Recibo_${payment.id.slice(0, 8)}.pdf`);
  }

  public async generateInstallmentGuide(
    loan: any,
    installment: any,
    client: ClientProfile,
  ) {
    const doc = this.doc;
    const startY = await this.drawHeader();

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("GUIA DE PAGAMENTO", 105, startY, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Parcela Nº ${installment.installment_number}`, 105, startY + 7, {
      align: "center",
    });

    let currentY = startY + 25;

    // Client and Loan Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("DADOS DO CLIENTE", 15, currentY);

    doc.text("DETALHES DO EMPRÉSTIMO", 105, currentY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    currentY += 8;

    // Client Column
    doc.text(client.full_name || "N/A", 15, currentY);
    currentY += 6;
    doc.text(`ID: ${client.document_id || "N/A"}`, 15, currentY);
    currentY += 6;
    doc.text(`Tel: ${client.phone || "N/A"}`, 15, currentY);

    // Loan Column (reset Y for loan info)
    let loanY = startY + 25 + 8;
    doc.text(`Contrato: #${loan.id.slice(0, 8).toUpperCase()}`, 105, loanY);
    loanY += 6;
    doc.text(`Data do Contrato: ${new Date(loan.created_at).toLocaleDateString("pt-MZ")}`, 105, loanY);
    loanY += 6;
    doc.text(`Taxa: ${loan.interest_rate}%`, 105, loanY);

    currentY = Math.max(currentY, loanY) + 15;

    // Table with Installment Details
    autoTable(doc, {
      startY: currentY,
      head: [["Descrição", "Vencimento", "Valor Original", "Multas/Mora", "Total a Pagar"]],
      body: [
        [
          `Parcela ${installment.installment_number}`,
          new Date(installment.due_date).toLocaleDateString("pt-MZ"),
          formatCurrency(installment.amount),
          "A calcular no momento do pagamento",
          formatCurrency(installment.amount),
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right", fontStyle: "bold" },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // Instructions Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, currentY, 180, 40, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("INSTRUÇÕES PARA PAGAMENTO", 20, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("1. Este documento serve apenas como guia para pagamento de prestação.", 20, currentY + 18);
    doc.text("2. O valor total pode sofrer alterações devido a multas por atraso.", 20, currentY + 24);
    doc.text("3. Após o pagamento, exija o seu recibo definitivo processado pelo sistema.", 20, currentY + 30);
    doc.text("4. Pagamentos via M-Pesa/Transferência devem incluir a referência do contrato.", 20, currentY + 36);

    // Footer lines
    this.drawFooter();

    // Save
    doc.save(`Guia_Pagamento_${loan.id.slice(0, 8)}_P${installment.installment_number}.pdf`);
  }

  public async generateFinancialReport(
    summary: { totalLent: number; totalReceived: number; balance: number },
    items: {
      date: Date;
      description: string;
      value: number;
      type: "in" | "out";
    }[],
    period: string,
  ) {
    const doc = this.doc;
    const startY = await this.drawHeader();

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("RELATÓRIO FINANCEIRO", 105, startY, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(period, 105, startY + 7, { align: "center" });

    let currentY = startY + 20;

    // Summary Cards (Simulated with simple Rectangles)
    const summaryY = currentY;
    const cardWidth = 55;
    // Card 1: Lent
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, summaryY, cardWidth, 25, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL EMPRESTADO", 15 + cardWidth / 2, summaryY + 8, {
      align: "center",
    });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(
      formatCurrency(summary.totalLent),
      15 + cardWidth / 2,
      summaryY + 18,
      { align: "center" },
    );

    // Card 2: Received
    doc.setFillColor(240, 253, 244); // Emerald-50
    doc.roundedRect(15 + cardWidth + 7.5, summaryY, cardWidth, 25, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61); // Emerald-700
    doc.text(
      "TOTAL RECEBIDO",
      15 + cardWidth + 7.5 + cardWidth / 2,
      summaryY + 8,
      { align: "center" },
    );
    doc.setFontSize(14);
    doc.text(
      formatCurrency(summary.totalReceived),
      15 + cardWidth + 7.5 + cardWidth / 2,
      summaryY + 18,
      { align: "center" },
    );

    // Card 3: Balance
    doc.setFillColor(254, 242, 242); // Rose-50
    doc.roundedRect(
      15 + cardWidth * 2 + 15,
      summaryY,
      cardWidth,
      25,
      2,
      2,
      "F",
    );
    doc.setFontSize(8);
    doc.setTextColor(190, 18, 60); // Rose-700
    doc.text(
      "SALDO A RECEBER",
      15 + cardWidth * 2 + 15 + cardWidth / 2,
      summaryY + 8,
      { align: "center" },
    );
    doc.setFontSize(14);
    doc.text(
      formatCurrency(summary.balance),
      15 + cardWidth * 2 + 15 + cardWidth / 2,
      summaryY + 18,
      { align: "center" },
    );

    currentY += 40;

    // Table
    autoTable(doc, {
      startY: currentY,
      head: [["Data", "Descrição", "Tipo", "Valor"]],
      body: items.map((item) => [
        item.date.toLocaleDateString("pt-MZ"),
        item.description,
        item.type === "in" ? "Entrada" : "Saída",
        formatCurrency(item.value),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        3: { halign: "right", fontStyle: "bold" },
      },
    });

    this.drawFooter();
    doc.save(`Relatorio_Financeiro_${period.replace(/\s/g, "_")}.pdf`);
  }

  public async generateClientStatement(
    client: ClientProfile,
    loans: {
      id: string;
      amount: number;
      amount_paid: number;
      status: string;
      start_date: Date;
    }[],
    summary: { totalBorrowed: number; totalPaid: number; debt: number },
  ) {
    const doc = this.doc;
    const startY = await this.drawHeader();

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("FICHA FINANCEIRA DO CLIENTE", 105, startY, { align: "center" });

    let currentY = startY + 20;

    // Client Info Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, currentY, 180, 25, 2, 2, "FD");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(client.full_name.toUpperCase(), 20, currentY + 10);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    let infoX = 20;
    if (client.document_id) {
      doc.text(`ID: ${client.document_id}`, infoX, currentY + 18);
      infoX += 60;
    }
    if (client.phone) {
      doc.text(`Tel: ${client.phone}`, infoX, currentY + 18);
    }

    currentY += 40;

    // Summary Cards
    const cardWidth = 55;
    // Total Borrowed
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, currentY, cardWidth, 20, 2, 2, "F");
    doc.setFontSize(8);
    doc.text("TOTAL EMPRESTADO", 15 + cardWidth / 2, currentY + 7, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(
      formatCurrency(summary.totalBorrowed),
      15 + cardWidth / 2,
      currentY + 16,
      { align: "center" },
    );

    // Total Paid
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15 + cardWidth + 7.5, currentY, cardWidth, 20, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.text("TOTAL PAGO", 15 + cardWidth + 7.5 + cardWidth / 2, currentY + 7, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(
      formatCurrency(summary.totalPaid),
      15 + cardWidth + 7.5 + cardWidth / 2,
      currentY + 16,
      { align: "center" },
    );

    // Debt
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(
      15 + cardWidth * 2 + 15,
      currentY,
      cardWidth,
      20,
      2,
      2,
      "F",
    );
    doc.setFontSize(8);
    doc.setTextColor(190, 18, 60);
    doc.text(
      "DÍVIDA ATUAL",
      15 + cardWidth * 2 + 15 + cardWidth / 2,
      currentY + 7,
      { align: "center" },
    );
    doc.setFontSize(12);
    doc.text(
      formatCurrency(summary.debt),
      15 + cardWidth * 2 + 15 + cardWidth / 2,
      currentY + 16,
      { align: "center" },
    );

    currentY += 35;

    // Loan History Table
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Histórico de Empréstimos", 15, currentY - 5);

    autoTable(doc, {
      startY: currentY,
      head: [["Data", "ID", "Status", "Valor", "Pago"]],
      body: loans.map((loan) => [
        loan.start_date.toLocaleDateString("pt-MZ"),
        loan.id.slice(0, 8),
        loan.status === "active"
          ? "Ativo"
          : loan.status === "paid"
            ? "Pago"
            : "Atrasado",
        formatCurrency(loan.amount),
        formatCurrency(loan.amount_paid),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });

    this.drawFooter();
    doc.save(`Ficha_Cliente_${client.full_name.replace(/\s/g, "_")}.pdf`);
  }
  public async generateLoanListReport(loans: any[]) {
    const doc = this.doc;
    const startY = await this.drawHeader();

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("RELATÓRIO DE EMPRÉSTIMOS", 105, startY, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Total de Registros: ${loans.length}`, 105, startY + 7, {
      align: "center",
    });

    const tableData = loans.map((loan: any) => {
      const totalPaid =
        loan.installments?.reduce(
          (acc: number, curr: any) => acc + (Number(curr.amount_paid) || 0),
          0,
        ) || 0;

      return [
        loan.clients?.full_name || "N/A",
        formatCurrency(loan.loan_amount),
        formatCurrency(loan.total_to_pay),
        formatCurrency(totalPaid),
        loan.status === "active"
          ? "Ativo"
          : loan.status === "completed"
            ? "Finalizado"
            : "Inadimplente",
        new Date(loan.start_date || loan.created_at).toLocaleDateString(
          "pt-MZ",
        ),
      ];
    });

    autoTable(doc, {
      startY: startY + 15,
      head: [["Cliente", "Principal", "Total", "Pago", "Status", "Início"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    this.drawFooter();
    doc.save(
      `Relatorio_Emprestimos_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  }

  public async generateRegulatoryReport(data: RegulatoryReportData) {
    const doc = this.doc;
    const startY = await this.drawHeader();

    // Report Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("RELATÓRIO TRIMESTRAL (XdM)", 105, startY, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const d1 = new Date(data.period.startDate).toLocaleDateString("pt-MZ");
    const d2 = new Date(data.period.endDate).toLocaleDateString("pt-MZ");
    doc.text(`Período de ${d1} a ${d2}`, 105, startY + 6, { align: "center" });

    let currentY = startY + 15;

    // Values in Meticais Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("(Valores em Meticais)", 195, currentY, { align: "right" });
    currentY += 5;

    // --- 1. DADOS DA INSTITUIÇÃO ---
    autoTable(doc, {
      startY: currentY,
      head: [["1. DADOS DA INSTITUIÇÃO", ""]],
      body: [
        ["Nome Comercial", data.institution.name],
        ["NUIT", data.institution.nuit],
        [
          "Endereço Sede",
          `${data.institution.address}${data.institution.neighborhood ? `, Bairro ${data.institution.neighborhood}` : ""}`,
        ],
        ["Província", data.institution.province],
        ["Distrito / Cidade", data.institution.district],
        ["Email", data.institution.email],
        ["Telefone", data.institution.phone],
        ["Nº de Trabalhadores", data.institution.employees.toString()],
        [
          "Início de Atividades",
          data.institution.foundation_date
            ? new Date(data.institution.foundation_date).toLocaleDateString(
                "pt-MZ",
              )
            : "N/A",
        ],
        ["Responsável", data.institution.responsible_name],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;

    // --- 2. INFORMAÇÕES SOBRE A ACTIVIDADE ---
    // 2.1 CARTEIRA DE CRÉDITO
    autoTable(doc, {
      startY: currentY,
      head: [
        ["2.1 CARTEIRA DE CRÉDITO", "Capital (1)", "Juro (2)", "TOTAL (3)"],
      ],
      body: [
        [
          "Montante de créditos concedidos no período",
          formatCurrency(data.financials.disbursed),
          "0,00",
          formatCurrency(data.financials.disbursed),
        ],
        [
          "Montante de créditos reembolsados no período",
          formatCurrency(data.financials.recovered * 0.8),
          formatCurrency(data.financials.recovered * 0.2),
          formatCurrency(data.financials.recovered),
        ],
        [
          "Montante da carteira de crédito activa/vigente",
          formatCurrency(data.portfolio.gross_portfolio),
          "0,00",
          formatCurrency(data.portfolio.gross_portfolio),
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 90 },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 2.1.3 Créditos por Sector
    const sectorRows = Object.entries(data.portfolio_sectors || {}).map(
      ([sector, amount]) => [sector, formatCurrency(amount)],
    );
    autoTable(doc, {
      startY: currentY,
      head: [
        [
          "2.1.3 Créditos concedidos por sector de actividade/finalidade",
          "Montante (4)",
        ],
      ],
      body: [
        ...sectorRows,
        ["TOTAL", formatCurrency(data.portfolio.gross_portfolio)],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
      didParseCell: (d) => {
        if (d.row.index === sectorRows.length) d.cell.styles.fontStyle = "bold";
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 2.1.5 Estrutura da Carteira em Risco
    const r = data.portfolio_risk!;
    autoTable(doc, {
      startY: currentY,
      head: [
        [
          "2.1.5 Estrutura da Carteira em Risco",
          "Capital (12)",
          "Juro (13)",
          "TOTAL",
        ],
      ],
      body: [
        [
          "Classe I (de 1 até 30 dias)",
          formatCurrency(r.class_1.capital),
          formatCurrency(r.class_1.interest),
          formatCurrency(r.class_1.total),
        ],
        [
          "Classe II (de 31 até 90 dias)",
          formatCurrency(r.class_2.capital),
          formatCurrency(r.class_2.interest),
          formatCurrency(r.class_2.total),
        ],
        [
          "Classe III (de 91 a 365 dias)",
          formatCurrency(r.class_3.capital),
          formatCurrency(r.class_3.interest),
          formatCurrency(r.class_3.total),
        ],
        [
          "Classe IV (mais de 365 dias)",
          formatCurrency(r.class_4.capital),
          formatCurrency(r.class_4.interest),
          formatCurrency(r.class_4.total),
        ],
        [
          "TOTAL",
          formatCurrency(r.total.capital),
          formatCurrency(r.total.interest),
          formatCurrency(r.total.total),
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right", fontStyle: "bold" },
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 2.2 TAXAS DE JURO
    autoTable(doc, {
      startY: currentY,
      head: [["2.2 TAXAS DE JURO E PRAZOS", "Mínimo", "Máximo"]],
      body: [
        [
          "Taxa de juro mensal (%)",
          `${data.interest_rates.min}%`,
          `${data.interest_rates.max}%`,
        ],
        ["Prazo (Meses)", data.terms.min.toString(), data.terms.max.toString()],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: { 1: { halign: "center" }, 2: { halign: "center" } },
    });

    // Final Page - Financial Position
    doc.addPage();
    currentY = 20;
    doc.setFont("helvetica", "bold");
    doc.text("3. SITUAÇÃO FINANCEIRA DA OPERADORA", 15, currentY);
    currentY += 5;

    const f = data.financial_position!;
    autoTable(doc, {
      startY: currentY,
      head: [["Descrição", "Mês 1", "Mês 2", "Mês 3"]],
      body: [
        [
          "Caixa",
          formatCurrency(f.month_1.cash),
          formatCurrency(f.month_2.cash),
          formatCurrency(f.month_3.cash),
        ],
        [
          "Bancos",
          formatCurrency(f.month_1.banks),
          formatCurrency(f.month_2.banks),
          formatCurrency(f.month_3.banks),
        ],
        [
          "Outros Activos",
          formatCurrency(f.month_1.other),
          formatCurrency(f.month_2.other),
          formatCurrency(f.month_3.other),
        ],
        [
          "TOTAL",
          formatCurrency(f.month_1.total),
          formatCurrency(f.month_2.total),
          formatCurrency(f.month_3.total),
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });

    // Signatures
    currentY = (doc as any).lastAutoTable.finalY + 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.line(20, currentY, 90, currentY);
    doc.text("O Contabilista", 55, currentY + 5, { align: "center" });
    doc.line(110, currentY, 180, currentY);
    doc.text("A Gerência", 145, currentY + 5, { align: "center" });

    this.drawFooter();
    const f1 = data.period.startDate.split("T")[0];
    const f2 = data.period.endDate.split("T")[0];
    doc.save(
      `Relatorio_Regulamentar_${data.institution.name}_${f1}_a_${f2}.pdf`,
    );
  }

  public async generateMonthlyPortfolioReport(
    data: any[],
    date: Date,
    institutionName: string,
  ) {
    const doc = this.doc;
    const startY = await this.drawHeader();

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("CARTEIRA DE CRÉDITO MENSAL", 105, startY, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(
      date
        .toLocaleDateString("pt-MZ", { month: "long", year: "numeric" })
        .toUpperCase(),
      105,
      startY + 6,
      { align: "center" },
    );

    // Columns
    const columns = [
      { header: "Op", dataKey: "contract_number" },
      { header: "Cód.", dataKey: "client_code" },
      { header: "Cliente", dataKey: "client_name" },
      { header: "Desemb.", dataKey: "disbursement_date" },
      { header: "Valor", dataKey: "amount" },
      { header: "Fim", dataKey: "purpose" },
      { header: "Prest.", dataKey: "installment_value" },
      { header: "Freq", dataKey: "payment_frequency" },
      { header: "Pz", dataKey: "term" },
      { header: "Tx", dataKey: "interest_rate" },
      { header: "Dívida", dataKey: "outstanding_balance" },
      { header: "Atraso", dataKey: "arrears_amount" },
      { header: "Dias", dataKey: "days_overdue" },
      { header: "PPEs", dataKey: "provisions" },
    ];

    // Transform Data
    let totalDisbursed = 0;
    let totalOutstanding = 0;
    let totalArrears = 0;

    const tableData = data.map((item) => {
      totalDisbursed += item.amount;
      totalOutstanding += item.outstanding_balance;
      totalArrears += item.arrears_amount;

      return {
        contract_number: item.contract_number,
        client_code: item.client_code || "-",
        client_name: item.client_name.substring(0, 20), // Truncate name to fit
        disbursement_date: new Date(item.disbursement_date).toLocaleDateString(
          "pt-MZ",
        ),
        amount: formatCurrency(item.amount),
        purpose: item.purpose.substring(0, 8),
        installment_value: formatCurrency(item.installment_value),
        payment_frequency: item.payment_frequency.substring(0, 3), // e.g. Men
        term: item.term,
        interest_rate: `${item.interest_rate}%`,
        outstanding_balance: formatCurrency(item.outstanding_balance),
        arrears_amount: formatCurrency(item.arrears_amount),
        days_overdue: item.days_overdue,
        provisions: item.provisions > 0 ? formatCurrency(item.provisions) : "-",
      };
    });

    // Add Totals Row
    tableData.push({
      contract_number: "TOTAL",
      client_code: "",
      client_name: "",
      disbursement_date: "",
      amount: formatCurrency(totalDisbursed),
      purpose: "",
      installment_value: "",
      payment_frequency: "",
      term: "", // Changed to empty string to fix type error if any, though any is used
      interest_rate: "",
      outstanding_balance: formatCurrency(totalOutstanding),
      arrears_amount: formatCurrency(totalArrears),
      days_overdue: "", // Changed
      provisions: "", // Changed
    } as any);

    autoTable(doc, {
      startY: startY + 15,
      columns: columns,
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200], // Grey Header
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 6,
      },
      styles: {
        fontSize: 5, // Smaller font to fit 14 columns
        cellPadding: 1,
        lineColor: [0, 0, 0], // Full borders
        lineWidth: 0.1,
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 10 }, // Op
        1: { cellWidth: 10 }, // Code
        2: { cellWidth: 25 }, // Name
        3: { cellWidth: 12, halign: "center" }, // Date
        4: { cellWidth: 14, halign: "right" }, // Amount
        5: { cellWidth: 10 }, // Purpose
        6: { cellWidth: 12, halign: "right" }, // Installment
        7: { cellWidth: 8 }, // Freq
        8: { cellWidth: 6, halign: "center" }, // Term
        9: { cellWidth: 6, halign: "center" }, // Rate
        10: { cellWidth: 14, halign: "right" }, // Outstanding
        11: { cellWidth: 14, halign: "right" }, // Arrears
        12: { cellWidth: 6, halign: "center" }, // Days
        13: { cellWidth: 10, halign: "right" }, // PPEs
      },
      didParseCell: (data) => {
        // Bold Total Row to mimic footer
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // Signatures
    const currentY = (doc as any).lastAutoTable.finalY + 30;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.line(20, currentY, 90, currentY);
    doc.text("O Contabilista", 55, currentY + 5, { align: "center" });

    doc.line(110, currentY, 180, currentY);
    doc.text("A Gerência", 145, currentY + 5, { align: "center" });

    this.drawFooter();
    doc.save(
      `Carteira_Mensal_${date.getMonth() + 1}_${date.getFullYear()}.pdf`,
    );
  }
}
