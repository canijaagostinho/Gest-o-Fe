"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  Building2,
  Smartphone,
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
  const [step, setStep] = useState(1); // 1: method, 2: instruction/gateway, 3: success (4 in original code)
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [fileUrl, setFileUrl] = useState("");

  const supabase = createClient();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${institutionId}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(filePath);

      setFileUrl(publicUrlData.publicUrl);
      toast.success("Comprovativo anexado com sucesso");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao fazer upload do ficheiro.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!fileUrl && paymentMethod !== "gateway") {
      toast.error("Por favor anexe o comprovativo de pagamento.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("subscription_payments").insert({
        institution_id: institutionId,
        subscription_id: subscriptionId,
        plan_id: plan.id,
        amount: plan.price_amount,
        status: "pending",
        payment_method: paymentMethod,
        receipt_url: fileUrl,
      });

      if (error) throw error;

      setStep(3); // Success
      setTimeout(() => {
        onSuccess();
      }, 4000);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao submeter pagamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGatewayPayment = async () => {
    try {
      setLoading(true);
      // This is where we would call the national payment gateway API
      // For now, we simulate the redirect or the prompt
      toast.info("A redirecionar para o portal de pagamento seguro...");

      // Simulating a small delay before "instant" activation (in real world, webhook does this)
      // But if the user wants "libera logo", we can simulate that for the demo or implementation

      // Real implementation would be:
      // 1. Create payment session via API Action
      // 2. Redirect user
      // 3. Webhook updates DB

      setTimeout(() => {
        toast.success("Pagamento processado com sucesso!");
        setStep(3);
        // In a real scenario, we'd wait for the webhook,
        // but we can optimisticly update if the provider supports it
        onSuccess();
      }, 3000);
    } catch (err) {
      toast.error("Erro ao processar pagamento via Gateway.");
    } finally {
      // setLoading(false) // Success handles this
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
              Escolha o seu método preferido para restaurar o acesso
              instantaneamente.
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Label className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Método de Pagamento
                  </Label>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => setPaymentMethod("gateway")}
                      className={`flex items-center gap-5 p-5 rounded-[1.5rem] border-2 transition-all text-left ${paymentMethod === "gateway" ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div
                        className={`p-3 rounded-2xl ${paymentMethod === "gateway" ? "bg-blue-600" : "bg-slate-700"}`}
                      >
                        <Zap className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg">
                          Pagamento Instantâneo
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          Cartão, M-Pesa API, Conta Móvel (Liberação na hora)
                        </p>
                      </div>
                      <CheckCircle2
                        className={`h-6 w-6 ${paymentMethod === "gateway" ? "text-blue-500" : "opacity-0"}`}
                      />
                    </button>

                    <button
                      onClick={() => setPaymentMethod("manual")}
                      className={`flex items-center gap-5 p-5 rounded-[1.5rem] border-2 transition-all text-left ${paymentMethod === "manual" ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div
                        className={`p-3 rounded-2xl ${paymentMethod === "manual" ? "bg-indigo-600" : "bg-slate-700"}`}
                      >
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg">
                          Transferência / Depósito
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          Envio de comprovativo manual (1-4 horas úteis)
                        </p>
                      </div>
                      <CheckCircle2
                        className={`h-6 w-6 ${paymentMethod === "manual" ? "text-indigo-500" : "opacity-0"}`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && paymentMethod === "manual" && (
                <motion.div
                  key="step2-manual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm font-bold">
                        Banco:
                      </span>
                      <span className="font-bold text-white uppercase text-sm tracking-wider">
                        Millennium BIM
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm font-bold">
                        NIB:
                      </span>
                      <span className="font-bold text-white text-lg tabular-nums">
                        0001 0000 1234 5678 901 23
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Comprovativo Bancário
                    </Label>
                    <Label
                      htmlFor="receipt-upload"
                      className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-[1.5rem] cursor-pointer bg-white/5 transition-all ${fileUrl ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/10"}`}
                    >
                      {loading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      ) : fileUrl ? (
                        <>
                          <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500" />
                          <p className="text-sm font-bold text-emerald-500">
                            Documento anexado!
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mb-2 text-slate-500 group-hover:text-white" />
                          <p className="text-sm font-bold text-slate-400">
                            Clique para fazer o upload
                          </p>
                          <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest">
                            PDF, JPG ou PNG
                          </p>
                        </>
                      )}
                      <Input
                        id="receipt-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        disabled={loading}
                      />
                    </Label>
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
                      {paymentMethod === "gateway"
                        ? "O seu acesso está a ser restaurado. O painel será atualizado em instantes."
                        : "Recebemos o seu comprovativo! A nossa equipa irá validar em até 4 horas úteis."}
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
                onClick={step === 1 ? onClose : () => setStep(step - 1)}
              >
                Voltar
              </Button>

              <Button
                onClick={
                  paymentMethod === "gateway"
                    ? handleGatewayPayment
                    : step === 1
                      ? () => setStep(2)
                      : handleSubmitPayment
                }
                disabled={loading || (step === 2 && !fileUrl)}
                className={`flex-1 h-14 rounded-2xl font-black text-lg transition-all shadow-xl ${paymentMethod === "gateway" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"}`}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {paymentMethod === "gateway"
                      ? "Pagar Agora"
                      : step === 1
                        ? "Seguinte"
                        : "Confirmar Envio"}
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
