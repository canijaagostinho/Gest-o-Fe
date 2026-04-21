"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createSubscriptionAction(
  planId: string,
  paymentMethod: string,
  amount: number,
  receiptUrl?: string
) {
  const supabase = await createClient();

  // 1. Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  // 2. Obter perfil do usuário e instituição
  const { data: profile } = await supabase
    .from("users")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  if (!profile?.institution_id) {
    throw new Error("Usuário não associado a uma instituição.");
  }

  const institutionId = profile.institution_id;
  const adminSupabase = createAdminClient();

  try {
    // 3. Obter detalhes do plano para calcular o período
    const { data: plan } = await adminSupabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) throw new Error("Plano não encontrado.");

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + (plan.interval_months || 1));

    // 4. Upsert na tabela de subscrições
    const { data: subscription, error: subError } = await adminSupabase
      .from("subscriptions")
      .upsert({
        institution_id: institutionId,
        plan_id: planId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString(),
        updated_at: now.toISOString(),
      })
      .select()
      .single();

    if (subError) throw new Error("Erro ao criar subscrição: " + subError.message);

    // 5. Inserir registro de pagamento
    const { error: payError } = await adminSupabase
      .from("subscription_payments")
      .insert([
        {
          institution_id: institutionId,
          subscription_id: subscription.id,
          plan_id: planId,
          amount: amount,
          status: "pending", // Fica pendente para aprovação do admin geral se necessário, ou "paid" se automático
          payment_method: paymentMethod,
          receipt_url: receiptUrl,
          created_at: now.toISOString(),
        },
      ]);

    if (payError) throw new Error("Erro ao registrar pagamento: " + payError.message);

    // 6. Atualizar o plano na tabela da instituição para refletir o nome do plano atual
    const { error: instError } = await adminSupabase
      .from("institutions")
      .update({ 
        subscription_plan: plan.name,
        status: "active" 
      })
      .eq("id", institutionId);

    if (instError) throw new Error("Erro ao atualizar instituição: " + instError.message);

    revalidatePath("/(dashboard)", "layout");
    revalidatePath("/settings/plans");

    return { success: true, subscriptionId: subscription.id };
  } catch (error: any) {
    console.error("Subscription Error:", error);
    throw new Error(error.message || "Erro interno ao processar subscrição.");
  }
}

export async function getSubscriptionStatus() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  if (!profile?.institution_id) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("institution_id", profile.institution_id)
    .single();

  return subscription;
}
