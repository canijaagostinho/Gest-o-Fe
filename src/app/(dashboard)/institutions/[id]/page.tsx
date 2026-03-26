import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Users,
  FileText,
  Building2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function InstitutionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch Institution
  const { data: institution, error } = await supabase
    .from("institutions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !institution) {
    notFound();
  }

  // Fetch Stats (Mock for now or simple count if tables exist)
  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", id);

  const { count: loansCount } = await supabase
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", id);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/institutions">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {institution.name}
            </h2>
            <p className="text-slate-500">
              Detalhes da instituição e visão geral.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/institutions/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" /> Editar
            </Button>
          </Link>
          <Link href={`/users/new?institution_id=${id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Users className="h-4 w-4" /> Criar Usuário
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários vinculados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos Ativos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loansCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Empréstimos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status da Conta
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold capitalize ${institution.status === "active" ? "text-emerald-600" : "text-red-600"}`}
            >
              {institution.status === "active" ? "Ativa" : "Inativa"}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde {formatDate(institution.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-50 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Email
            </span>
            <p className="text-sm font-medium text-slate-900">
              {institution.email}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Telefone
            </span>
            <p className="text-sm font-medium text-slate-900">
              {institution.phone || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Endereço
            </span>
            <p className="text-sm font-medium text-slate-900">
              {institution.address || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              ID do Sistema
            </span>
            <p className="text-sm font-mono text-slate-500">{institution.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
