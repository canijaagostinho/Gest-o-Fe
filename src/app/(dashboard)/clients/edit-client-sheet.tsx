"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClientForm } from "./client-form";
import { Client } from "./types";

interface EditClientSheetProps {
  client: Client | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClientSheet({
  client,
  isOpen,
  onOpenChange,
}: EditClientSheetProps) {
  if (!client) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Editar Cliente</SheetTitle>
          <SheetDescription>
            Altere as informações do cliente abaixo.
          </SheetDescription>
        </SheetHeader>
        <ClientForm
          initialData={client}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
