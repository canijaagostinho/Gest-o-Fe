"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { translateSupabaseError } from "@/lib/error-handler";
import { useSecureForm } from "@/hooks/useSecureForm";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Camada 5: Client-side brute-force lockout tracking
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const toastShown = useRef(false);

  // Camada 5: useSecureForm for client-side validation including DOM XSS detection
  const { errors, validateAll, onBlur } = useSecureForm<{
    email: string;
    password: string;
  }>(
    {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
    },
    { email: "Email", password: "Senha" },
  );

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_failed" && !toastShown.current) {
      toast.error("Acesso Negado", {
        description: "E-mail ou senha incorretos. Verifique suas credenciais.",
      });
      toastShown.current = true;
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Camada 5: Client-side lockout enforcement (5 attempts → 60s lockout)
    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast.error("Acesso Temporariamente Bloqueado", {
        description: `Demasiadas tentativas. Aguarde ${remaining} segundos.`,
      });
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement;
    const currentEmail = emailInput?.value || email;
    const currentPassword = passwordInput?.value || password;

    // Camada 5: Client-side schema validation before hitting the server
    const isValid = validateAll({ email: currentEmail, password: currentPassword });
    if (!isValid) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      });

      if (error) {
        // Camada 5: Increment attempt counter, lock after 5 failures
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockedUntil(Date.now() + 60_000);
          toast.error("Conta Temporariamente Bloqueada", {
            description:
              "5 tentativas inválidas. Acesso bloqueado por 60 segundos.",
          });
        } else {
          toast.error("Erro ao entrar", {
            description: translateSupabaseError(error),
          });
        }
        return;
      }

      // Check if profile exists in public.users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          console.warn("Autenticado mas sem perfil em public.users:", user.id);
          await supabase.auth.signOut();
          toast.error("Acesso Negado", {
            description: "E-mail ou senha incorretos. Verifique suas credenciais.",
          });
          return;
        }
      }

      // Reset attempts on success
      setAttempts(0);
      setLockedUntil(null);

      toast.success("Sucesso!", {
        description: "Redirecionando para o painel...",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao tentar fazer login.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="space-y-1 text-center flex flex-col items-center">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-24 w-24 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl shadow-blue-900/10 group-hover:scale-105 transition-all duration-300 ring-1 ring-slate-900/5 dark:ring-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <Image
                src="/logo.webp"
                alt="Gestão Flex Logotipo - Sistema de Gestão Financeira"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-bold text-slate-700 dark:text-slate-200 tracking-tight font-heading">
              Gestão
            </span>
            <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent tracking-tighter">
              Flex
            </span>
          </div>
          <CardDescription className="text-base">
            Entre na sua conta para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => onBlur("email", e.target.value)}
                className={`h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={(e) => onBlur("password", e.target.value)}
                  className={`h-11 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              className="w-full h-11 text-base font-semibold"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Novo por aqui?
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/signup">Criar Nova Instituição</Link>
          </Button>
          <p className="text-sm text-muted-foreground text-center font-medium">
            Esqueceu sua senha? Entre em contato com o suporte.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

