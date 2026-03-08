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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createAccountAction,
  updateAccountAction,
} from "@/app/actions/account-actions";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  balance: z.coerce.number().min(0, {
    message: "O saldo inicial não pode ser negativo.",
  }),
  bank_provider: z.string().min(1, {
    message: "Selecione um provedor.",
  }),
  is_default: z.boolean().default(false).optional(),
});

const PROVIDERS = [
  { label: "BCI", value: "bci" },
  { label: "Moza Bank", value: "moza" },
  { label: "M-Pesa", value: "mpesa" },
  { label: "e-Mola", value: "emola" },
  { label: "Standard Bank", value: "standard" },
  { label: "Ponto 24", value: "ponto24" },
  { label: "Outro / Caixa Física", value: "outro" },
];

interface AccountFormProps {
  initialData?: any | null;
  onClose: () => void;
}

export function AccountForm({ initialData, onClose }: AccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Caixa" : "Nova Caixa";
  const action = initialData ? "Salvar alterações" : "Criar caixa";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      balance: initialData?.balance ? Number(initialData.balance) : 0,
      bank_provider: initialData?.bank_provider || "outro",
      is_default: initialData?.is_default || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      if (initialData) {
        const res = await updateAccountAction(initialData.id, {
          name: values.name,
          bank_provider: values.bank_provider,
          is_default: values.is_default,
        });
        if (res.success) {
          toast.success("Caixa atualizada com sucesso.");
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await createAccountAction(values);
        if (res.success) {
          toast.success("Caixa criada com sucesso.");
        } else {
          toast.error(res.error);
        }
      }
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Algo deu errado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Caixa</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="Ex: Mpesa, BCI..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bank_provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco / Carteira Móvel</FormLabel>
              <Select
                disabled={loading}
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {!initialData && (
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Inicial</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Conta Principal</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Usar esta conta como padrão para transações.
                </p>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end w-full">
          <Button disabled={loading} type="submit" className="w-full sm:w-auto">
            {action}
          </Button>
        </div>
      </form>
    </Form>
  );
}
