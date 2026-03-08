"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  History,
  AlertTriangle,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PaymentModal } from "@/components/billing/payment-modal";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [institution, setInstitution] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();

      if (!profile?.institution_id) {
        if (user.user_metadata?.role !== "admin_geral") {
          toast.error("Instituição não encontrada");
          router.push("/");
        }
        return;
      }

      // Fetch Institution
      const { data: inst } = await supabase
        .from("institutions")
        .select("*")
        .eq("id", profile.institution_id)
        .single();
      setInstitution(inst);

      // Fetch Subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("institution_id", profile.institution_id)
        .single();

      setSubscription(sub);

      // Fetch Plans
      const { data: availablePlans } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_amount", { ascending: true });

      setPlans(availablePlans || []);

      // Fetch Payment History
      const { data: paymentHistory } = await supabase
        .from("subscription_payments")
        .select("*, plan:plans(name)")
        .eq("institution_id", profile.institution_id)
        .order("created_at", { ascending: false });

      setPayments(paymentHistory || []);
    } catch (error: any) {
      console.error("Error fetching billing:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [supabase, router]);

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const isTrialing = subscription?.status === "trialing";
  const isPastDue =
    subscription?.status === "past_due" || subscription?.status === "canceled";
  const isActive = subscription?.status === "active";

  const daysLeft = isTrialing
    ? calculateDaysLeft(subscription.trial_end)
    : isActive && subscription.current_period_end
      ? calculateDaysLeft(subscription.current_period_end)
      : 0;

  return (
    <div className="flex-1 space-y-8 pt-4 pb-12 max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Plano e Assinatura
          </h2>
          <p className="text-slate-500 font-medium">
            Página de facturação da instituição{" "}
            <span className="font-bold text-slate-700">
              {institution?.name}
            </span>
          </p>
        </div>
      </div>

      {/* Current Status Card */}
      <Card
        className={`border-none shadow-lg relative overflow-hidden ${isPastDue ? "bg-gradient-to-r from-red-50 to-white" : isTrialing ? "bg-gradient-to-r from-indigo-50 to-white" : "bg-gradient-to-r from-emerald-50 to-white"}`}
      >
        {/* Decorative background shape */}
        <div
          className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none ${isPastDue ? "bg-red-400" : isTrialing ? "bg-indigo-400" : "bg-emerald-400"}`}
        ></div>

        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div
                className={`p-4 rounded-2xl shadow-sm ${isPastDue ? "bg-white text-red-600 border border-red-100" : isTrialing ? "bg-white text-indigo-600 border border-indigo-100" : "bg-white text-emerald-600 border border-emerald-100"}`}
              >
                {isPastDue ? (
                  <ShieldAlert className="h-10 w-10" />
                ) : isTrialing ? (
                  <Clock className="h-10 w-10" />
                ) : (
                  <CheckCircle2 className="h-10 w-10" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  Status Atual:
                  <span
                    className={`uppercase tracking-widest text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm ${isPastDue ? "bg-red-500 text-white" : isTrialing ? "bg-indigo-500 text-white" : "bg-emerald-500 text-white"}`}
                  >
                    {isPastDue
                      ? "Bloqueado (Pendente)"
                      : isTrialing
                        ? "Período de Teste"
                        : "Ativo"}
                  </span>
                </h3>
                <p className="text-base text-slate-600 mt-2 font-medium">
                  {isTrialing
                    ? `O seu período de teste grátis termina em ${subscription.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : "N/A"}.`
                    : isPastDue
                      ? "A sua assinatura expirou. Por favor efetue o pagamento para restaurar o acesso."
                      : `A sua assinatura atual do plano ${subscription.plan?.name || ""} é válida até ${subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "N/A"}.`}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center min-w-[140px] bg-white rounded-2xl p-5 shadow-md border border-slate-100">
              <span
                className={`text-4xl font-black tracking-tight ${daysLeft <= 3 ? "text-red-500" : "text-slate-800"}`}
              >
                {daysLeft}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Dias Restantes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Section */}
      <div className="mt-12">
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-500" />
            Opções de Renovação
          </h3>
          <p className="text-slate-500 font-medium ml-8">
            Selecione o plano ideal para garantir funcionamento ininterrupto da
            plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isAnnual = plan.interval_months === 12;
            const isSelected = selectedPlan?.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between border-2 transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden
                                    ${
                                      isSelected
                                        ? "border-emerald-500 shadow-emerald-500/20 shadow-xl bg-gradient-to-b from-emerald-50/50 to-white transform -translate-y-1"
                                        : "border-slate-100 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 bg-white"
                                    }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

                <CardHeader className="pb-4 relative z-10 pt-6">
                  {isAnnual && (
                    <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" /> Popular
                    </div>
                  )}
                  <CardTitle className="text-xl font-extrabold text-emerald-700">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed mt-2 text-slate-500 font-medium">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow z-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      {Number(plan.price_amount).toLocaleString("pt-MZ")}
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                      MTn
                    </span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    {plan.interval_months}{" "}
                    {plan.interval_months === 1 ? "mês" : "meses"}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 pb-6 mt-auto z-10">
                  <Button
                    className={`w-full font-bold shadow-sm transition-all duration-300 ${
                      isSelected
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan);
                      setIsPaymentModalOpen(true);
                    }}
                  >
                    {isSelected ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Continuar com{" "}
                        {plan.name}
                      </span>
                    ) : (
                      "Selecionar"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card className="border-none shadow-md rounded-2xl bg-white mt-10 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6">
          <CardTitle className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
            <History className="h-6 w-6 text-blue-500" />
            Histórico de Faturas
          </CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500">
            Acompanhe todos os pagamentos e recibos associados à sua
            instituição.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-16 text-slate-500 flex flex-col items-center bg-slate-50/30">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <History className="h-8 w-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-600">
                Nenhuma transação registrada ainda.
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Os seus pagamentos futuros aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4">Data</th>
                    <th className="px-8 py-4">Plano</th>
                    <th className="px-8 py-4">Valor</th>
                    <th className="px-8 py-4">Método</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-800">
                        {p.plan?.name || "-"}
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">
                        {Number(p.amount).toLocaleString("pt-MZ")}{" "}
                        <span className="text-xs text-slate-400 font-bold ml-1">
                          MTn
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />
                        {p.payment_method === "bank_transfer"
                          ? "Transferência"
                          : p.payment_method === "mpesa"
                            ? "M-Pesa"
                            : p.payment_method}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-min gap-1.5 ${
                            p.status === "approved"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : p.status === "pending"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${p.status === "approved" ? "bg-emerald-500" : p.status === "pending" ? "bg-amber-500" : "bg-red-500"}`}
                          />
                          {p.status === "approved"
                            ? "Aprovado"
                            : p.status === "pending"
                              ? "Pendente"
                              : "Recusado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isPaymentModalOpen && selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          institutionId={institution?.id}
          subscriptionId={subscription?.id}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchBillingData(); // refresh
          }}
        />
      )}
    </div>
  );
}
