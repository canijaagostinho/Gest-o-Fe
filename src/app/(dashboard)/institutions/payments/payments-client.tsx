"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentsClient({
  initialPayments,
}: {
  initialPayments: any[];
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleAction = async (
    paymentId: string,
    action: "approve" | "reject",
  ) => {
    try {
      setProcessingId(paymentId);

      // Refetch current payment details to ensure consistency
      const { data: payment, error: fetchErr } = await supabase
        .from("subscription_payments")
        .select("*, plan:plans(*)")
        .eq("id", paymentId)
        .single();

      if (fetchErr) throw fetchErr;

      if (action === "reject") {
        const { error: updateErr } = await supabase
          .from("subscription_payments")
          .update({ status: "failed" })
          .eq("id", paymentId);

        if (updateErr) throw updateErr;

        toast.success("Pagamento rejeitado.");
      } else if (action === "approve") {
        // 1. Mark payment as approved
        const { error: updErr } = await supabase
          .from("subscription_payments")
          .update({ status: "approved" })
          .eq("id", paymentId);

        if (updErr) throw updErr;

        // Calculate next period end based on plan interval
        const months = payment.plan.interval_months || 1;
        const nextEndDate = new Date();
        nextEndDate.setMonth(nextEndDate.getMonth() + months);
        // Enforce 22:00 expiration time
        nextEndDate.setUTCHours(22, 0, 0, 0);

        const { error: subErr } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            plan_id: payment.plan_id,
            current_period_start: new Date().toISOString(),
            current_period_end: nextEndDate.toISOString(),
          })
          .eq("id", payment.subscription_id);

        if (subErr) throw subErr;

        // 3. Create success notification
        await supabase.from("system_notifications").insert({
          institution_id: payment.institution_id,
          title: "Pagamento Confirmado",
          message: `O seu pagamento foi validado com sucesso! O acesso total ao sistema foi restaurado e a sua subscrição está agora ativa.`,
          type: "success",
        });

        toast.success("Pagamento aprovado! Assinatura atualizada.");
      }

      // Remove from list or update status in state
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      router.refresh();
    } catch (error: any) {
      console.error("Payment action error:", error);
      toast.error("Erro ao processar o pagamento: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      {payments.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          Nenhum pagamento pendente encontrado.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Instituição</th>
              <th className="px-6 py-4">Plano</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4">Comprovativo</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-600">
                  {new Date(payment.created_at).toLocaleDateString("pt-MZ")}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {payment.institution?.name}
                </td>
                <td className="px-6 py-4">{payment.plan?.name}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">
                  {Number(payment.amount).toLocaleString("pt-MZ")} MTn
                </td>
                <td className="px-6 py-4">
                  <span className="uppercase text-[10px] font-black tracking-widest bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {payment.payment_method === "bank_transfer"
                      ? "Transf."
                      : payment.payment_method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {payment.receipt_url ? (
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Eye className="w-4 h-4" /> Ver Anexo
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Sem anexo</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                    onClick={() => handleAction(payment.id, "reject")}
                    disabled={processingId === payment.id}
                  >
                    Reprovar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                    onClick={() => handleAction(payment.id, "approve")}
                    disabled={processingId === payment.id}
                  >
                    {processingId === payment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Aprovar"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
