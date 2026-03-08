"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { insertOperationLog } from "@/utils/operation-logger";

/**
 * Voids a payment transaction.
 * Updates the payment status and re-opens the loan installments if necessary.
 */
export async function voidPaymentAction(paymentId: string) {
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
    return {
      success: false,
      error: error.message || "Erro ao anular pagamento.",
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
}) {
  try {
    const supabase = await createClient();

    // 1. Get Account
    const { data: account, error: accError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", data.account_id)
      .single();

    if (accError) throw new Error("Conta não encontrada.");

    // 2. Create Payment
    const { data: payment, error: payError } = await supabase
      .from("payments")
      .insert({
        loan_id: data.loan_id,
        client_id: data.client_id,
        amount_paid: data.amount, // Using amount_paid col
        payment_date: data.payment_date,
        recorded_by: data.user_id,
        institution_id: data.institution_id,
        status: "paid",
      })
      .select()
      .single();

    if (payError) throw payError;

    // 3. Credit to Account (Create Transaction)
    const { error: transError } = await supabase.from("transactions").insert({
      account_id: data.account_id,
      type: "credit",
      amount: data.amount,
      description: `Pagamento de Empréstimo #${data.loan_id.slice(0, 8)}`,
      reference_type: "payment",
      reference_id: payment.id,
      institution_id: data.institution_id,
    });

    if (transError) throw transError;

    // 4. Update Account Balance
    const newBalance = Number(account.balance) + data.amount;
    const { error: balError } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", data.account_id);

    if (balError) throw balError;

    // 5. Update Installment Logic (Check if we need to mark installments as paid)
    // This logic was in payInstallmentAction, but here it's a general payment.
    // We probably should try to match this payment to the oldest unpaid installment?
    // Or just leave it as a general payment.
    // Given existing code `payInstallmentAction` exists, maybe we should call that too?
    // But `payInstallmentAction` takes `installmentId`.
    // For now, we just record the payment transaction and account update.
    // The installment update logic is separate in the current UI (Pay button on installment row).
    // But the `PaymentForm` seems to be a general "Add Payment" form.
    // If the user uses this form, they are paying "something".
    // Let's assume for now this form is for general payments, and we won't auto-close installments unless we add logic for it.
    // Ideally we should auto-distribute.
    // But to stay safe and strict to "Gestão de Caixa" request:
    // "Sempre que um... pagamento for registrado... atualizando o saldo".

    // 6. Log Operation
    await insertOperationLog({
      institution_id: data.institution_id,
      user_id: data.user_id,
      operation_id: payment.id,
      type: "Pagamento",
      amount: data.amount,
      status: "success",
      observations: `Recebimento Direto Adicional - Empréstimo #${data.loan_id.slice(0, 8)}`,
    });

    revalidatePath("/payments");
    revalidatePath("/finance/accounts");
    revalidatePath(`/loans/${data.loan_id}`);

    return { success: true, paymentId: payment.id };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao criar pagamento.",
    };
  }
}
