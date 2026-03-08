import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MonitoringClient from "./monitoring-client";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  // Access control: Ensure user is admin (and NOT admin_geral as requested)
  // Actually, looking at the layout, user_institution_id is enforced for normal routes.
  // The user explicitly stated: "é so para admistradores da instituições, o administrador geral nao precisa disso"

  // Ensure user is the institution admin (role 'gestor')
  const { data: userData } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  let roleName = null;
  const roleData = userData?.role;
  if (Array.isArray(roleData)) {
    roleName = roleData[0]?.name;
  } else {
    roleName = (roleData as any)?.name;
  }

  if (roleName !== "gestor") {
    redirect("/"); // Block regular operators or admin_geral
  }

  // Fetch initial logs (first 100 or so)
  // We'll let the client do the filtering, or we can fetch all given the scope.
  // The instructions say "Tabela com Paginação, Ordenação...".
  // Usually for large datasets we paginate via server, but since this is an admin panel for an institution,
  // bringing in recent records is good. We'll pass them to the client.

  const { data: rawLogs } = await supabase
    .from("operation_logs")
    .select(
      `
            *,
            users:user_id(full_name, email)
        `,
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const logs =
    rawLogs?.map((log) => ({
      ...log,
      user_name: (log.users as any)?.full_name || "Desconhecido",
      user_email: (log.users as any)?.email || "",
    })) || [];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-2xl">
          <Activity className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Monitoramento Administrativo
          </h1>
          <p className="text-slate-500 font-medium">
            Acompanhe todas as operações financeiras realizadas pelos usuários
            da sua instituição.
          </p>
        </div>
      </div>

      <MonitoringClient initialLogs={logs} />
    </div>
  );
}
