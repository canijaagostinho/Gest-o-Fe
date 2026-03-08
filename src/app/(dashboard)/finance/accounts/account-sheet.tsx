"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AccountForm } from "./account-form";

interface AccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
}

export const AccountSheet: React.FC<AccountSheetProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Caixa" : "Nova Caixa"}</SheetTitle>
          <SheetDescription>
            {initialData
              ? "Atualize os detalhes da caixa aqui."
              : "Adicione uma nova caixa para gerir o seu fluxo financeiro."}
          </SheetDescription>
        </SheetHeader>
        <AccountForm initialData={initialData} onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
};
