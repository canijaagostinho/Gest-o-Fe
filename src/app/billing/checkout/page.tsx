"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert,
  Calendar,
  Zap,
  Upload,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createSubscriptionAction } from "@/app/actions/subscription-actions";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");
  
  const [plan, setPlan] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("gateway");
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (!planId) {
        toast.error("Plano não selecionado.");
        router.push("/settings/plans");
        return;
      }

      try {
        setLoading(true);
        
        // Obter plano
        const { data: planData, error: planError } = await supabase
          .from("plans")
          .select("*")
          .eq("id", planId)
          .single();
          
        if (planError) throw planError;
        setPlan(planData);

        // Obter instituição do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from("users")
            .select("institution:institutions(*)")
            .eq("id", user.id)
            .single();
            
          if (userData && userData.institution) {
            setInstitution(userData.institution);
          }
        }
      } catch (err: any) {
        toast.error("Erro ao carregar dados: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [planId, supabase, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    try {
      setSubmitting(true);
      
      // Simulação de upload de comprovativo (seria uma URL real aqui)
      const simulatedReceiptUrl = "https://example.com/receipt.pdf";
      
      const result = await createSubscriptionAction(
        plan.id,
        paymentMethod,
        plan.price_amount,
        simulatedReceiptUrl
      );

      if (result.success) {
        if (paymentMethod === "gateway") {
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

          if (baseUrl && (result as any).paymentId) {
            const finalUrl = `${baseUrl}?reference=${(result as any).paymentId}`;
            toast.info("A redirecionar para o portal de pagamento seguro...");
            window.location.href = finalUrl;
            return;
          }
        }

        setSuccess(true);
        toast.success("Subscrição processada com sucesso!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err: any) {
      toast.error("Erro ao processar: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold animate-pulse">Preparando seu checkout seguro...</p>
      </div>
    );
  }

  if (!plan) return null;

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6"
      >
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Parabéns!</h2>
        <p className="text-xl text-slate-600 max-w-md mb-8">
          Sua subscrição para o plano <span className="text-blue-600 font-black">{plan.name}</span> foi processada. 
          Você será redirecionado para o dashboard em instantes.
        </p>
        <Button 
          asChild 
          className="bg-slate-900 hover:bg-black text-white px-8 h-12 rounded-2xl font-bold"
        >
          <Link href="/dashboard">Ir para o Dashboard agora</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/settings/plans" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Voltar para Planos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Payment Form */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Finalizar Subscrição</h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Checkout Seguro & Encriptado</p>
          </div>

          <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-extrabold flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">1</span>
                Método de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 p-6 rounded-3xl border-2 border-blue-600 bg-blue-50/50 ring-4 ring-blue-100/50">
                <div className="p-4 rounded-2xl bg-blue-600 text-white">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-xl">Débito Pay</p>
                  <p className="text-sm text-slate-600 font-bold mt-1">Pagamento Seguro com Cartão Visa / Mastercard</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Liberação instantânea do acesso via API</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider self-start md:self-center">
                  <Zap className="w-4 h-4" /> Instantâneo
                </div>
              </div>

              <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-blue-600" />
                  Instruções de Pagamento
                </h4>
                <ul className="text-sm space-y-3 text-slate-600 font-medium">
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black border border-slate-200">1</span>
                     Ao clicar em "Confirmar Pagamento", você será redirecionado para o portal seguro da Débito Pay.
                  </li>
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black border border-slate-200">2</span>
                     Efetue o pagamento de forma segura usando o seu cartão Visa ou Mastercard.
                  </li>
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black border border-slate-200">3</span>
                     A ativação da sua conta será automática e imediata após a conclusão (via webhook).
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5">
          <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden sticky top-8">
            <div className="p-8 bg-blue-600/10">
              <h3 className="text-2xl font-black tracking-tight mb-2">Resumo do Pedido</h3>
              <p className="text-blue-200/60 font-medium text-xs tracking-widest uppercase">Processamento imediato após confirmação</p>
            </div>
            
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/10">
                <div className="p-3 bg-blue-600 rounded-2xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-lg leading-none mb-1">{plan.name}</p>
                  <p className="text-xs text-white/50 font-bold uppercase tracking-wider italic">Plano Selecionado</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50 font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Duração
                  </span>
                  <span className="font-black">{plan.interval_months} Mes(es)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50 font-bold flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Método
                  </span>
                  <span className="font-black uppercase tracking-widest text-[10px] bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    {paymentMethod === 'gateway' ? 'Débito Pay' : paymentMethod === 'mpesa' ? 'M-Pesa' : 'Transferência'}
                  </span>
                </div>
                {institution && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/50 font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Instituição
                    </span>
                    <span className="font-black truncate max-w-[150px]">{institution.name}</span>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-8">
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Total a Pagar</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black leading-none italic tracking-tighter">
                        {Number(plan.price_amount).toLocaleString('pt-MZ')}
                      </span>
                      <span className="text-xs font-black text-blue-400 uppercase tracking-widest">MTn</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-900/40 group active:scale-[0.98] transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Confirmar Pagamento
                        <CheckCircle2 className="ml-3 w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 py-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Garantia de Segurança Gestão Flex</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="p-6 bg-slate-800/50 flex items-center gap-4">
              <div className="p-2 bg-slate-700 rounded-xl">
                 <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                Sua ativação será automática e imediata após a confirmação do pagamento pelo gateway.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
