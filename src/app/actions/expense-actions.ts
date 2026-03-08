"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Expense } from "@/types/database";

export async function createExpenseAction(data: {
  category: string;
  amount: number;
  date: string;
  description?: string;
  institution_id: string;
  user_id: string;
}) {
  try {
    const supabase = await createClient();

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        institution_id: data.institution_id,
        category: data.category,
        amount: data.amount,
        date: data.date,
        description: data.description,
        user_id: data.user_id,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/finance/expenses");
    return { success: true, expense };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao registrar despesa.",
    };
  }
}

export async function updateExpenseAction(id: string, data: Partial<Expense>) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("expenses").update(data).eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/finance/expenses");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar despesa.",
    };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/finance/expenses");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao excluir despesa.",
    };
  }
}
