"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Save,
  Settings as SettingsIcon,
  Percent,
  Globe,
  Building2,
  Users as UsersIcon,
  Palette,
  Shield,
  Upload,
  Bell,
  Mail,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

// Schema for Financial/Global Settings
const settingsSchema = z.object({
  default_interest_rate: z.coerce.number().min(0),
  default_fine_rate: z.coerce.number().min(0),
  default_mora_rate: z.coerce.number().min(0),
  currency: z.string().min(1),
  language: z.string().min(1),
  max_active_loans: z.coerce.number().min(1),
});

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const supabase = createClient();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      default_interest_rate: 5,
      default_fine_rate: 2,
      default_mora_rate: 1,
      currency: "MZN",
      language: "pt",
      max_active_loans: 1,
    },
  });

  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("institution_id, role:roles(name)")
        .eq("id", user.id)
        .single();

      const role = (profile?.role as any)?.name || "gestor";
      setUserRole(role);

      if (role !== "admin_geral" && profile?.institution_id) {
        setInstitutionId(profile.institution_id);

        const { data: settings } = await supabase
          .from("settings")
          .select("*")
          .eq("institution_id", profile.institution_id)
          .maybeSingle();

        if (settings) {
          form.reset({
            default_interest_rate: Number(settings.default_interest_rate),
            default_fine_rate: Number(settings.default_fine_rate),
            default_mora_rate: Number(settings.default_mora_rate),
            currency: settings.currency,
            language: settings.language,
            max_active_loans: settings.max_active_loans,
          });
        }

        // Fetch Users
        const { data: instUsers } = await supabase
          .from("users")
          .select("*, role:roles(name)")
          .eq("institution_id", profile.institution_id);

        if (instUsers) {
          setUsersList(instUsers);
        }
      }
      setPageLoading(false);
    }
    fetchSettings();
  }, [supabase, form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    try {
      setLoading(true);
      if (!institutionId) throw new Error("Instituição não identificada");

      // Security check
      if (
        userRole !== "admin_geral" &&
        userRole !== "gestor" &&
        userRole !== "operador"
      ) {
        throw new Error("Permissão negada.");
      }

      const { error } = await supabase.from("settings").upsert(
        {
          institution_id: institutionId,
          ...values,
        },
        { onConflict: "institution_id" },
      );

      if (error) throw error;

      toast.success("Configurações salvas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isGeneralAdmin = userRole === "admin_geral";

  return (
    <div className="flex-1 space-y-6 pt-2">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {isGeneralAdmin ? "Gestão da Plataforma" : "Configurações"}
          </h2>
          <p className="text-slate-500">
            {isGeneralAdmin
              ? "Gerencie as instituições e parâmetros globais do Gestão Flex."
              : "Gerencie todos os aspectos da sua instituição."}
          </p>
        </div>
      </div>

      {isGeneralAdmin ? (
        <div className="grid gap-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Administração de Instituições
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-2">
                    Como Administrador Geral, você gerencia o ecossistema de
                    instituições.
                  </CardDescription>
                </div>
                <Building2 className="h-16 w-16 text-white/10" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <Link href="/institutions">
                  <Button
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg border-0"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Gerenciar Instituições
                  </Button>
                </Link>
                <Link href="/institutions/new">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-700 text-white hover:bg-slate-800 font-bold"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Nova Instituição
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Parâmetros de Rede</CardTitle>
                <CardDescription>
                  Configurações globais para novas instâncias.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500 italic">
                  Planos de assinatura e limites de rede são gerenciados pelo
                  backend central.
                </p>
                <Link href="/settings/plans">
                  <Button
                    variant="secondary"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold border-0 h-10"
                  >
                    Editar Planos
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Logs de Segurança</CardTitle>
                <CardDescription>
                  Monitoramento de acessos globais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/audit-logs">
                  <Button variant="outline" className="w-full">
                    Ver Auditoria
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Tabs
          defaultValue={userRole === "operador" ? "rates" : "users"}
          className="space-y-6"
        >
          <TabsList className="bg-white/50 border border-slate-200 p-1 w-full justify-start h-auto flex-wrap">
            {userRole !== "operador" && (
              <TabsTrigger
                value="users"
                className="px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md"
              >
                <UsersIcon className="w-4 h-4 mr-2" />
                Usuários e Permissões
              </TabsTrigger>
            )}
            <TabsTrigger
              value="rates"
              className="px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md"
            >
              <Percent className="w-4 h-4 mr-2" />
              Taxas e Juros
            </TabsTrigger>
            {userRole !== "operador" && (
              <TabsTrigger
                value="localization"
                className="px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md"
              >
                <Globe className="w-4 h-4 mr-2" />
                Idioma e Moeda
              </TabsTrigger>
            )}
            {userRole !== "operador" && (
              <TabsTrigger
                value="institution"
                className="px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Perfil da Instituição
              </TabsTrigger>
            )}
            <TabsTrigger
              value="notifications"
              className="px-6 py-2.5 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            {userRole !== "operador" && (
              <TabsTrigger
                value="billing"
                className="px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md"
              >
                <Save className="w-4 h-4 mr-2" />
                Plano e Assinatura
              </TabsTrigger>
            )}
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Tab: Users */}
              <TabsContent value="users">
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>Gestão de Usuários</CardTitle>
                    <CardDescription>
                      Controle quem tem acesso ao sistema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* User Stats/Limits - Embedded Dashboard View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
                              Gestores
                            </p>
                            <p className="text-2xl font-black text-blue-900">
                              {
                                usersList.filter(
                                  (u: any) => u.role?.name === "gestor",
                                ).length
                              }{" "}
                              / 4
                            </p>
                          </div>
                          <div
                            className={`p-3 rounded-xl ${usersList.filter((u: any) => u.role?.name === "gestor").length >= 4 ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
                          >
                            <UsersIcon className="h-5 w-5" />
                          </div>
                        </div>
                      </Card>
                      <Card className="border-none shadow-sm bg-slate-50 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                              Usuários Normais
                            </p>
                            <p className="text-2xl font-black text-slate-900">
                              {
                                usersList.filter(
                                  (u: any) =>
                                    u.role?.name !== "gestor" &&
                                    u.role?.name !== "admin_geral",
                                ).length
                              }{" "}
                              / 15
                            </p>
                          </div>
                          <div
                            className={`p-3 rounded-xl ${usersList.filter((u: any) => u.role?.name !== "gestor").length >= 15 ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-600"}`}
                          >
                            <UsersIcon className="h-5 w-5" />
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="space-y-8">
                      {/* Table for Managers/Admins */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-3 ml-1 uppercase tracking-wider">
                          Gestores / Administradores
                        </h4>
                        <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-blue-700 uppercase bg-blue-50/50">
                              <tr>
                                <th className="px-6 py-3 font-black">Nome</th>
                                <th className="px-6 py-3 font-black">Email</th>
                              </tr>
                            </thead>
                            <tbody>
                              {usersList.filter(
                                (u: any) =>
                                  u.role?.name === "gestor" ||
                                  u.role?.name === "admin_geral",
                              ).length > 0 ? (
                                usersList
                                  .filter(
                                    (u: any) =>
                                      u.role?.name === "gestor" ||
                                      u.role?.name === "admin_geral",
                                  )
                                  .map((user: any) => (
                                    <tr
                                      key={user.id}
                                      className="bg-white border-b border-blue-50 hover:bg-blue-50/30 transition-colors"
                                    >
                                      <td className="px-6 py-4 font-bold text-blue-950">
                                        {user.full_name || "Sem Nome"}
                                      </td>
                                      <td className="px-6 py-4 text-slate-600">
                                        {user.email}
                                      </td>
                                    </tr>
                                  ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={2}
                                    className="px-6 py-8 text-center text-slate-500 italic"
                                  >
                                    Nenhum administrador encontrado.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Table for Normal Users */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-3 ml-1 uppercase tracking-wider">
                          Usuários Normais
                        </h4>
                        <div className="border rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                              <tr>
                                <th className="px-6 py-3 font-black">Nome</th>
                                <th className="px-6 py-3 font-black">Email</th>
                              </tr>
                            </thead>
                            <tbody>
                              {usersList.filter(
                                (u: any) =>
                                  u.role?.name !== "gestor" &&
                                  u.role?.name !== "admin_geral",
                              ).length > 0 ? (
                                usersList
                                  .filter(
                                    (u: any) =>
                                      u.role?.name !== "gestor" &&
                                      u.role?.name !== "admin_geral",
                                  )
                                  .map((user: any) => (
                                    <tr
                                      key={user.id}
                                      className="bg-white border-b hover:bg-slate-50 transition-colors"
                                    >
                                      <td className="px-6 py-4 font-bold text-slate-900">
                                        {user.full_name || "Sem Nome"}
                                      </td>
                                      <td className="px-6 py-4 text-slate-600">
                                        {user.email}
                                      </td>
                                    </tr>
                                  ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={2}
                                    className="px-6 py-8 text-center text-slate-500 italic"
                                  >
                                    Nenhum usuário normal encontrado.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link href="/users/new">
                        <Button
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all rounded-xl"
                        >
                          Criar Usuário
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Rates */}
              <TabsContent value="rates">
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>Taxas e Juros</CardTitle>
                    <CardDescription>
                      Defina os valores padrão aplicados aos novos contratos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="default_interest_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Juros Mensal (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={
                                  !isGeneralAdmin &&
                                  userRole !== "gestor" &&
                                  userRole !== "operador"
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="default_fine_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Multa Fixa (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={
                                  !isGeneralAdmin &&
                                  userRole !== "gestor" &&
                                  userRole !== "operador"
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="default_mora_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mora Diária (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled={
                                  !isGeneralAdmin &&
                                  userRole !== "gestor" &&
                                  userRole !== "operador"
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {(isGeneralAdmin ||
                      userRole === "gestor" ||
                      userRole === "operador") && (
                      <Button type="submit" disabled={loading}>
                        {loading && (
                          <SettingsIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Salvar Taxas
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Localization */}
              <TabsContent value="localization">
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>Regionalização</CardTitle>
                    <CardDescription>
                      Adapte o sistema para sua moeda e idioma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moeda Padrão</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={
                                  !isGeneralAdmin &&
                                  userRole !== "gestor" &&
                                  userRole !== "operador"
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a moeda" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MZN">
                                    Metical (MZN)
                                  </SelectItem>
                                  <SelectItem value="USD">
                                    Dólar (USD)
                                  </SelectItem>
                                  <SelectItem value="EUR">
                                    Euro (EUR)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idioma do Sistema</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={
                                  !isGeneralAdmin &&
                                  userRole !== "gestor" &&
                                  userRole !== "operador"
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o idioma" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pt">Português</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {(isGeneralAdmin ||
                      userRole === "gestor" ||
                      userRole === "operador") && (
                      <Button type="submit" disabled={loading}>
                        Salvar Regionalização
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Notifications (Redirect) */}
              <TabsContent value="notifications">
                <Card className="border-none shadow-md bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          Notificações Automáticas
                        </CardTitle>
                        <CardDescription className="text-amber-100 mt-2">
                          Configure lembretes de vencimento por Email e SMS para
                          seus clientes.
                        </CardDescription>
                      </div>
                      <Bell className="h-16 w-16 text-white/20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                      <Link href="/notifications">
                        <Button
                          size="lg"
                          className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-lg border-0"
                        >
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          Gerenciar Notificações
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Mail className="w-8 h-8 text-blue-500 mb-2" />
                      <CardTitle className="text-base">Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500">
                        Envio automático de lembretes e recibos.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <MessageSquare className="w-8 h-8 text-emerald-500 mb-2" />
                      <CardTitle className="text-base">SMS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500">
                        Alertas diretos no celular do cliente.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Billing (Redirect) */}
              <TabsContent value="billing">
                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          Plano e Assinatura
                        </CardTitle>
                        <CardDescription className="text-emerald-100 mt-2">
                          Gerencie sua assinatura, visualize faturas e faça
                          renovações.
                        </CardDescription>
                      </div>
                      <Save className="h-16 w-16 text-white/20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                      <Link href="/settings/billing">
                        <Button
                          size="lg"
                          className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg border-0"
                        >
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          Acessar Cobrança
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Institution (Redirect) */}
              <TabsContent value="institution">
                <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          Dados da Instituição
                        </CardTitle>
                        <CardDescription className="text-blue-100 mt-2">
                          Gerencie informações legais, fiscais, endereço,
                          identidade visual e responsáveis.
                        </CardDescription>
                      </div>
                      <Building2 className="h-16 w-16 text-white/20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                      <Link href="/settings/institution">
                        <Button
                          size="lg"
                          className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg border-0"
                        >
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          Acessar Módulo Completo
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                {/* ... (institution cards remain same) ... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Palette className="w-8 h-8 text-pink-500 mb-2" />
                      <CardTitle className="text-base">
                        Identidade Visual
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500">
                        Logotipo, cores e branding.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Shield className="w-8 h-8 text-emerald-500 mb-2" />
                      <CardTitle className="text-base">Dados Fiscais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500">
                        NUIT, registros e conformidade.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <Globe className="w-8 h-8 text-amber-500 mb-2" />
                      <CardTitle className="text-base">Localização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500">
                        Endereços e áreas de atuação.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      )}
    </div>
  );
}
