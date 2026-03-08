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
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
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
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-800 rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <main className="max-w-6xl w-full space-y-12 relative z-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-2xl shadow-blue-500/20 ring-1 ring-white/20"
            >
              <ShieldAlert className="h-14 w-14 text-white" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
              Acesso Restrito
            </h1>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          </div>

          <p className="text-xl sm:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
            {isTrialEnded ? (
              <>
                O período de teste gratuito da instituição{" "}
                <span className="text-blue-400 font-bold">
                  {institution?.name}
                </span>{" "}
                terminou após 45 dias.
              </>
            ) : (
              <>
                A sua subscrição do Gestão Flex para a instituição{" "}
                <span className="text-blue-400 font-bold">
                  {institution?.name}
                </span>{" "}
                expirou.
              </>
            )}
            <br />
            <span className="text-slate-200 mt-2 inline-block">
              Regularize sua situação para continuar utilizando o Gestão Flex.
            </span>
          </p>
        </motion.div>

        {/* Only show plans and payment options to Administrators/Gestores */}
        {userRole === "gestor" || userRole === "admin_geral" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              >
                <Card
                  className={`group relative flex flex-col border-none bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 ring-1 ring-white/10 ${plan.name.toLowerCase().includes("premium") || plan.name.toLowerCase().includes("anual") ? "ring-2 ring-blue-500/50" : ""}`}
                >
                  {plan.name.toLowerCase().includes("premium") ||
                  plan.name.toLowerCase().includes("anual") ? (
                    <div className="absolute top-0 right-0 p-6">
                      <div className="bg-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-blue-500/30">
                        <Star className="h-3 w-3 fill-current" /> Recomendado
                      </div>
                    </div>
                  ) : null}

                  <CardHeader className="pb-6 pt-10 px-8">
                    <div className="p-3 bg-white/5 w-fit rounded-2xl mb-4 group-hover:bg-blue-600/20 transition-colors">
                      <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-black text-white tracking-tight">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-400 line-clamp-2 min-h-[2.5rem] mt-2 leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-8 pb-8 flex-grow">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
                        {Number(plan.price_amount).toLocaleString("pt-MZ")}
                      </span>
                      <span className="text-lg font-bold text-slate-500 uppercase tracking-widest">
                        MTn
                      </span>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
                        <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Clock className="h-3 w-3 text-blue-400" />
                        </div>
                        Válido por {plan.interval_months} mes(es)
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
                        <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                          <ShieldCheck className="h-3 w-3 text-green-400" />
                        </div>
                        Acesso total a todas funcionalidades
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 pt-0">
                    <Button
                      className={`w-full h-14 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl ${
                        plan.name.toLowerCase().includes("premium") ||
                        plan.name.toLowerCase().includes("anual")
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                          : "bg-white text-slate-900 hover:bg-slate-200"
                      }`}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsPaymentModalOpen(true);
                      }}
                    >
                      Selecionar Plano <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 max-w-2xl mx-auto bg-slate-800/40 backdrop-blur-xl border border-rose-500/20 rounded-[2.5rem] p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-6">
              <Clock className="h-8 w-8 text-rose-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">
              Acesso Temporariamente Suspenso
            </h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Por favor, entre em contato com o <strong>Administrador</strong>{" "}
              da sua instituição para regularizar o acesso ao sistema. Suas
              funcionalidades e dados estão seguros e retornarão assim que a
              subscrição for reativada.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-12 mt-20 pt-12 border-t border-white/5"
        >
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 text-slate-500 hover:text-white font-bold transition-all"
          >
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-red-500/20 group-hover:text-red-400">
              <LogOut className="h-5 w-5" />
            </div>
            Sair da Conta
          </button>
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
          <a
            href="mailto:suporte@gestaoflex.mz"
            className="group flex items-center gap-3 text-slate-500 hover:text-white font-bold transition-all"
          >
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-blue-500/20 group-hover:text-blue-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            Falar com Suporte
          </a>
        </motion.div>
      </main>

      {/* Custom Payment Modal Portal Support can be added here if needed */}
      {isPaymentModalOpen && selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          institutionId={institution?.id}
          subscriptionId={subscription?.id}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            // If it was a gateway payment, we want to reload/redirect immediately
            toast.success("Pagamento confirmado! Acesso restaurado.");
            setTimeout(() => {
              window.location.href = "/"; // Hard reload to clear middleware state
            }, 2000);
          }}
        />
      )}
    </div>
  );
}
