"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  LogOut,
  CheckCircle2,
  MessageSquare,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  Star,
  Lock,
  LockKeyhole,
  Check,
  Sparkles,
  HelpCircle,
  Smartphone,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { PaymentModal } from "@/components/billing/payment-modal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BlockedPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [institution, setInstitution] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("institution_id, role:roles(name)")
          .eq("id", user.id)
          .single();

        if (profile) {
          const roleName = (profile.role as any)?.name || "operador";
          setUserRole(roleName);
        }

        if (profile?.institution_id) {
          const { data: inst } = await supabase
            .from("institutions")
            .select("*")
            .eq("id", profile.institution_id)
            .single();
          setInstitution(inst);

          const { data: sub } = await supabase
            .from("subscriptions")
            .select("*, plan:plans(*)")
            .eq("institution_id", profile.institution_id)
            .maybeSingle();
          setSubscription(sub);
        }

        const { data: availablePlans } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("price_amount", { ascending: true });
        setPlans(availablePlans || []);
      } catch (err) {
        console.error("Error fetching blocked page data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0B0F19]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-r-2 border-blue-500"
        />
      </div>
    );
  }

  const isTrialEnded = subscription?.status === "trialing";

  return (
    <div className="min-h-screen bg-[#0A0D16] text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      <title>Acesso Suspenso - Gestão Flex</title>
      
      {/* Background blobs for visual richness */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.2, 0.12],
            x: [0, 45, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.15, 1, 1.15],
            opacity: [0.08, 0.15, 0.08],
            x: [0, -35, 0],
            y: [0, -45, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-800 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
      </div>

      {/* Glassmorphic Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-10 bg-slate-950/20 backdrop-blur-md rounded-2xl mt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative flex items-center justify-center overflow-hidden">
            <Image
              src="/logo-premium.png"
              alt="GestãoFlex Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-black text-white tracking-tight font-sora">
            Gestão<span className="text-blue-500">Flex</span>
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 font-bold transition-all text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair da Conta</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col justify-center">
        {userRole === "gestor" || userRole === "admin_geral" ? (
          <div className="space-y-12">
            
            {/* Title / Hero */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-black tracking-widest uppercase"
              >
                <Sparkles className="h-3 w-3 text-amber-400" /> Acesso Suspenso
              </motion.div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight font-sora">
                Mantenha o seu capital a <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">render</span>
              </h1>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                {isTrialEnded ? (
                  <>O período de teste da instituição <span className="text-blue-400 font-bold">{institution?.name}</span> chegou ao fim.</>
                ) : (
                  <>A assinatura do GestãoFlex para a instituição <span className="text-blue-400 font-bold">{institution?.name}</span> está suspensa.</>
                )}
                <br />
                Reative seu plano hoje para continuar operando com cobranças automatizadas e relatórios em tempo real.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
              
              {/* Left Column: Pricing Cards (Columns 8/12) */}
              <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Nossos Planos</h2>
                  <div className="h-px bg-white/10 flex-grow"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {plans.map((plan, idx) => {
                    const isPremium = plan.name.toLowerCase().includes("premium") || plan.name.toLowerCase().includes("anual");
                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      >
                        <Card
                          className={`group relative flex flex-col border-none !bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 ring-1 ring-white/10 ${
                            isPremium ? "ring-2 ring-blue-500/50 !bg-gradient-to-b !from-[#151B33] !to-[#0A0D16] shadow-[0_0_35px_rgba(59,130,246,0.25)]" : ""
                          }`}
                        >
                          {isPremium && (
                            <div className="absolute top-0 right-0 p-6">
                              <span className="bg-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/20 text-white">
                                <Star className="h-3 w-3 fill-current text-amber-300" /> Mais Recomendado
                              </span>
                            </div>
                          )}

                          <CardHeader className="pb-6 pt-10 px-8">
                            <div className={`p-4 w-fit rounded-2xl mb-4 ${isPremium ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-slate-400"}`}>
                              <Zap className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-3xl font-black text-white tracking-tight font-sora">
                              {plan.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-400 min-h-[3rem] mt-2 leading-relaxed font-medium">
                              {plan.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="px-8 pb-8 flex-grow">
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-black text-white tracking-tight tabular-nums">
                                {Number(plan.price_amount).toLocaleString("pt-MZ")}
                              </span>
                              <span className="text-sm font-black text-slate-500 uppercase tracking-widest">
                                MTn
                              </span>
                            </div>

                            <div className="mt-8 space-y-4">
                              <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
                                <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                  <Clock className="h-3 w-3 text-blue-400" />
                                </div>
                                Válido por {plan.interval_months} mes(es)
                              </div>
                              <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
                                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                  <Check className="h-3 w-3 text-emerald-400" />
                                </div>
                                Automações de Cobrança WhatsApp
                              </div>
                              <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
                                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                  <Check className="h-3 w-3 text-emerald-400" />
                                </div>
                                Acesso total a todas funcionalidades
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="p-8 pt-0">
                            <Button
                              className={`w-full h-14 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg ${
                                isPremium
                                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30 border-none"
                                  : "bg-white text-slate-950 hover:bg-slate-200 border-none"
                              }`}
                              onClick={() => {
                                setSelectedPlan(plan);
                                setIsPaymentModalOpen(true);
                              }}
                            >
                              Pagar com Visa / Mastercard <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Sidebar (Columns 4/12) */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumo do Status</h2>
                  <div className="h-px bg-white/10 flex-grow"></div>
                </div>

                {/* Subscription Expiry / Detail Card */}
                <Card className="border-none !bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 rounded-[2rem] overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instituição</p>
                        <h4 className="text-base font-bold text-white leading-tight font-sora">{institution?.name}</h4>
                      </div>
                    </div>
                    
                    <div className="h-px bg-white/5"></div>
                    
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between font-semibold text-slate-400">
                        <span>Plano Anterior:</span>
                        <span className="text-slate-200">{subscription?.plan?.name || "-"}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-400">
                        <span>Vencimento:</span>
                        <span className="text-slate-200">
                          {subscription?.current_period_end
                            ? new Date(subscription.current_period_end).toLocaleDateString("pt-PT")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-400">
                        <span>Dias Vencidos:</span>
                        <span className="text-rose-400 font-bold">
                          {subscription?.current_period_end
                            ? Math.max(
                                0,
                                Math.ceil(
                                  (Date.now() - new Date(subscription.current_period_end).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )
                            : 0}{" "}
                          dia(s)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features Lock Card */}
                <Card className="border-none !bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/10 rounded-[2rem] overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <LockKeyhole className="h-24 w-24 text-white" />
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Lock className="h-4 w-4 text-rose-500" /> Funcionalidades Pausadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 space-y-4">
                    <div className="space-y-3">
                      {[
                        { title: "WhatsApp Lembretes", desc: "Cobranças automáticas para devedores.", status: "Pausado" },
                        { title: "Novos Empréstimos", desc: "Registo e cálculo de parcelas.", status: "Bloqueado" },
                        { title: "Relatórios de Lucros", desc: "Análise financeira completa.", status: "Bloqueado" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 flex-shrink-0 animate-pulse"></div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white leading-tight">{item.title}</span>
                              <span className="text-[9px] font-black uppercase bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded-md leading-none">{item.status}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3.5 text-[11px] text-blue-300 font-medium leading-relaxed">
                      💡 Ao manter a sua assinatura ativa, você garante a saúde financeira do seu negócio e o retorno de cada centavo emprestado sem estresse.
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
            
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto !bg-slate-900/40 backdrop-blur-xl border border-rose-500/20 rounded-[2.5rem] p-10 text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10">
              <Lock className="h-8 w-8 text-rose-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight font-sora">
              Acesso Temporariamente Suspenso
            </h3>
            <p className="text-slate-300 leading-relaxed font-medium text-sm">
              Por favor, entre em contato com o <strong>Administrador/Gestor</strong> da sua instituição para regularizar o pagamento da mensalidade do GestãoFlex.
              <br /><br />
              Todos os seus dados estão seguros e o acesso será restabelecido de imediato assim que a assinatura for reativada.
            </p>
            {subscription && (
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="text-slate-400 font-semibold"><span className="text-slate-200">Plano:</span> {subscription.plan?.name || "-"}</p>
                <p className="text-slate-400 font-semibold">
                  <span className="text-slate-200">Valor de Renovação:</span>{" "}
                  {Number(subscription.plan?.price_amount).toLocaleString("pt-MZ")} MTn
                </p>
                <p className="text-slate-400 font-semibold">
                  <span className="text-slate-200">Data Limite:</span>{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString("pt-PT")}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Support Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 pt-8 border-t border-white/5 relative z-10 text-slate-500 font-bold text-xs">
          <span>Precisa de ajuda ou deseja alterar seu plano?</span>
          <a
            href="mailto:suporte@gestaoflex.mz"
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-blue-500/30"
          >
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span>Falar com Suporte</span>
          </a>
        </div>
      </main>

      {/* Payment Modal Support */}
      {isPaymentModalOpen && selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          institutionId={institution?.id}
          subscriptionId={subscription?.id}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            toast.success("Pagamento confirmado! Acesso restaurado.");
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 2000);
          }}
        />
      )}
    </div>
  );
}
