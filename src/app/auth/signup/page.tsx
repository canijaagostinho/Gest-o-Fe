"use client";

import { useState } from "react";
import Image from "next/image";
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
import { Loader2, Building2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { registerAndLoginAction } from "@/app/actions/auth-actions";
import { translateSupabaseError } from "@/lib/error-handler";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !institutionName || !email || !password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Sua senha é fraca", {
        description: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e um caractere especial (ex: @).",
      });
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
      toast.error("Erro inesperado", {
        description: translateSupabaseError(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-background/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-xl border border-slate-100 relative">
              <Image src="/logo.webp" alt="Gestão Flex Logotipo" fill className="object-cover" />
            </div>
          </div>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-9 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
