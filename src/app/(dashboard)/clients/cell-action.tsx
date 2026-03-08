"use client";

import { useState } from "react";
import { MoreHorizontal, User, Trash, Edit, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteClientAction } from "@/app/actions/client-actions";
import { toast } from "sonner";
import LinkNext from "next/link";
import { Client } from "./types";
import { EditClientSheet } from "./edit-client-sheet";

interface CellActionProps {
  data: Client;
  userRole?: string;
}

export function CellAction({ data, userRole }: CellActionProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteClientAction(data.id);

      if (result.success) {
        toast.success("Cliente eliminado com sucesso.");
      } else {
        toast.error(result.error || "Erro ao eliminar cliente.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao tentar eliminar o cliente.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-2xl bg-white border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900">
              Tem a certeza?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Esta ação não pode ser desfeita. Isso eliminará permanentemente o
              cliente
              <span className="font-bold border-b border-slate-200 px-1 mx-1">
                {data.full_name}
              </span>
              e removerá os seus dados dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-rose-200"
            >
              {loading ? "Eliminando..." : "Confirmar Eliminação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditClientSheet
        client={data}
        isOpen={editOpen}
        onOpenChange={setEditOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rounded-2xl border-none shadow-2xl p-2 bg-white w-52 z-50"
        >
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
            Ações do Cliente
          </DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <LinkNext
              href={`/clients/${data.id}`}
              className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50"
            >
              <User className="mr-2 h-4 w-4 text-blue-500" /> Ver Perfil
            </LinkNext>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <LinkNext
              href="/loans/new"
              className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50"
            >
              <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" /> Novo
              Empréstimo
            </LinkNext>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
            className="rounded-xl flex items-center font-bold text-slate-700 cursor-pointer hover:bg-slate-50"
          >
            <Edit className="mr-2 h-4 w-4 text-amber-500" /> Editar Dados
          </DropdownMenuItem>

          {userRole !== "operador" && (
            <>
              <DropdownMenuSeparator className="bg-slate-50 my-1" />
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="rounded-xl flex items-center font-bold text-rose-600 cursor-pointer hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600"
              >
                <Trash className="mr-2 h-4 w-4" /> Eliminar Cliente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
