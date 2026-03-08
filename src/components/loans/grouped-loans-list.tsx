"use client";

import { Loan } from "@/app/(dashboard)/loans/columns";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LoanCellAction } from "@/app/(dashboard)/loans/loan-cell-action";
import { isToday, isYesterday, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Calendar, Shield, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface GroupedLoansListProps {
  loans: Loan[];
  userRole?: string;
}

export function GroupedLoansList({ loans, userRole }: GroupedLoansListProps) {
  if (!loans?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed shadow-sm">
        <FileText className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">
          Nenhum empréstimo encontrado
        </h3>
        <p className="text-sm mt-1">
          Ajuste os filtros ou crie um novo empréstimo.
        </p>
      </div>
    );
  }

  // Group loans by date
  const groupedLoans = loans.reduce((groups: Record<string, Loan[]>, loan) => {
    const date = parseISO(loan.created_at);
    let groupKey = "";

    if (isToday(date)) {
      groupKey = "Hoje";
    } else if (isYesterday(date)) {
      groupKey = "Ontem";
    } else {
      // Capitalize first letter
      const formatted = format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
      groupKey = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(loan);
    return groups;
  }, {});

  // Check if a loan has overdue installments
  const getDynamicStatus = (loan: any) => {
    // If it's already definitively cancelled or completed, keep it
    if (loan.status === "cancelled" || loan.status === "completed") {
      return loan.status;
    }

    // If it's active or pending, check installments
    if (loan.installments && Array.isArray(loan.installments)) {
      const today = new Date().toISOString().split("T")[0];
      const hasOverdue = loan.installments.some(
        (i: any) => i.status !== "paid" && i.due_date < today,
      );

      if (hasOverdue) return "delinquent";
    }

    return loan.status;
  };

  const getStatusConfig = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pendente",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      active: {
        label: "Ativo",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      completed: {
        label: "Pago",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      cancelled: {
        label: "Cancelado",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      },
      delinquent: {
        label: "Atrasado",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      },
    };
    return (
      variants[status] || {
        label: status,
        className: "bg-slate-100 text-slate-600",
      }
    );
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedLoans).map(([dateLabel, dayLoans], groupIndex) => (
        <div key={dateLabel} className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {dateLabel}
            <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-2">
              {dayLoans.length}
            </span>
          </h3>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {dayLoans.map((loan, index) => {
              const collateral = loan.loan_collateral?.[0];
              const typeMap: Record<string, string> = {
                vehicle: "Veículo",
                real_estate: "Imóvel",
                other: "Outros",
              };
              const dynamicStatus = getDynamicStatus(loan);
              const statusConfig = getStatusConfig(dynamicStatus);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={loan.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 gap-4 sm:gap-6 hover:bg-slate-50 transition-colors ${
                    index !== dayLoans.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  {/* Client Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-lg sm:text-xl border border-blue-200">
                      {loan.clients?.full_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate text-sm sm:text-base">
                        {loan.clients?.full_name || "Cliente Desconhecido"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Badge
                          variant="outline"
                          className={
                            statusConfig.className +
                            " border text-[10px] px-2 py-0 h-5"
                          }
                        >
                          {statusConfig.label}
                        </Badge>
                        <span className="hidden sm:inline text-slate-300">
                          •
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {loan.term} parcelas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Value & Collateral */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                    {/* Collateral (Hidden on very small screens, visible otherwise) */}
                    <div className="hidden md:flex flex-col items-end text-right min-w-[100px]">
                      {collateral ? (
                        <>
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 justify-end">
                            <Shield className="h-3 w-3 text-slate-400" />
                            {typeMap[collateral.type] || collateral.type}
                          </span>
                          <span
                            className="text-[10px] text-slate-500 truncate max-w-[120px]"
                            title={collateral.description}
                          >
                            {collateral.description}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          Sem garantia
                        </span>
                      )}
                    </div>

                    {/* Value */}
                    <div className="flex flex-col items-start sm:items-end min-w-[120px]">
                      <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">
                        {formatCurrency(loan.loan_amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                        Valor Concedido
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="ml-2 sm:ml-4 flex-shrink-0">
                      <LoanCellAction data={loan} userRole={userRole} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
