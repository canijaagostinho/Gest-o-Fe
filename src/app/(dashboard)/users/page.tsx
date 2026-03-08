import { createClient } from "@/utils/supabase/server";
import { UserClient } from "./user-client";
import { Button } from "@/components/ui/button";
import { Plus, Users, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Fetch current user's profile and role
  const { data: currentUser } = await supabase
    .from("users")
    .select("*, role:roles(name)")
    .eq("id", authUser?.id)
    .single();

  const isGlobalAdmin = (currentUser?.role as any)?.name === "admin_geral";
  const isGestor = (currentUser?.role as any)?.name === "gestor";
  const institutionId = currentUser?.institution_id;

  // Fetch users based on role
  let query = supabase
    .from("users")
    .select("*, institution:institutions(name), role:roles(name)")
    .order("created_at", { ascending: false });

  if (!isGlobalAdmin) {
    query = query.eq("institution_id", institutionId);
  }

  const { data: users, error } = await query;

  if (error) {
    return (
      <div className="p-8 text-red-500 font-bold bg-red-50 rounded-3xl m-8">
        Erro ao carregar usuários: {error.message}
      </div>
    );
  }

  // Calculate limits if institutional
  const gestoresCount =
    users?.filter((u: any) => (u.role as any)?.name === "gestor").length || 0;
  const normalCount =
    users?.filter(
      (u: any) =>
        (u.role as any)?.name !== "gestor" &&
        (u.role as any)?.name !== "admin_geral",
    ).length || 0;

  const canAddGestor = isGlobalAdmin || (isGestor && gestoresCount < 2);
  const canAddNormal = isGlobalAdmin || (isGestor && normalCount < 5);
  const canCreateAny = canAddGestor || canAddNormal;

  // Fetch available roles for editing (only appropriate ones)
  const { data: availableRoles } = await supabase
    .from("roles")
    .select("id, name")
    .neq("name", "admin_geral");

  return (
    <div className="flex-1 space-y-10 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Header section with Stats & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-slate-200 hover:bg-slate-100 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isGlobalAdmin
                ? "Gestão Global de Usuários"
                : "Equipa da Instituição"}
            </h1>
            <p className="text-slate-500 font-medium tracking-tight">
              {isGlobalAdmin
                ? "Controle central de acessos e permissões em todo o ecossistema."
                : "Gerencie os acessos e permissões dos seus colaboradores."}
            </p>
          </div>

          {canCreateAny && (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5"
            >
              <Link href="/users/new">
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Limits Information for Gestores */}
      {!isGlobalAdmin && isGestor && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-blue-50/50 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
                  Gestores
                </p>
                <p className="text-2xl font-black text-blue-900">
                  {gestoresCount} / 2
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${gestoresCount >= 2 ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
              >
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-blue-600/70 mt-3 font-medium">
              Capacidade máxima de administradores institucionais.
            </p>
          </Card>
          <Card className="border-none shadow-sm bg-slate-50 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Usuários Normais
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {normalCount} / 5
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${normalCount >= 5 ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-600"}`}
              >
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Capacidade de agentes e operadores financeiros.
            </p>
          </Card>
        </div>
      )}

      {/* Main Content Area */}
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">
                {isGlobalAdmin ? "Todos os Usuários" : "Membros da Equipa"}
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium mt-1">
                {users?.length || 0} usuários ativos
              </CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Procurar usuário..."
                className="pl-11 h-12 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserClient
            data={users || []}
            currentUserRole={(currentUser?.role as any)?.name}
            availableRoles={availableRoles || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
