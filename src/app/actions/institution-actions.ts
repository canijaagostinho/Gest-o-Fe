"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  InstitutionFormValues,
  institutionSchema,
} from "@/schemas/institution";
import { insertOperationLog } from "@/utils/operation-logger";
import { RoleName, ActionResponse } from "@/types";
import { translateSupabaseError } from "@/lib/error-handler";

async function checkGlobalAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, error: "Não autenticado." };

  const { data: profile } = await supabase
    .from("users")
    .select("*, role:roles(name)")
    .eq("id", user.id)
    .single();

  const roleName = (profile?.role as unknown as { name: RoleName })?.name;
  if (roleName !== "admin_geral") {
    return { allowed: false, error: "Acesso negado. Apenas administradores gerais podem gerir instituições." };
  }

  return { allowed: true, userId: user.id };
}

export async function createInstitutionAction(data: InstitutionFormValues): Promise<ActionResponse> {
  try {
    const auth = await checkGlobalAdmin();
    if (!auth.allowed) return { success: false, error: auth.error };

    const supabase = await createClient();

    // Validate data server-side
    const validatedFields = institutionSchema.safeParse(data);
    if (!validatedFields.success) {
      return { success: false, error: "Dados inválidos." };
    }

    // Check for duplicates before inserting (case-insensitive)
    const { data: nameExists } = await supabase
      .from("institutions")
      .select("id")
      .ilike("name", data.name)
      .maybeSingle();

    if (nameExists) {
      return { success: false, error: "Uma instituição com este nome já existe." };
    }

    const { data: emailExists } = await supabase
      .from("institutions")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();

    if (emailExists) {
      return { success: false, error: "Uma instituição com este e-mail já existe." };
    }

    const { data: newInstitution, error } = await supabase
      .from("institutions")
      .insert([data])
      .select("id")
      .single();

    if (error) {
      return { success: false, error: translateSupabaseError(error) };
    }

    // Log Operation
    await insertOperationLog({
      institution_id: newInstitution.id,
      user_id: auth.userId!,
      operation_id: newInstitution.id,
      type: "Outro",
      status: "success",
      observations: `Criação de nova instituição: ${data.name}`,
    });

    revalidatePath("/institutions");
    revalidatePath("/dashboard");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("CREATE_INSTITUTION_EXCEPTION:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}

export async function updateInstitutionAction(
  id: string,
  data: InstitutionFormValues,
): Promise<ActionResponse> {
  try {
    const auth = await checkGlobalAdmin();
    if (!auth.allowed) return { success: false, error: auth.error };

    const supabase = await createClient();

    const validatedFields = institutionSchema.safeParse(data);
    if (!validatedFields.success) {
      return { success: false, error: "Dados inválidos." };
    }

    const { error } = await supabase
      .from("institutions")
      .update(data)
      .eq("id", id);

    if (error) {
      return { success: false, error: translateSupabaseError(error) };
    }

    // Log Operation
    await insertOperationLog({
      institution_id: id,
      user_id: auth.userId!,
      operation_id: id,
      type: "Atualização",
      status: "success",
      observations: `Atualização de dados da instituição: ${data.name}`,
    });

    revalidatePath("/institutions");
    revalidatePath(`/institutions/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_INSTITUTION_EXCEPTION:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}

export async function toggleInstitutionStatusAction(
  id: string,
  currentStatus: string,
): Promise<ActionResponse> {
  try {
    const auth = await checkGlobalAdmin();
    if (!auth.allowed) return { success: false, error: auth.error };

    const supabase = await createClient();
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("institutions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      return { success: false, error: translateSupabaseError(error) };
    }

    // Log Operation
    await insertOperationLog({
      institution_id: id,
      user_id: auth.userId!,
      operation_id: id,
      type: "Atualização",
      status: "success",
      observations: `Alteração de status da instituição ID ${id} para ${newStatus}`,
    });

    revalidatePath("/institutions");
    return { success: true, data: newStatus }; // Returned as data to match ActionResponse
  } catch (error: any) {
    console.error("TOGGLE_INSTITUTION_EXCEPTION:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}

export async function deleteInstitutionAction(id: string): Promise<ActionResponse> {
  try {
    const auth = await checkGlobalAdmin();
    if (!auth.allowed) return { success: false, error: auth.error };

    const supabase = await createClient();

    const { error } = await supabase.from("institutions").delete().eq("id", id);

    if (error) {
      return { success: false, error: translateSupabaseError(error) };
    }

    // Log Operation
    await insertOperationLog({
      institution_id: id,
      user_id: auth.userId!,
      operation_id: id,
      type: "Cancelamento",
      status: "success",
      observations: `Remoção definitiva da instituição ID: ${id}`,
    });

    revalidatePath("/institutions");
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_INSTITUTION_EXCEPTION:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}
