"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { SendMessageModal } from "./send-message-modal";

interface Institution {
  id: string;
  name: string;
}

interface InstitutionsHeaderActionsProps {
  institutions: Institution[];
}

export function InstitutionsHeaderActions({
  institutions,
}: InstitutionsHeaderActionsProps) {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold"
        onClick={() => setIsMessageModalOpen(true)}
      >
        <Megaphone className="mr-2 h-4 w-4" /> Enviar Mensagem
      </Button>
      <Link href="/institutions/payments">
        <Button
          variant="outline"
          className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold"
        >
          Pagamentos
        </Button>
      </Link>
      <Link href="/institutions/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Instituição
        </Button>
      </Link>

      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        institutions={institutions}
      />
    </div>
  );
}
