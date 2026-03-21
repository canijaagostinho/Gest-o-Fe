"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "react-router-dom"; // Actually, project uses next/navigation
import { AlertCircle, ArrowRight, X, Sparkles, Building2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Note: Next.js standard is next/navigation
import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";

interface Props {
  role?: string | null;
}

export function InstitutionCompletionBanner({ role }: Props) {
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const router = useNextRouter();
  const pathname = useNextPathname();

  // Show for gestor (admin of institution) or admin_geral
  const isAdmin = role === "gestor" || role === "admin_geral";

  useEffect(() => {
    // Check if dismissed in localStorage for this specific reason
    const isPermanentlyDismissed = localStorage.getItem("onboarding_dismissed") === "true";
    if (isPermanentlyDismissed) {
      setDismissed(true);
    }

    if (!isAdmin) return;

    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Get user profile and institution
        const { data: profile } = await supabase
          .from("users")
          .select("institution_id")
          .eq("id", user.id)
          .single();

        if (!profile?.institution_id) return;

        // 2. Check if institution data is complete
        const { data: institution } = await supabase
          .from("institutions")
          .select("name, email, phone, nuit, province, district, address_line, responsible_name")
          .eq("id", profile.institution_id)
          .single();

        if (!institution) return;

        // Mandatory fields check
        const incomplete =
          !institution.email?.trim() ||
          !institution.phone?.trim() ||
          !institution.nuit?.trim() ||
          !institution.responsible_name?.trim() ||
          !institution.address_line?.trim();

        // 3. Check if at least one account (caixa) was created
        // Requirement: "aparece automaticamente após a criação da primeira conta"
        const { count, error: countError } = await supabase
          .from("accounts")
          .select("*", { count: 'exact', head: true })
          .eq("institution_id", profile.institution_id);

        setIsIncomplete(incomplete);
        setHasAccount((count || 0) > 0);
        setIsReady(true);

        // If data is now complete, ensure it's not dismissed anymore (reset for future use if needed)
        if (!incomplete) {
          localStorage.removeItem("onboarding_dismissed");
          setDismissed(false);
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
      }
    };

    checkStatus();
  }, [isAdmin, pathname]);

  const handleDismiss = () => {
    setDismissed(true);
    // Optional: session-based dismissal or persistent
    // localStorage.setItem("onboarding_dismissed", "true");
  };

  // Condition: Admin/Director AND Incomplete AND has at least one account created
  if (!isAdmin || !isReady || !isIncomplete || dismissed || !hasAccount) return null;

  // Don't show on the settings page itself (redundant)
  if (pathname.includes("/settings/institution")) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl px-4"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-blue-100 shadow-[0_20px_50px_rgba(59,130,246,0.15)] rounded-3xl p-5 md:p-6 overflow-hidden relative group">
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-emerald-50/50 rounded-full blur-3xl" />

          <div className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0 animate-pulse-slow">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2 py-0 text-[10px] uppercase font-black tracking-widest">
                    Ação Necessária
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Configuração Inicial
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                  Complete o Perfil da sua Instituição
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">
                  Dados obrigatórios estão em falta. Preencha o NUIT, endereço e contatos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/settings/institution")}
                className="bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl h-11 px-6 shadow-xl shadow-slate-100 group transition-all"
              >
                Completar <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="rounded-2xl hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
            {children}
        </span>
    );
}
