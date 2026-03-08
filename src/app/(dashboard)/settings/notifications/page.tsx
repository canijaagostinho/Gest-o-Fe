"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Save,
  Bell,
  History,
  FileText,
  Mail,
  MessageSquare,
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

export default function NotificationSettingsPage() {
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

  useEffect(() => {
    async function loadData() {
      setLoading(true);

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

      setLoading(false);
    }
    loadData();
  }, [form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    try {
      setSaving(true);
      const result = await updateNotificationSettingsAction({
        id: settingsId,
        ...values,
      });

      if (result.success) {
        toast.success("Configurações salvas com sucesso!");
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
        // Refresh logs
        const logRes = await getNotificationLogsAction();
        if (logRes.success) {
          setLogs(logRes.data || []);
        }
      } else {
        toast.info(result.message || "Nenhuma ação necessária.");
      }
    } catch (error) {
      toast.error("Erro ao executar verificação.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notificações</h2>
          <p className="text-muted-foreground">
            Configure alertas automáticos de vencimento e veja o histórico de
            envios.
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Histórico de Envios</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Automação</CardTitle>
                    <CardDescription>
                      Defina quando e como os clientes serão notificados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="days_before_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dias de Antecedência</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="max-w-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Quantos dias antes do vencimento a mensagem será
                            enviada.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-4 rounded-md border p-4">
                      <Mail />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Email
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Enviar lembretes por email.
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="email_enabled"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-4 rounded-md border p-4">
                      <MessageSquare />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">SMS</p>
                        <p className="text-sm text-muted-foreground">
                          Enviar lembretes por SMS (requer integração).
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="sms_enabled"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Modelos de Mensagem</CardTitle>
                    <CardDescription>
                      Personalize o conteúdo. Use variaveis como{" "}
                      {"{client_name}"}, {"{amount}"}, {"{due_date}"}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email_template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template de Email</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[100px]" {...field} />
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
                          <FormLabel>Template de SMS</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[80px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button disabled={saving} type="submit" className="w-full">
                      {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar Alterações
                    </Button>
                    <div className="pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={onManualCheck}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Executar Verificação Agora
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Simula o Cron Job diário.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>
                Últimas notificações enviadas pelo sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
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
                        className="text-center text-muted-foreground h-24"
                      >
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {formatDate(log.sent_at)}{" "}
                          {new Date(log.sent_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{log.clients?.full_name}</TableCell>
                        <TableCell>{log.loans?.contract_number}</TableCell>
                        <TableCell className="capitalize">
                          <div className="flex items-center">
                            {log.type === "email" ? (
                              <Mail className="mr-2 h-4 w-4" />
                            ) : (
                              <MessageSquare className="mr-2 h-4 w-4" />
                            )}
                            {log.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === "sent" ? "default" : "destructive"
                            }
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
