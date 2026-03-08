"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Building2, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { registerAndLoginAction } from "@/app/actions/auth-actions";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !institutionName || !email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerAndLoginAction({
        fullName,
        institutionName,
        email,
        password,
      });

      if (!result.success) {
        toast.error("Erro no cadastro", {
          description: result.error,
        });
        return;
      }

      if (result.warning) {
        toast.warning("Cadastro realizado", {
          description: result.warning,
        });
        router.push("/auth/login");
      } else {
        toast.success("Bem-vindo!", {
          description: "Sua instituição foi criada com sucesso.",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-background/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            Gestão Flex
          </CardTitle>
          <CardDescription>
            Comece a gerenciar seus empréstimos hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institution">Nome da Instituição</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="institution"
                  placeholder="Ex: Gestão Flex"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Seu Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Nome do Administrador"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Admin</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <Button
              className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/90 mt-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                "Criar Instituição e Entrar"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center flex-col gap-2">
          <p className="text-xs text-center text-muted-foreground px-4">
            Ao se cadastrar, você concorda com nossos Termos de Serviço e
            Política de Privacidade.
          </p>
          <div className="relative w-full py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Já possui cadastro?
              </span>
            </div>
          </div>
          <Link
            href="/auth/login"
            className="text-sm font-bold text-primary hover:underline"
          >
            Voltar para Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
