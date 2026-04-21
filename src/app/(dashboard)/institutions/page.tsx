import { createClient } from "@/utils/supabase/server";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InstitutionsHeaderActions } from "@/components/institutions/institutions-header-actions";

export default async function InstitutionsPage() {
  const supabase = await createClient();

  const { data: institutions, error } = await supabase
    .from("institutions")
    .select("id, name")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Erro ao carregar instituições: {error.message}</div>;
  }

  // We also need to fetch full institutions data for the datatable
  const { data: fullInstitutions } = await supabase
    .from("institutions")
    .select("*")
    .order("created_at", { ascending: false });

  // Get user role for UI restrictions
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = "operador";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();
    userRole = (profile?.role as any)?.name || "operador";
  }

  const columns = getColumns(userRole);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Instituições</h2>
        <InstitutionsHeaderActions institutions={institutions || []} />
      </div>
      <div className="h-full flex-1 flex-col space-y-8 flex">
        <DataTable columns={columns} data={(fullInstitutions as any[]) || []} />
      </div>
    </div>
  );
}
