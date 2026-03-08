"use client";

import { Payment } from "@/app/(dashboard)/payments/columns";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PaymentCellAction } from "@/app/(dashboard)/payments/payment-cell-action";
import { isToday, isYesterday, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Calendar, Wallet } from "lucide-react";
import { motion } from "framer-motion";

interface GroupedPaymentsListProps {
  payments: Payment[];
  userRole?: string;
}

export function GroupedPaymentsList({
  payments,
  userRole,
}: GroupedPaymentsListProps) {
  if (!payments?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed shadow-sm">
        <FileText className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">
          Nenhum recebimento encontrado
        </h3>
        <p className="text-sm mt-1">
          Ajuste os filtros ou registre um novo recebimento.
        </p>
      </div>
    );
  }

  // Group payments by date
  const groupedPayments = payments.reduce(
    (groups: Record<string, Payment[]>, payment) => {
      const date = parseISO(payment.payment_date);
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
      groups[groupKey].push(payment);
      return groups;
    },
    {},
  );

  const getStatusConfig = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      paid: {
        label: "Pago",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      voided: {
        label: "Anulado",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      },
      overdue: {
        label: "Atrasado",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      },
    };
    return (
      variants[status] || {
        label: status,
        className: "bg-slate-100 text-slate-600 border-slate-200",
      }
    );
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedPayments).map(
        ([dateLabel, dayPayments], groupIndex) => (
          <div key={dateLabel} className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateLabel}
              <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-2">
                {dayPayments.length}
              </span>
            </h3>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              {dayPayments.map((payment, index) => {
                const statusConfig = getStatusConfig(payment.status);
                const paymentTime = format(
                  parseISO(payment.payment_date),
                  "HH:mm",
                );

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={payment.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 gap-4 sm:gap-6 hover:bg-slate-50 transition-colors ${
                      index !== dayPayments.length - 1
                        ? "border-b border-slate-50"
                        : ""
                    }`}
                  >
                    {/* Client Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 font-bold text-lg sm:text-xl border border-emerald-200">
                        {payment.loans?.clients?.full_name
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-sm sm:text-base">
                          {payment.loans?.clients?.full_name ||
                            "Cliente Desconhecido"}
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
                            Recebido às {paymentTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                      <div className="flex flex-col items-start sm:items-end min-w-[120px]">
                        <span className="text-sm sm:text-lg font-black text-emerald-600 tracking-tight flex items-center gap-1">
                          + {formatCurrency(payment.amount_paid)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                          Valor Recebido
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="ml-2 sm:ml-4 flex-shrink-0">
                        <PaymentCellAction data={payment} userRole={userRole} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
