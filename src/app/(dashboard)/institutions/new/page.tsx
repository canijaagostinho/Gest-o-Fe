"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { InstitutionForm } from "@/components/institutions/institution-form";
import { createInstitutionAction } from "@/app/actions/institution-actions";
import { InstitutionFormValues } from "@/schemas/institution";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewInstitutionPage() {
  const router = useRouter();

  async function onSubmit(data: InstitutionFormValues) {
    const result = await createInstitutionAction(data);

    if (result.success) {
      toast.success("Instituição criada com sucesso!");
      router.push("/institutions");
    } else {
      toast.error("Erro ao criar instituição", {
        description: result.error,
      });
      throw new Error(result.error);
    }
  }

  return (
    <div className="flex-1 space-y-10 p-4 md:p-8 pt-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-xl border border-slate-100 shadow-slate-200/50 relative">
          <Image src="/logo.webp" alt="Gestão Flex Logotipo" fill className="object-cover" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            Cadastrar Instituição
          </h2>
          <p className="text-slate-500 font-medium">
            Configure uma nova entidade parceira no ecossistema.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8">
          <InstitutionForm
            onSubmit={onSubmit}
            submitLabel="Validar e Criar Instituição"
          />
        </CardContent>
      </Card>
    </div>
  );
}
