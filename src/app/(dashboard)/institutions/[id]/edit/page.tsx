"use client";

import { createClient } from "@/utils/supabase/client";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { InstitutionForm } from "@/components/institutions/institution-form";
import { updateInstitutionAction } from "@/app/actions/institution-actions";
import { InstitutionFormValues } from "@/schemas/institution";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditInstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<InstitutionFormValues | null>(
    null,
  );

  useEffect(() => {
    async function fetchInstitution() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Instituição não encontrada");
        router.push("/");
        return;
      }

      setInstitution({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        nuit: data.nuit || "",
        website: data.website || "",
        number_of_employees: data.number_of_employees || 0,
        logo_url: data.logo_url || "",
        primary_color: data.primary_color || "",
      });
      setLoading(false);
    }
    fetchInstitution();
  }, [id, router]);

  async function onSubmit(data: InstitutionFormValues) {
    const result = await updateInstitutionAction(id, data);

    if (result.success) {
      toast.success("Instituição atualizada com sucesso!");
      router.push("/institutions");
    } else {
      toast.error("Erro ao atualizar instituição", {
        description: result.error,
      });
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!institution) return null;

  return (
    <div className="flex-1 space-y-10 p-4 md:p-8 pt-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Editar Instituição
        </h2>
        <p className="text-slate-500 font-medium">
          Atualize os dados da entidade parceira.
        </p>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8">
          <InstitutionForm
            initialData={institution}
            onSubmit={onSubmit}
            submitLabel="Salvar Alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}
