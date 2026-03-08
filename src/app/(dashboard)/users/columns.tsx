"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-action";
import { InstitutionUser } from "./types";

export const getColumns = (
  currentUserRole: string | null,
  availableRoles: any[] = [],
): ColumnDef<InstitutionUser>[] => {
  const isManager =
    currentUserRole === "admin_geral" || currentUserRole === "gestor";

  const cols: ColumnDef<InstitutionUser>[] = [
    {
      accessorKey: "full_name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">
              {row.getValue("full_name")}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "institution.name",
      header: "Instituição",
      cell: ({ row }) => {
        const institution = row.original.institution;
        return (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-600">
              {institution?.name || "Sistema"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "role.name",
      header: "Perfil",
      cell: ({ row }) => {
        const role = row.original.role?.name;
        const roleLabels: Record<string, string> = {
          admin_geral: "Admin Geral",
          gestor: "Gestor",
          agente: "Agente",
          operador: "Operador",
        };
        return (
          <Badge
            variant="outline"
            className="rounded-full bg-blue-50 text-blue-700 border-blue-100 font-bold uppercase text-[9px] tracking-widest px-3 py-1"
          >
            {roleLabels[role || ""] || role}
          </Badge>
        );
      },
    },
  ];

  // Only add actions if user is a manager
  if (isManager) {
    cols.push({
      id: "actions",
      cell: ({ row }) => (
        <CellAction
          data={row.original}
          roles={availableRoles}
          currentUserRole={currentUserRole}
        />
      ),
    });
  }

  return cols;
};
