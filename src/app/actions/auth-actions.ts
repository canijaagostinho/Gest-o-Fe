"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function registerAndLoginAction(data: {
  fullName: string;
  email: string;
  password: string;
  institutionName: string;
}) {
  // 1. Validate Input
  if (
    !data.email ||
    !data.password ||
    !data.fullName ||
    !data.institutionName
  ) {
    return { success: false, error: "Todos os campos são obrigatórios." };
  }

  // 2. Setup Admin Client (for privileged creation)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY missing.");
    return { success: false, error: "Erro de configuração do servidor." };
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  try {
    // 3. Create Institution
    // We assume 'institutions' table exists and has a 'name' column.
    const { data: institution, error: instError } = await supabaseAdmin
      .from("institutions")
      .insert({
        name: data.institutionName,
        // Add default fields if necessary, e.g. active: true
        // Assuming 'nuit', 'address' are optional or can be updated later per dashboard logic
      })
      .select()
      .single();

    if (instError) {
      console.error("Institution Creation Error:", instError);
      return {
        success: false,
        error: "Erro ao criar instituição: " + instError.message,
      };
    }

    const institutionId = institution.id;

    // 4. Fetch 'gestor' Role ID (Institution Admin)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "gestor") // 'gestor' is the standard institution admin role
      .single();

    if (roleError || !roleData) {
      console.error("Role Fetch Error:", roleError);
      // Rollback institution? Ideally yes, but for MVP/SaaS flow we might manually cleanup or handle later.
      // Deleting institution to keep clean:
      await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
      return {
        success: false,
        error: "Erro ao configurar permissões (Role 'admin' não encontrada).",
      };
    }

    const roleId = roleData.id;

    // 5. Create Auth User (Auto-confirmed)
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
          institution_id: institutionId,
          role_id: roleId,
        },
      });

    if (createError) {
      console.error("Auth User Creation Error:", createError);
      // Rollback Institution
      await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
      if (
        createError.message.includes("already registered") ||
        createError.message.includes("exists")
      ) {
        return { success: false, error: "Este email já está em uso." };
      }
      return {
        success: false,
        error: "Erro ao registrar usuário: " + createError.message,
      };
    }

    if (!newUser.user) {
      await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
      return {
        success: false,
        error: "Erro desconhecido na criação do usuário.",
      };
    }

    const userId = newUser.user.id;

    // 6. Create User Profile
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: data.email,
      full_name: data.fullName,
      institution_id: institutionId,
      role_id: roleId,
      status: "active",
    });

    if (profileError) {
      console.error("Profile Creation Error:", profileError);
      // Rollback Auth User and Institution
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
      return {
        success: false,
        error: "Erro ao criar perfil: " + profileError.message,
      };
    }

    // 7. Auto-Login (Sign In)
    // Now we switch to the standard server client context to set the session cookie for the user.
    const supabase = await createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      console.error("Auto-login Error:", signInError);
      // Account is created, but login failed. Redirect to login?
      return {
        success: true,
        warning:
          "Conta criada, mas o login automático falhou. Por favor, entre manualmente.",
      };
    }

    return { success: true };
  } catch (e: any) {
    console.error("Server Action Exception:", e);
    return { success: false, error: "Erro interno: " + e.message };
  }
}
