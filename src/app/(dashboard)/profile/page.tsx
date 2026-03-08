"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Shield, Building2 } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("*, role:roles(name), institution:institutions(name)")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando perfil...</div>;
  }

  if (!profile) return <div>Erro ao carregar perfil.</div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Meu Perfil
        </h2>
        <p className="text-slate-500 font-medium">
          Gerencie suas informações pessoais.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl font-black bg-blue-100 text-blue-700">
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{profile.full_name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {profile.role?.name === "gestor"
                    ? "Administrador"
                    : profile.role?.name || "Usuário"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 text-slate-600"
                >
                  {profile.institution?.name || "Gestão Flex"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="h-4 w-4" /> Email
              </div>
              <div className="font-medium text-slate-900">{profile.email}</div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Building2 className="h-4 w-4" /> Instituição
              </div>
              <div className="font-medium text-slate-900">
                {profile.institution?.name || "N/A"}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4" /> Função
              </div>
              <div className="font-medium text-slate-900 uppercase">
                {profile.role?.name}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
