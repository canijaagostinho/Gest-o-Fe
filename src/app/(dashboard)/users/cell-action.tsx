"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditUserSheet } from "./edit-user-sheet";
import { InstitutionUser } from "./types";

import { PasswordResetModal } from "./password-reset-modal";
import { AlertModal } from "@/components/modals/alert-modal";
import { revokeUserAccessAction } from "@/app/actions/user-actions";
import { toast } from "sonner";

interface CellActionProps {
  data: InstitutionUser;
  roles: any[];
  currentUserRole: string | null;
}

export function CellAction({ data, roles, currentUserRole }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRevoke = async () => {
    try {
      setLoading(true);
      const result = await revokeUserAccessAction(data.id);

      if (!result.success) {
        toast.error("Erro ao revogar acesso", { description: result.error });
        return;
      }

      toast.success("Acesso revogado com sucesso!");
      setRevokeOpen(false);
    } catch (error) {
      toast.error("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const isManager =
    currentUserRole === "admin_geral" ||
    currentUserRole === "gestor" ||
    currentUserRole === "admin";

  return (
    <>
      <EditUserSheet
        user={data}
        isOpen={open}
        onOpenChange={setOpen}
        roles={roles}
      />
      <PasswordResetModal
        user={data}
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
      />
      <AlertModal
        isOpen={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        onConfirm={onRevoke}
        loading={loading}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rounded-2xl border-none shadow-xl p-2 bg-white w-56"
        >
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
            Gestão de Acesso
          </DropdownMenuLabel>
          {isManager && (
            <>
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="rounded-xl cursor-pointer font-bold text-slate-700"
              >
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setResetOpen(true)}
                className="rounded-xl cursor-pointer font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 mb-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Redefinir Senha
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem
                onClick={() => setRevokeOpen(true)}
                className="rounded-xl cursor-pointer text-red-600 font-bold focus:text-red-600 focus:bg-red-50"
              >
                <Trash className="mr-2 h-4 w-4" /> Revogar Acesso
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
