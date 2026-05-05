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

/**
 * Allows the currently logged-in gestor or admin_geral to update
 * their own institution's profile from the Settings page.
 * This is separate from the admin-only updateInstitutionAction.
 */
export async function updateMyInstitutionAction(data: {
  name: string;
  trade_name?: string;
  acronym?: string;
  type: string;
  type_other_desc?: string;
  foundation_date?: string;
  number_of_employees?: number;
  logo_url?: string;
  stamp_url?: string;
  primary_color: string;
  secondary_color: string;
  nuit: string;
  reg_number?: string;
  tax_regime?: string;
  province: string;
  district: string;
  neighborhood?: string;
  address_line: string;
  phone: string;
  email: string;
  website?: string;
  responsible_name: string;
  responsible_role: string;
  responsible_phone?: string;
  responsible_email?: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado." };

    // Get the user's profile and role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("institution_id, role:roles(name)")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.institution_id) {
      return { success: false, error: "Perfil ou instituição não encontrada." };
    }

    const roleName = (profile?.role as unknown as { name: RoleName })?.name;
    if (roleName !== "gestor" && roleName !== "admin_geral") {
      return { success: false, error: "Sem permissão para editar os dados da instituição." };
    }

    const institutionId = profile.institution_id;

    // Explicitly map only valid DB columns (exclude 'country' which is not in the DB)
    const updatePayload = {
      name: data.name,
      trade_name: data.trade_name || null,
      acronym: data.acronym || null,
      type: data.type,
      type_other_desc: data.type_other_desc || null,
      foundation_date: data.foundation_date || null,
      number_of_employees: data.number_of_employees ?? 0,
      logo_url: data.logo_url || null,
      stamp_url: data.stamp_url || null,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      nuit: data.nuit,
      reg_number: data.reg_number || null,
      tax_regime: data.tax_regime || null,
      province: data.province,
      district: data.district,
      neighborhood: data.neighborhood || null,
      address_line: data.address_line,
      phone: data.phone,
      email: data.email,
      website: data.website || null,
      responsible_name: data.responsible_name,
      responsible_role: data.responsible_role,
      responsible_phone: data.responsible_phone || null,
      responsible_email: data.responsible_email || null,
    };

    const { error } = await supabase
      .from("institutions")
      .update(updatePayload)
      .eq("id", institutionId);

    if (error) {
      console.error("UPDATE_MY_INSTITUTION_ERROR:", error);
      return { success: false, error: translateSupabaseError(error) };
    }

    await insertOperationLog({
      institution_id: institutionId,
      user_id: user.id,
      operation_id: institutionId,
      type: "Atualização",
      status: "success",
      observations: `Atualização do perfil da instituição: ${data.name}`,
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_MY_INSTITUTION_EXCEPTION:", error);
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
