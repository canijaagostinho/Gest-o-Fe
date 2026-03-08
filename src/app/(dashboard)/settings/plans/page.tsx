"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Loader2,
  CheckCircle2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  updatePlan,
  togglePlanStatus,
  createPlan,
  deletePlan,
} from "@/app/actions/plan-actions";

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    async function fetchPlansAndRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("role:roles(name)")
            .eq("id", user.id)
            .single();

          if (profile) {
            setUserRole((profile.role as any)?.name || "");
          }
        }

        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .order("price_amount", { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (err: any) {
        toast.error("Erro ao carregar dados: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlansAndRole();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setSaving(true);

      if (isCreating) {
        const res = await createPlan({
          name: editingPlan.name,
          description: editingPlan.description,
          price_amount: editingPlan.price_amount,
          interval_months: editingPlan.interval_months,
        });
        setPlans((prev) =>
          [...prev, res.plan].sort((a, b) => a.price_amount - b.price_amount),
        );
        toast.success("Plano criado com sucesso!");
      } else {
        await updatePlan(editingPlan.id, {
          name: editingPlan.name,
          description: editingPlan.description,
          price_amount: editingPlan.price_amount,
          interval_months: editingPlan.interval_months,
        });
        setPlans((prev) =>
          prev
            .map((p) => (p.id === editingPlan.id ? editingPlan : p))
            .sort((a, b) => a.price_amount - b.price_amount),
        );
        toast.success("Plano atualizado com sucesso!");
      }

      setEditingPlan(null);
      setIsCreating(false);
    } catch (err: any) {
      toast.error("Erro ao salvar plano: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.",
      )
    )
      return;

    try {
      setDeletingId(id);
      await deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setEditingPlan(null);
      toast.success("Plano excluído com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir plano");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setEditingPlan({
      name: "",
      description: "",
      price_amount: 0,
      interval_months: 1,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white shadow-sm hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-500" />
              Gestão de Planos
            </h2>
            <p className="text-slate-500 font-medium">
              Configurações globais de subscrição do Gestão Flex.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="group relative border-none shadow-xl bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />

              <CardHeader className="pb-4 pt-8">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  {userRole === "admin_geral" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit3 className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl font-black text-slate-900 mt-4">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 leading-snug h-10 line-clamp-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">
                      {Number(plan.price_amount).toLocaleString("pt-MZ")}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      MTn
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {plan.interval_months} Mes(es)
                    </div>
                    {plan.is_active ? (
                      <div className="px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Ativo
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-red-50 rounded-full text-[10px] font-black text-red-600 uppercase tracking-widest">
                        Inativo
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              {userRole === "admin_geral" ? (
                <CardFooter className="pb-8">
                  <Button
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold rounded-2xl h-11"
                    onClick={() => setEditingPlan(plan)}
                  >
                    Editar Configurações
                  </Button>
                </CardFooter>
              ) : (
                <CardFooter className="pb-8">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-11 shadow-lg shadow-blue-200"
                    asChild
                  >
                    <Link href={`/billing/checkout?planId=${plan.id}`}>
                      Assinar Plano
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        ))}

        {/* Add new plan card - Admin Geral Only */}
        {userRole === "admin_geral" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: plans.length * 0.1 }}
          >
            <button
              onClick={openCreateModal}
              className="w-full h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
              <div className="p-4 bg-slate-50 rounded-full group-hover:bg-blue-100 transition-colors">
                <Plus className="h-8 w-8 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest text-xs">
                Adicionar Novo Plano
              </p>
            </button>
          </motion.div>
        )}
      </div>

      {/* Editing Dialog Overlay */}
      <AnimatePresence>
        {editingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <form onSubmit={handleSave}>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {isCreating ? "Novo Plano" : "Editar Plano"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(null);
                        setIsCreating(false);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="plan-name"
                        className="text-xs font-black uppercase text-slate-500 px-1"
                      >
                        Nome do Plano
                      </Label>
                      <Input
                        id="plan-name"
                        value={editingPlan.name}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            name: e.target.value,
                          })
                        }
                        className="rounded-2xl h-12 border-slate-200 focus:ring-blue-500 font-bold"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="plan-desc"
                        className="text-xs font-black uppercase text-slate-500 px-1"
                      >
                        Descrição
                      </Label>
                      <Textarea
                        id="plan-desc"
                        value={editingPlan.description}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            description: e.target.value,
                          })
                        }
                        className="rounded-2xl border-slate-200 focus:ring-blue-500 font-medium min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="plan-price"
                          className="text-xs font-black uppercase text-slate-500 px-1"
                        >
                          Preço (MTn)
                        </Label>
                        <Input
                          id="plan-price"
                          type="number"
                          value={editingPlan.price_amount}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              price_amount: e.target.value,
                            })
                          }
                          className="rounded-2xl h-12 border-slate-200 focus:ring-blue-500 font-black text-lg"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label
                          htmlFor="plan-interval"
                          className="text-xs font-black uppercase text-slate-500 px-1"
                        >
                          Duração (Meses)
                        </Label>
                        <Input
                          id="plan-interval"
                          type="number"
                          value={editingPlan.interval_months}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              interval_months: e.target.value,
                            })
                          }
                          className="rounded-2xl h-12 border-slate-200 focus:ring-blue-500 font-black text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 flex gap-3">
                  {!isCreating && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-14 h-12 flex-shrink-0 rounded-2xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDelete(editingPlan.id)}
                      disabled={saving || deletingId === editingPlan.id}
                    >
                      {deletingId === editingPlan.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl font-bold text-slate-600 border-slate-200"
                    onClick={() => {
                      setEditingPlan(null);
                      setIsCreating(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" /> Salvar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
