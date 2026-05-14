"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical System Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-2xl w-full space-y-10">
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-500 rounded-[2.5rem] shadow-2xl shadow-rose-200 mb-4">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight font-sora">
            Algo não correu bem.
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
            Ocorreu um erro inesperado no sistema. Nossa equipe técnica já foi notificada e estamos trabalhando para resolver.
          </p>
          {error.digest && (
            <div className="inline-block px-4 py-2 bg-slate-200/50 rounded-lg border border-slate-200">
                <code className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ID do Erro: {error.digest}
                </code>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            onClick={() => reset()}
            size="lg" 
            className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 group transition-all"
          >
            <RefreshCcw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <div className="pt-16">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] font-sora">
            GestãoFlex Security & Stability Monitoring
          </p>
        </div>
      </div>
    </div>
  );
}
