"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import LinkNext from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { CellAction } from "./cell-action";
import { Client } from "./types";

export const getColumns = (userRole?: string): ColumnDef<Client>[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => (
      <span className="text-slate-500 font-mono text-xs">
        {row.getValue("code") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Nome",
    cell: ({ row }) => {
      const name = row.getValue("full_name") as string;
      // Generate initials
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3 border border-blue-200">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{name}</span>
            <span className="text-[10px] text-slate-400">
              {row.original.email || "Sem email"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone ? (
        <div className="flex items-center">
          <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
          {phone}
        </div>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "id_number",
    header: "Documento (BI/NUIT)",
  },
  {
    accessorKey: "classification",
    header: "Classificação",
    cell: ({ row }) => {
      const classification = row.getValue("classification") as string;
      const colors: Record<string, string> = {
        Regular:
          "bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-600/10",
        "Em risco":
          "bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-emerald-600/10",
        Inadimplente:
          "bg-red-50 text-red-700 border-red-100 ring-1 ring-red-600/10",
      };
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
            colors[classification] ||
              "bg-slate-50 text-slate-700 border-slate-100",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full mr-1.5",
              classification === "Regular"
                ? "bg-emerald-500"
                : classification === "Em risco"
                  ? "bg-amber-500"
                  : "bg-red-500",
            )}
          ></span>
          {classification}
        </span>
      );
    },
  },
  {
    accessorKey: "financial_health",
    header: "Saúde Financeira",
    cell: ({ row }) => {
      const client = row.original;
      const score = client.repayment_progress ?? 0;

      return (
        <div className="w-[120px] space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Pago</span>
            <span className="font-medium text-slate-700">{score}%</span>
          </div>
          <Progress
            value={score}
            className={cn(
              "h-1.5",
              score < 40
                ? "bg-red-100 [&>div]:bg-red-500"
                : score < 80
                  ? "bg-amber-100 [&>div]:bg-amber-500"
                  : "bg-emerald-100 [&>div]:bg-emerald-500",
            )}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Data de Cadastro",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} userRole={userRole} />,
  },
];
