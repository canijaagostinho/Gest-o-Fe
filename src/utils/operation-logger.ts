import { createClient } from "@/utils/supabase/server";

export type OperationType =
  | "Empréstimo"
  | "Pagamento"
  | "Atualização"
  | "Cancelamento"
  | "Outro";
export type OperationStatus = "success" | "failed" | "reversed" | "pending";

export interface OperationLogData {
  institution_id: string;
  user_id: string;
  operation_id?: string;
  type: OperationType;
  amount?: number;
  status?: OperationStatus;
  observations?: string;
  metadata?: Record<string, unknown>;
}

export async function insertOperationLog(data: OperationLogData) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("operation_logs").insert({
      institution_id: data.institution_id,
      user_id: data.user_id,
      operation_id: data.operation_id || null,
      type: data.type,
      amount: data.amount || null,
      status: data.status || "success",
      observations: data.observations || null,
      metadata: data.metadata || null,
    });

    if (error) {
      console.error("Failed to insert operation log:", error);
    }
  } catch (e) {
    console.error("Error in insertOperationLog utility:", e);
  }
}
