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
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AutoScalingAmount } from "@/components/ui/auto-scaling-amount";

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
    header: "Beneficiário",
    cell: ({ row }) => {
      const client = row.original.clients;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
            {client?.full_name?.charAt(0) || "?"}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight text-sm">
              {client?.full_name || "Desconhecido"}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Contrato #{row.original.id.split('-')[0].toUpperCase()}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "loan_amount",
    header: "Capital",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <AutoScalingAmount 
          amount={row.getValue("loan_amount")} 
          baseSize="sm" 
          showCurrency={true}
          className="text-slate-900 font-black"
        />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Principal
        </span>
      </div>
    ),
  },
  {
    accessorKey: "term",
    header: "Prazo",
    cell: ({ row }) => {
        const term = Number(row.getValue("term"));
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">{term}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {term === 1 ? "mês" : "meses"}
                </span>
            </div>
        );
    },
  },
  {
    accessorKey: "status",
    header: "Status Operacional",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, { label: string; className: string; dot: string }> = {
        pending: {
          label: "Análise",
          className: "bg-amber-50 text-amber-600 border-amber-100",
          dot: "bg-amber-500"
        },
        active: {
          label: "Vigente",
          className: "bg-emerald-50 text-emerald-600 border-emerald-100",
          dot: "bg-emerald-500"
        },
        completed: {
          label: "Liquidado",
          className: "bg-blue-50 text-blue-600 border-blue-100",
          dot: "bg-blue-500"
        },
        cancelled: {
          label: "Instinto",
          className: "bg-slate-50 text-slate-500 border-slate-100",
          dot: "bg-slate-400"
        },
        delinquent: {
          label: "Inadimplente",
          className: "bg-rose-50 text-rose-600 border-rose-100 font-black",
          dot: "bg-rose-600"
        },
      };
      const config = variants[status] || { label: status, className: "", dot: "bg-slate-400" };
      return (
        <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-none", config.className)}>
          <span className={cn("w-1.5 h-1.5 rounded-full mr-2", config.dot)} />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Emissão",
    cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 italic text-xs">
            <Calendar className="w-3 h-3 opacity-40" />
            {formatDate(row.getValue("created_at"))}
        </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <LoanCellAction data={row.original} userRole={userRole} />
    ),
  },
];
