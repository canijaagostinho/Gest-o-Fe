import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, User, Database, Clock, Terminal } from "lucide-react";

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select(
      `
            *,
            user:users(full_name, email)
        `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex-1 space-y-10 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Terminal className="h-8 w-8 text-blue-600" />
          Trilha de Auditoria
        </h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Registro completo de atividades e alterações de dados no sistema.
        </p>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">
                Logs do Sistema
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium mt-1">
                Últimos 50 registros de atividade global
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                    Data/Hora
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                    Usuário
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                    Ação
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                    Módulo
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                    Alteração
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs?.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("pt-MZ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">
                            {(log.user as any)?.full_name || "Sistema"}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {(log.user as any)?.email || "Automático"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge
                        className={`rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-wider
                                                ${
                                                  log.action === "INSERT"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : log.action === "UPDATE"
                                                      ? "bg-blue-100 text-blue-700"
                                                      : "bg-red-100 text-red-700"
                                                }`}
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">
                          {log.table_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-xs truncate text-[10px] font-mono bg-slate-50 p-2 rounded-lg text-slate-500 border border-slate-100 group-hover:max-w-none group-hover:whitespace-normal transition-all">
                        {JSON.stringify(log.new_data || log.old_data)}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!logs || logs.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <History className="h-12 w-12" />
                        <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">
                          Nenhum log registrado
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
