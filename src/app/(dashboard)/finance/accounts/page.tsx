import { getAccountsAction } from "@/app/actions/account-actions";
import { AccountClient } from "./account-client";
import { createClient } from "@/utils/supabase/server";

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = "operador";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role:roles(name)")
      .eq("id", user.id)
      .single();

    userRole = (profile?.role as any)?.name || "operador";
  }

  const { data } = await getAccountsAction();
  const accounts = data || [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AccountClient data={accounts} userRole={userRole} />
      </div>
    </div>
  );
}
