import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Notification } from "@/types/database";
import { toast } from "sonner";

interface NotificationPayload {
  new: Notification;
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Initial fetch could be added here

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: NotificationPayload) => {
          const newNotification = payload.new;
          setNotifications((prev) => [newNotification, ...prev]);
          toast(newNotification.title, {
            description: newNotification.message,
            // type: newNotification.type // Sonner might need adaptation for types
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return notifications;
}
