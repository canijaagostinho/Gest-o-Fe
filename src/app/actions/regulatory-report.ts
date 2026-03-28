"use server";

import { createClient } from "@/utils/supabase/server";

export interface RegulatoryReportData {
  institution: {
    name: string;
    nuit: string;
    address: string;
    email: string;
    phone: string;
    employees: number;
    foundation_date: string;
    responsible_name: string;
    province: string;
    district: string;
    neighborhood: string;
  };
  portfolio: {
    total_clients: number;
    active_clients: number;
    gross_portfolio: number;
    net_portfolio: number;
    loans_in_arrears: number;
    par_30: number;
  };
  portfolio_risk?: {
    class_1: { capital: number; interest: number; total: number }; // 1-30 days (actually 0-30 in BoM terms usually means current + up to 30)
    class_2: { capital: number; interest: number; total: number }; // 31-90 days
    class_3: { capital: number; interest: number; total: number }; // 91-365 days
    class_4: { capital: number; interest: number; total: number }; // >365 days
    total: { capital: number; interest: number; total: number };
  };
  portfolio_sectors?: Record<string, number>;
  client_demographics?: {
    male: number;
    female: number;
    other: number;
    total: number;
  };
  financials: {
    disbursed: number;
    recovered: number;
    interest_earned: number;
    revenue: number;
    provisions: number;
  };
  financial_position?: {
    month_1: {
      cash: number;
      banks: number;
      other: number;
      total: number;
      date: string;
    };
    month_2: {
      cash: number;
      banks: number;
      other: number;
      total: number;
      date: string;
    };
    month_3: {
      cash: number;
      banks: number;
      other: number;
      total: number;
      date: string;
    };
  };
  interest_rates: {
    min: number;
    max: number;
  };
  terms: {
    min: number;
    max: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export async function getRegulatoryData(
  institutionId: string,
  startDate: string,
  endDate: string,
): Promise<RegulatoryReportData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: userData } = await supabase
    .from("users")
    .select("institution_id, role:roles(name)")
    .eq("id", user.id)
    .single();

  const userInstitutionId = userData?.institution_id;
  const isAdminGeral = (userData?.role as any)?.name === "admin_geral";

  // Security check: Ensure user can only access their own institution
  if (!isAdminGeral && userInstitutionId !== institutionId) {
    throw new Error("Unauthorized access to institution data");
  }

  // --- 1. Fetch Institution Details ---
  const { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("id", institutionId)
    .single();

  if (!institution) throw new Error("Institution not found");

  // Use provided range
  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate + "T23:59:59").toISOString();

  // 2. Fetch Clients & Loans
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", institutionId)
    .lte("created_at", endDateISO);

  const { data: loans } = await supabase
    .from("loans")
    .select("*, installments(*), client:clients(gender)")
    .eq("institution_id", institutionId)
    .lte("start_date", endDateISO);

  // Filter loans that were active at any point in the quarter
  const relevantLoans =
    loans?.filter((loan) => {
      const isLiquidatedBefore =
        loan.status === "liquidated" && loan.updated_at < startDateISO;
      return !isLiquidatedBefore;
    }) || [];

  const activeClientsCount = new Set(relevantLoans.map((l) => l.client_id))
    .size;
  const grossPortfolio = relevantLoans.reduce(
    (sum, loan) => sum + Number(loan.loan_amount),
    0,
  );

  // --- Risk Analysis & Provisions ---
  const riskData = {
    class_1: { capital: 0, interest: 0, total: 0 },
    class_2: { capital: 0, interest: 0, total: 0 },
    class_3: { capital: 0, interest: 0, total: 0 },
    class_4: { capital: 0, interest: 0, total: 0 },
  };

  relevantLoans.forEach((loan) => {
    let maxOverdueDays = 0;
    const installments = loan.installments || [];

    // Calculate overdue relative to end of period
    const referenceDate =
      new Date() > new Date(endDateISO) ? new Date(endDateISO) : new Date();

    installments.forEach((i: any) => {
      if (i.status !== "paid" && new Date(i.due_date) < referenceDate) {
        const diff = referenceDate.getTime() - new Date(i.due_date).getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        if (days > maxOverdueDays) maxOverdueDays = days;
      }
    });

    // Simple calculation of outstanding at end of quarter
    const paidByRef = installments
      .filter(
        (i: any) =>
          i.status === "paid" &&
          new Date(i.updated_at || referenceDate) <= referenceDate,
      )
      .reduce((sum: number, i: any) => sum + (Number(i.amount_paid) || 0), 0);

    let outstandingAtEnd = Number(loan.total_to_pay) - paidByRef;
    if (outstandingAtEnd < 0) outstandingAtEnd = 0;

    const capitalRatio = Number(loan.loan_amount) / Number(loan.total_to_pay);
    const capitalBal = outstandingAtEnd * capitalRatio;
    const interestBal = outstandingAtEnd - capitalBal;

    if (maxOverdueDays <= 30) {
      riskData.class_1.capital += capitalBal;
      riskData.class_1.interest += interestBal;
      riskData.class_1.total += outstandingAtEnd;
    } else if (maxOverdueDays <= 90) {
      riskData.class_2.capital += capitalBal;
      riskData.class_2.interest += interestBal;
      riskData.class_2.total += outstandingAtEnd;
    } else if (maxOverdueDays <= 365) {
      riskData.class_3.capital += capitalBal;
      riskData.class_3.interest += interestBal;
      riskData.class_3.total += outstandingAtEnd;
    } else {
      riskData.class_4.capital += capitalBal;
      riskData.class_4.interest += interestBal;
      riskData.class_4.total += outstandingAtEnd;
    }
  });

  const provisions =
    riskData.class_1.capital * 0.01 +
    riskData.class_2.capital * 0.1 +
    riskData.class_3.capital * 0.5 +
    riskData.class_4.capital * 1.0;

  // --- Sectors ---
  const sectors: Record<string, number> = {};
  relevantLoans.forEach((l) => {
    const p = l.purpose || "Outros";
    sectors[p] = (sectors[p] || 0) + Number(l.loan_amount);
  });

  // --- Demographics ---
  const demographics = {
    male: 0,
    female: 0,
    other: 0,
    total: activeClientsCount,
  };
  const uniqueClients = new Map();
  relevantLoans.forEach((l) => {
    if (!uniqueClients.has(l.client_id)) {
      uniqueClients.set(l.client_id, l.client?.gender);
    }
  });
  uniqueClients.forEach((gender) => {
    if (gender === "male") demographics.male++;
    else if (gender === "female") demographics.female++;
    else demographics.other++;
  });

  // --- Interest Rates & Terms ---
  const rates = relevantLoans.map((l) => Number(l.interest_rate));
  const terms = relevantLoans.map((l) => Number(l.term));

  // --- Dynamic Month Generation for Section 3.0 ---
  const getMonthData = async (date: Date) => {
    const mStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    ).toISOString();
    const mEnd = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
    ).toISOString();

    const { data: p } = await supabase
      .from("payments")
      .select("amount_paid")
      .eq("institution_id", institutionId)
      .gte("payment_date", mStart)
      .lte("payment_date", mEnd);
    const total = p?.reduce((s, curr) => s + Number(curr.amount_paid), 0) || 0;
    return {
      cash: total * 0.1,
      banks: total * 0.9,
      other: 0,
      total,
      date: mEnd,
    };
  };

  // Attempt to get data for the months within the range
  const start = new Date(startDateISO);
  const end = new Date(endDateISO);
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end && months.length < 3) {
    months.push(await getMonthData(current));
    current.setMonth(current.getMonth() + 1);
  }

  // Padding if less than 3 months
  while (months.length < 3) {
    months.push({ cash: 0, banks: 0, other: 0, total: 0, date: "" });
  }

  const { data: disbursedInQ } = await supabase
    .from("loans")
    .select("loan_amount")
    .eq("institution_id", institutionId)
    .gte("start_date", startDateISO)
    .lte("start_date", endDateISO);
  const disbursedAmount =
    disbursedInQ?.reduce((s, l) => s + Number(l.loan_amount), 0) || 0;

  const { data: recoveredInQ } = await supabase
    .from("payments")
    .select("amount_paid")
    .eq("institution_id", institutionId)
    .gte("payment_date", startDateISO)
    .lte("payment_date", endDateISO);
  const recoveredAmount =
    recoveredInQ?.reduce((s, p) => s + Number(p.amount_paid), 0) || 0;

  return {
    institution: {
      name: institution.name,
      nuit: institution.nuit || "N/A",
      address: institution.address || "N/A",
      email: institution.email || "N/A",
      phone: institution.phone || "N/A",
      employees: institution.number_of_employees || 0,
      foundation_date: institution.foundation_date || "",
      responsible_name: institution.responsible_name || "N/A",
      province: institution.province || "N/A",
      district: institution.district || "N/A",
      neighborhood: institution.neighborhood || "",
    },
    portfolio: {
      total_clients: totalClients || 0,
      active_clients: activeClientsCount,
      gross_portfolio: grossPortfolio,
      net_portfolio: grossPortfolio - provisions,
      loans_in_arrears: relevantLoans.filter((l) => {
        const overdue = (l.installments || []).some(
          (i: any) =>
            i.status !== "paid" && new Date(i.due_date) < new Date(endDateISO),
        );
        return overdue;
      }).length,
      par_30:
        grossPortfolio > 0
          ? ((riskData.class_2.total +
              riskData.class_3.total +
              riskData.class_4.total) /
              grossPortfolio) *
            100
          : 0,
    },
    portfolio_risk: {
      ...riskData,
      total: {
        capital:
          riskData.class_1.capital +
          riskData.class_2.capital +
          riskData.class_3.capital +
          riskData.class_4.capital,
        interest:
          riskData.class_1.interest +
          riskData.class_2.interest +
          riskData.class_3.interest +
          riskData.class_4.interest,
        total:
          riskData.class_1.total +
          riskData.class_2.total +
          riskData.class_3.total +
          riskData.class_4.total,
      },
    },
    portfolio_sectors: sectors,
    client_demographics: demographics,
    financials: {
      disbursed: disbursedAmount,
      recovered: recoveredAmount,
      interest_earned: recoveredAmount * 0.15,
      revenue: recoveredAmount * 0.15,
      provisions: provisions,
    },
    financial_position: {
      month_1: months[0],
      month_2: months[1],
      month_3: months[2],
    },
    interest_rates: { min: Math.min(...rates, 0), max: Math.max(...rates, 0) },
    terms: { min: Math.min(...terms, 0), max: Math.max(...terms, 0) },
    period: { startDate: startDateISO, endDate: endDateISO },
  };
}

export interface MonthlyPortfolioItem {
  client_code: string;
  client_name: string;
  contract_number: string;
  disbursement_date: string;
  maturity_date: string;
  amount: number;
  interest_rate: number;
  purpose: string;
  installment_value: number;
  payment_frequency: string;
  term: number;
  outstanding_balance: number;
  arrears_amount: number;
  days_overdue: number;
  risk_class: string;
  provisions: number;
}

export async function getMonthlyCreditPortfolio(
  institutionId: string,
  startDate: string,
  endDate: string,
  statusFilter: string = "all",
  purposeFilter: string = "all",
): Promise<{ data: MonthlyPortfolioItem[]; institution: any }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: userData } = await supabase
    .from("users")
    .select("institution_id, role:roles(name)")
    .eq("id", user.id)
    .single();

  const userInstitutionId = userData?.institution_id;
  const isAdminGeral = (userData?.role as any)?.name === "admin_geral";

  // Security check: Ensure user can only access their own institution
  if (!isAdminGeral && userInstitutionId !== institutionId) {
    throw new Error("Unauthorized access to institution data");
  }

  // Fetch Institution
  const { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("id", institutionId)
    .single();

  // Use provided range
  const startISO = new Date(startDate).toISOString();
  const endISO = new Date(endDate + "T23:59:59").toISOString();

  let query = supabase
    .from("loans")
    .select(
      `
            *,
            client:clients(full_name, code),
            installments(*)
        `,
    )
    .eq("institution_id", institutionId)
    .lte("start_date", endISO)
    .neq("status", "rejected");

  if (purposeFilter !== "all") {
    query = query.eq("purpose", purposeFilter);
  }

  const { data: loans } = await query;

  if (!loans) return { data: [], institution: institution || {} };

  const portfolio: MonthlyPortfolioItem[] = [];
  const today = new Date();

  loans.forEach((loan: any) => {
    // Skip liquidated if filtered by Active
    const isLiquidatedBefore =
      loan.status === "liquidated" && loan.updated_at <= endISO;
    const isLiquidated = loan.status === "liquidated" || isLiquidatedBefore;

    if (statusFilter === "active" && isLiquidated) return;
    if (statusFilter === "liquidated" && !isLiquidated) return;

    const paidAmount = loan.installments.reduce(
      (sum: number, i: any) => sum + (Number(i.amount_paid) || 0),
      0,
    );
    let outstandingBalance = Number(loan.total_to_pay) - paidAmount;
    if (outstandingBalance < 0) outstandingBalance = 0;

    // If filtering by "Active", usually means outstanding > 0.
    // However, "Liquidated" status is explicit.
    if (statusFilter === "active" && outstandingBalance <= 0) return;

    // Calculate Overdue
    let maxOverdueDays = 0;
    let arrearsAmount = 0;

    loan.installments.forEach((i: any) => {
      if (i.status !== "paid" && new Date(i.due_date) < new Date(endISO)) {
        const overdueTime =
          new Date(endISO).getTime() - new Date(i.due_date).getTime();
        const days = Math.ceil(overdueTime / (1000 * 3600 * 24));
        if (days > maxOverdueDays) maxOverdueDays = days;

        // Add to arrears amount (capital + interest of that installment)
        arrearsAmount += Number(i.amount) - (Number(i.amount_paid) || 0);
      }
    });

    if (statusFilter === "arrears" && maxOverdueDays === 0) return;

    // Risk Class & Provisions
    let riskClass = "Normal";
    let provisionRate = 0.01;

    if (maxOverdueDays > 365) {
      riskClass = "Perda (IV)";
      provisionRate = 1.0;
    } else if (maxOverdueDays > 90) {
      riskClass = "Duvidoso (III)";
      provisionRate = 0.5;
    } else if (maxOverdueDays > 30) {
      riskClass = "Sub-Standard (II)";
      provisionRate = 0.1;
    } else if (maxOverdueDays > 0) {
      riskClass = "Em Atraso (I)";
      provisionRate = 0.01;
    }

    const principalRatio = Number(loan.loan_amount) / Number(loan.total_to_pay);
    const capitalBalance = outstandingBalance * principalRatio;
    const provisions = capitalBalance * provisionRate;

    const sortedInstallments = loan.installments.sort(
      (a: any, b: any) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    );
    const maturityDate =
      sortedInstallments.length > 0
        ? sortedInstallments[sortedInstallments.length - 1].due_date
        : loan.start_date;

    // Installment Value - Take value from first installment or calculate average?
    // Usually fixed. Let's take the first one.
    const installmentValue =
      sortedInstallments.length > 0 ? Number(sortedInstallments[0].amount) : 0;

    const frequencyMap: Record<string, string> = {
      daily: "Diário",
      weekly: "Semanal",
      "bi-weekly": "Quinzenal",
      monthly: "Mensal",
      quarterly: "Trimestral",
      "semi-annually": "Semestral",
      yearly: "Anual",
    };

    portfolio.push({
      client_code: loan.client?.code || "N/A",
      client_name: loan.client?.full_name || "Desconhecido",
      contract_number:
        loan.contract_number || loan.id.substring(0, 8).toUpperCase(),
      disbursement_date: loan.start_date,
      maturity_date: maturityDate,
      amount: Number(loan.loan_amount),
      interest_rate: Number(loan.interest_rate),
      purpose: loan.purpose || "Outros",
      installment_value: installmentValue,
      payment_frequency:
        frequencyMap[loan.payment_frequency] || loan.payment_frequency,
      term: Number(loan.term),
      outstanding_balance: outstandingBalance,
      arrears_amount: arrearsAmount,
      days_overdue: maxOverdueDays,
      risk_class: riskClass,
      provisions: provisions,
    });
  });

  return {
    data: portfolio,
    institution: institution
      ? {
          name: institution.name,
          address: institution.address || institution.address_line,
          nuit: institution.nuit,
          email: institution.email,
          phone: institution.phone,
          logo_url: institution.logo_url,
          primary_color: institution.primary_color,
        }
      : {},
  };
}
