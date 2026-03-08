"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    Users,
    CreditCard,
    Building2,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sora overflow-x-hidden">
            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight">
                                Gestão<span className="text-blue-600">Flex</span>
                            </span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="#features" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Funcionalidades</Link>
                            <Link href="#benefits" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Benefícios</Link>
                            <Link href="#security" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Segurança</Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <Link href="/auth/login">
                                <Button variant="ghost" className="font-bold text-slate-700 hover:bg-slate-100 rounded-xl px-6">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-200 transform transition-transform hover:scale-105 active:scale-95">
                                    Começar Agora
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-20">
                {/* Hero Section */}
                <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
                    </div>

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-black uppercase tracking-widest shadow-sm">
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                A Solução Nº1 para Microcrédito
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                                Gestão Inteligente para o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Microcrédito</span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
                                Transforme sua operação financeira com uma plataforma robusta, segura e escalável. Centralize contratos, automatize cobranças e tome decisões baseadas em dados.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/auth/register">
                                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl px-10 h-16 text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">
                                        Avaliação Gratuita
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border-slate-200 text-slate-700 font-bold rounded-2xl px-10 h-16 text-lg shadow-sm hover:bg-slate-50 transition-all">
                                        Acessar Sistema
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                                <div>
                                    <p className="text-3xl font-black text-slate-900">100%</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Seguro</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900">24/7</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Monitoramento</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900">Real-time</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dashboards</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 rounded-[2.5rem] bg-white p-4 shadow-2xl shadow-slate-200 border border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=2070&auto=format&fit=crop"
                                    alt="Dashboard Preview"
                                    className="rounded-[2rem] w-full object-cover shadow-inner"
                                />
                            </div>
                            <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-600/10 rounded-full blur-[40px] -z-10" />
                            <div className="absolute -bottom-10 -left-10 h-60 w-60 bg-indigo-600/10 rounded-full blur-[60px] -z-10" />
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Funcionalidades Core</h2>
                            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Tudo o que sua instituição precisa em um só lugar</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    title: "Gestão de Empréstimos",
                                    desc: "Criação, simulação e acompanhamento completo de contratos com juros simples ou compostos.",
                                    icon: CreditCard,
                                    color: "bg-blue-50 text-blue-600"
                                },
                                {
                                    title: "Análise de Risco",
                                    desc: "Visualize a saúde da sua carteira em tempo real com indicadores de inadimplência e provisões.",
                                    icon: BarChart3,
                                    color: "bg-emerald-50 text-emerald-600"
                                },
                                {
                                    title: "Base de Clientes",
                                    desc: "Gestão completa de tomadores com histórico financeiro detalhado e scoring automático.",
                                    icon: Users,
                                    color: "bg-indigo-50 text-indigo-600"
                                },
                                {
                                    title: "Relatórios Regulatórios",
                                    desc: "Geração automática de relatórios em PDF, Excel e formatos compatíveis com reguladores.",
                                    icon: FileText,
                                    color: "bg-amber-50 text-amber-600"
                                }
                            ].map((feat, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -10 }}
                                    className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100"
                                >
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feat.color}`}>
                                        <feat.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3">{feat.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/10 blur-[100px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-blue-900/40 border border-white/10">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Pronto para modernizar sua operação?</h2>
                            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium">
                                Junte-se a dezenas de instituições que já otimizaram seus processos com a Gestão Flex. Comece seu teste gratuito agora.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link href="/auth/register">
                                    <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-black rounded-2xl px-12 h-16 text-lg">
                                        Experimentar Grátis
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-black rounded-2xl px-12 h-16 text-lg backdrop-blur-sm">
                                        Agendar Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            Gestão<span className="text-blue-600">Flex</span>
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-400">&copy; 2026 Gestão Flex. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Termos</Link>
                        <Link href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Privacidade</Link>
                        <Link href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Suporte</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
