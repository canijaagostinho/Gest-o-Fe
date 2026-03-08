import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Info,
  FileText,
  Database,
  ShieldAlert,
  GitCommit,
} from "lucide-react";

type OperationLogProps = {
  id: string;
  created_at: string;
  type: string;
  amount: number | null;
  status: string;
  observations: string | null;
  user_name: string;
  user_email: string;
  operation_id?: string;
  metadata?: any;
};

interface Props {
  log: OperationLogProps | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OperationDetailsModal({ log, isOpen, onClose }: Props) {
  if (!log) return null;

  const formatMoney = (amount: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(amount);
  };

  const {
    type,
    status,
    amount,
    user_name,
    user_email,
    observations,
    created_at,
    operation_id,
  } = log;

  const getStatusColor = (s: string) => {
    if (s === "success") return "bg-emerald-100 text-emerald-700";
    if (s === "reversed") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  const getStatusText = (s: string) => {
    if (s === "success") return "Sucesso";
    if (s === "reversed") return "Revertido / Anulado";
    return s;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-50 border-none rounded-[2rem] shadow-2xl">
        {/* Header Profile Area */}
        <div className="bg-white p-6 pb-8 border-b border-slate-100 relative">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-blue-600" />
                  Detalhes da Operação
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500">
                  ID Interno:{" "}
                  <span className="font-mono text-xs">
                    {log.id.split("-")[0]}
                  </span>
                </DialogDescription>
              </div>
              <Badge
                className={`px-3 py-1 font-black uppercase text-[10px] tracking-wider border-none ${getStatusColor(status)}`}
              >
                {getStatusText(status)}
              </Badge>
            </div>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-1 items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
            <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">
              {type}
            </span>
            <span className="text-4xl font-black text-slate-900 tracking-tighter">
              {formatMoney(amount)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Sections */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Autor da Ação
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {user_name}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {user_email}
                </span>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Data e Hora Registro
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {new Date(created_at).toLocaleString("pt-MZ", {
                    dateStyle: "long",
                    timeStyle: "medium",
                  })}
                </span>
              </div>
            </div>

            {observations && (
              <div className="flex gap-4 items-start p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Observações / Razão
                  </span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {observations}
                  </p>
                </div>
              </div>
            )}

            {operation_id && (
              <div className="flex gap-4 items-center px-4 py-3 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                <Database className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 truncate flex-1 flex items-center gap-2">
                  REF_ID:{" "}
                  <span className="font-mono text-slate-700 font-medium">
                    {operation_id}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
