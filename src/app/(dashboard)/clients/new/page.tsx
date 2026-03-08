"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ChevronLeft,
  Save,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Briefcase,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";

const clientSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  id_number: z.string().min(5, "Número de identificação inválido"),
  phone: z.string().min(9, "Telefone inválido"),
  address: z.string().min(5, "Endereço deve ser detalhado"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.string().min(1, "Sexo é obrigatório"),
  marital_status: z.string().min(1, "Estado civil é obrigatório"),
  occupation: z.string().min(1, "Profissão é obrigatória"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  code: z.string().optional(),
});

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: "",
      id_number: "",
      phone: "",
      address: "",
      birth_date: "",
      gender: "Masculino",
      marital_status: "Solteiro(a)",
      occupation: "",
      email: "",
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof clientSchema>) {
    try {
      setLoading(true);

      // Get current user and institution
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();

      if (!userData?.institution_id) {
        toast.error("Instituição não encontrada");
        return;
      }

      // Check for duplicate ID
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .eq("id_number", values.id_number)
        .eq("institution_id", userData.institution_id)
        .maybeSingle();

      if (existing) {
        form.setError("id_number", {
          message: "Número de identificação já cadastrado nesta instituição",
        });
        return;
      }

      // Create client
      const { error: insertError } = await supabase.from("clients").insert({
        ...values,
        institution_id: userData.institution_id,
        status: "active",
        classification: "Regular",
      });

      if (insertError) throw insertError;

      // Log action
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "create_client",
        module: "clients",
        record_id: null, // Ideally we'd get the new client ID
      });

      toast.success("Cliente cadastrado com sucesso!");
      router.push("/clients");
      router.refresh();
    } catch (error: any) {
      toast.error("Erro ao cadastrar cliente: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Novo Cliente
            </h2>
            <p className="text-slate-500">
              Cadastre um novo tomador de crédito no sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Personal Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Dados Pessoais
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input placeholder="CL001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº de Identificação (BI)</FormLabel>
                        <FormControl>
                          <Input placeholder="000000000A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Feminino">Feminino</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Civil</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Solteiro(a)">
                              Solteiro(a)
                            </SelectItem>
                            <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                            <SelectItem value="Divorciado(a)">
                              Divorciado(a)
                            </SelectItem>
                            <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact & Professional Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-blue-600" />
                  Contato e Profissão
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="+258 8X XXX XXXX" {...field} />
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
                        <FormLabel>Email (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="cliente@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            className="pl-10"
                            placeholder="Bairro, Rua, Casa nº"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissão / Atividade Econômica</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            className="pl-10"
                            placeholder="Ex: Comerciante"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
              <Link href="/clients">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-8 h-12"
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-12 h-12 shadow-lg shadow-blue-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Cliente
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
