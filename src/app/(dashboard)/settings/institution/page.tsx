"use client";

import { InstitutionForm } from "@/components/settings/institution-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function InstitutionProfilePage() {
  return (
    <div className="flex-1 space-y-6 pt-2">
      <div className="flex items-center space-x-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Perfil da Instituição
          </h2>
          <p className="text-slate-500">
            Dados legais, fiscais e identidade visual.
          </p>
        </div>
      </div>

      <InstitutionForm />
    </div>
  );
}
