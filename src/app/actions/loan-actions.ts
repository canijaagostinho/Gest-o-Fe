"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { insertOperationLog } from "@/utils/operation-logger";
import { ActionResponse, LoanCreateData } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";
import { translateSupabaseError } from "@/lib/error-handler";

/**
 * Marks an installment as paid.
 * Checks if all installments for the loan are paid, and if so, marks the loan as completed.
 */
export async function payInstallmentAction(
  installmentId: string,
  amountPaid: number,
  paymentDate: Date = new Date(),
  paymentMethod: string = "Dinheiro",
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Get installment and loan details
    const { data: instData, error: fetchInstError } = await supabase
      .from("installments")
      .select("*, loans(*)")
      .eq("id", installmentId)
      .single();

    if (fetchInstError || !instData) throw new Error("Parcela não encontrada.");

    const installment = instData;
    const loan = instData.loans;

    if (!loan.account_id) throw new Error("Este empréstimo não possui uma conta de desembolso vinculada para recebimento.");

    // 2. Use the centralized createPaymentAction logic
    // We import it inside if needed, but since it's in a different file, we should import it at the top.
    // However, I'll implement the call here.
    const { createPaymentAction } = await import("./payment-actions");
    
    // Get current user for recorded_by
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sessão expirada. Por favor, faça login novamente.");

    const result = await createPaymentAction({
      loan_id: loan.id,
      client_id: loan.client_id,
      amount: amountPaid,
      payment_date: paymentDate.toISOString().split("T")[0],
      account_id: loan.account_id,
      user_id: user.id,
      institution_id: loan.institution_id,
      installment_id: installmentId,
      payment_method: paymentMethod,
      notes: `Recebimento Parcela #${installment.installment_number}`,
    });

    return result;
  } catch (error: any) {
    console.error("Payment Process Error:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Cancels a loan and its pending installments.
 */
export async function cancelLoanAction(loanId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Update loan status to 'cancelled'
    const { error: loanError } = await supabase
      .from("loans")
      .update({ status: "cancelled" })
      .eq("id", loanId);

    if (loanError) throw loanError;

    // 2. Update all pending installments to 'cancelled'
    const { error: instError } = await supabase
      .from("installments")
      .update({ status: "cancelled" })
      .eq("loan_id", loanId)
      .neq("status", "paid"); // Only cancel unpaid ones

    if (instError) throw instError;

    // 3. Log Operation
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: loanData } = await supabase
        .from("loans")
        .select("institution_id, contract_number, total_amount")
        .eq("id", loanId)
        .single();
      if (loanData) {
        await insertOperationLog({
          institution_id: loanData.institution_id,
          user_id: user.id,
          operation_id: loanId,
          type: "Cancelamento",
          amount: loanData.total_amount,
          status: "success",
          observations: `Cancelamento do Empréstimo #${loanData.contract_number}`,
        });
      }
    }

    revalidatePath(`/loans/${loanId}`);
    revalidatePath("/loans");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

/**
 * Placeholder for Renegotiation.
 * For now, just updates status to 'active' (or leaves it) but could be extended.
 */
export async function renegotiateLoanAction(loanId: string) {
  // TODO: Implement full renegotiation logic (re-calculating installments, etc.)
  return { success: true, message: "Funcionalidade de renegociação em breve." };
}

export async function createLoanAction(data: LoanCreateData): Promise<ActionResponse<{ loanId: string }>> {
  try {
    const supabase = await createClient();

    // 1. Check account balance
    const { data: account, error: accError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", data.account_id)
      .single();

    if (accError) throw new Error("Conta não encontrada.");

    // Ensure balance is treated as a number
    const currentBalance = Number(account.balance);
    if (currentBalance < data.loan_amount) {
      return {
        success: false,
        error: "Saldo insuficiente na caixa selecionada.",
      };
    }

    // 2. Create Loan
    // Exclude unnecessary fields from data object if needed, but we can destruct
    const {
      installments,
      collateral,
      agent_id,
      institution_id,
      account_id,
      user_id,
      total_to_pay,
      installment_amount,
      ...loanFields
    } = data;

    // Calculate commission if agent is selected
    let commissionAmount = 0;
    if (agent_id) {
      const { data: agent } = await supabase
        .from("agents")
        .select("commission_rate")
        .eq("id", agent_id)
        .single();

      if (agent) {
        commissionAmount =
          data.loan_amount * (Number(agent.commission_rate) / 100);
      }
    }

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .insert({
        ...loanFields,
        institution_id,
        status: "active",
        created_by: user_id,
        agent_id: agent_id,
        commission_amount: commissionAmount,
        total_amount: total_to_pay,
        total_to_pay: total_to_pay,
        installment_amount: installment_amount,
        late_fee_rate: data.late_fee_rate,
        mora_rate: data.mora_rate,
      })
      .select()
      .single();

    if (loanError) {
      console.error("Loan Creation Error:", loanError);
      throw new Error("Erro ao criar registro do empréstimo.");
    }

    // 2b. Insert Collateral if provided
    if (collateral) {
      const { error: colError } = await supabase
        .from("loan_collateral")
        .insert({
          loan_id: loan.id,
          type: collateral.type,
          description: collateral.description,
          value: collateral.value,
          image_url: collateral.image_url,
          location: collateral.location,
          documents: collateral.documents,
        });

      if (colError) {
        console.error("Collateral Insert Error:", colError);
        // We don't fail the whole loan for this, but logs are good
      }
    }

    // 3. Create Installments
    const installmentsData = installments.map((inst: { number?: number; installment_number?: number; dueDate?: string; due_date?: string; amount: number }) => ({
      loan_id: loan.id,
      institution_id: data.institution_id,
      installment_number: inst.number || inst.installment_number,
      due_date: inst.dueDate
        ? new Date(inst.dueDate).toISOString().split("T")[0]
        : inst.due_date,
      amount: inst.amount,
      status: "pending",
    }));

    const { error: instError } = await supabase
      .from("installments")
      .insert(installmentsData);

    if (instError) {
      // In a real app we would rollback here (delete loan), but Supabase JS doesn't support transactions easily.
      // We could manually delete the loan here.
      await supabase.from("loans").delete().eq("id", loan.id);
      throw new Error("Erro ao gerar parcelas.");
    }

    // 4. Deduct from Account (Create Transaction)
    const { error: transError } = await supabase.from("transactions").insert({
      account_id: data.account_id,
      type: "debit",
      amount: data.loan_amount,
      description: `Desembolso de Empréstimo #${data.contract_number}`,
      reference_type: "loan",
      reference_id: loan.id,
      institution_id: data.institution_id,
    });

    if (transError) {
      console.error("Transaction Error:", transError);
      // Non-fatal? The loan is valid. But balance is wrong.
      // Ideally rollback.
    }

    // 5. Update Account Balance
    const newBalance = currentBalance - data.loan_amount;
    const { error: balError } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", data.account_id)
      .single();

    if (balError) {
      console.error("Balance Update Error:", balError);
    }

    // 6. Create Commission Record (if agent selected)
    if (agent_id && commissionAmount > 0) {
      const { error: commError } = await supabase.from("commissions").insert({
        agent_id: agent_id,
        loan_id: loan.id,
        amount: commissionAmount,
        status: "pending",
        institution_id: data.institution_id,
      });

      if (commError) {
        console.error("Commission Insert Error:", commError);
      }
    }

    // 7. Log Operation
    await insertOperationLog({
      institution_id: data.institution_id,
      user_id: data.user_id,
      operation_id: loan.id,
      type: "Empréstimo",
      amount: data.loan_amount,
      status: "success",
      observations: `Novo Empréstimo #${data.contract_number} (Cliente ID: ${data.client_id})`,
    });

    revalidatePath("/loans");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    revalidatePath("/finance/accounts");

    return { success: true, data: { loanId: loan.id } };
  } catch (error: unknown) {
    console.error("CRITICAL ERROR in createLoanAction:", error);
    let errorMessage = error instanceof Error ? error.message : "Erro ao criar empréstimo.";

    // Provide more detailed context for the error
    if (typeof error === "object" && error !== null) {
      const err = error as any;
      const details = {
        message: err.message,
        code: err.code,
        detail: err.detail,
        hint: err.hint,
        stack: err.stack?.substring(0, 300), // First 300 chars of stack
      };
      errorMessage = `Erro Detalhado: ${JSON.stringify(details)}`;
    }

    return { success: false, error: errorMessage };
  }
}
