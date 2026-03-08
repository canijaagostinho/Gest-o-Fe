"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export type Collateral = {
  id: string;
  type: string;
  description: string;
  value: number;
  location?: string;
  created_at: string;
  loans: {
    id: string;
    status: string;
    clients: {
      full_name: string;
    };
  };
};

export const columns: ColumnDef<Collateral>[] = [
  {
    accessorKey: "loans.clients.full_name",
    header: "Cliente",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.loans?.clients?.full_name || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const typeMap: Record<string, string> = {
        vehicle: "Veículo",
        real_estate: "Imóvel",
        other: "Outros",
      };
      return typeMap[row.getValue("type") as string] || row.getValue("type");
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => (
      <span
        className="truncate max-w-[200px] block"
        title={row.getValue("description")}
      >
        {row.getValue("description")}
      </span>
    ),
  },
  {
    accessorKey: "value",
    header: "Valor Estimado",
    cell: ({ row }) => formatCurrency(row.getValue("value")),
  },
  {
    accessorKey: "location",
    header: "Localização",
    cell: ({ row }) => row.getValue("location") || "-",
  },
  {
    accessorKey: "loans.status",
    header: "Status do Empréstimo",
    cell: ({ row }) => {
      const status = row.original.loans?.status;
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
    id: "actions",
    cell: ({ row }) => (
      <Link
        href={`/loans/${row.original.loans?.id}`}
        className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-bold"
      >
        Ver Empréstimo <ExternalLink className="ml-1 h-3 w-3" />
      </Link>
    ),
  },
];
