import { createClient } from "@/utils/supabase/server";
import PaymentsClient from "./payments-client";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PendingPaymentsPage() {
  const supabase = await createClient();

  // Ensure we are admin_geral
  // (Handled by layout as well, but good to be safe)

  // Fetch pending payments
  const { data: payments, error } = await supabase
    .from("subscription_payments")
    .select(
      `
            *,
            plan:plans(name, interval_months),
            institution:institutions(name)
        `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return (
      <div className="p-8 text-red-500 font-bold">
        Erro ao carregar pagamentos: {error.message}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/institutions">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Verificação de Pagamentos
            {payments && payments.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-sm font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-4 h-4" /> {payments.length} Pendentes
              </span>
            )}
          </h2>
          <p className="text-slate-500">
            Os comprovativos submetidos dependem da sua validação manual para
            liberação do acesso.
          </p>
        </div>
      </div>

      <PaymentsClient initialPayments={payments || []} />
    </div>
  );
}
