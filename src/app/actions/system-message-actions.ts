"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendSystemMessageAction(data: {
  institution_ids: string[] | "all";
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}) {
  try {
    const supabase = await createClient();

    // Ensure user is admin_geral
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado." };

    const { data: userData } = await supabase
      .from("users")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();

    const isAdminGeral = (userData?.role as any)?.name === "admin_geral";
    if (!isAdminGeral) {
      return { success: false, error: "Acesso negado." };
    }

    let targetInstitutionIds: string[] = [];

    if (data.institution_ids === "all") {
      const { data: allInstitutions, error: instErr } = await supabase
        .from("institutions")
        .select("id");
      if (instErr) throw new Error("Erro ao carregar instituições.");
      targetInstitutionIds = allInstitutions.map((i: any) => i.id);
    } else {
      targetInstitutionIds = data.institution_ids;
    }

    if (targetInstitutionIds.length === 0) {
      return { success: false, error: "Nenhuma instituição selecionada." };
    }

    // Prepare notifications
    const notificationsToInsert = targetInstitutionIds.map((id) => ({
      institution_id: id,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("system_notifications")
      .insert(notificationsToInsert);

    if (insertError) {
      console.error("Failed to insert system messages:", insertError);
      return { success: false, error: "Erro ao enviar mensagens." };
    }

    return { success: true, count: targetInstitutionIds.length };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro inesperado ao enviar mensagem.",
    };
  }
}
