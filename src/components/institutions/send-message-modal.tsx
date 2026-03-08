"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Megaphone, Send } from "lucide-react";
import { toast } from "sonner";
import { sendSystemMessageAction } from "@/app/actions/system-message-actions";
import { useRouter } from "next/navigation";

interface Institution {
  id: string;
  name: string;
}

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
}

export function SendMessageModal({
  isOpen,
  onClose,
  institutions,
}: SendMessageModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "error" | "success">(
    "info",
  );
  const [target, setTarget] = useState<string>("all");
  const router = useRouter();

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem.");
      return;
    }

    setIsLoading(true);
    try {
      const institutionIds = target === "all" ? "all" : [target];

      const result = await sendSystemMessageAction({
        title,
        message,
        type,
        institution_ids: institutionIds,
      });

      if (result.success) {
        const count = result.count || 1;
        toast.success(
          `Mensagem enviada para ${count > 1 ? count + " instituições" : "1 instituição"}.`,
        );
        setTitle("");
        setMessage("");
        setType("info");
        setTarget("all");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Comunicado Geral</DialogTitle>
              <DialogDescription>
                Envie uma mensagem que aparecerá nas notificações dos
                administradores.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Destinatário</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o destinatário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold text-blue-600">
                  Todas as Instituições
                </SelectItem>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Mensagem</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informação (Azul)</SelectItem>
                <SelectItem value="warning">
                  Aviso / Alerta (Amarelo)
                </SelectItem>
                <SelectItem value="success">
                  Sucesso / Novidade (Verde)
                </SelectItem>
                <SelectItem value="error">
                  Urgente / Problema (Vermelho)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Ex: Atualização do Sistema"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Escreva sua mensagem aqui..."
              className="min-h-[100px] resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Confirmar e Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
