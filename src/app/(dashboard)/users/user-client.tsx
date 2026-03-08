"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { InstitutionUser } from "./types";
import { Building2 } from "lucide-react";

interface UserClientProps {
  data: InstitutionUser[];
  currentUserRole: string | null;
  availableRoles: any[];
}

export function UserClient({
  data,
  currentUserRole,
  availableRoles,
}: UserClientProps) {
  const columns = getColumns(currentUserRole, availableRoles);

  // Group users by institution
  const groupedUsers = data.reduce(
    (acc, user) => {
      // Handle both object and array formats gracefully from Supabase join
      let instName = "Plataforma (Admin)";
      if (user.institution) {
        if (Array.isArray(user.institution)) {
          instName = user.institution[0]?.name || instName;
        } else {
          instName = (user.institution as any).name || instName;
        }
      }

      if (!acc[instName]) {
        acc[instName] = [];
      }
      acc[instName].push(user);
      return acc;
    },
    {} as Record<string, InstitutionUser[]>,
  );

  const sortedInstitutions = Object.keys(groupedUsers).sort((a, b) => {
    // Keep Admin/Plataforma at the top
    if (a.includes("Plataforma")) return -1;
    if (b.includes("Plataforma")) return 1;
    return a.localeCompare(b);
  });

  // If there's only one institution, just render the standard flat table
  if (sortedInstitutions.length <= 1) {
    return <DataTable columns={columns} data={data} />;
  }

  // For multiple institutions, render grouped lists
  return (
    <div className="space-y-8 p-6 bg-slate-50/30">
      {sortedInstitutions.map((instName) => (
        <div key={instName} className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-[14px]">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              {instName}
            </h3>
            <span className="ml-2 px-3 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-full shadow-sm">
              {groupedUsers[instName].length}{" "}
              {groupedUsers[instName].length === 1 ? "usuário" : "usuários"}
            </span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <DataTable columns={columns} data={groupedUsers[instName]} />
          </div>
        </div>
      ))}
    </div>
  );
}
