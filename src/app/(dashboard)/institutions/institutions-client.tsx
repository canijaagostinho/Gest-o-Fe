"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns, Institution } from "./columns";

interface InstitutionsClientProps {
  data: Institution[];
  userRole: string;
}

export function InstitutionsClient({ data, userRole }: InstitutionsClientProps) {
  const columns = getColumns(userRole);

  return (
    <DataTable columns={columns} data={data} />
  );
}
