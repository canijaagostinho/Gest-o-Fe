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

    // 2. Alert institutions approaching expiration (3, 2, 1 days before)
    // For subscriptions > 3 days away, use 7-day cooldown to avoid spam.
    // For 1-3 days, use 20-hour cooldown so we notify once per day.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const twentyHoursAgo = new Date();
    twentyHoursAgo.setHours(twentyHoursAgo.getHours() - 20);

    console.log("Checking for approaching expirations...");

    const { data: potentialAlerts, error: soonErr } = await supabaseAdmin
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
      .in("status", ["trialing", "active"]);

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

        // Only send alerts at 3, 2, or 1 days remaining
        if (diffDays <= 0 || diffDays > 3) continue;

        // In the critical 3-day window: use 20-hour cooldown so we notify once per day
        const cooldownDate = twentyHoursAgo;
        const lastNotified = sub.last_notified_at
          ? new Date(sub.last_notified_at)
          : null;

        if (lastNotified && lastNotified > cooldownDate) continue;

        const inst = sub.institutions as any;

        // 1. Send Email
        if (inst && inst.email) {
          try {
            await resend.emails.send({
              from: "Gestão Flex <financeiro@gestaoflex.mz>",
              to: inst.email,
              subject: isTrial
                ? `Aviso: O seu período de teste termina em ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`
                : `Aviso: Sua assinatura expira em ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`,
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
              ? `Teste Gratuito: Faltam ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`
              : `Assinatura: Faltam ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`,
            message: `O seu acesso ao sistema expira em ${diffDays} ${diffDays === 1 ? "dia" : "dias"} (${endDate.toLocaleDateString("pt-MZ")}). Por favor, regularize a sua subscrição para evitar interrupções.`,
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

        // 3. Mark as notified with current timestamp
        await supabaseAdmin
          .from("subscriptions")
          .update({ last_notified_at: today.toISOString() })
          .eq("id", sub.id);
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
