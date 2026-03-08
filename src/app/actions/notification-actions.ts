"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";

export async function getNotificationSettingsAction() {
  try {
    const supabase = await createClient();

    // RLS now ensures we only see our own settings.
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "The result contains 0 rows"
      console.error("Error fetching settings:", error);
    }

    if (!data) {
      // Return defaults if no settings found
      return {
        success: true,
        data: {
          days_before_due: 3,
          email_enabled: false,
          sms_enabled: false,
          email_template:
            "Olá {client_name}, sua parcela de {amount} vence em {due_date}.",
          sms_template:
            "Olá {client_name}, parcela de {amount} vence em {due_date}.",
        },
      };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateNotificationSettingsAction(data: {
  id?: string;
  days_before_due: number;
  email_enabled: boolean;
  sms_enabled: boolean;
  email_template: string;
  sms_template: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.institution_id) {
      throw new Error("Erro ao identificar a instituição do usuário.");
    }

    const institutionId = userData.institution_id;

    const payload = {
      days_before_due: data.days_before_due,
      email_enabled: data.email_enabled,
      sms_enabled: data.sms_enabled,
      email_template: data.email_template,
      sms_template: data.sms_template,
      updated_at: new Date().toISOString(),
      institution_id: institutionId, // Force institution_id
    };

    if (data.id) {
      const { error } = await supabase
        .from("notification_settings")
        .update(payload)
        .eq("id", data.id);

      if (error) throw error;
    } else {
      // Check if any row exists to avoid duplicates if ID wasn't passed but row exists
      const { data: existing } = await supabase
        .from("notification_settings")
        .select("id")
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("notification_settings")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_settings")
          .insert(payload);
        if (error) throw error;
      }
    }

    revalidatePath("/settings/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getNotificationLogsAction() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notification_logs")
      .select(
        `
                *,
                clients:client_id(full_name),
                loans:loan_id(contract_number)
            `,
      )
      .order("sent_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkAndSendNotificationsAction() {
  try {
    const supabase = await createClient();

    // This is tricky. This action might be called by a cron job or manual trigger.
    // If manual, we have a user context (RLS applies).
    // If system cron (e.g. via API route with service key), RLS is bypassed.
    // Since we enabled RLS on tables and strict separation, a system/admin cron
    // would need to loop through ALL institutions or handle it carefully.

    // HOWEVER, based on current implementation, this action is likely triggered BY A USER (Manager).
    // So RLS will scope it to the Manager's institution.
    // It will only process loans and settings for the current institution.

    // 1. Get Settings
    const { data: settings } = await supabase
      .from("notification_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings) return { success: false, error: "Settings not found" };
    if (!settings.email_enabled && !settings.sms_enabled) {
      return { success: true, message: "Notifications disabled", count: 0 };
    }

    const days = settings.days_before_due || 3;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    // 2. Find due installments
    // RLS applies to installments too.
    const { data: installments, error: instError } = await supabase
      .from("installments")
      .select(
        `
                id, amount, due_date, loan_id, status,
                loans:loan_id (
                    id, contract_number,
                    clients:client_id (id, full_name, email, phone_number)
                )
            `,
      )
      .eq("status", "pending")
      .eq("due_date", targetDateStr);

    if (instError) throw instError;
    if (!installments || installments.length === 0) {
      return { success: true, message: "No installments due", count: 0 };
    }

    // We need institution_id for inserting logs
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let institutionId = null;

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();
      institutionId = userData?.institution_id;
    }

    // If no user (cron?), we might need to derive institution_id from the loan/installment data?
    // But let's assume manual trigger for now as per previous context.

    let sentCount = 0;

    // 3. Process each
    for (const inst of installments) {
      const loan = inst.loans as any;
      const client = loan?.clients;

      if (!client) continue;

      // Derive institution_id from loan if user context is missing (though RLS would block fetch if no context)
      // But wait, installments don't return institution_id in the select above.
      // But we know they match RLS of current user.

      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("notification_logs")
        .select("*", { count: "exact", head: true })
        .eq("loan_id", loan.id)
        .gte("sent_at", today);

      if (count && count > 0) continue;

      const formatMsg = (tmpl: string) => {
        return tmpl
          .replace("{client_name}", client.full_name)
          .replace("{amount}", String(inst.amount))
          .replace("{due_date}", new Date(inst.due_date).toLocaleDateString());
      };

      // Send Email
      if (settings.email_enabled && client.email) {
        const msg = formatMsg(settings.email_template || "");
        let status: "sent" | "failed" = "sent";
        let errorDetails = null;

        try {
          const { error } = await resend.emails.send({
            from: "Gestão Flex <notifications@resend.dev>", // Should be verified domain later
            to: client.email,
            subject: "Aviso de Vencimento - Parcela de Empréstimo",
            text: msg,
          });
          if (error) throw error;
        } catch (err: any) {
          console.error("Resend Email Error:", err);
          status = "failed";
          errorDetails = err.message;
        }

        await supabase.from("notification_logs").insert({
          client_id: client.id,
          loan_id: loan.id,
          type: "email",
          status: status,
          sent_at: new Date().toISOString(),
          institution_id: institutionId,
          error_details: errorDetails,
        });

        if (status === "sent") sentCount++;
      }

      // Send SMS
      if (settings.sms_enabled && client.phone_number) {
        const msg = formatMsg(settings.sms_template || "");
        await supabase.from("notification_logs").insert({
          client_id: client.id,
          loan_id: loan.id,
          type: "sms",
          status: "sent",
          sent_at: new Date().toISOString(),
          institution_id: institutionId, // Insert with institution_id
        });
        sentCount++;
        console.log(`[MOCK SMS] To: ${client.phone_number}, Msg: ${msg}`);
      }
    }

    revalidatePath("/settings/notifications");
    return { success: true, count: sentCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendIndividualNotificationAction(data: {
  client_id: string;
  loan_id: string;
  type: "email" | "sms";
  message: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.institution_id) {
      throw new Error("Instituição não encontrada.");
    }

    // Fetch client details for email
    const { data: clientData } = await supabase
      .from("clients")
      .select("email")
      .eq("id", data.client_id)
      .single();

    // Real Send Email if type is email
    let status: "sent" | "failed" = "sent";
    if (data.type === "email" && clientData?.email) {
      try {
        const { error } = await resend.emails.send({
          from: "Gestão Flex <notifications@resend.dev>",
          to: clientData.email,
          subject: "Notificação Direta",
          text: data.message,
        });
        if (error) throw error;
      } catch (err: any) {
        console.error("Resend Manual Email Error:", err);
        status = "failed";
      }
    }

    // Log Send Log
    const { error } = await supabase.from("notification_logs").insert({
      client_id: data.client_id,
      loan_id: data.loan_id,
      type: data.type,
      status: status,
      sent_at: new Date().toISOString(),
      institution_id: userData.institution_id,
    });

    if (error) throw error;

    // Audit Log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "send_manual_notification",
      module: "notifications",
      record_id: data.loan_id,
      new_data: { type: data.type, message: data.message, status },
      institution_id: userData.institution_id,
    });

    console.log(
      `[MOCK ${data.type.toUpperCase()}] Manual sending - Msg: ${data.message}`,
    );

    revalidatePath("/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
