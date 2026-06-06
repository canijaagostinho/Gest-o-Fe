"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-2xl w-full space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-200 mb-4 animate-bounce">
            <Search className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-8xl md:text-[10rem] font-black text-slate-900 tracking-tighter leading-none font-sora">
            404
          </h1>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight font-sora">
            Página não encontrada
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
            O conteúdo que você está procurando parece ter sido movido ou não existe mais.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 group transition-all">
              <Home className="mr-2 h-4 w-4" />
              Ir para o Início
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="pt-20">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] font-sora">
            GestãoFlex Premium Platform
          </p>
        </div>
      </div>
    </div>
  );
}
