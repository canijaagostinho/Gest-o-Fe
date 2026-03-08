import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsClient } from "./clients-client";

export default async function ClientsPage() {
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

  // Query with nested loans and installments for progress calculation
  const { data: dbClients, error } = await supabase
    .from("clients")
    .select(
      `
            *,
            loans (
                id,
                installments (
                    amount,
                    amount_paid
                )
            )
        `,
    )
    .order("created_at", { ascending: false });

  if (error && !dbClients) {
    console.error("Error fetching clients:", error);
  }

  // Process clients to calculate real repayment progress
  const processedClients = (dbClients || []).map((client: any) => {
    let totalOwed = 0;
    let totalPaid = 0;

    if (client.loans && client.loans.length > 0) {
      client.loans.forEach((loan: any) => {
        if (loan.installments && loan.installments.length > 0) {
          loan.installments.forEach((inst: any) => {
            totalOwed += Number(inst.amount);
            totalPaid += Number(inst.amount_paid);
          });
        }
      });
    }

    const repaymentProgress =
      totalOwed > 0 ? Math.round((totalPaid / totalOwed) * 100) : 0;

    return {
      ...client,
      repayment_progress: repaymentProgress,
    };
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Clientes
          </h2>
          <p className="text-slate-500">
            Gerencie a base de dados de seus tomadores de crédito.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/clients/new">
            <Button className="rounded-xl px-4 py-2.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200">
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 p-6 border border-slate-100">
        <ClientsClient data={processedClients} userRole={userRole} />
      </div>
    </div>
  );
}
