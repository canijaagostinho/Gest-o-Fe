"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResponse, AccountCreateData, AccountUpdateData, RoleName, Account } from "@/types";
import { insertOperationLog } from "@/utils/operation-logger";
import { translateSupabaseError } from "@/lib/error-handler";

export async function getAccountsAction(): Promise<ActionResponse<Account[]>> {
  try {
    const supabase = await createClient();
    // RLS will now enforce institution separation automatically.
    // But we can also be explicit if we wanted, but RLS is the gold standard we just implemented.
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("GET_ACCOUNTS_EXCEPTION:", error);
    return { success: false, error: translateSupabaseError(error) };
  }
}

export async function createAccountAction(data: AccountCreateData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Get current user to get institution_id
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    // We need the institution_id. We can get it from the user's profile.
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("institution_id, role:roles(name)")
      .eq("id", user.id)
      .single();

    const roleName = (userData?.role as unknown as { name: RoleName })?.name;

    if (roleName === "admin_geral") {
      throw new Error(
        "O Administrador Geral não pode possuir caixas. Cada instituição gere os seus próprios fundos.",
      );
    }

    if (userError || !userData?.institution_id) {
      throw new Error("Erro ao identificar a instituição do usuário.");
    }

    const institutionId = userData.institution_id;

    // If this is default, unset other defaults
    if (data.is_default) {
      const { error: resetError } = await supabase
        .from("accounts")
        .update({ is_default: false })
        .eq("institution_id", institutionId)
        .neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data: account, error: accError } = await supabase
      .from("accounts")
      .insert({
        name: data.name,
        balance: data.balance,
        bank_provider: data.bank_provider || "outro",
        is_default: data.is_default,
        institution_id: institutionId,
      })
      .select()
      .single();

    if (accError) {
      console.error("ACCOUNT INSERT ERROR:", accError);
      throw new Error(`Erro ao criar conta: ${accError.message}`);
    }

    // If initial balance > 0, record transaction
    if (data.balance > 0) {
      const { error: txError } = await supabase.from("transactions").insert({
        account_id: account.id,
        type: "credit",
        amount: data.balance,
        description: "Saldo Inicial",
        reference_type: "adjustment",
        reference_id: account.id,
        institution_id: institutionId,
      });
      if (txError) {
        console.error("TRANSACTION INSERT ERROR:", txError);
        throw new Error(`Conta criada mas falha ao registar saldo inicial: ${txError.message}`);
      }
    }

    // 3. Log Operation
    await insertOperationLog({
      institution_id: institutionId,
      user_id: user.id,
      operation_id: account.id,
      type: "Outro",
      status: "success",
      observations: `Abertura de nova conta/caixa: ${data.name} (${data.bank_provider})`,
      amount: data.balance,
      metadata: { is_default: data.is_default },
    });

    revalidatePath("/finance/accounts");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function updateAccountAction(
  id: string,
  data: AccountUpdateData,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    if (data.is_default) {
      await supabase
        .from("accounts")
        .update({ is_default: false })
        .neq("id", id);
    }

    const { error } = await supabase.from("accounts").update(data).eq("id", id);

    if (error) throw error;

    // 3. Log Operation (We might need user info here)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("users").select("institution_id").eq("id", user.id).single();
      if (profile) {
        await insertOperationLog({
          institution_id: profile.institution_id,
          user_id: user.id,
          operation_id: id,
          type: "Atualização",
          status: "success",
          observations: `Atualização de configurações da conta ID: ${id}`,
        });
      }
    }

    revalidatePath("/finance/accounts");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function deleteAccountAction(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Fetch all transactions for this account
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("id, description")
      .eq("account_id", id);

    if (txError) throw txError;

    // 2. Filter for operational transactions (anything other than 'Saldo Inicial')
    const operationalTransactions =
      transactions?.filter((tx) => tx.description !== "Saldo Inicial") || [];

    if (operationalTransactions.length > 0) {
      return {
        success: false,
        error:
          "Não pode eliminar uma conta com transações operacionais (empréstimos ou pagamentos) registadas.",
      };
    }

    // 3. Delete 'Saldo Inicial' transactions if any
    if (transactions && transactions.length > 0) {
      const { error: delTxError } = await supabase
        .from("transactions")
        .delete()
        .eq("account_id", id);

      if (delTxError) throw delTxError;
    }

    // 4. Delete the account
    // 5. Log Operation
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
        const { data: profile } = await supabase.from("users").select("institution_id").eq("id", currentUser.id).single();
        if (profile) {
            await insertOperationLog({
                institution_id: profile.institution_id,
                user_id: currentUser.id,
                operation_id: id,
                type: "Cancelamento",
                status: "success",
                observations: `Eliminação de conta/caixa ID: ${id}`,
            });
        }
    }

    revalidatePath("/finance/accounts");
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_ACCOUNT_EXCEPTION:", error);
    return { success: false, error: translateSupabaseError(error) };
  }
}

export async function getAccountTransactionsAction(accountId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    // RLS protects this automatically.
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("GET_ACCOUNT_TX_EXCEPTION:", error);
    return { success: false, error: translateSupabaseError(error) };
  }
}
