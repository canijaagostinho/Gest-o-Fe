"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building,
  Users,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction } from "@/app/actions/user-actions";
import Link from "next/link";

const userSchema = z
  .object({
    full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    institution_id: z.string().uuid("Selecione uma instituição"),
    role_id: z.string().uuid("Selecione uma função"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const institutionIdParam = searchParams.get("institution_id");
  const [showPassword, setShowPassword] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: "",
      email: "",
      institution_id: institutionIdParam || "",
      role_id: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Re-sync if param changes after mount
  useEffect(() => {
    if (institutionIdParam) {
      form.setValue("institution_id", institutionIdParam);
    }
  }, [institutionIdParam, form]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: insts } = await supabase
        .from("institutions")
        .select("id, name")
        .eq("status", "active");

      // Fetch relevant roles
      // Fetch relevant roles - fetching ALL except admin_geral
      const { data: rl } = await supabase
        .from("roles")
        .select("id, name, description")
        .neq("name", "admin_geral");

      setInstitutions(insts || []);

      if (rl) {
        // Filter out 'agente' and 'cliente'
        // And try to find 'financeiro' if it exists, or keep everything else
        const filteredRoles = rl.filter(
          (r: any) => !["agente", "cliente"].includes(r.name.toLowerCase()),
        );
        setRoles(filteredRoles);
      } else {
        setRoles([]);
      }
    };
    fetchData();
  }, []);

  async function checkLimits(institutionId: string, roleId: string) {
    const supabase = createClient();
    const role = roles.find((r: any) => r.id === roleId);

    if (!role) return false;

    // Get count of users with this role in the institution
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", institutionId)
      .eq("role_id", roleId);

    if (error) {
      console.error("Error checking limits:", error);
      return false;
    }

    const currentCount = count || 0;

    // Limit Logic
    if (role.name === "gestor" && currentCount >= 4) {
      toast.error("Limite atingido", {
        description:
          "Esta instituição já possui 4 Administradores/Diretores (Máximo permitido).",
      });
      return false;
    }

    if (role.name === "operador" && currentCount >= 15) {
      toast.error("Limite atingido", {
        description:
          "Esta instituição já possui 15 Usuários Normais (Máximo permitido).",
      });
      return false;
    }

    return true;
  }

  async function onSubmit(data: z.infer<typeof userSchema>) {
    setIsLoading(true);

    try {
      const result = await createUserAction(data);

      if (!result.success) {
        toast.error("Erro ao criar usuário", {
          description: result.error,
        });
        return;
      }

      toast.success("Usuário criado com sucesso!");
      router.push("/users");
      router.refresh();
    } catch (error: any) {
      console.error("Detailed Error:", error);
      const errorMessage =
        typeof error === "object"
          ? JSON.stringify(error, Object.getOwnPropertyNames(error))
          : String(error);
      toast.error("Erro Crítico (Exception)", {
        description: "Ocorreu uma falha grave: " + errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Novo Usuário
          </h2>
          <p className="text-slate-500">
            Crie uma nova conta de acesso para gestores ou funcionários.
          </p>
        </div>
        <Link href="/users">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section: Dados Pessoais */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-500" />
                    Dados Pessoais
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Informações básicas de identificação do usuário.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Maria Silva"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail Corporativo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="usuario@empresa.com"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section: Acesso e Segurança */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Acesso e Permissões
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Defina onde o usuário trabalha e qual seu nível de acesso.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="institution_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instituição</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione a unidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {institutions.map((inst) => (
                                <SelectItem key={inst.id} value={inst.id}>
                                  {inst.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função do Usuário</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione o cargo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name === "gestor"
                                    ? "Administrador / Diretor"
                                    : role.name === "operador"
                                      ? "Funcionário / Atendente"
                                      : role.name === "financeiro"
                                        ? "Financeiro"
                                        : role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Inicial</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 pr-10"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 w-11 px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Link href="/users">
                <Button type="button" variant="outline" className="h-11 px-8">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 h-11 px-8 text-white min-w-[150px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Usuário"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
