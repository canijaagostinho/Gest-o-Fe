"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, ArrowRight, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  role?: string | null;
}

export function SubscriptionCountdownBanner({ role }: Props) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isTrialing, setIsTrialing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  // Only show for gestor role
  const isGestor = role === "gestor";

  useEffect(() => {
    if (!isGestor) return;

    const checkSubscription = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("users")
          .select("institution_id")
          .eq("id", user.id)
          .single();

        if (!profile?.institution_id) return;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, trial_end, current_period_end")
          .eq("institution_id", profile.institution_id)
          .maybeSingle();

        if (!sub) return;

        const trialing = sub.status === "trialing";
        const active = sub.status === "active";

        if (!trialing && !active) return;

        const endDate = trialing ? sub.trial_end : sub.current_period_end;
        if (!endDate) return;

        const diff = new Date(endDate).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));

        setIsTrialing(trialing);
        // Show banner when 7 or fewer days remain
        if (days >= 0 && days <= 7) {
          setDaysLeft(days);
        } else {
          setDaysLeft(null);
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      }
    };

    checkSubscription();
  }, [isGestor]);

  if (!isGestor || daysLeft === null || dismissed) return null;

  const isUrgent = daysLeft <= 3;

  const bgClass = isUrgent
    ? "bg-gradient-to-r from-red-600 to-rose-600"
    : "bg-gradient-to-r from-amber-500 to-orange-500";

  const label = isTrialing ? "período de teste" : "assinatura";

  const message =
    daysLeft === 0
      ? `O seu ${label} expira hoje!`
      : daysLeft === 1
        ? `Falta 1 dia para o fim do seu ${label}!`
        : `Faltam ${daysLeft} dias para o fim do seu ${label}.`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className={`${bgClass} text-white px-6 py-3`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/settings/billing")}
              className="flex items-center gap-3 flex-1 hover:opacity-90 transition-opacity text-left"
            >
              <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                {isUrgent ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>

              {/* Days pill */}
              <div className="flex-shrink-0 bg-white/20 rounded-xl px-3 py-1 text-center min-w-[52px]">
                <span className="text-xl font-black leading-none block">
                  {daysLeft}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                  {daysLeft === 1 ? "dia" : "dias"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-black text-sm">{message} </span>
                <span className="font-medium text-sm text-white/90">
                  Renove agora para não perder o acesso.
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest flex-shrink-0">
                Renovar <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Fechar alerta"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
