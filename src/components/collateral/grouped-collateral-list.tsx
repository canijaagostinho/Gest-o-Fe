"use client";

import { Collateral } from "@/app/(dashboard)/collateral/columns";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { isToday, isYesterday, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  Calendar,
  ShieldCheck,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface GroupedCollateralListProps {
  collaterals: Collateral[];
}

export function GroupedCollateralList({
  collaterals,
}: GroupedCollateralListProps) {
  if (!collaterals?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed shadow-sm">
        <ShieldCheck className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">
          Nenhuma garantia encontrada
        </h3>
        <p className="text-sm mt-1">
          Os empréstimos atuais não possuem bens de garantia vinculados.
        </p>
      </div>
    );
  }

  // Group collaterals by created_at date
  const groupedCollaterals = collaterals.reduce(
    (groups: Record<string, Collateral[]>, collateral) => {
      const date = parseISO(collateral.created_at);
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
      groups[groupKey].push(collateral);
      return groups;
    },
    {},
  );

  const getTypeMap = (type: string) => {
    const map: Record<string, string> = {
      vehicle: "Veículo",
      real_estate: "Imóvel",
      other: "Outros",
    };
    return map[type] || type;
  };

  const getStatusConfig = (status: string | undefined) => {
    if (!status)
      return {
        label: "Desconhecido",
        className: "bg-slate-100 text-slate-600",
      };

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
        label: "Inadimplente",
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
      {Object.entries(groupedCollaterals).map(
        ([dateLabel, dayCollaterals], groupIndex) => (
          <div key={dateLabel} className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateLabel}
              <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-2">
                {dayCollaterals.length}
              </span>
            </h3>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              {dayCollaterals.map((collateral, index) => {
                const statusConfig = getStatusConfig(collateral.loans?.status);
                // Handle array or object structure from Supabase join
                const clientData = Array.isArray(collateral.loans?.clients)
                  ? collateral.loans?.clients[0]
                  : collateral.loans?.clients;
                const clientName =
                  clientData?.full_name || "Cliente Desconhecido";
                const recordTime = format(
                  parseISO(collateral.created_at),
                  "HH:mm",
                );

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={collateral.id}
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 sm:p-6 gap-4 sm:gap-6 hover:bg-slate-50 transition-colors ${
                      index !== dayCollaterals.length - 1
                        ? "border-b border-slate-50"
                        : ""
                    }`}
                  >
                    {/* Client and Guarantee Type Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700 font-bold text-lg sm:text-xl border border-teal-200">
                        <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-sm sm:text-base">
                          {getTypeMap(collateral.type)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 truncate">
                          <span
                            className="font-medium text-slate-700 truncate max-w-[150px] sm:max-w-xs"
                            title={clientName}
                          >
                            Declarado por: {clientName}
                          </span>
                          <span className="hidden sm:inline text-slate-300">
                            •
                          </span>
                          <span className="flex items-center gap-1 hidden sm:flex">
                            Registrado às {recordTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description and Location details */}
                    <div className="hidden lg:flex flex-col items-start min-w-[200px] flex-1">
                      <span
                        className="text-sm text-slate-700 truncate w-full"
                        title={collateral.description}
                      >
                        {collateral.description}
                      </span>
                      {collateral.location && (
                        <span className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate w-full">
                          <MapPin className="h-3 w-3" />
                          {collateral.location}
                        </span>
                      )}
                    </div>

                    {/* Value and Status */}
                    <div className="flex items-center justify-between w-full md:w-auto md:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-start md:items-end min-w-[120px]">
                          <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">
                            {formatCurrency(collateral.value)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                            Status:{" "}
                            <Badge
                              variant="outline"
                              className={
                                statusConfig.className +
                                " border-0 text-[10px] px-1 py-0 h-4 bg-transparent shadow-none"
                              }
                            >
                              {statusConfig.label}
                            </Badge>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-2 sm:ml-4 flex-shrink-0">
                        <Link href={`/loans/${collateral.loans?.id}`}>
                          <div className="h-10 w-10 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700 rounded-full flex items-center justify-center transition-colors">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </Link>
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
