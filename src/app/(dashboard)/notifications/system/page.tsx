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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50">
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
