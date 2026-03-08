"use client";

import { useState } from "react";
import { Expense } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { formatCurrency } from "@/lib/utils";
import {
  Edit,
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import { deleteExpenseAction } from "@/app/actions/expense-actions";
import { toast } from "sonner";
import { ExpenseForm } from "./expense-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ExpenseListProps {
  data: Expense[];
  userId: string;
  institutionId: string;
  userRole?: string;
}

export function ExpenseList({
  data,
  userId,
  institutionId,
  userRole,
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState(data);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewPeriod, setViewPeriod] = useState<
    "monthly" | "quarterly" | "semiannual" | "annual"
  >("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    const res = await deleteExpenseAction(id);
    if (res.success) {
      toast.success("Despesa excluída");
    } else {
      toast.error(res.error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const filteredExpenses = expenses.filter((expense: any) => {
    const expenseDate = new Date(expense.date);
    const matchCategory =
      filterCategory === "all" || expense.category === filterCategory;
    const matchYear = expenseDate.getFullYear() === selectedYear;

    if (viewPeriod === "monthly") {
      return (
        matchCategory && matchYear && expenseDate.getMonth() === selectedMonth
      );
    }

    if (viewPeriod === "quarterly") {
      const quarter = Math.floor(selectedMonth / 3);
      const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
      return matchCategory && matchYear && expenseQuarter === quarter;
    }

    if (viewPeriod === "semiannual") {
      const semester = Math.floor(selectedMonth / 6);
      const expenseSemester = Math.floor(expenseDate.getMonth() / 6);
      return matchCategory && matchYear && expenseSemester === semester;
    }

    return matchCategory && matchYear; // Annual
  });

  const totalAmount = filteredExpenses.reduce(
    (sum: number, item: any) => sum + Number(item.amount),
    0,
  );

  // Helper for grouping
  const groupExpensesByMonth = (items: Expense[]) => {
    const groups: Record<string, Expense[]> = {};
    items.forEach((item) => {
      const date = new Date(item.date);
      const monthName = format(date, "MMMM yyyy", { locale: ptBR });
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(item);
    });
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].date);
      const dateB = new Date(b[1][0].date);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const expenseGroups = groupExpensesByMonth(filteredExpenses);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Despesas</h2>
          <p className="text-muted-foreground">
            Gerencie os gastos operacionais da instituição.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total do Período
            </CardTitle>
            <span className="text-muted-foreground font-black">MT</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} registros
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4 py-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex bg-white border rounded-lg p-1 shadow-sm">
          <Button
            variant={viewPeriod === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewPeriod("monthly")}
            className="text-xs h-8"
          >
            Mensal
          </Button>
          <Button
            variant={viewPeriod === "quarterly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewPeriod("quarterly")}
            className="text-xs h-8"
          >
            Trimestral
          </Button>
          <Button
            variant={viewPeriod === "semiannual" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewPeriod("semiannual")}
            className="text-xs h-8"
          >
            Semestral
          </Button>
          <Button
            variant={viewPeriod === "annual" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewPeriod("annual")}
            className="text-xs h-8"
          >
            Anual
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="flex h-9 w-[120px] rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {viewPeriod === "monthly" && (
            <select
              className="flex h-9 w-[130px] rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {format(new Date(2024, i, 1), "MMMM", { locale: ptBR })}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

        <select
          className="flex h-9 w-[180px] rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">Todas Categorias</option>
          <option value="Aluguel">Aluguel</option>
          <option value="Energia">Energia</option>
          <option value="Salários">Salários</option>
          <option value="Transporte">Transporte</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      <div className="space-y-8">
        {expenseGroups.length === 0 ? (
          <div className="rounded-md border bg-white p-12 text-center text-slate-400">
            Nenhuma despesa encontrada para este período.
          </div>
        ) : (
          expenseGroups.map(([month, group]) => (
            <div key={month} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1">
                {month}
              </h3>
              <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right w-[100px]">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.map((expense: any) => (
                      <TableRow
                        key={expense.id}
                        className="hover:bg-slate-50/50"
                      >
                        <TableCell className="font-medium">
                          {format(new Date(expense.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                            {expense.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 max-w-[300px] truncate">
                          {expense.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {userRole !== "operador" && (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleEdit(expense)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-slate-50/30 px-6 py-3 border-t flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">
                    TOTAL DO MÊS
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {formatCurrency(
                      group.reduce(
                        (acc: number, curr: any) => acc + Number(curr.amount),
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingExpense}
        userId={userId}
        institutionId={institutionId}
      />
    </div>
  );
}
