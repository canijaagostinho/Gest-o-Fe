"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Edit,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toggleInstitutionStatusAction } from "@/app/actions/institution-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define a local type if one doesn't exist globally yet, matching Supabase table
export type Institution = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  created_at: string;
};

export const getColumns = (userRole?: string): ColumnDef<Institution>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className={`capitalize font-medium ${status === "active" ? "text-emerald-600" : "text-slate-500"}`}
        >
          {status === "active" ? "Ativo" : "Inativo"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const institution = row.original;
      const router = useRouter();

      const handleToggleStatus = async () => {
        const result = await toggleInstitutionStatusAction(
          institution.id,
          institution.status,
        );
        if (result.success) {
          const newStatus = institution.status === "active" ? "Inativo" : "Ativo";
          toast.success(`Status atualizado para ${newStatus}`);
          router.refresh();
        } else {
          toast.error("Erro ao atualizar status", {
            description: result.error,
          });
        }
      };

      // Only allow actions for global admin
      if (userRole !== "admin_geral") {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(institution.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/institutions/${institution.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
              </DropdownMenuItem>
            </Link>
            <Link href={`/institutions/${institution.id}/edit`}>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleToggleStatus}
              className={
                institution.status === "active"
                  ? "text-red-600"
                  : "text-emerald-600"
              }
            >
              {institution.status === "active" ? (
                <>
                  <Ban className="mr-2 h-4 w-4" /> Desativar
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Ativar
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
