"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { MonthlyPortfolioItem } from "@/app/actions/regulatory-report";

interface MonthlyPortfolioTableProps {
  data: MonthlyPortfolioItem[];
}

export function MonthlyPortfolioTable({ data }: MonthlyPortfolioTableProps) {
  if (data.length === 0) return null;

  const totalDisbursed = data.reduce((sum, item) => sum + item.amount, 0);
  const totalOutstanding = data.reduce(
    (sum, item) => sum + item.outstanding_balance,
    0,
  );
  const totalArrears = data.reduce((sum, item) => sum + item.arrears_amount, 0);
  const totalProvisions = data.reduce((sum, item) => sum + item.provisions, 0);

  return (
    <div className="mt-6 border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-center whitespace-nowrap">
                Op (1)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-center whitespace-nowrap">
                Código (2)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap">
                Cliente (3)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-center whitespace-nowrap">
                Desemb. (4)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-right whitespace-nowrap">
                Montante (5)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap">
                Finalidade (6)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-right whitespace-nowrap">
                Prestaç. (7)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap">
                Periodic. (8)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-center whitespace-nowrap">
                Prazo (9)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-center whitespace-nowrap">
                Taxa (10)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-right whitespace-nowrap">
                Dívida (11)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-right whitespace-nowrap">
                Atraso (12)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-center whitespace-nowrap">
                Dias (13)
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 text-right whitespace-nowrap">
                PPEs (14)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="hover:bg-slate-50/50">
                <TableCell className="text-[11px] font-medium text-center">
                  {item.contract_number}
                </TableCell>
                <TableCell className="text-[11px] font-medium text-slate-500 text-center">
                  {item.client_code}
                </TableCell>
                <TableCell className="text-[11px] font-bold text-slate-900">
                  {item.client_name}
                </TableCell>
                <TableCell className="text-[11px] text-center">
                  {new Date(item.disbursement_date).toLocaleDateString("pt-MZ")}
                </TableCell>
                <TableCell className="text-[11px] text-right font-medium">
                  {formatCurrency(item.amount)}
                </TableCell>
                <TableCell className="text-[11px] text-slate-600">
                  {item.purpose}
                </TableCell>
                <TableCell className="text-[11px] text-right">
                  {formatCurrency(item.installment_value)}
                </TableCell>
                <TableCell className="text-[11px] text-slate-600">
                  {item.payment_frequency}
                </TableCell>
                <TableCell className="text-[11px] text-center">
                  {item.term}
                </TableCell>
                <TableCell className="text-[11px] text-center">
                  {item.interest_rate}%
                </TableCell>
                <TableCell className="text-[11px] text-right font-bold text-blue-700">
                  {formatCurrency(item.outstanding_balance)}
                </TableCell>
                <TableCell className="text-[11px] text-right font-bold text-amber-700">
                  {formatCurrency(item.arrears_amount)}
                </TableCell>
                <TableCell className="text-[11px] text-center">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full",
                      item.days_overdue > 0
                        ? "bg-amber-100 text-amber-700 font-bold"
                        : "text-slate-400",
                    )}
                  >
                    {item.days_overdue}
                  </span>
                </TableCell>
                <TableCell className="text-[11px] text-right text-red-700 font-medium">
                  {item.provisions > 0 ? formatCurrency(item.provisions) : "-"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-slate-900 text-white font-bold hover:bg-slate-900">
              <TableCell
                colSpan={3}
                className="text-right uppercase tracking-wider text-[10px]"
              >
                Totais da Carteira
              </TableCell>
              <TableCell className="text-right text-[11px]">
                {formatCurrency(totalDisbursed)}
              </TableCell>
              <TableCell colSpan={5}></TableCell>
              <TableCell className="text-right text-[11px] font-black">
                {formatCurrency(totalOutstanding)}
              </TableCell>
              <TableCell className="text-right text-[11px] font-black text-amber-400">
                {formatCurrency(totalArrears)}
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right text-[11px] text-rose-300">
                {formatCurrency(totalProvisions)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
