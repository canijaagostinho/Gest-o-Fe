import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Central de Alertas
          </h2>
          <p className="text-slate-500">
            Monitoramento de pendências e notificações importantes do sistema.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-5 w-5" />
              Atenção Necessária
            </CardTitle>
            <CardDescription>
              Itens que requerem sua intervenção imediata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-900">
              <p className="font-semibold">Pagamentos em Atraso</p>
              <p className="text-sm mt-1">
                Existem contratos com parcelas vencidas há mais de 30 dias.
                Verifique a seção de empréstimos.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Info className="h-5 w-5" />
              Informativos
            </CardTitle>
            <CardDescription>
              Atualizações e lembretes do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-900">
              <p className="font-semibold">Novas Solicitações</p>
              <p className="text-sm mt-1">
                Existem novos pedidos de empréstimo aguardando análise de
                crédito.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
              Concluídos Recentemente
            </CardTitle>
            <CardDescription>
              Histórico de ações automáticas e resoluções.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 italic">
              Nenhum evento recente para exibir.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
