import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * Webhook handler for M-Pesa / Simpllo / National Gateways
 * URL: [DOMAIN]/api/webhooks/payments
 */
export async function POST(req: Request) {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[${requestId}] Webhook Payment Received`);

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const signature = req.headers.get("x-mpesa-signature"); // Or generic 'x-webhook-signature'

    // 1. Verify Signature (Security)
    // IMPORTANT: To enable this, set PAYMENT_WEBHOOK_SECRET in your environment
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (secret) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = hmac.update(rawBody).digest("hex");

      if (signature !== digest) {
        console.warn(`[${requestId}] Invalid webhook signature detected`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn(
        `[${requestId}] Webhook received but PAYMENT_WEBHOOK_SECRET is not set. Skipping verification (INSECURE).`,
      );
    }

    console.log(`[${requestId}] Body:`, JSON.stringify(body, null, 2));

    // 2. Identify the payment and institution
    // DébitoPay / M-Pesa standard fields
    const paymentId = body.reference || body.input_ThirdPartyReference || body.paymentId;
    const responseCode = body.status || body.output_ResponseCode;
    const transactionId = body.transactionId || body.output_TransactionID;

    // DébitoPay usually sends 'completed' or 'success'
    const isSuccess = 
      responseCode === "completed" || 
      responseCode === "success" || 
      responseCode === "SUCCESS" ||
      responseCode === "INS-0";

    if (!paymentId) {
      console.error(`[${requestId}] Webhook missing reference/paymentId. Body:`, body);
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 3. Handle successful payment
    if (isSuccess) {
      console.log(`[${requestId}] Processing success for Payment: ${paymentId}`);

      // Fetch payment details to get subscription ID
      const { data: payment, error: fetchErr } = await supabase
        .from("subscription_payments")
        .select("*, plan:plans(*)")
        .eq("id", paymentId)
        .single();

      if (fetchErr || !payment) {
        console.error(`[${requestId}] Payment record not found: ${paymentId}`);
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      // Avoid double processing
      if (payment.status === "approved") {
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // A. Update Payment Record
      await supabase
        .from("subscription_payments")
        .update({
          status: "approved",
          transaction_id: transactionId,
          processed_at: new Date().toISOString(),
          metadata: body, // Store the full response for audit
        })
        .eq("id", paymentId);

      // Get current subscription status for audit logging
      const { data: subCurrent } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("id", payment.subscription_id)
        .single();

      // B. Update Subscription (Restore/Extend Access)
      const months = payment.plan.interval_months || 1;
      const nextEndDate = new Date();
      nextEndDate.setMonth(nextEndDate.getMonth() + months);
      nextEndDate.setUTCHours(22, 0, 0, 0);

      const { error: subErr } = await supabase
        .from("subscriptions")
        .update({
          status: "Ativa",
          plan_id: payment.plan_id,
          current_period_start: new Date().toISOString(),
          current_period_end: nextEndDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.subscription_id);

      if (subErr) throw subErr;

      // C. Log to subscription_audit_logs (Audit Trail)
      await supabase
        .from("subscription_audit_logs")
        .insert({
          subscription_id: payment.subscription_id,
          institution_id: payment.institution_id,
          event_type: "reactivation",
          status_before: subCurrent?.status || "Suspensa por inadimplência",
          status_after: "Ativa",
          due_date: nextEndDate.toISOString(),
          reactivation_date: new Date().toISOString(),
          amount_paid: payment.amount,
          payment_method: payment.payment_method || "gateway",
        });

      // D. Create Success Notification
      await supabase.from("system_notifications").insert({
        institution_id: payment.institution_id,
        title: "Acesso Restaurado!",
        message: "O pagamento foi confirmado via gateway. A sua subscrição está ativa novamente.",
        type: "success",
        link: "/dashboard",
      });

      console.log(`[${requestId}] Payment ${paymentId} fully processed and subscription updated.`);
      return NextResponse.json({ success: true, message: "Payment processed" });
    }

    // Handle Failure
    console.warn(`[${requestId}] Payment failed or rejected by gateway. Code: ${responseCode}`);
    return NextResponse.json({ success: true, message: "Failure logged" });

  } catch (error: any) {
    console.error(`[${requestId}] Webhook Critical Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
