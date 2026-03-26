"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  InstitutionFormValues,
  institutionSchema,
} from "@/schemas/institution";

export async function createInstitutionAction(data: InstitutionFormValues) {
  try {
    const supabase = await createClient();

    // Validate data server-side
    const validatedFields = institutionSchema.safeParse(data);
    if (!validatedFields.success) {
      return { success: false, error: "Dados inválidos." };
    }

    // Check for duplicates before inserting
    const { data: existingInstitution } = await supabase
      .from("institutions")
      .select("id")
      .or(`name.eq."${data.name}",email.eq."${data.email}"`)
      .maybeSingle();

    if (existingInstitution) {
      return { 
        success: false, 
        error: "Uma instituição com este nome ou e-mail já existe." 
      };
    }

    const { error } = await supabase
      .from("institutions")
      .insert([data])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/institutions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Erro interno no servidor." };
  }
}

export async function updateInstitutionAction(
  id: string,
  data: InstitutionFormValues,
) {
  try {
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
      return { success: false, error: error.message };
    }

    revalidatePath("/institutions");
    revalidatePath(`/institutions/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Erro interno no servidor." };
  }
}

export async function toggleInstitutionStatusAction(
  id: string,
  currentStatus: string,
) {
  try {
    const supabase = await createClient();
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("institutions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/institutions");
    return { success: true, newStatus };
  } catch (error: any) {
    return { success: false, error: "Erro interno no servidor." };
  }
}

export async function deleteInstitutionAction(id: string) {
  // Optional: Soft delete or check for dependencies (users, loans) before deleting
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("institutions").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/institutions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Erro interno no servidor." };
  }
}
