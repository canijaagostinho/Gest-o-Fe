"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { translateSupabaseError } from "@/lib/error-handler";

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

  // Strict password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!passwordRegex.test(data.password)) {
    return {
      success: false,
      error: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e um caractere especial."
    };
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
        error: "Erro ao criar instituição: " + translateSupabaseError(instError),
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
    let userId: string;
    const { data: authData, error: createError } =
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
      console.log("Auth User Creation Error or User Exists:", createError.message);

      if (
        createError.message.toLowerCase().includes("already registered") ||
        createError.message.toLowerCase().includes("exists")
      ) {
        // Find existing user
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersData?.users.find(u => u.email?.toLowerCase() === data.email.toLowerCase());

        if (existingUser) {
          userId = existingUser.id;
          console.log("Found existing auth user:", userId);
          // Update metadata to ensure it's correct for profile creation
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              full_name: data.fullName,
              institution_id: institutionId,
              role_id: roleId,
            }
          });
        } else {
          // Rollback Institution
          await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
          return { success: false, error: "Este email já está em uso, mas não pôde ser recuperado." };
        }
      } else {
        // Rollback Institution
        await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
        return {
          success: false,
          error: "Erro ao registrar usuário: " + translateSupabaseError(createError),
        };
      }
    } else {
      userId = authData.user!.id;
    }

    // 6. Create User Profile
    const { error: profileError } = await supabaseAdmin.from("users").upsert({
      id: userId,
      email: data.email,
      full_name: data.fullName,
      institution_id: institutionId,
      role_id: roleId,
      status: "active",
    });

    if (profileError) {
      console.error("Profile Creation Error (Upsert):", profileError);
      // Rollback Auth User and Institution (only if we created a NEW user)
      if (!createError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
      return {
        success: false,
        error: "Erro ao criar perfil: " + translateSupabaseError(profileError),
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
    return { success: false, error: "Erro interno: " + translateSupabaseError(e) };
  }
}
