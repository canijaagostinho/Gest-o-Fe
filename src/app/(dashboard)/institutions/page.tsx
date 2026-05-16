import { createClient } from "@/utils/supabase/server";
import { InstitutionsHeaderActions } from "@/components/institutions/institutions-header-actions";
import { InstitutionsClient } from "./institutions-client";
import { Institution } from "./columns";

export default async function InstitutionsPage() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-slate-500">
        Acesso negado. Por favor, faça login.
      </div>
    );
  }

  // 1. Get user role safely
  let userRole = "operador";
  try {
    const { data: profile } = await supabase
      .from("users")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();
    
    if (profile && (profile as any).role) {
      userRole = (profile as any).role.name || "operador";
    }
  } catch (err) {
    console.error("Error fetching user role:", err);
  }

  // 2. Fetch institutions for header actions (only needed columns)
  const { data: institutions, error: headerError } = await supabase
    .from("institutions")
    .select("id, name")
    .order("created_at", { ascending: false });

  // 3. Fetch institutions for the table (limited columns to prevent serialization issues)
  const { data: fullInstitutions, error: dataError } = await supabase
    .from("institutions")
    .select("id, name, email, status, created_at")
    .order("created_at", { ascending: false });

  if (headerError || dataError) {
    return (
      <div className="p-8 text-red-500 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-lg font-bold">Erro ao carregar dados</h3>
        <p>{headerError?.message || dataError?.message}</p>
      </div>
    );
  }

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
