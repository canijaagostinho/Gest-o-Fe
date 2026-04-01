"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { CellAction } from "./cell-action";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export type AccountColumn = {
  id: string;
  name: string;
  balance: number;
  bank_provider?: string;
  is_default: boolean;
  created_at: string;
};

export const columns: ColumnDef<AccountColumn>[] = [
  {
    accessorKey: "name",
    header: "Nome da Caixa",
    cell: ({ row }) => {
      const provider = row.original.bank_provider || "outro";
      const name = row.original.name;

      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
            {provider !== "outro" ? (
              <Image
                src={`/logos/providers/${provider}.webp`}
                alt={`Logotipo do provedor de pagamento ${provider}`}
                fill
                className="object-contain"
              />
            ) : null}
            <div className={provider !== "outro" ? "hidden" : "block"}>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Saldo Atual",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("balance"));
      const formatted = formatCurrency(amount);
      return <div className="font-bold">{formatted}</div>;
    },
  },
  {
    accessorKey: "is_default",
    header: "Status",
    cell: ({ row }) =>
      row.getValue("is_default") ? (
        <Badge variant="default">Padrão</Badge>
      ) : (
        <Badge variant="secondary">Secundária</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
