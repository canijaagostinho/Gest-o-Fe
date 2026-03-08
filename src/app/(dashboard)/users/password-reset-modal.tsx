"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Mail, Check, RefreshCw, Key } from "lucide-react";
import { updateUserAction } from "@/app/actions/user-actions";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function PasswordResetModal({
  isOpen,
  onClose,
  user,
}: PasswordResetModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const password = generatePassword();

      // Call server action to update password
      const result = await updateUserAction({
        id: user.id,
        password: password,
        // We must pass required fields if the action expects them, or ensure action handles partial updates
        // The action implementation I saw earlier handles partial updates for password if provided.
        // However, it might require full_name/email implicitly if validation is strict.
        // Let's pass existing values just in case or trust the partial update logic.
        // Looking at updateUserAction: it updates auth with password if provided.
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
      });

      if (!result.success) {
        toast.error("Erro ao redefinir senha", { description: result.error });
        return;
      }

      setNewPassword(password);
      toast.success("Senha redefinida com sucesso!");
    } catch (error) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success("Senha copiada!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmail = () => {
    if (newPassword && user.email) {
      const subject = "Redefinição de Senha - Gestão Flex";
      const body = `Olá ${user.full_name},\n\nSua senha de acesso ao sistema foi redefinida.\n\nNova Senha: ${newPassword}\n\nAcesse em: ${window.location.origin}\n\nPor favor, altere sua senha após o primeiro login.`;
      window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleClose = () => {
    setNewPassword(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-600" />
            Redefinir Senha
          </DialogTitle>
          <DialogDescription>
            Esta ação gerará uma nova senha aleatória para o usuário{" "}
            <strong>{user.full_name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {!newPassword ? (
          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
              <RefreshCw
                className={`h-8 w-8 text-indigo-500 ${isLoading ? "animate-spin" : ""}`}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground w-3/4">
              Ao confirmar, a senha atual deixará de funcionar imediatamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm font-medium text-emerald-800">
                Senha redefinida com sucesso!
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-white px-3 py-1 rounded border border-emerald-200 text-lg font-bold tracking-wider text-emerald-600 select-all">
                  {newPassword}
                </code>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCopy} className="w-full">
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button
                variant="outline"
                onClick={handleEmail}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between gap-2">
          {!newPassword ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? "Gerando..." : "Gerar Nova Senha"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto ml-auto"
            >
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
