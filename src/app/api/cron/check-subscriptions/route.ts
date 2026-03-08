import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import { TrialExpiringEmail } from "@/components/emails/trial-expiring-email";

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

    // 1. Process EXPIRED trials and subscriptions
    // Find trialing subscriptions where trial_end is in the past
    console.log("Checking expired subscriptions...");
    const { data: expiredTrials, error: trialErr } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("status", "trialing")
      .lt("trial_end", today.toISOString())
      .select();

    if (trialErr) console.error("Error updating expired trials:", trialErr);

    // Find active subscriptions where current_period_end is in the past
    const { data: expiredActives, error: activeErr } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("status", "active")
      .lt("current_period_end", today.toISOString())
      .select();

    if (activeErr) console.error("Error updating expired actives:", activeErr);

    // 2. Alert institutions 3 days before expiration
    // Calculate 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Fetch subscriptions trialing or active that end within the next 3 days
    // and haven't been notified in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log("Checking for approaching expirations...");

    let query = supabaseAdmin
      .from("subscriptions")
      .select(
        `
                id,
                status,
                trial_end,
                current_period_end,
                last_notified_at,
                institutions (
                    id,
                    name,
                    email
                )
            `,
      )
      .in("status", ["trialing", "active"])
      .or(
        `last_notified_at.is.null,last_notified_at.lt.${sevenDaysAgo.toISOString()}`,
      );

    const { data: potentialAlerts, error: soonErr } = await query;

    if (soonErr)
      console.error("Error fetching expiring subscriptions:", soonErr);

    let emailsSent = 0;
    let systemNotifsCreated = 0;

    if (potentialAlerts && potentialAlerts.length > 0) {
      for (const sub of potentialAlerts) {
        const isTrial = sub.status === "trialing";
        const endDateStr = isTrial ? sub.trial_end : sub.current_period_end;

        if (!endDateStr) continue;

        const endDate = new Date(endDateStr);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // We only alert if exactly 3 days left (or less, if we missed a day, but not if already expired)
        if (diffDays > 0 && diffDays <= 3) {
          const inst = sub.institutions as any;

          // 1. Send Email
          if (inst && inst.email) {
            try {
              await resend.emails.send({
                from: "Gestão Flex <financeiro@gestaoflex.mz>",
                to: inst.email,
                subject: isTrial
                  ? "Aviso: O seu período de teste termina em 3 dias"
                  : "Aviso: Sua assinatura expira em 3 dias",
                react: TrialExpiringEmail({
                  institutionName: inst.name,
                  daysLeft: diffDays,
                  isTrial,
                  endDate: endDate.toLocaleDateString("pt-MZ"),
                }) as React.ReactElement,
              });
              emailsSent++;
            } catch (emailErr) {
              console.error(`Failed to send email to ${inst.email}`, emailErr);
            }
          }

          // 2. Create In-App Notification
          try {
            await supabaseAdmin.from("system_notifications").insert({
              institution_id: inst.id,
              title: isTrial
                ? "Teste Gratuito a Terminar"
                : "Assinatura a Terminar",
              message: `O seu acesso ao sistema expira em ${diffDays} dias (${endDate.toLocaleDateString("pt-MZ")}). Por favor, regularize a sua subscrição para evitar interrupções.`,
              type: "warning",
              link: "/settings/billing",
            });
            systemNotifsCreated++;
          } catch (notifErr) {
            console.error(
              `Failed to create system notification for ${inst.id}`,
              notifErr,
            );
          }

          // 3. Mark as notified
          await supabaseAdmin
            .from("subscriptions")
            .update({ last_notified_at: today.toISOString() })
            .eq("id", sub.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      expired_trials: expiredTrials?.length || 0,
      expired_actives: expiredActives?.length || 0,
      warnings_sent: emailsSent,
      system_notifications: systemNotifsCreated,
    });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
