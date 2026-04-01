import { createClient } from "@/utils/supabase/server";
import { ExpenseList } from "@/components/expenses/expense-list";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user profile to get institution_id and role
  const { data: profile } = await supabase
    .from("users")
    .select("institution_id, role:roles(name)")
    .eq("id", user.id)
    .single();

  const userRole = (profile?.role as any)?.name;

  // 2. Restrict access for non-managers
  if (["operador", "agente", "cliente"].includes(userRole)) {
    redirect("/dashboard");
  }

  if (!profile?.institution_id) {
    return <div>Erro: Instituição não encontrada.</div>;
  }

  // Fetch expenses
  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return <div>Erro ao carregar despesas.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ExpenseList
        data={expenses || []}
        userId={user.id}
        institutionId={profile.institution_id}
        userRole={(profile?.role as any)?.name}
      />
    </div>
  );
}
