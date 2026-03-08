"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OperationDetailsModal from "@/components/monitoring/operation-details-modal";

export type OperationLog = {
  id: string;
  created_at: string;
  type: string;
  amount: number | null;
  status: string;
  observations: string | null;
  user_name: string;
  user_email: string;
  metadata?: any;
};

interface Props {
  initialLogs: OperationLog[];
}

export default function MonitoringClient({ initialLogs }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter logic
  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchesSearch =
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.observations || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "Todos" || log.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [initialLogs, searchQuery, selectedType]);

  // Export logic
  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        "Data",
        "Usuario",
        "Tipo",
        "Valor",
        "Status",
        "Observacoes",
      ];
      const csvRows = filteredLogs.map((log) =>
        [
          new Date(log.created_at).toLocaleString("pt-MZ"),
          log.user_name,
          log.type,
          log.amount?.toString() || "0",
          log.status,
          `"${(log.observations || "").replace(/"/g, '""')}"`,
        ].join(","),
      );

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `monitoramento_operacoes_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const types = [
    "Todos",
    "Empréstimo",
    "Pagamento",
    "Cancelamento",
    "Atualização",
  ];

  const formatMoney = (amount: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Pesquisar usuário ou detalhes..."
                  className="pl-9 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {types.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className={`cursor-pointer px-4 py-2 font-semibold text-xs transition-colors rounded-xl border-none ${
                      selectedType === t
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    onClick={() => setSelectedType(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="h-11 rounded-xl font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-none w-full md:w-auto"
              onClick={exportToCSV}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                    Data e Hora
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                    Usuário Responsável
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                    Tipo de Operação
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                    Valor Envolvido
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter className="h-8 w-8 text-slate-300" />
                        <p className="font-medium">
                          Nenhuma operação encontrada com os filtros atuais.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-white transition-colors border-slate-100 group"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="font-medium text-slate-600 py-4">
                        {new Date(log.created_at).toLocaleString("pt-MZ", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {log.user_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {log.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-black uppercase tracking-wider text-[10px] px-3 py-1 border-none rounded-full
                                                    ${
                                                      log.type === "Empréstimo"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : log.type ===
                                                            "Pagamento"
                                                          ? "bg-emerald-100 text-emerald-700"
                                                          : log.type ===
                                                              "Cancelamento"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-orange-100 text-orange-700"
                                                    }`}
                        >
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-black ${log.amount ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {formatMoney(log.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-bold capitalize border text-[11px] rounded-lg
                                                    ${
                                                      log.status === "success"
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                        : log.status ===
                                                            "reversed"
                                                          ? "bg-red-50 text-red-600 border-red-200"
                                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                                    }`}
                        >
                          {log.status === "success"
                            ? "Sucesso"
                            : log.status === "reversed"
                              ? "Revertido"
                              : log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OperationDetailsModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
