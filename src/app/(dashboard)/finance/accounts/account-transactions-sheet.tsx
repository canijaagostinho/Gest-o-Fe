"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { getAccountTransactionsAction } from "@/app/actions/account-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";

interface AccountTransactionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
}

export const AccountTransactionsSheet: React.FC<
  AccountTransactionsSheetProps
> = ({ isOpen, onClose, account }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && account) {
      fetchTransactions();
    }
  }, [isOpen, account]);

  const fetchTransactions = async () => {
    setLoading(true);
    const result = await getAccountTransactionsAction(account.id);
    if (result.success) {
      setTransactions(result.data || []);
    }
    setLoading(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="space-y-4 min-w-[600px] w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Extrato de Movimentações</SheetTitle>
          <SheetDescription>
            Histórico recente para a conta <strong>{account?.name}</strong>.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
          <span className="text-sm text-slate-500 font-medium">
            Saldo Atual
          </span>
          <span className="text-2xl font-bold text-slate-900">
            {formatCurrency(Number(account?.balance || 0))}
          </span>
        </div>

        <div className="rounded-md border h-[600px] relative">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(t.created_at)}
                        <br />
                        {new Date(t.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {t.description}
                          </span>
                          <span className="text-xs text-slate-400 uppercase tracking-wider">
                            {t.reference_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end font-bold space-x-1">
                          {t.type === "credit" ? (
                            <>
                              <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-600">
                                +{formatCurrency(Number(t.amount))}
                              </span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3 text-red-500" />
                              <span className="text-red-600">
                                -{formatCurrency(Number(t.amount))}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-slate-500"
                    >
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
