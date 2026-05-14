import { createClient } from "@/utils/supabase/server";
import { InstitutionsHeaderActions } from "@/components/institutions/institutions-header-actions";
import { InstitutionsClient } from "./institutions-client";
import { Institution } from "./columns";

export default async function InstitutionsPage() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
      return <div>Acesso negado. Por favor, faça login.</div>;
  }

  // Fetch institutions for header actions
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
  const { data: profile } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single() as { data: { role: { name: string } } | null };
  
  const userRole = profile?.role?.name || "operador";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Instituições</h2>
        <InstitutionsHeaderActions institutions={institutions || []} />
      </div>
      <div className="h-full flex-1 flex-col space-y-8 flex">
        <InstitutionsClient 
            data={(fullInstitutions as Institution[]) || []} 
            userRole={userRole} 
        />
      </div>
    </div>
  );
}
