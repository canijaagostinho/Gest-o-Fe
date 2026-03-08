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
  institutionSchema,
  InstitutionFormValues,
} from "@/schemas/institution";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface InstitutionFormProps {
  initialData?: InstitutionFormValues;
  onSubmit: (data: InstitutionFormValues) => Promise<void>;
  submitLabel?: string;
}

export function InstitutionForm({
  initialData,
  onSubmit,
  submitLabel = "Salvar Instituição",
}: InstitutionFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema) as any,
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      address: "",
      number_of_employees: 0,
    },
  });

  const handleSubmit = async (data: InstitutionFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                Nome da Instituição
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Gestão Flex S.A."
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-bold text-red-500 ml-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                E-mail Institucional
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="contato@empresa.com"
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-bold text-red-500 ml-1" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Telefone Principal
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="+258 84 000 0000"
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-bold text-red-500 ml-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Endereço Sede
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Rua, Cidade, Província"
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-bold text-red-500 ml-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nuit"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  NUIT (Opcional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 400123456"
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-bold text-red-500 ml-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Website (Opcional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://suaempresa.com"
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage className="text-xs font-bold text-red-500 ml-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="number_of_employees"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Número de Funcionários
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-bold text-red-500 ml-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2">
            Identidade Visual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    URL do Logo (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-bold text-red-500 ml-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primary_color"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Cor Principal
                  </FormLabel>
                  <div className="flex gap-3">
                    <FormControl>
                      <div className="relative flex-1">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border border-slate-200 shadow-sm"
                          style={{ backgroundColor: field.value || "#2563eb" }}
                        />
                        <Input
                          placeholder="#2563eb"
                          className="h-14 pl-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 text-slate-900 font-bold placeholder:text-slate-300 uppercase"
                          {...field}
                          maxLength={7}
                        />
                      </div>
                    </FormControl>
                    <Input
                      type="color"
                      className="h-14 w-14 p-1 rounded-2xl cursor-pointer bg-slate-50 border-none"
                      value={field.value || "#2563eb"}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                  <FormMessage className="text-xs font-bold text-red-500 ml-1" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Processando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
