"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
  Check,
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch System Notifications
      const { data: notifs, error: notifErr } = await supabase
        .from("system_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (notifErr) throw notifErr;
      setNotifications(notifs || []);

      // 2. Fetch Overdue Installments for Collection
      const today = new Date().toISOString().split("T")[0];
      const { data: overdue, error: overdueErr } = await supabase
        .from("installments")
        .select("id, amount, due_date, loans(id, clients(full_name, phone))")
        .eq("status", "pending")
        .lte("due_date", today)
        .order("due_date", { ascending: true });

      if (overdueErr) throw overdueErr;
      
      const mappedOverdue = (overdue as any)?.map((i: any) => ({
        id: i.id,
        loanId: i.loans?.id,
        amount: i.amount,
        dueDate: i.due_date,
        clientName: i.loans?.clients?.full_name || "Cliente",
        phone: i.loans?.clients?.phone || "",
        daysOverdue: Math.floor((new Date().getTime() - new Date(i.due_date).getTime()) / (1000 * 60 * 60 * 24))
      })) || [];

      setOverdueItems(mappedOverdue);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const notifyWhatsApp = (item: any) => {
    const rawPhone = item.phone?.replace(/\D/g, "");
    if (!rawPhone) {
      toast.error("Telefone não cadastrado para este cliente.");
      return;
    }
    
    // Add 258 prefix if not present (Mozambique)
    const phone = rawPhone.length === 9 ? `258${rawPhone}` : rawPhone;
    
    const message = `Olá *${item.clientName}*, notamos que sua parcela de *${formatCurrency(item.amount)}* venceu em *${new Date(item.dueDate).toLocaleDateString('pt-MZ')}*. Por favor, entre em contato com a nossa equipe para regularizar sua situação. \n\nAtenciosamente, \n*Gestão Flex*`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("system_notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      toast.error("Erro ao atualizar notificação");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("system_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success("Notificação removida");
    } catch (err) {
      toast.error("Erro ao remover notificação");
    }
  };

  const markAllRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("system_notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) throw error;
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toast.success("Todas as notificações marcadas como lidas");
    } catch (err) {
      toast.error("Erro ao atualizar notificações");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 pt-4 pb-12 max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Alertas do Sistema
            </h2>
            <p className="text-slate-500 font-medium">
              Fique por dentro das atualizações da sua conta.
            </p>
          </div>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button
            onClick={markAllRead}
            variant="outline"
            size="sm"
            className="font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Check className="h-4 w-4 mr-2" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* 1. Collection Alerts (Prioritized) */}
      {overdueItems.length > 0 && (
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                Alertas de Cobrança ({overdueItems.length})
              </h3>
            </div>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
              Ação Imediata
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {overdueItems.map((item) => (
              <Card key={item.id} className="border-none bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                      <User className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-slate-900 truncate tracking-tight uppercase text-base">
                          {item.clientName}
                        </h4>
                        {item.daysOverdue >= 30 && (
                          <Badge variant="destructive" className="bg-rose-600 text-[10px] font-black px-2 py-0.5 rounded-lg">CRÍTICO</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-sm font-black text-blue-600">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Venceu em {new Date(item.dueDate).toLocaleDateString('pt-MZ')}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                          {item.daysOverdue} dias em atraso
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button
                         onClick={() => notifyWhatsApp(item)}
                         className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl h-12 px-6 gap-2 shadow-lg shadow-emerald-200/50"
                      >
                         <MessageSquare className="h-4 w-4" />
                         Notificar
                      </Button>
                      <Button
                         variant="outline"
                         asChild
                         className="flex-1 sm:flex-none border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-2xl h-12 px-6 hover:bg-slate-50"
                      >
                         <Link href={`/payments/new?loanId=${(item as any).loanId || ""}&installmentId=${item.id}`}>Pagar</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="relative py-4">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
               <div className="w-full border-t border-slate-100" />
             </div>
             <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
               <span className="bg-[#F8FAFC] px-4 text-slate-300">Notificações Gerais</span>
             </div>
          </div>
        </div>
      )}

      {/* 2. System Notifications */}
      <div className="space-y-4">
        {notifications.length === 0 && overdueItems.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50 rounded-[2.5rem]">
            <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-bold">Nenhuma notificação por enquanto.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border-none transition-all hover:translate-x-1 ${!notif.is_read ? "bg-white shadow-md ring-1 ring-blue-100" : "bg-slate-50/80 grayscale-[0.5] shadow-sm"}`}
            >
              <CardContent className="p-0">
                <div className="flex items-start p-6 gap-6 relative">
                  {!notif.is_read && (
                    <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                  )}
                  <div
                    className={`p-3 rounded-2xl ${
                      notif.type === "warning"
                        ? "bg-amber-50"
                        : notif.type === "error"
                          ? "bg-red-50"
                          : notif.type === "success"
                            ? "bg-emerald-50"
                            : "bg-blue-50"
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-black tracking-tight ${!notif.is_read ? "text-slate-900" : "text-slate-600"}`}
                      >
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${!notif.is_read ? "text-slate-600" : "text-slate-500"} font-medium`}
                    >
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 pt-3">
                      {notif.link && (
                        <Button
                          asChild
                          size="sm"
                          className="h-8 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Link href={notif.link}>Ver Detalhes</Link>
                        </Button>
                      )}
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Marcar como lida
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
