"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Deletes a client if they have no active or completed loans.
 */
export async function deleteClientAction(clientId: string) {
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

    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao eliminar cliente.",
    };
  }
}

/**
 * Updates an existing client.
 */
export async function updateClientAction(clientId: string, data: any) {
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

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar cliente.",
    };
  }
}
