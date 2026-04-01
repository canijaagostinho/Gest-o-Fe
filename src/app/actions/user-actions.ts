"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { ActionResponse, UserCreateData, UserUpdateData, RoleName } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";
import { translateSupabaseError } from "@/lib/error-handler";
import { insertOperationLog } from "@/utils/operation-logger";

export async function createUserAction(data: UserCreateData): Promise<ActionResponse> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(
        "CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in server environment.",
      );
      return {
        success: false,
        error: "Erro de Configuração: Chave de Serviço ausente no servidor.",
      };
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

    const supabase = await createClient();

    // 1. Verify Current User Permissions
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      console.error("Auth check failed:", authError);
      return { success: false, error: "Não autenticado ou sessão expirada." };
    }

    const { data: requesterProfile, error: profileFetchError } = await supabase
      .from("users")
      .select("*, role:roles(name)")
      .eq("id", currentUser.id)
      .single();

    if (profileFetchError) {
      console.error("Requester profile fetch failed:", profileFetchError);
      return {
        success: false,
        error: "Erro ao verificar permissões: " + profileFetchError.message,
      };
    }

    const requesterRole = (requesterProfile?.role as unknown as { name: RoleName })?.name;

    if (
      requesterRole !== "admin_geral" &&
      requesterRole !== "gestor" &&
      requesterRole !== "admin"
    ) {
      return {
        success: false,
        error: "Permissão negada. Apenas administradores podem criar usuários.",
      };
    }

    // 2. Check Limits
    const targetInstitutionId = data.institution_id;
    const targetRoleId = data.role_id;

    // Fetch role name to check specific limits
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("name")
      .eq("id", targetRoleId)
      .single();
    if (roleError || !roleData)
      return { success: false, error: "Função inválida ou não encontrada." };

    const roleName = roleData.name;

    const { count, error: countError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", targetInstitutionId)
      .eq("role_id", targetRoleId);

    if (countError)
      return {
        success: false,
        error: "Erro ao verificar limites: " + countError.message,
      };

    const currentCount = count || 0;

    if ((roleName === "gestor" || roleName === "admin") && currentCount >= 2) {
      return {
        success: false,
        error: "Limite atingido: Máximo de 2 Administradores por instituição.",
      };
    }

    if ((roleName === "operador" || roleName === "user") && currentCount >= 5) {
      return {
        success: false,
        error: "Limite atingido: Máximo de 5 Usuários Normais por instituição.",
      };
    }

    // 3. Create User in Supabase Auth
    let userId = "";

    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Auto confirm
        user_metadata: {
          full_name: data.full_name,
          institution_id: targetInstitutionId,
          role_id: targetRoleId,
        },
      });

    if (createError) {
      console.error("Supabase Admin CreateUser Error:", createError);
      return {
        success: false,
        error: "Erro ao criar conta: " + translateSupabaseError(createError),
      };
    }

    if (!newUser.user) {
      return {
        success: false,
        error: "Erro desconhecido ao criar usuário (sem dados retornados).",
      };
    }

    userId = newUser.user.id;

    // 4. Update/Insert Profile
    // We use the 'users' table as per the application convention.
    // Ensure this table exists and matches the schema used by the app.
    const { error: profileError } = await supabaseAdmin.from("users").upsert({
      id: userId,
      email: data.email,
      full_name: data.full_name,
      institution_id: targetInstitutionId,
      role_id: targetRoleId,
      status: "active",
    });

    if (profileError) {
      console.error("Profile Upsert Error:", profileError);

      // Critical: If profile fails, we might have a dangling Auth user.
      // If it was a NEW user, we should delete it to maintain consistency.
      // If it was an existing user (though we return early above), we wouldn't delete.

      if (newUser.user) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }

      return {
        success: false,
        error: "Erro ao configurar perfil do usuário: " + translateSupabaseError(profileError),
      };
    }

    // 5. Log Operation
    await insertOperationLog({
      institution_id: targetInstitutionId,
      user_id: currentUser.id,
      operation_id: userId,
      type: "Outro",
      status: "success",
      observations: `Criação de novo usuário: ${data.full_name} (${data.email})`,
      metadata: { role_id: targetRoleId },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    console.error("CRITICAL SERVER ACTION EXCEPTION:", error);
    return {
      success: false,
      error: "Exceção no Servidor: " + translateSupabaseError(error),
    };
  }
}

export async function updateUserAction(data: UserUpdateData): Promise<ActionResponse> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: "Erro de Configuração: Chave de Serviço ausente no servidor.",
      };
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

    const supabase = await createClient();

    // Check permissions
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return { success: false, error: "Não autenticado" };

    const { data: requesterProfile } = await supabase
      .from("users")
      .select("*, role:roles(name)")
      .eq("id", currentUser.id)
      .single();

    if (!requesterProfile) return { success: false, error: "Perfil do requisitante não encontrado." };

    const roleName = (requesterProfile.role as unknown as { name: RoleName })?.name;
    const isGlobalAdmin = roleName === "admin_geral";
    const isLocalManager = roleName === "gestor" || roleName === "admin";

    if (!isGlobalAdmin && !isLocalManager) {
      return { success: false, error: "Permissão negada. Apenas administradores podem atualizar usuários." };
    }

    // 2. Security Check: Same Institution (unless Global Admin)
    if (!isGlobalAdmin) {
      const { data: targetUser, error: targetError } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", data.id)
        .single();

      if (targetError || !targetUser) {
        return { success: false, error: "Utilizador alvo não encontrado." };
      }

      const requesterInstitutionId = requesterProfile.institution_id;
      if (targetUser.institution_id !== requesterInstitutionId) {
        return { success: false, error: "Permissão negada. Você só pode gerir utilizadores da sua própria instituição." };
      }
    }

    // Update Profile
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .update({
        full_name: data.full_name,
        email: data.email,
        role_id: data.role_id,
        // institution_id is complex to change due to limits, maybe restrict it for now or check limits again.
        // For simplicity, let's assume institution doesn't change OR we are just updating details.
      })
      .eq("id", data.id);

    if (profileError) return { success: false, error: translateSupabaseError(profileError) };

    // Update Auth (Email and/or Password)
    const authUpdates: Record<string, any> = {
      user_metadata: { full_name: data.full_name },
    };

    if (data.email) authUpdates.email = data.email;
    if (data.password && data.password.trim().length > 0)
      authUpdates.password = data.password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(data.id, authUpdates);
      if (authError)
        return {
          success: false,
          error: "Erro ao atualizar autenticação: " + translateSupabaseError(authError),
        };
    }

    // 3. Log Operation
    await insertOperationLog({
      institution_id: requesterProfile.institution_id,
      user_id: currentUser.id,
      operation_id: data.id,
      type: "Atualização",
      status: "success",
      observations: `Atualização de dados do usuário: ${data.full_name}`,
    });

    revalidatePath("/users");
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    console.error("UPDATE USER EXCEPTION:", error);
    return { success: false, error: "Erro ao atualizar: " + translateSupabaseError(error) };
  }
}

export async function revokeUserAccessAction(userId: string): Promise<ActionResponse> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: "Erro de Configuração: Chave de Serviço ausente no servidor.",
      };
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

    const supabase = await createClient();

    // 1. Check permissions
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return { success: false, error: "Não autenticado" };

    const { data: requesterProfile } = await supabase
      .from("users")
      .select("*, role:roles(name)")
      .eq("id", currentUser.id)
      .single();

    if (!requesterProfile) return { success: false, error: "Perfil do requisitante não encontrado." };

    const roleName = (requesterProfile.role as unknown as { name: RoleName })?.name;
    const isGlobalAdmin = roleName === "admin_geral";
    const isLocalManager = roleName === "gestor" || roleName === "admin";

    if (!isGlobalAdmin && !isLocalManager) {
      return {
        success: false,
        error: "Permissão negada. Apenas administradores podem revogar acessos.",
      };
    }

    // Security Check: Same Institution
    if (!isGlobalAdmin) {
      const { data: targetUser } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", userId)
        .single();
      
      const requesterInstitutionId = requesterProfile.institution_id;
      if (targetUser?.institution_id !== requesterInstitutionId) {
        return { success: false, error: "Permissão negada. Você só pode revogar acessos de utilizadores da sua própria instituição." };
      }
    }

    // Prevent self-revocation
    if (currentUser.id === userId) {
      return {
        success: false,
        error: "Você não pode revogar o seu próprio acesso administrativo.",
      };
    }

    // 2. Delete from Auth (this also triggers cascading deletes if configured, but we'll be explicit)
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Auth Delete Error:", authError);
      return {
        success: false,
        error: "Erro ao remover usuário da autenticação: " + translateSupabaseError(authError),
      };
    }

    // 3. Delete from users table (if not handled by cascade)
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Profile Delete Error:", profileError);
      // Auth is already gone, so we just log this
    }

    // 4. Log Operation
    await insertOperationLog({
      institution_id: requesterProfile.institution_id,
      user_id: currentUser.id,
      operation_id: userId,
      type: "Cancelamento",
      status: "success",
      observations: `Revogação de acesso do usuário ID: ${userId}`,
    });

    revalidatePath("/users");
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    console.error("REVOKE ACCESS EXCEPTION:", error);
    return { success: false, error: "Erro ao revogar acesso: " + translateSupabaseError(error) };
  }
}
