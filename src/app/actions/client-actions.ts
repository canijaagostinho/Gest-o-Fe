"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { insertOperationLog } from "@/utils/operation-logger";
import { translateSupabaseError } from "@/lib/error-handler";
import { ActionResponse } from "@/types";

/**
 * Deletes a client if they have no active or completed loans.
 */
export async function deleteClientAction(clientId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Check if client has any loans
    const { count, error: countError } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientId);

    if (countError) throw new Error(countError.message);

    if (count && count > 0) {
      return {
        success: false,
        error:
          "Não é possível eliminar um cliente que possui empréstimos registados. Elimine ou cancele os empréstimos primeiro.",
      };
    }

    // 2. Delete the client
    const { error: deleteError } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (deleteError) throw new Error(deleteError.message);

    // 3. Log Operation
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // We need to know which institution this is for, though RLS handles it, the log needs it explicitly.
      const { data: profile } = await supabase.from("users").select("institution_id").eq("id", user.id).single();
      if (profile) {
        await insertOperationLog({
          institution_id: profile.institution_id,
          user_id: user.id,
          operation_id: clientId,
          type: "Cancelamento",
          status: "success",
          observations: `Eliminação de ficha de cliente ID: ${clientId}`,
        });
      }
    }

    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_CLIENT_EXCEPTION:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Updates an existing client.
 */
export async function updateClientAction(clientId: string, data: {
  full_name: string;
  email?: string;
  phone: string;
  id_number: string;
  address?: string;
  code?: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("clients")
      .update({
        full_name: data.full_name,
        email: data.email || null,
        phone: data.phone,
        id_number: data.id_number,
        address: data.address || null,
        code: data.code || null,
      })
      .eq("id", clientId);

    if (error) throw error;

    // 3. Log Operation
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("users").select("institution_id").eq("id", user.id).single();
      if (profile) {
        await insertOperationLog({
          institution_id: profile.institution_id,
          user_id: user.id,
          operation_id: clientId,
          type: "Atualização",
          status: "success",
          observations: `Atualização de dados do cliente: ${data.full_name}`,
        });
      }
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);

    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_CLIENT_EXCEPTION:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
