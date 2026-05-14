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

    // 2. Perform Manual Transaction (Best Effort Atomicity)
    // PASSO 1: Validar saldo (read-only)
    const { data: source, error: srcError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", sourceAccountId)
      .single();

    if (srcError || !source) throw new Error("Conta origem não encontrada.");
    if (Number(source.balance) < amount) {
      return { success: false, error: "Saldo insuficiente na conta de origem." };
    }

    // PASSO 2: Debitar conta origem
    const newSourceBalance = Number(source.balance) - amount;
    const { error: debitError } = await supabase
      .from("accounts")
      .update({ balance: newSourceBalance })
      .eq("id", sourceAccountId);

    if (debitError) throw new Error("Falha ao debitar conta origem.");

    // PASSO 3: Creditar conta destino
    const { data: target, error: tgtError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", targetAccountId)
      .single();

    if (tgtError || !target) {
      // REVERTER: Restaurar saldo da conta origem
      await supabase
        .from("accounts")
        .update({ balance: source.balance })
        .eq("id", sourceAccountId);
      throw new Error("Conta destino não encontrada. Transação revertida.");
    }

    const newTargetBalance = Number(target.balance) + amount;
    const { error: creditError } = await supabase
      .from("accounts")
      .update({ balance: newTargetBalance })
      .eq("id", targetAccountId);

    if (creditError) {
      // REVERTER: Restaurar saldo da conta origem
      await supabase
        .from("accounts")
        .update({ balance: source.balance })
        .eq("id", sourceAccountId);
      throw new Error("Falha ao creditar conta destino. Transação revertida.");
    }

    // PASSO 4: Registar transações no histórico
    const transferId = `TRF_${Date.now()}`;
    
    await supabase.from("transactions").insert([
      {
        account_id: sourceAccountId,
        type: "debit",
        amount: amount,
        description: `Transferência (Saída): ${description}`,
        reference_type: "transfer",
        reference_id: transferId,
        institution_id: userData.institution_id,
      },
      {
        account_id: targetAccountId,
        type: "credit",
        amount: amount,
        description: `Transferência (Entrada): ${description}`,
        reference_type: "transfer",
        reference_id: transferId,
        institution_id: userData.institution_id,
      }
    ]);

    // 3. Invalidate Caches
    revalidatePath("/finance/accounts");
    revalidatePath(`/finance/accounts/${sourceAccountId}`);
    revalidatePath(`/finance/accounts/${targetAccountId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("TRANSFER_ERROR:", error);
    return { success: false, error: error.message };
  }
}
