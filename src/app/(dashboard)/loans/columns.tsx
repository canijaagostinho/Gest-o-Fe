"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, CreditCard, Calendar, ArrowRight } from "lucide-react";
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

export type Loan = {
  id: string;
  loan_amount: number;
  interest_rate: number;
  term: number;
  status: string;
  start_date: string | null;
  created_at: string;
  clients: {
    full_name: string;
  };
  loan_collateral: {
    type: string;
    description: string;
    value: number;
    location?: string;
    created_at: string;
  }[];
};

import { LoanCellAction } from "./loan-cell-action";

export const getColumns = (userRole?: string): ColumnDef<Loan>[] => [
  {
    accessorKey: "clients.full_name",
    header: "Cliente",
    cell: ({ row }) => {
      const client = row.original.clients;
      return (
        <span className="font-medium">
          {client?.full_name || "Desconhecido"}
        </span>
      );
    },
  },
  {
    accessorKey: "loan_amount",
    header: "Valor",
    cell: ({ row }) => (
      <span className="text-blue-600 font-semibold">
        {formatCurrency(row.getValue("loan_amount"))}
      </span>
    ),
  },
  {
    accessorKey: "term",
    header: "Prazo",
    cell: ({ row }) => `${row.getValue("term")} parcelas`,
  },
  {
    accessorKey: "loan_collateral",
    header: "Garantia",
    cell: ({ row }) => {
      const collateral = row.original.loan_collateral?.[0];
      if (collateral) {
        const typeMap: Record<string, string> = {
          vehicle: "Veículo",
          real_estate: "Imóvel",
          other: "Outros",
        };

        return (
          <div className="flex flex-col">
            <span className="font-medium text-xs text-slate-700">
              {typeMap[collateral.type] || collateral.type}
            </span>
            <span
              className="text-[10px] text-slate-500 truncate max-w-[100px]"
              title={collateral.description}
            >
              {collateral.description}
            </span>
          </div>
        );
      }
      return <span className="text-slate-400 text-xs">-</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, { label: string; className: string }> = {
        pending: {
          label: "Pendente",
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        },
        active: {
          label: "Ativo",
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        },
        completed: {
          label: "Pago",
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        },
        cancelled: {
          label: "Cancelado",
          className: "bg-slate-100 text-slate-500 border-slate-200",
        },
        delinquent: {
          label: "Inadimplente",
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
    accessorKey: "created_at",
    header: "Data",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <LoanCellAction data={row.original} userRole={userRole} />
    ),
  },
];
