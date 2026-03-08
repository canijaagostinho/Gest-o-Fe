"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { updateUserAction } from "@/app/actions/user-actions";

const userFormSchema = z
  .object({
    full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("Email inválido."),
    role_id: z.string().uuid("Selecione um perfil."),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "A senha deve ter pelo menos 6 caracteres",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    },
  );

interface EditUserSheetProps {
  user: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roles: any[];
}

export function EditUserSheet({
  user,
  isOpen,
  onOpenChange,
  roles,
}: EditUserSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",

      role_id: user?.role_id || "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof userFormSchema>) {
    setIsLoading(true);
    try {
      const result = await updateUserAction({ ...data, id: user.id });

      if (!result.success) {
        toast.error("Erro ao atualizar", { description: result.error });
        return;
      }

      toast.success("Usuário atualizado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] border-none shadow-2xl bg-[#F8FAFC] p-0 overflow-y-auto rounded-l-[3rem]">
        {/* Custom Decorative Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 pt-12 pb-24 px-8 text-white overflow-hidden">
          <div className="relative z-10">
            <SheetTitle className="text-3xl font-black tracking-tight text-white mb-2">
              Editar Perfil
            </SheetTitle>
            <SheetDescription className="text-blue-100 font-medium text-base">
              Gerencie as informações e credenciais do usuário.
            </SheetDescription>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative px-8 -mt-16 mb-8">
          <div className="h-32 w-32 rounded-[2rem] bg-white shadow-xl flex items-center justify-center border-4 border-white">
            <div className="h-full w-full rounded-[1.7rem] bg-indigo-50 flex items-center justify-center">
              <span className="text-4xl font-black text-indigo-300">
                {getInitials(user?.full_name || "U")}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 bg-emerald-500 border-4 border-white p-2 rounded-full">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="px-8 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Main Info Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-3">
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                          <Input
                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-none group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-indigo-100 transition-all font-bold text-slate-700"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-3">
                        Email Corporativo
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                          <Input
                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-none group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-indigo-100 transition-all font-bold text-slate-700"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-3">
                        Perfil de Acesso
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 pl-12 rounded-2xl bg-slate-50 border-none relative text-slate-700 font-bold">
                                <SelectValue placeholder="Selecione um perfil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name === "gestor"
                                    ? "Administrador / Diretor"
                                    : role.name === "operador"
                                      ? "Funcionário / Atendente"
                                      : role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage className="ml-3" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Security Section */}
              <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                <div className="flex items-center gap-3 mb-2 ml-2">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                    Credenciais
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-3">
                        Nova Senha (Opcional)
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-14 pl-6 pr-12 rounded-2xl bg-slate-50 border-none group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-indigo-100 transition-all font-bold text-slate-700"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-indigo-600 rounded-xl"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="ml-3" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-3">
                        Confirmar Nova Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-14 pl-6 rounded-2xl bg-slate-50 border-none group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-indigo-100 transition-all font-bold text-slate-700"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-3" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
