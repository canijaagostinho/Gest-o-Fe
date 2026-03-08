"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Agent } from "@/types/database";

export async function createAgentAction(data: {
  institution_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  commission_rate: number;
}) {
  try {
    const supabase = await createClient();

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        institution_id: data.institution_id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        commission_rate: data.commission_rate,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/agents");
    return { success: true, agent };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao criar agente." };
  }
}

export async function updateAgentAction(id: string, data: Partial<Agent>) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("agents").update(data).eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/agents");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar agente.",
    };
  }
}

export async function deleteAgentAction(id: string) {
  try {
    const supabase = await createClient();

    // Check if agent has loans or commissions before deleting?
    // For now, allow delete (or soft delete via status)

    const { error } = await supabase.from("agents").delete().eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/agents");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao excluir agente.",
    };
  }
}
