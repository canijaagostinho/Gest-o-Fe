import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Webhook handler for National/Local Payment Gateways (e.g. M-Pesa API, Simpllo, etc.)
 * This route should be registered as the "Callback URL" or "Webhook URL" in the payment provider's portal.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    // 1. Verify Signature (Security)
    // This depends on the specific provider. Usually involves a shared secret or public key.
    // Example: const signature = req.headers.get('x-gateway-signature')

    console.log("Payment Webhook received:", body);

    // 2. Identify the payment and institution
    // Usually providers send a 'reference' or 'metadata' we supplied during checkout.
    const { paymentId, status, transactionId } = body;

    // 3. Handle successful payment
    if (status === "SUCCESS" || status === "COMPLETED") {
      // Fetch payment details to get subscription ID
      const { data: payment, error: fetchErr } = await supabase
        .from("subscription_payments")
        .select("*, plan:plans(*)")
        .eq("id", paymentId)
        .single();

      if (fetchErr || !payment) {
        console.error("Payment not found for webhook:", paymentId);
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 },
        );
      }

      // A. Update Payment Record
      await supabase
        .from("subscription_payments")
        .update({
          status: "approved",
          transaction_id: transactionId, // Optional: add this column if needed
          processed_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      // B. Update Subscription (Restore Access)
      const months = payment.plan.interval_months || 1;
      const nextEndDate = new Date();
      nextEndDate.setMonth(nextEndDate.getMonth() + months);
      // Enforce 22:00 expiration time
      nextEndDate.setUTCHours(22, 0, 0, 0);

      const { error: subErr } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          plan_id: payment.plan_id,
          current_period_start: new Date().toISOString(),
          current_period_end: nextEndDate.toISOString(),
        })
        .eq("id", payment.subscription_id);

      if (subErr) throw subErr;

      // C. Create Success Notification for the User
      await supabase.from("system_notifications").insert({
        institution_id: payment.institution_id,
        title: "Acesso Restaurado!",
        message:
          "O seu pagamento foi confirmado automaticamente pelo gateway. O bloqueio foi removido e a sua subscrição está ativa.",
        type: "success",
      });

      return NextResponse.json({
        success: true,
        message: "Subscription activated",
      });
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
