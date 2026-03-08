"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Download,
  FileText,
  Printer,
  User,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRange } from "react-day-picker";
import { InstitutionProfile, PDFService } from "@/services/pdf-service";
import { exportToExcel } from "@/lib/export-utils";
import { toast } from "sonner";

const overdueClients: any[] = [];

export function DelinquentClientsReport({
  dateRange,
  status,
  institutionData,
}: {
  dateRange: DateRange | undefined;
  status: string;
  institutionData?: InstitutionProfile;
}) {
  const handleExport = async (type: "pdf" | "excel") => {
    try {
      if (type === "excel") {
        exportToExcel(overdueClients, "inadimplencia.xlsx");
        toast.success("Excel gerado com sucesso!");
      } else if (type === "pdf") {
        if (!institutionData) {
          toast.error("Dados da instituição não disponíveis para PDF");
          return;
        }
        const { exportToPDF } = await import("@/lib/export-utils");
        exportToPDF(
          "Relatório de Inadimplência",
          ["ID", "Cód. Cliente", "Nome", "Valor", "Dias", "Status"],
          overdueClients.map((c) => [
            c.id,
            c.code,
            c.name,
            formatCurrency(c.amount),
            c.days,
            c.status,
          ]),
          "inadimplencia.pdf",
        );
        toast.success("PDF gerado com sucesso!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total em Atraso
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Clientes Afetados
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">0</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Média de Atraso
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">0 Dias</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Casos Críticos
            </p>
            <p className="text-2xl font-black text-rose-900 mt-1">0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100">
          <div>
            <CardTitle>Lista de Inadimplência</CardTitle>
            <CardDescription>
              Clientes com parcelas em atraso e nível de risco.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200"
              onClick={() => handleExport("excel")}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
              onClick={() => handleExport("pdf")}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[300px] font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Cliente (Nome / Código)
                </TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Valor em Aberto
                </TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Dias de Atraso
                </TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Ação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueClients.map((client: any) => (
                <TableRow
                  key={client.id}
                  className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {client.name}
                        </p>
                        <div className="flex gap-2">
                          <p className="text-[10px] text-blue-600 font-bold">
                            {client.code}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ID #{client.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {formatCurrency(client.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium">
                        {client.days} dias
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold border-none",
                        client.status === "Crítico"
                          ? "bg-rose-100 text-rose-700"
                          : client.status === "Atenção"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700",
                      )}
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
