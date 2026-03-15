"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  role?: string | null;
}

export function InstitutionCompletionBanner({ role }: Props) {
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Only show for gestor role
  const isGestor = role === "gestor";

  useEffect(() => {
    if (!isGestor) return;

    const checkCompletion = async () => {
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

        const { data: institution } = await supabase
          .from("institutions")
          .select("name, email, phone, address")
          .eq("id", profile.institution_id)
          .single();

        if (!institution) return;

        // Check if any required field is missing/empty
        const incomplete =
          !institution.name?.trim() ||
          !institution.email?.trim() ||
          !institution.phone?.trim() ||
          !institution.address?.trim();

        setIsIncomplete(incomplete);
        // Reset dismissed when data becomes complete
        if (!incomplete) setDismissed(false);
      } catch (err) {
        console.error("Error checking institution completion:", err);
      }
    };

    checkCompletion();

    // Re-check when navigating away from the institution settings page
    // (user might have just saved data)
  }, [isGestor, pathname]);

  if (!isGestor || !isIncomplete || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/settings/institution")}
              className="flex items-center gap-3 flex-1 hover:opacity-90 transition-opacity text-left"
            >
              <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-black text-sm">
                  Perfil da Instituição incompleto —{" "}
                </span>
                <span className="font-medium text-sm text-white/90">
                  Preencha os dados da sua instituição para uma melhor
                  experiência operacional.
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest flex-shrink-0">
                Completar agora <ArrowRight className="h-3.5 w-3.5" />
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
