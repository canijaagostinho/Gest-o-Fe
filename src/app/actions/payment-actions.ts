"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { insertOperationLog } from "@/utils/operation-logger";
import { translateSupabaseError } from "@/lib/error-handler";
import { ActionResponse } from "@/types";

/**
 * Voids a payment transaction.
 * Updates the payment status and re-opens the loan installments if necessary.
 */
export async function voidPaymentAction(paymentId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Get payment details before voiding
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) throw new Error("Pagamento não encontrado.");

    // 2. Void the payment
    const { error: voidError } = await supabase
      .from("payments")
      .update({ status: "voided" })
      .eq("id", paymentId);

    if (voidError) throw voidError;

    // 3. Log action (System logs and Operation Logs)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "void_payment",
        module: "payments",
        details: { amount: payment.amount_paid, loan_id: payment.loan_id },
      });

      await insertOperationLog({
        institution_id: payment.institution_id,
        user_id: user.id,
        operation_id: paymentId,
        type: "Atualização",
        amount: payment.amount_paid,
        status: "reversed",
        observations: `Anulação do Pagamento. Ref empréstimo: ${payment.loan_id}`,
      });
    }

    revalidatePath("/payments");
    revalidatePath(`/loans/${payment.loan_id}`);

    return { success: true };
  } catch (error: any) {
    console.error("VOID_PAYMENT_EXCEPTION:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}

export async function createPaymentAction(data: {
  loan_id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  account_id: string;
  user_id: string;
  institution_id: string;
  installment_id?: string; // Optional, for specific installment payment
  payment_method?: string;
  notes?: string;
}): Promise<ActionResponse<{ paymentId: string }>> {
  try {
    const supabase = await createClient();

    // Use atomic RPC for data integrity
    const { data: result, error: rpcError } = await supabase.rpc("handle_loan_payment", {
      p_loan_id: data.loan_id,
      p_client_id: data.client_id,
      p_amount: data.amount,
      p_payment_date: data.payment_date,
      p_account_id: data.account_id,
      p_recorded_by: data.user_id,
      p_institution_id: data.institution_id,
      p_installment_id: data.installment_id || null,
      p_payment_method: data.payment_method || "Dinheiro",
      p_notes: data.notes || "",
    });

    if (rpcError) throw new Error("Erro no banco de dados: " + translateSupabaseError(rpcError));
    if (!result.success) throw new Error(translateSupabaseError(result.error));

    // 4. Log Operation
    await insertOperationLog({
      institution_id: data.institution_id,
      user_id: data.user_id,
      operation_id: result.payment_id,
      type: "Pagamento",
      amount: data.amount,
      status: "success",
      observations: `Pagamento registado. Ref empréstimo: ${data.loan_id}${data.installment_id ? ` (Parcela ID: ${data.installment_id})` : ""}`,
    });

    revalidatePath("/payments");
    revalidatePath("/finance/accounts");
    revalidatePath(`/loans/${data.loan_id}`);
    revalidatePath("/dashboard");

    return { success: true, paymentId: result.payment_id };
  } catch (error: any) {
    console.error("Payment registration failure:", error);
    return {
      success: false,
      error: translateSupabaseError(error),
    };
  }
}
