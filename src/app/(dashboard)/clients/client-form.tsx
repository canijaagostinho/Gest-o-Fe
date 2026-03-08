"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
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
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { updateClientAction } from "@/app/actions/client-actions";

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z
    .string()
    .email({
      message: "Email inválido.",
    })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(9, {
    message: "Telefone deve ter pelo menos 9 dígitos.",
  }),
  id_number: z.string().min(5, {
    message: "Documento inválido.",
  }),
  address: z.string().optional(),
  code: z.string().optional(),
});

interface ClientFormProps {
  initialData?: {
    id: string;
    full_name: string;
    email?: string | null;
    phone: string | null;
    id_number: string | null;
    address?: string | null;
    code?: string | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  onSuccess?: () => void;
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          full_name: initialData.full_name,
          email: initialData.email || "",
          phone: initialData.phone || "",
          id_number: initialData.id_number || "",
          address: initialData.address || "",
          code: initialData.code || "",
        }
      : {
          full_name: "",
          email: "",
          phone: "",
          id_number: "",
          address: "",
          code: "",
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (initialData) {
        const result = await updateClientAction(initialData.id, values);
        if (!result.success) {
          toast.error("Erro ao atualizar cliente: " + result.error);
          return;
        }
        toast.success("Cliente atualizado com sucesso!");
        if (onSuccess) onSuccess();
      } else {
        const { error } = await supabase.from("clients").insert({
          full_name: values.full_name,
          email: values.email || null,
          phone: values.phone,
          id_number: values.id_number,
          address: values.address || null,
          code: values.code || null,
        });

        if (error) {
          toast.error("Erro ao criar cliente: " + error.message);
          return;
        }

        toast.success("Cliente criado com sucesso!");
        router.push("/clients");
      }
      router.refresh();
    } catch (error) {
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Dados do Cliente</CardTitle>
        <CardDescription>
          Insira as informações básicas para cadastro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Código (Opcional)</FormLabel>
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
                  <FormItem className="md:col-span-3">
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="joao@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="84 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="id_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento (BI / NUIT)</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Av. Eduardo Mondlane, Maputo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Atualizar Cliente" : "Salvar Cliente"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
