"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function getPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("price_amount", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updatePlan(id: string, values: any) {
  const supabase = await createClient();

  // Authorization Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  if ((profile?.role as any)?.name !== "admin_geral") {
    throw new Error(
      "Acesso negado: Apenas o Administrador Geral pode modificar planos.",
    );
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("plans")
    .update(values)
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  const supabase = await createClient();

  // Authorization Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  if ((profile?.role as any)?.name !== "admin_geral") {
    throw new Error(
      "Acesso negado: Apenas o Administrador Geral pode modificar planos.",
    );
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("plans")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function createPlan(values: any) {
  const supabase = await createClient();

  // Authorization Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  if ((profile?.role as any)?.name !== "admin_geral") {
    throw new Error(
      "Acesso negado: Apenas o Administrador Geral pode criar planos.",
    );
  }

  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase
    .from("plans")
    .insert([{ ...values, is_active: true }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, plan: data };
}

export async function deletePlan(id: string) {
  const supabase = await createClient();

  // Authorization Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  if ((profile?.role as any)?.name !== "admin_geral") {
    throw new Error(
      "Acesso negado: Apenas o Administrador Geral pode excluir planos.",
    );
  }

  // Check if plan has active subscriptions
  const adminSupabase = createAdminClient();
  const { count, error: countError } = await adminSupabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", id)
    .in("status", ["active", "past_due", "trialing"]);

  if (countError) throw new Error(countError.message);
  if (count && count > 0) {
    throw new Error(
      "Não é possível excluir um plano que possui subscrições ativas vinculadas a ele.",
    );
  }

  const { error } = await adminSupabase.from("plans").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return { success: true };
}
