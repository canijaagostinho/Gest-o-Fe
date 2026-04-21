import { createClient } from "@/utils/supabase/server";
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
    // M-Pesa standard fields: input_ThirdPartyReference (our paymentId)
    // output_ResponseCode: "INS-0" (Success)
    const paymentId = body.input_ThirdPartyReference || body.paymentId;
    const responseCode = body.output_ResponseCode || body.status;
    const transactionId = body.output_TransactionID || body.transactionId;

    const isSuccess = responseCode === "INS-0" || responseCode === "SUCCESS" || responseCode === "COMPLETED";

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const supabase = await createClient();

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

      // B. Update Subscription (Restore/Extend Access)
      const months = payment.plan.interval_months || 1;
      const nextEndDate = new Date();
      nextEndDate.setMonth(nextEndDate.getMonth() + months);
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

      // C. Create Success Notification
      await supabase.from("system_notifications").insert({
        institution_id: payment.institution_id,
        title: "Acesso Restaurado!",
        message: "O pagamento foi confirmado via M-Pesa. A sua subscrição está ativa novamente.",
        type: "success",
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
