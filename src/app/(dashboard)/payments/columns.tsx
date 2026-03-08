"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Banknote, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type Payment = {
  id: string;
  amount_paid: number;
  payment_date: string;
  status: string;
  created_at: string;
  loans: {
    id: string;
    clients: {
      full_name: string;
    };
  };
};

import { PaymentCellAction } from "./payment-cell-action";

export const getColumns = (userRole?: string): ColumnDef<Payment>[] => [
  {
    accessorKey: "loans.clients.full_name",
    header: "Cliente",
    cell: ({ row }) => {
      const client = row.original.loans?.clients;
      return (
        <span className="font-medium">
          {client?.full_name || "Desconhecido"}
        </span>
      );
    },
  },
  {
    accessorKey: "amount_paid",
    header: "Valor Pago",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount_paid"));
      return (
        <span className="text-emerald-600 font-semibold">
          {formatCurrency(isNaN(amount) ? 0 : amount)}
        </span>
      );
    },
  },
  {
    accessorKey: "payment_date",
    header: "Data do Pagamento",
    cell: ({ row }) => {
      const date = new Date(row.getValue("payment_date"));
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {date.toLocaleDateString("pt-MZ")}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("pt-MZ", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, { label: string; className: string }> = {
        paid: {
          label: "Pago",
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        },
        voided: {
          label: "Anulado",
          className: "bg-slate-100 text-slate-500 border-slate-200",
        },
        overdue: {
          label: "Atrasado",
          className: "bg-red-500/10 text-red-600 border-red-500/20",
        },
      };
      const config = variants[status] || { label: status, className: "" };
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <PaymentCellAction data={row.original} userRole={userRole} />
    ),
  },
];
