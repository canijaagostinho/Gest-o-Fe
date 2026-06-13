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
  Smartphone,
  CreditCard,
  TrendingUp,
  Activity,
  FileText,
  AlertTriangle,
  Building2,
  HelpCircle,
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
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          console.error("userError:", userError);
          toast.error("Erro de Autenticação", { description: userError.message });
          router.push("/auth/login");
          return;
        }
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("institution_id, role:roles(name)")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("profileError:", profileError);
          toast.error("Erro ao Carregar Perfil", { description: profileError.message });
        }

        if (profile) {
          const roleName = (profile.role as any)?.name || "operador";
          setUserRole(roleName);
        }

        if (profile?.institution_id) {
          const { data: inst, error: instError } = await supabase
            .from("institutions")
            .select("*")
            .eq("id", profile.institution_id)
            .single();
          if (instError) {
            console.error("instError:", instError);
            toast.error("Erro ao Carregar Instituição", { description: instError.message });
          } else {
            setInstitution(inst);
          }

          const { data: sub, error: subError } = await supabase
            .from("subscriptions")
            .select("*, plan:plans(*)")
            .eq("institution_id", profile.institution_id)
            .maybeSingle();
          if (subError) {
            console.error("subError:", subError);
            toast.error("Erro ao Carregar Assinatura", { description: subError.message });
          } else {
            setSubscription(sub);
          }
        }

        const { data: availablePlans, error: plansError } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("price_amount", { ascending: true });

        if (plansError) {
          console.error("plansError:", plansError);
          toast.error("Erro ao Carregar Planos", { description: plansError.message });
        } else {
          setPlans(availablePlans || []);
        }
      } catch (err: any) {
        console.error("Error fetching blocked page data:", err);
        toast.error("Erro Inesperado", {
          description: err.message || "Ocorreu um erro desconhecido.",
        });
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

  const scrollToPlans = () => {
    const plansSection = document.getElementById("planos-section");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#020817]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-r-2 border-blue-500"
        />
      </div>
    );
  }

  const isTrialEnded = subscription?.status === "trialing";

  // Helper to dynamically label plans
  const getPlanDetails = (plan: any) => {
    const name = plan.name.toLowerCase();
    const months = plan.interval_months;
    if (name.includes("anual") || months === 12) {
      return {
        badge: "🏆 RECOMENDADO - MAIS VANTAJOSO",
        tagline: "Melhor valor anual",
        savings: "Economize 35%",
        isHighlighted: true,
        colorClass: "from-blue-600 to-indigo-600",
        btnClass: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      };
    }
    if (name.includes("semestral") || months === 6) {
      return {
        badge: "⭐ MELHOR CUSTO-BENEFÍCIO",
        tagline: "Ideal para médio prazo",
        savings: "Economize 20%",
        isHighlighted: false,
        colorClass: "from-slate-800 to-slate-900",
        btnClass: "bg-white text-slate-950 hover:bg-slate-200",
      };
    }
    if (name.includes("trimestral") || months === 3) {
      return {
        badge: "🔥 MAIS POPULAR",
        tagline: "O mais escolhido",
        savings: "Economize 10%",
        isHighlighted: false,
        colorClass: "from-slate-800 to-slate-900",
        btnClass: "bg-white text-slate-950 hover:bg-slate-200",
      };
    }
    return {
      badge: "Plano Mensal",
      tagline: "Flexibilidade mensal",
      savings: null,
      isHighlighted: false,
      colorClass: "from-slate-800 to-slate-900",
      btnClass: "bg-white text-slate-950 hover:bg-slate-200",
    };
  };

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      <title>Acesso Suspenso - Gestão Flex</title>

      {/* Grid overlay Stripe-style */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* Background blobs for visual richness */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 60, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[15%] w-[70%] h-[70%] bg-blue-900/40 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -60, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -right-[15%] w-[70%] h-[70%] bg-indigo-950/40 rounded-full blur-[160px]"
        />
      </div>

      {/* Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5 relative z-10 bg-slate-950/45 backdrop-blur-xl rounded-2xl mt-4">
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col justify-center gap-24">
        {userRole === "gestor" || userRole === "admin_geral" ? (
          <>
            {/* HERO SECTION */}
            <section className="max-w-4xl mx-auto w-full">
              <Card className="border border-white/10 bg-slate-950/50 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-12 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                {/* Visual gradient light behind the badge */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/15 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                  {/* Upper Badge */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-rose-950/50 border border-rose-500/30 text-rose-400 rounded-full text-xs font-extrabold tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                    Assinatura Suspensa
                  </motion.div>

                  {/* Title & Subtitle */}
                  <div className="space-y-4">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-sora">
                      Seu sistema está <br />
                      <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-rose-500 bg-clip-text text-transparent">
                        temporariamente bloqueado
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                      A sua assinatura expirou e algumas funcionalidades cruciais foram pausadas para proteger a continuidade e integridade do seu serviço.
                    </p>
                  </div>

                  {/* Emotional Message Box */}
                  <div className="w-full max-w-xl bg-slate-900/40 border border-white/5 rounded-2xl p-6 text-left space-y-4 backdrop-blur-md">
                    <p className="text-sm font-black uppercase text-slate-400 tracking-wider">
                      Enquanto sua conta estiver suspensa:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "Novas cobranças não serão processadas",
                        "Relatórios financeiros ficarão indisponíveis",
                        "Lembretes automáticos serão interrompidos",
                        "O crescimento do seu negócio ficará limitado",
                      ].map((text, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-rose-500 text-sm mt-0.5">🔴</span>
                          <span className="text-xs text-slate-200 font-bold leading-normal">
                            {text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Countdown Timer Visual */}
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-6 py-3.5 rounded-xl">
                    <span className="text-lg">⏳</span>
                    <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
                      Reative agora e volte a operar em menos de 2 minutos.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button
                      onClick={scrollToPlans}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black h-14 px-8 text-base rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] border-none"
                    >
                      Reativar Agora <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white h-14 px-8 text-base rounded-xl font-bold transition-all"
                    >
                      <a href="mailto:suporte@gestaoflex.mz">
                        <MessageSquare className="mr-2 h-5 w-5 text-blue-400" /> Falar com Suporte
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            {/* IMPACT SECTION */}
            <section className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-black tracking-[0.2em] text-rose-500 uppercase">Perdas Operacionais</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sora">
                  O que você está perdendo neste momento
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
                  Cada dia com o sistema suspenso representa mais risco de atraso nos pagamentos dos seus clientes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Cobranças automáticas pausadas",
                    desc: "Sem envio automático de parcelas a vencer, abrindo margem para esquecimentos.",
                    icon: CreditCard,
                    glowColor: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] border-rose-500/10 hover:border-rose-500/30",
                    iconClass: "bg-rose-500/10 text-rose-400",
                  },
                  {
                    title: "Relatórios financeiros bloqueados",
                    desc: "Nenhum gráfico de lucro, demonstrativo de fluxo de caixa ou ROI estará acessível.",
                    icon: TrendingUp,
                    glowColor: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] border-amber-500/10 hover:border-amber-500/30",
                    iconClass: "bg-amber-500/10 text-amber-400",
                  },
                  {
                    title: "WhatsApp automático suspenso",
                    desc: "As mensagens de régua de cobrança programadas no WhatsApp ficam totalmente congeladas.",
                    icon: MessageSquare,
                    glowColor: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] border-blue-500/10 hover:border-blue-500/30",
                    iconClass: "bg-blue-500/10 text-blue-400",
                  },
                  {
                    title: "Controle de parcelas indisponível",
                    desc: "Sua equipe não consegue emitir recibos, registrar amortizações ou receber pagamentos.",
                    icon: Clock,
                    glowColor: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] border-emerald-500/10 hover:border-emerald-500/30",
                    iconClass: "bg-emerald-500/10 text-emerald-400",
                  },
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="group"
                  >
                    <Card className={`h-full border bg-slate-950/45 backdrop-blur-xl rounded-[2rem] p-6 transition-all duration-300 group-hover:-translate-y-1.5 ${card.glowColor}`}>
                      <CardHeader className="p-0 pb-4">
                        <div className={`p-3.5 w-fit rounded-2xl mb-4 ${card.iconClass}`}>
                          <card.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg font-bold text-white tracking-tight leading-snug">
                          {card.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                          {card.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* BENEFIT SECTION */}
            <section className="space-y-8 bg-slate-950/20 border border-white/5 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
                <span className="text-xs font-black tracking-[0.2em] text-blue-500 uppercase">Vantagens de Reativar</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sora">
                  Por que milhares de instituições usam o GestãoFlex
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-medium">
                  Garanta a saúde financeira da sua operação com as melhores ferramentas de microcrédito.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mt-8">
                {[
                  { title: "Automatização de cobranças", desc: "Redução comprovada de até 40% na taxa de atraso." },
                  { title: "Gestão inteligente de parcelas", desc: "Cálculos matemáticos e taxas de amortização 100% corretos." },
                  { title: "Controle de inadimplência", desc: "Indicadores claros e suspensão de novas liberações de risco." },
                  { title: "Relatórios inteligentes", desc: "Lucro líquido, histórico operacional e fluxo em PDF/Excel." },
                  { title: "Fluxo de caixa em tempo real", desc: "Movimentações de saldo atualizadas no momento da baixa." },
                  { title: "Notificações automáticas", desc: "WhatsApp integrado com mensagens automáticas personalizadas." },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex gap-4 p-5 bg-slate-900/35 border border-white/5 rounded-2xl hover:bg-slate-900/50 hover:border-white/10 transition-all duration-300">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-white">{benefit.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRICING SECTION */}
            <section id="planos-section" className="space-y-8 pt-8">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-black tracking-[0.2em] text-emerald-500 uppercase">Valores de Assinatura</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sora">
                  Escolha o seu Plano Premium
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-medium">
                  Selecione o plano ideal para a sua estrutura operacional e recupere o acesso imediatamente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center max-w-6xl mx-auto mt-8">
                {plans.map((plan, idx) => {
                  const details = getPlanDetails(plan);
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="flex"
                    >
                      <Card
                        className={`group relative flex flex-col w-full border-none rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.65)] hover:-translate-y-2 ring-1 ${
                          details.isHighlighted
                            ? "ring-2 ring-blue-500/60 bg-gradient-to-b from-[#11162b] to-[#040817] shadow-[0_0_35px_rgba(37,99,235,0.25)] scale-105"
                            : "ring-white/5 bg-slate-900/60 backdrop-blur-xl"
                        }`}
                      >
                        {/* Highlights & Badges */}
                        {details.isHighlighted && (
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400" />
                        )}
                        <div className="absolute top-0 right-0 p-6">
                          {details.isHighlighted ? (
                            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg text-white shadow-amber-500/20">
                              <Star className="h-3 w-3 fill-current text-white" /> MAIS VANTAJOSO
                            </span>
                          ) : plan.name.toLowerCase().includes("semestral") ? (
                            <span className="bg-slate-800 border border-white/10 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-slate-300">
                              MELHOR CUSTO
                            </span>
                          ) : null}
                        </div>

                        <CardHeader className="pb-6 pt-10 px-8">
                          <div className={`p-4 w-fit rounded-2xl mb-4 ${
                            details.isHighlighted ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-slate-400"
                          }`}>
                            <Zap className="h-8 w-8" />
                          </div>
                          <CardTitle className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sora">
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-400 min-h-[3rem] mt-2 leading-relaxed font-medium">
                            {plan.description}
                          </CardDescription>
                          {details.savings && (
                            <div className="mt-2.5 inline-block w-fit bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                              {details.savings}
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="px-8 pb-8 flex-grow">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                              {Number(plan.price_amount).toLocaleString("pt-MZ")}
                            </span>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
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
                              Automações de WhatsApp
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
                              <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-emerald-400" />
                              </div>
                              Suporte Premium prioritário
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="p-8 pt-0">
                          <Button
                            className={`w-full h-14 rounded-2xl font-black text-sm sm:text-base transition-all duration-300 shadow-md ${details.btnClass}`}
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsPaymentModalOpen(true);
                            }}
                          >
                            Reativar com Cartão <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* TRUST & CONVERSION BADGES */}
            <section className="max-w-4xl mx-auto w-full text-center space-y-8 border-t border-white/5 pt-12">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 text-base">⚡</span>
                  <span>Ativação Instantânea</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 text-base">🔒</span>
                  <span>Ambiente Seguro SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-500 text-base">🛡️</span>
                  <span>Proteção de Dados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">💳</span>
                  <span>Visa / Mastercard</span>
                </div>
              </div>
            </section>

            {/* SOCIAL PROOF SECTION */}
            <section className="space-y-10 border-t border-white/5 pt-16">
              <div className="text-center space-y-3">
                <span className="text-xs font-black tracking-[0.2em] text-indigo-500 uppercase">Impacto do Sistema</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sora">
                  Números que confirmam a nossa confiança
                </h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
                {[
                  { value: "+5.000", label: "Utilizadores ativos diários" },
                  { value: "+1 Milhão MT", label: "Processados mensalmente" },
                  { value: "98%", label: "Taxa de satisfação do cliente" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                    <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-400 mt-2">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Fictional Logos */}
              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 pt-6 opacity-30 select-none">
                {["MozCredi", "CapitalFácil", "KapaFinanças", "BancMicro", "MicroMoz"].map((logo, idx) => (
                  <span key={idx} className="text-sm sm:text-base font-black tracking-widest uppercase font-sora text-slate-400">
                    {logo}
                  </span>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* OPERATOR REDIRECT SCREEN */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-slate-950/50 backdrop-blur-2xl border border-rose-500/25 rounded-[3rem] p-10 text-center space-y-8 shadow-[0_20px_50px_rgba(239,68,68,0.15)]"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-500/10">
              <LockKeyhole className="h-10 w-10 text-rose-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-sora">
                Acesso Suspenso
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Por favor, entre em contato com o <strong>Administrador ou Gestor</strong> da sua instituição para regularizar o pagamento da mensalidade do GestãoFlex.
              </p>
            </div>
            
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Todos os dados de empréstimos, taxas e carteira de clientes permanecem armazenados com total segurança. O acesso será totalmente restabelecido de imediato assim que a assinatura for reativada.
            </p>

            {subscription && (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 text-left text-xs sm:text-sm space-y-3 max-w-md mx-auto backdrop-blur-md">
                <p className="text-slate-400 font-semibold flex justify-between">
                  <span className="text-slate-200">Plano Anteriror:</span> 
                  <span>{subscription.plan?.name || "-"}</span>
                </p>
                <p className="text-slate-400 font-semibold flex justify-between">
                  <span className="text-slate-200">Valor de Renovação:</span> 
                  <span className="text-white font-bold">{Number(subscription.plan?.price_amount).toLocaleString("pt-MZ")} MTn</span>
                </p>
                <p className="text-slate-400 font-semibold flex justify-between">
                  <span className="text-slate-200">Vencido desde:</span> 
                  <span className="text-rose-400 font-bold">
                    {subscription.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString("pt-PT")
                      : "-"}
                  </span>
                </p>
              </div>
            )}

            <Button
              onClick={handleLogout}
              className="bg-white text-slate-950 hover:bg-slate-200 font-bold h-12 px-6 rounded-xl w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
            </Button>
          </motion.div>
        )}

        {/* Support Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-8 pt-8 border-t border-white/5 relative z-10 text-slate-500 font-bold text-xs">
          <span>Dúvidas sobre pagamentos?</span>
          <a
            href="mailto:suporte@gestaoflex.mz"
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-blue-500/30"
          >
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span>Falar com Financeiro</span>
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
