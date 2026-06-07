import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";

// Initialize Supabase Admin strictly for backend cron job bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: Request) {
  // Simple Authorization header check for the cron job secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "dev_secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to day boundary

    console.log(`[CRON] Starting subscription verification at ${new Date().toISOString()}`);

    // -------------------------------------------------------------------------
    // 1. AUTO-SUSPEND OVERDUE SUBSCRIPTIONS
    // -------------------------------------------------------------------------
    // Fetch all active, Ativa, or trialing subscriptions to verify expiration
    const { data: activeSubs, error: fetchExpiredErr } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        id,
        institution_id,
        status,
        current_period_end,
        trial_end,
        plan_id,
        plans(name, price_amount)
      `)
      .in("status", ["Ativa", "active", "trialing"]);

    if (fetchExpiredErr) {
      console.error("Error fetching active subscriptions:", fetchExpiredErr);
    }

    const nowStr = new Date().toISOString();
    const expiredSubs = (activeSubs || []).filter((sub) => {
      const isTrial = !sub.plan_id;
      const periodEnd = isTrial ? sub.trial_end : sub.current_period_end;
      return periodEnd ? periodEnd < nowStr : false;
    });

    let suspendedCount = 0;

    if (expiredSubs && expiredSubs.length > 0) {
      for (const sub of expiredSubs) {
        console.log(`[CRON] Suspending subscription ${sub.id} for institution ${sub.institution_id}`);

        // A. Update status to 'Suspensa por inadimplência'
        const { error: updateSubErr } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "Suspensa por inadimplência",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);

        if (updateSubErr) {
          console.error(`[CRON] Failed to update subscription ${sub.id}:`, updateSubErr);
          continue;
        }

        // B. Log to subscription_audit_logs (Permanent, non-editable logs)
        const { error: auditErr } = await supabaseAdmin
          .from("subscription_audit_logs")
          .insert({
            subscription_id: sub.id,
            institution_id: sub.institution_id,
            event_type: "suspension",
            status_before: sub.status,
            status_after: "Suspensa por inadimplência",
            due_date: sub.plan_id ? sub.current_period_end : sub.trial_end,
            suspension_date: new Date().toISOString(),
            suspension_reason: sub.plan_id 
              ? "Falta de pagamento após data de vencimento" 
              : "Fim do período de teste gratuito (Trial)",
            amount_paid: 0,
          });

        if (auditErr) {
          console.error(`[CRON] Failed to write audit log for sub ${sub.id}:`, auditErr);
        }

        // C. Create internal notification for system administrators or users
        await supabaseAdmin.from("system_notifications").insert({
          institution_id: sub.institution_id,
          title: "Acesso Suspenso",
          message: "O seu acesso ao GestãoFlex foi suspenso devido à falta de pagamento da assinatura. Para voltar a utilizar a plataforma, efetue a regularização do pagamento.",
          type: "error",
          link: "/settings/billing",
        });

        suspendedCount++;
      }
    }

    // -------------------------------------------------------------------------
    // 2. AUTOMATIC MULTI-CHANNEL NOTIFICATIONS (7, 3, 1, 0, -1, -3, -7, -15 days)
    // -------------------------------------------------------------------------
    // Target days for notifications: positive means days before due, negative means days after due
    const notificationThresholds = [7, 3, 1, 0, -1, -3, -7, -15];

    // Fetch all active or suspended subscriptions with institution details
    const { data: allSubs, error: fetchSubsErr } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        id,
        status,
        current_period_end,
        plans(name, price_amount),
        institutions(id, name, email, phone)
      `);

    if (fetchSubsErr) {
      throw new Error(`Failed to fetch subscriptions for notifications: ${fetchSubsErr.message}`);
    }

    let emailsSent = 0;
    let whatsappSent = 0;
    let systemNotifsCreated = 0;

    if (allSubs && allSubs.length > 0) {
      for (const sub of allSubs) {
        const endDateStr = sub.current_period_end;
        if (!endDateStr) continue;

        const endDate = new Date(endDateStr);
        endDate.setUTCHours(0, 0, 0, 0);

        const nowDay = new Date();
        nowDay.setUTCHours(0, 0, 0, 0);

        // Calculate difference in days (endDate - now)
        const diffTime = endDate.getTime() - nowDay.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // If the current diffDays is not in our target thresholds, skip
        if (!notificationThresholds.includes(diffDays)) continue;

        const inst = sub.institutions as any;
        const plan = sub.plans as any;
        if (!inst) continue;

        const planName = plan?.name || "Plano Profissional";
        const planPrice = plan?.price_amount ? Number(plan.price_amount) : 0;
        const formattedDate = new Date(endDateStr).toLocaleDateString("pt-MZ");
        const daysInArrears = Math.abs(diffDays);

        // Formulate message based on threshold
        let subject = "";
        let message = "";
        let notifType: "info" | "warning" | "error" = "info";

        if (diffDays === 7) {
          subject = `Aviso: Sua assinatura vence em 7 dias`;
          message = `Prezado ${inst.name}, lembramos que a mensalidade do plano ${planName} vence em 7 dias (${formattedDate}). Valor: ${planPrice.toLocaleString("pt-MZ")} MTn. Evite a suspensão do acesso efetuando a regularização.`;
          notifType = "info";
        } else if (diffDays === 3) {
          subject = `Aviso: Sua assinatura vence em 3 dias`;
          message = `Prezado ${inst.name}, sua assinatura do GestãoFlex vence em 3 dias (${formattedDate}). Regularize o pagamento de ${planPrice.toLocaleString("pt-MZ")} MTn para garantir o uso ininterrupto da plataforma.`;
          notifType = "warning";
        } else if (diffDays === 1) {
          subject = `Aviso: Sua assinatura vence amanhã`;
          message = `Urgente: A mensalidade da sua assinatura vence amanhã (${formattedDate}). Valor: ${planPrice.toLocaleString("pt-MZ")} MTn. Regularize hoje mesmo para evitar o bloqueio automático de acesso ao sistema.`;
          notifType = "warning";
        } else if (diffDays === 0) {
          subject = `Aviso: Sua assinatura vence hoje`;
          message = `Urgente: Sua assinatura do plano ${planName} vence hoje! Efetue o pagamento de ${planPrice.toLocaleString("pt-MZ")} MTn agora para continuar utilizando a plataforma GestãoFlex sem interrupções.`;
          notifType = "warning";
        } else if (diffDays === -1) {
          subject = `Acesso Suspenso: Assinatura Vencida`;
          message = `Seu acesso ao GestãoFlex foi suspenso devido à falta de pagamento da assinatura (vencida em ${formattedDate}). Valor pendente: ${planPrice.toLocaleString("pt-MZ")} MTn. Efetue a regularização para reativar o sistema.`;
          notifType = "error";
        } else if (diffDays === -3) {
          subject = `Assinatura Suspensa há 3 dias`;
          message = `Prezado ${inst.name}, o seu acesso ao GestãoFlex continua suspenso devido ao atraso de 3 dias no pagamento da assinatura (vencimento: ${formattedDate}). Todos os seus dados estão preservados. Efetue a regularização de ${planPrice.toLocaleString("pt-MZ")} MTn para liberar o acesso.`;
          notifType = "error";
        } else if (diffDays === -7) {
          subject = `Assinatura Suspensa há 7 dias`;
          message = `Prezado ${inst.name}, lembramos que a sua assinatura está suspensa por inadimplência há 7 dias (vencimento: ${formattedDate}). Para retomar o uso da plataforma GestãoFlex, regularize o pagamento pendente.`;
          notifType = "error";
        } else if (diffDays === -15) {
          subject = `Assinatura Suspensa há 15 dias`;
          message = `Prezado ${inst.name}, sua assinatura está suspensa há 15 dias (vencimento: ${formattedDate}). Seus clientes e empréstimos estão protegidos, mas o acesso permanece bloqueado. Regularize seu pagamento para reativar o sistema.`;
          notifType = "error";
        }

        // Send to each channel and log in database to prevent double-sending
        const channels = ["email", "whatsapp", "internal"];

        for (const channel of channels) {
          try {
            // Check if already sent
            const { data: alreadySent } = await supabaseAdmin
              .from("subscription_notification_logs")
              .select("id")
              .eq("subscription_id", sub.id)
              .eq("target_day", diffDays)
              .eq("channel", channel)
              .maybeSingle();

            if (alreadySent) continue; // Skip if already notified on this day through this channel

            // Send notification
            if (channel === "email" && inst.email) {
              await resend.emails.send({
                from: "Gestão Flex <financeiro@gestaoflex.mz>",
                to: inst.email,
                subject: subject,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #1e3a8a; margin-bottom: 20px;">GestãoFlex - Comunicado Financeiro</h2>
                    <p style="font-size: 16px; color: #334155; line-height: 1.6;">${message}</p>
                    <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                      <strong>Plano:</strong> ${planName}<br>
                      <strong>Valor:</strong> ${planPrice.toLocaleString("pt-MZ")} MTn<br>
                      <strong>Vencimento:</strong> ${formattedDate}<br>
                      ${diffDays < 0 ? `<strong>Atraso:</strong> ${daysInArrears} dia(s)` : ""}
                    </div>
                    <a href="https://gestaoflex.mz/settings/billing" style="display: inline-block; margin-top: 25px; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Regularizar Assinatura</a>
                    <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; color: #64748b;">Se você já efetuou o pagamento, desconsidere esta mensagem. Suporte: suporte@gestaoflex.mz</p>
                  </div>
                `,
              });
              emailsSent++;
            }

            if (channel === "whatsapp" && inst.phone) {
              // WhatsApp Notification Mock
              // In production, this would call a WhatsApp gateway API (e.g. Twilio, Simpllo)
              console.log(`[WHATSAPP NOTIFICATION MOCK]
                To: ${inst.phone}
                Message: ${message}
              `);
              whatsappSent++;
            }

            if (channel === "internal") {
              await supabaseAdmin.from("system_notifications").insert({
                institution_id: inst.id,
                title: subject,
                message: message,
                type: notifType,
                link: "/settings/billing",
              });
              systemNotifsCreated++;
            }

            // Log that this notification was successfully sent
            await supabaseAdmin.from("subscription_notification_logs").insert({
              subscription_id: sub.id,
              institution_id: inst.id,
              target_day: diffDays,
              channel: channel,
            });

          } catch (channelErr) {
            console.error(`[CRON] Error processing channel ${channel} for sub ${sub.id}:`, channelErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      auto_suspended_count: suspendedCount,
      notifications: {
        emails_sent: emailsSent,
        whatsapp_sent: whatsappSent,
        internal_notifications: systemNotifsCreated,
      }
    });

  } catch (error: any) {
    console.error("[CRON] Critical error during subscription check:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
