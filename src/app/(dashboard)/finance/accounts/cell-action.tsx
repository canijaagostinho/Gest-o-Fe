"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountSheet } from "./account-sheet";
import { AccountTransactionsSheet } from "./account-transactions-sheet";
import { deleteAccountAction } from "@/app/actions/account-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CellActionProps {
  data: any;
  userRole?: string;
}

export function CellAction({ data, userRole }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      const result = await deleteAccountAction(data.id);
      if (result.success) {
        toast.success("Conta eliminada com sucesso.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao eliminar conta.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AccountSheet
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={data}
      />
      <AccountTransactionsSheet
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        account={data}
      />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              conta e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={onConfirm}
              className="bg-red-600 focus:ring-red-600"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" /> Ver Extrato
          </DropdownMenuItem>
          {userRole !== "operador" && (
            <>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Atualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
