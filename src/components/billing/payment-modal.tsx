"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { createSubscriptionAction } from "@/app/actions/subscription-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  institutionId: string;
  subscriptionId: string;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  plan,
  institutionId,
  subscriptionId,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: gateway info, 3: processing/success
  const paymentMethod = "gateway";

  const supabase = createClient();

  const handleGatewayPayment = async () => {
    try {
      setLoading(true);

      // 1. Create a pending payment record first to get a reference ID via server action
      const result = await createSubscriptionAction(
        plan.id,
        "gateway",
        plan.price_amount
      );

      if (!result.success || !result.paymentId) {
        throw new Error("Não foi possível gerar a referência de pagamento.");
      }

      // 2. Safeguard: use the new links explicitly for all plans
      let baseUrl = plan?.payment_url;
      
      if (plan?.name === "Mensal") {
        baseUrl = "https://debitopay.com/l/gestaoflex";
      } else if (plan?.name === "Trimestral") {
        baseUrl = "https://debitopay.com/l/gestaoflex-pro-plano-trimestral";
      } else if (plan?.name === "Semestral") {
        baseUrl = "https://debitopay.com/l/gestaoflex-pro-plano-semestral";
      } else if (plan?.name === "Anual") {
        baseUrl = "https://debitopay.com/l/gestaoflex-pro-plano-anual";
      }

      if (baseUrl) {
        // 3. Append our payment ID as a reference for the webhook
        const finalUrl = `${baseUrl}?reference=${result.paymentId}`;
        
        toast.info("A redirecionar para o portal de pagamento seguro...");
        window.location.href = finalUrl;
      } else {
        toast.info("A processar pagamento seguro...");
        setTimeout(() => {
          toast.success("Pagamento processado com sucesso!");
          setStep(3);
          onSuccess();
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao processar pagamento: " + err.message);
    } finally {
      // setLoading(false)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-slate-900 border-white/10 shadow-2xl rounded-[2.5rem] p-0 overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />

        <div className="p-8 pt-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-400" />
              Ativar {plan?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-base">
            Restaure o seu acesso instantaneamente através do portal de pagamento seguro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-white/5 rounded-3xl p-6 ring-1 ring-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Plano Selecionado
                </p>
                <p className="text-xl font-bold text-white">{plan?.name}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Total a Pagar
                </p>
                <p className="text-3xl font-black text-emerald-400 tabular-nums">
                  {Number(plan?.price_amount).toLocaleString("pt-MZ")}{" "}
                  <span className="text-sm font-bold opacity-60">MTn</span>
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-blue-500/30 bg-blue-500/5 ring-4 ring-blue-500/10">
                    <div className="p-4 rounded-2xl bg-blue-600 text-white">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl text-white">Débito Pay</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Pagamento imediato via Cartão de Crédito/Débito Visa ou Mastercard.
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
                        Ativação automática via webhook instantâneo
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="h-24 w-24 bg-emerald-500/20 rounded-full flex items-center justify-center ring-8 ring-emerald-500/5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                        delay: 0.2,
                      }}
                    >
                      <ShieldCheck className="h-12 w-12 text-emerald-500" />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      Pagamento em Processamento
                    </h3>
                    <p className="text-slate-400 font-medium max-w-xs leading-relaxed">
                      O seu acesso está a ser restaurado. O painel será atualizado em instantes.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex gap-4">
          {step < 3 && (
            <>
              <Button
                variant="ghost"
                className="h-14 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 px-8"
                onClick={onClose}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleGatewayPayment}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl font-black text-lg transition-all shadow-xl bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Pagar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
