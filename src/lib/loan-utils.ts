export type InterestType = "simple" | "compound";
export type Frequency =
  | "daily"
  | "weekly"
  | "bi-weekly"
  | "monthly"
  | "quarterly"
  | "semi-annually"
  | "yearly";

export interface LoanSimulation {
  totalToPay: number;
  totalInterest: number;
  principal: number;
  installmentAmount: number;
  installments: Array<{
    number: number;
    dueDate: Date;
    amount: number;
  }>;
}

export function calculateLoan(
  amount: number,
  rate: number, // percentage per period
  term: number, // number of installments
  frequency: Frequency,
  interestType: InterestType,
  startDate: Date = new Date(),
): LoanSimulation {
  let totalToPay = 0;
  let installmentAmount = 0;
  let totalInterest = 0;

  // Precision helper: Round to 2 decimals
  const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  if (interestType === "simple") {
    // User Formula: Juros = Principal x Taxa x Prazo
    // Note: Rate is treated as % per period (month/week)
    totalInterest = round(amount * (rate / 100) * term);
    totalToPay = round(amount + totalInterest);

    // Base Installment
    installmentAmount = round(totalToPay / term);
  } else {
    // Compound: PMT = P * (r(1+r)^n) / ((1+r)^n - 1)
    const r = rate / 100;
    if (r === 0 || term === 0) {
      totalToPay = amount;
      installmentAmount = round(amount / term);
      totalInterest = 0;
    } else {
      const pmt =
        (amount * (r * Math.pow(1 + r, term))) / (Math.pow(1 + r, term) - 1);
      installmentAmount = round(pmt);
      totalToPay = round(installmentAmount * term);
      totalInterest = round(totalToPay - amount);
    }
  }

  const installments = [];
  let runningTotal = 0;

  for (let i = 1; i <= term; i++) {
    const dueDate = new Date(startDate);
    if (frequency === "daily") {
      dueDate.setDate(dueDate.getDate() + i); // Daily interaction
    } else if (frequency === "weekly") {
      dueDate.setDate(dueDate.getDate() + i * 7);
    } else if (frequency === "bi-weekly") {
      dueDate.setDate(dueDate.getDate() + i * 15); // Roughly 15 days, or 2 weeks? Using 15 days as standard.
    } else if (frequency === "monthly") {
      dueDate.setMonth(dueDate.getMonth() + i);
    } else if (frequency === "quarterly") {
      dueDate.setMonth(dueDate.getMonth() + i * 3);
    } else if (frequency === "semi-annually") {
      dueDate.setMonth(dueDate.getMonth() + i * 6);
    } else if (frequency === "yearly") {
      dueDate.setFullYear(dueDate.getFullYear() + i);
    }

    // Adjust last installment to match TotalToPay exactly
    let currentAmount = installmentAmount;
    if (i === term) {
      const remainder = round(totalToPay - runningTotal);
      // Only adjust if remainder is positive and reasonable (close to installment amount)
      // If simple interest logic was used, simpler to just force the remainder.
      currentAmount = remainder;
    }

    runningTotal += currentAmount;

    installments.push({
      number: i,
      dueDate,
      amount: currentAmount,
    });
  }

  return {
    totalToPay,
    totalInterest,
    principal: amount,
    installmentAmount, // Base installment amount
    installments,
  };
}

export function calculateLateFee(
  installmentAmount: number,
  dueDate: Date,
  currentDate: Date = new Date(),
  fineRate: number = 2, // Fixed fine percentage
  moraRate: number = 1, // Daily mora percentage
): {
  totalFine: number;
  fixedFine: number;
  dailyMora: number;
  daysOverdue: number;
} {
  const due = new Date(dueDate);
  const now = new Date(currentDate);

  // Normalize to start of day
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (now <= due)
    return { totalFine: 0, fixedFine: 0, dailyMora: 0, daysOverdue: 0 };

  const diffTime = Math.abs(now.getTime() - due.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Fixed Fine: Applied once if late
  const fixedFine = installmentAmount * (fineRate / 100);

  // Daily Mora: Applied per day of delay
  const dailyMora = installmentAmount * (moraRate / 100) * diffDays;

  const totalFine =
    Math.round((fixedFine + dailyMora + Number.EPSILON) * 100) / 100;

  return {
    totalFine,
    fixedFine: Math.round(fixedFine * 100) / 100,
    dailyMora: Math.round(dailyMora * 100) / 100,
    daysOverdue: diffDays,
  };
}
