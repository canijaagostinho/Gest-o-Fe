"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types";

/**
 * Deposits funds into a specific account.
 */
export async function depositAction(
  accountId: string,
  amount: number,
  description: string = "Depósito em conta"
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Get current user and institution_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: userData } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();

    if (!userData?.institution_id) throw new Error("Instituição não encontrada.");

    // 2. Perform Update
    // We try to fetch current balance first (Read-Modify-Write)
    // In a prod environment, an RPC with 'SET balance = balance + amount' is safer.
    const { data: currentAcc, error: fetchError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", accountId)
        .single();
    
    if (fetchError || !currentAcc) throw new Error("Conta não encontrada.");

    const newBalance = Number(currentAcc.balance) + Number(amount);

    const { data: updatedData, error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", accountId)
        .select();
        
    if (updateError) throw updateError;
    if (!updatedData || updatedData.length === 0) {
        throw new Error("Falha ao atualizar saldo. Verifique as permissões de acesso (RLS).");
    }

    // 3. Record the transaction
    const { error: txError } = await supabase.from("transactions").insert({
      account_id: accountId,
      type: "credit",
      amount: amount,
      description: description,
      reference_type: "adjustment",
      reference_id: accountId,
      institution_id: userData.institution_id,
    });

    if (txError) throw txError;

    // 4. Invalidate Caches
    revalidatePath("/finance/accounts");
    revalidatePath(`/finance/accounts/${accountId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("DEPOSIT_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Transfers funds between two accounts.
 */
export async function transferAction(
  sourceAccountId: string,
  targetAccountId: string,
  amount: number,
  description: string = "Transferência entre contas"
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Get current user and institution_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: userData } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();

    if (!userData?.institution_id) throw new Error("Instituição não encontrada.");

    // 2. Source Account Check
    const { data: sourceAcc, error: fetchSourceError } = await supabase
        .from("accounts")
        .select("balance, name")
        .eq("id", sourceAccountId)
        .single();
    
    if (fetchSourceError || !sourceAcc) throw new Error("Conta de origem não encontrada.");
    if (Number(sourceAcc.balance) < amount) throw new Error("Saldo insuficiente na conta de origem.");

    // 3. Perform Updates
    // Decrement Source
    const { data: decData, error: decError } = await supabase
        .from("accounts")
        .update({ balance: Number(sourceAcc.balance) - Number(amount) })
        .eq("id", sourceAccountId)
        .select();
    
    if (decError) throw decError;
    if (!decData || decData.length === 0) throw new Error("Falha ao debitar conta de origem.");

    // Increment Target
    const { data: targetAcc, error: fetchTargetError } = await supabase
        .from("accounts")
        .select("balance, name")
        .eq("id", targetAccountId)
        .single();
    
    if (fetchTargetError || !targetAcc) throw new Error("Conta de destino não encontrada.");

    const { data: incData, error: incError } = await supabase
        .from("accounts")
        .update({ balance: Number(targetAcc.balance) + Number(amount) })
        .eq("id", targetAccountId)
        .select();
    
    if (incError) throw incError;
    if (!incData || incData.length === 0) throw new Error("Falha ao creditar conta de destino.");

    // 4. Record Transactions
    // Debit Transaction
    await supabase.from("transactions").insert({
      account_id: sourceAccountId,
      type: "debit",
      amount: amount,
      description: `${description} (Para: ${targetAcc.name})`,
      reference_type: "transfer",
      reference_id: targetAccountId,
      institution_id: userData.institution_id,
    });

    // Credit Transaction
    await supabase.from("transactions").insert({
      account_id: targetAccountId,
      type: "credit",
      amount: amount,
      description: `${description} (De: ${sourceAcc.name})`,
      reference_type: "transfer",
      reference_id: sourceAccountId,
      institution_id: userData.institution_id,
    });

    // 5. Invalidate Caches
    revalidatePath("/finance/accounts");
    revalidatePath(`/finance/accounts/${sourceAccountId}`);
    revalidatePath(`/finance/accounts/${targetAccountId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("TRANSFER_ERROR:", error);
    return { success: false, error: error.message };
  }
}
