"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Bell,
  History,
  Settings,
  Mail,
  MessageSquare,
  Send,
  Save,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import {
  getNotificationSettingsAction,
  updateNotificationSettingsAction,
  getNotificationLogsAction,
  checkAndSendNotificationsAction,
} from "@/app/actions/notification-actions";
import { formatDate } from "@/lib/utils";

const settingsSchema = z.object({
  days_before_due: z.coerce.number().min(1, "Mínimo 1 dia"),
  email_enabled: z.boolean(),
  sms_enabled: z.boolean(),
  email_template: z.string().min(10, "Template muito curto"),
  sms_template: z.string().min(10, "Template muito curto"),
});

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | undefined>(undefined);
  const [logs, setLogs] = useState<any[]>([]);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      days_before_due: 3,
      email_enabled: false,
      sms_enabled: false,
      email_template: "",
      sms_template: "",
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Settings
      const setRes = await getNotificationSettingsAction();
      if (setRes.success && setRes.data) {
        setSettingsId(setRes.data.id);
        form.reset({
          days_before_due: setRes.data.days_before_due,
          email_enabled: setRes.data.email_enabled,
          sms_enabled: setRes.data.sms_enabled,
          email_template: setRes.data.email_template || "",
          sms_template: setRes.data.sms_template || "",
        });
      }

      // 2. Logs
      const logRes = await getNotificationLogsAction();
      if (logRes.success) {
        setLogs(logRes.data || []);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [form]);

  async function onSettingsSubmit(values: z.infer<typeof settingsSchema>) {
    try {
      setSaving(true);
      const result = await updateNotificationSettingsAction({
        id: settingsId,
        ...values,
      });

      if (result.success) {
        toast.success("Configurações salvas!");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  async function onManualCheck() {
    try {
      setLoading(true);
      const result = await checkAndSendNotificationsAction();
      if (result.success) {
        toast.success(
          `Verificação concluída. ${result.count} notificações enviadas.`,
        );
        await loadData();
      } else {
        toast.info(result.message || "Nenhuma ação necessária.");
      }
    } catch (error) {
      toast.error("Erro ao executar verificação.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Notificações
          </h2>
          <p className="text-slate-500">
            Gerencie a comunicação automática com seus clientes.
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 border border-slate-200 rounded-xl">
          <TabsTrigger
            value="settings"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Settings className="w-4 h-4 mr-2" /> Configurar Notificações
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <History className="w-4 h-4 mr-2" /> Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSettingsSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full -mr-16 -mt-16 blur-xl opacity-50 transition-all group-hover:bg-blue-100" />
                  <CardHeader>
                    <CardTitle className="font-black text-slate-800">
                      Regras de Automação
                    </CardTitle>
                    <CardDescription>
                      Defina os gatilhos para notificações automáticas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="days_before_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-700">
                            Antecedência de Aviso
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <Input
                                type="number"
                                className="max-w-[120px] rounded-xl border-slate-200 focus:ring-blue-500/20"
                                {...field}
                              />
                              <span className="text-sm font-bold text-slate-500">
                                Dias antes do vencimento
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-bold text-slate-900">
                                Lembretes por Email
                              </FormLabel>
                              <FormDescription>
                                Ativa o envio de lembretes para o endereço do
                                cliente.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sms_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-bold text-slate-900">
                                Lembretes por SMS
                              </FormLabel>
                              <FormDescription>
                                Ativa o envio de SMS (requer integração ativa).
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full -mr-16 -mt-16 blur-xl opacity-50" />
                  <CardHeader>
                    <CardTitle className="font-black text-slate-800">
                      Modelos de Mensagem
                    </CardTitle>
                    <CardDescription>
                      Personalize o texto enviado. Variáveis disponíveis:{" "}
                      {"{client_name}"}, {"{amount}"}, {"{due_date}"}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email_template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black flex items-center gap-2 text-blue-600">
                            <Mail className="h-4 w-4" /> Template de Email
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[120px] rounded-xl border-slate-200 focus:ring-blue-500/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sms_template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-black flex items-center gap-2 text-emerald-600">
                            <MessageSquare className="h-4 w-4" /> Template de
                            SMS
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[80px] rounded-xl border-slate-200 focus:ring-emerald-500/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      disabled={saving}
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-black text-white font-black h-12 rounded-xl shadow-lg shadow-slate-200 hover:shadow-xl transition-all"
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Gravar Configurações
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <CardHeader className="relative">
              <CardTitle className="text-white font-black text-2xl">
                Lembretes Automáticos
              </CardTitle>
              <CardDescription className="text-blue-100 font-medium">
                O sistema verifica diariamente parcelas próximas do vencimento e
                envia alertas aos clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 flex-1 w-full flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-tighter">
                    Próximo Envio Agendado
                  </p>
                  <p className="text-2xl font-black mt-0.5">Amanhã, 08:00</p>
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                <Button
                  onClick={onManualCheck}
                  variant="secondary"
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black h-14 rounded-2xl shadow-xl shadow-blue-900/20"
                >
                  <Bell className="mr-2 h-5 w-5 animate-pulse" />
                  Executar Verificação Manual
                </Button>
                <p className="text-[10px] text-center text-blue-100 uppercase font-black tracking-[0.2em] leading-relaxed opacity-80">
                  Processará vencimentos em {form.getValues("days_before_due")}{" "}
                  dias
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>
                Registros detalhados das últimas comunicações enviadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-slate-400 font-medium"
                      >
                        Nenhum registro de envio encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="group transition-colors hover:bg-slate-50/50"
                      >
                        <TableCell className="font-medium text-slate-600">
                          {formatDate(log.sent_at)}{" "}
                          <span className="text-[10px] text-slate-400 ml-1">
                            {new Date(log.sent_at)
                              .toLocaleTimeString()
                              .slice(0, 5)}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">
                          {log.clients?.full_name}
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono text-xs">
                          {log.loans?.contract_number || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.type === "email" ? (
                              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <Mail className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                <MessageSquare className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <span className="capitalize text-xs font-bold text-slate-600">
                              {log.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              log.status === "sent"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-700 border-red-100"
                            }
                            variant="outline"
                          >
                            {log.status === "sent" ? "Enviado" : "Falha"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
