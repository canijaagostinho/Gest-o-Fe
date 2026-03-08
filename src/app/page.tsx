"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    Users,
    CreditCard,
    Building2,
    FileText,
    ShieldCheck,
    Lock,
    Zap,
    Scale,
    TrendingUp,
    PieChart,
    ChevronDown,
    Globe,
    CheckCircle2,
    PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function LandingPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 font-sora selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            {/* Mesh Gradient Backgrounds */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 px-4 pt-6">
                <nav className="max-w-7xl mx-auto h-16 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl px-6 flex items-center justify-between shadow-2xl shadow-black/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">
                            Gestão<span className="text-blue-500">Flex</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        {["Funcionalidades", "Segurança", "Preços", "FAQ"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace('ç', 'c')}`}
                                className="text-sm font-bold text-slate-300 hover:text-white transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl px-4">
                                Login
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-6 h-10 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                                Teste Grátis
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-inner"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            Plataforma Operativa de Microcrédito 4.0
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.95] max-w-5xl"
                        >
                            Digitalize. Automatize. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500">Scale sem limites.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl font-medium"
                        >
                            A solução completa para instituições de microcrédito que buscam robustez empresarial, segurança de dados nível bancário e inteligência operacional.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                        >
                            <Link href="/auth/login">
                                <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-black rounded-2xl px-10 h-16 text-lg shadow-xl shadow-white/5 transition-all hover:-translate-y-1 group">
                                    Começar Agora
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="#demo">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 bg-white/5 text-white hover:bg-white/10 font-black rounded-2xl px-10 h-16 text-lg backdrop-blur-md transition-all">
                                    <PlayCircle className="mr-2 h-5 w-5 text-blue-400" />
                                    Ver Demo
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Interactive Dashboard Mockup */}
                        <motion.div
                            style={{ y, opacity }}
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="w-full mt-12 perspective-1000"
                        >
                            <div className="relative group p-[1px] rounded-[2.5rem] bg-gradient-to-br from-blue-500/50 via-indigo-500/20 to-transparent shadow-2xl shadow-blue-500/10">
                                <div className="rounded-[2.4rem] bg-slate-950 overflow-hidden border border-white/5 relative">
                                    <img
                                        src="/C:/Users/HEDWIG%20DA%20FATIMA/.gemini/antigravity/brain/623e8381-4b31-465a-a28c-1de878196abc/gestao_flex_dashboard_mockup_1772997299451.png"
                                        alt="Gestão Flex Dashboard"
                                        className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Bar */}
                <section className="relative z-10 -mt-20 px-4">
                    <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        {[
                            { label: "Volume Processado", val: "MT 12.5M+", icon: TrendingUp },
                            { label: "Clientes Ativos", val: "8.400+", icon: Users },
                            { label: "Tempo de Resposta", val: "Real-time", icon: Zap },
                            { label: "Taxa de Aprovação", val: "94.2%", icon: Scale },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/40 p-10 flex flex-col items-center text-center gap-2 group hover:bg-white/[0.02] transition-colors">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <stat.icon className="h-5 w-5 text-blue-400" />
                                </div>
                                <p className="text-3xl font-black text-white">{stat.val}</p>
                                <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Grid */}
                <section id="funcionalidades" className="py-32 px-4">
                    <div className="max-w-7xl mx-auto space-y-24">
                        <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                            <div className="space-y-4 max-w-2xl">
                                <h2 className="text-blue-500 font-black tracking-[0.3em] uppercase text-xs">A Vantagem Operacional</h2>
                                <p className="text-4xl md:text-6xl font-black text-white tracking-tight">Potencialize cada etapa do seu <span className="text-blue-500 italic">Core Business</span></p>
                            </div>
                            <p className="text-slate-400 font-medium max-w-sm border-l-2 border-blue-500/30 pl-6 leading-relaxed">
                                Abandone as planilhas e o trabalho manual. Nossa plataforma unifica fluxos complexos em uma interface intuitiva e automatizada.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Motor de Crédito Inteligente",
                                    desc: "Simulações precisas com taxas personalizáveis, cronogramas automáticos e gestão de carência em segundos.",
                                    icon: CreditCard,
                                    grad: "from-blue-500/20 to-blue-600/5",
                                    color: "text-blue-400"
                                },
                                {
                                    title: "Analytics de Risco & Saúde",
                                    desc: "Dashboards iterativos que mostram a saúde da carteira, inadimplência técnica e provisões regulatórias em tempo real.",
                                    icon: BarChart3,
                                    grad: "from-indigo-500/20 to-indigo-600/5",
                                    color: "text-indigo-400"
                                },
                                {
                                    title: "Central de CRM Financeiro",
                                    desc: "Visão 360° do cliente: histórico de pagamentos, scoring comportamental e documentação centralizada.",
                                    icon: Users,
                                    grad: "from-violet-500/20 to-violet-600/5",
                                    color: "text-violet-400"
                                },
                            ].map((feat, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -8 }}
                                    className={`relative p-10 rounded-[2.5rem] bg-gradient-to-br ${feat.grad} border border-white/5 group shadow-lg overflow-hidden`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                                    <div className={`h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-white/10 transition-all`}>
                                        <feat.icon className={`h-8 w-8 ${feat.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-4 leading-tight">{feat.title}</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">{feat.desc}</p>

                                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white group-hover:gap-4 transition-all">
                                        Saiba mais
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section id="segurança" className="py-32 bg-slate-900/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-inner">
                                <ShieldCheck className="h-4 w-4" />
                                Segurança Nível Bancário
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                                Seus dados protegidos pela <span className="text-emerald-400 underline decoration-emerald-500/30 underline-offset-8">melhor infraestrutura</span> comercial
                            </h2>
                            <p className="text-lg text-slate-400 leading-relaxed font-medium">
                                Operações financeiras exigem confiança total. Implementamos isolamento de dados (Multi-Tenant), criptografia em repouso e políticas rigorosas de Row-Level Security (RLS).
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {[
                                    { title: "Isolamento Estrito", desc: "Cada instituição possui seu próprio silo de dados lógico.", icon: Lock },
                                    { title: "Relatórios Auditáveis", desc: "Logs completos de cada transação e acesso administrativo.", icon: FileText },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="h-10 w-10 rounded-xl bg-slate-950 flex flex-shrink-0 items-center justify-center">
                                            <item.icon className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white mb-1">{item.title}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
                            <div className="relative grid grid-cols-2 gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="aspect-square rounded-[3rem] bg-slate-950 border border-white/10 p-8 flex flex-col justify-end gap-4 shadow-2xl"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                        <Globe className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <p className="text-2xl font-black text-white">99.9% Uptime</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="aspect-square rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-end gap-4 shadow-2xl mt-12"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                        <ShieldCheck className="h-6 w-6 text-white" />
                                    </div>
                                    <p className="text-2xl font-black text-white">ISO 27001</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="precos" className="py-32 px-4 relative">
                    <div className="max-w-7xl mx-auto space-y-24 relative z-10">
                        <div className="text-center space-y-6 max-w-3xl mx-auto">
                            <h2 className="text-blue-500 font-black tracking-[0.3em] uppercase text-xs">Investimento</h2>
                            <p className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                Planos <span className="text-blue-500 italic">transparentes</span> para o seu tamanho
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-center max-w-7xl mx-auto">
                            {/* Mensal */}
                            <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors h-full flex flex-col">
                                <h3 className="text-2xl font-black text-white mb-2">Mensal</h3>
                                <p className="text-slate-400 text-sm font-medium mb-8">Acesso completo ao Gestão Flex por 1 mês.</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-black text-white">799</span>
                                    <span className="text-slate-500 font-bold ml-1">MTN</span>
                                </div>
                                <ul className="space-y-4 mb-10 text-slate-300 font-medium text-sm flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Clientes Ilimitados</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Motor de Crédito Avançado</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Dashboard Analytics</li>
                                </ul>
                                <Link href="/auth/register">
                                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl h-12">
                                        Assinar Plano
                                    </Button>
                                </Link>
                            </div>

                            {/* Trimestral */}
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-b from-blue-600 to-indigo-700 border border-white/20 shadow-2xl shadow-blue-500/20 transform md:scale-105 relative z-10 h-full flex flex-col">
                                <div className="absolute top-0 right-8 translate-y-[-50%] bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                    Recomendado
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Trimestral</h3>
                                <p className="text-blue-200 text-sm font-medium mb-8">Acesso completo ao Gestão Flex por 3 meses.</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-black text-white">2.099</span>
                                    <span className="text-blue-200 font-bold ml-1">MTN</span>
                                </div>
                                <ul className="space-y-4 mb-10 text-white font-medium text-sm flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-300" /> Clientes Ilimitados</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-300" /> Motor de Crédito Avançado</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-300" /> Dashboard Analytics</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-300" /> Suporte Prioritário</li>
                                </ul>
                                <Link href="/auth/register">
                                    <Button className="w-full bg-white hover:bg-slate-100 text-indigo-700 font-black rounded-2xl h-12 shadow-lg">
                                        Assinar Plano
                                    </Button>
                                </Link>
                            </div>

                            {/* Semestral */}
                            <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors h-full flex flex-col">
                                <h3 className="text-2xl font-black text-white mb-2">Semestral</h3>
                                <p className="text-slate-400 text-sm font-medium mb-8">Acesso completo ao Gestão Flex por 6 meses.</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-black text-white">3.599</span>
                                    <span className="text-slate-500 font-bold ml-1">MTN</span>
                                </div>
                                <ul className="space-y-4 mb-10 text-slate-300 font-medium text-sm flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Clientes Ilimitados</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Motor de Crédito Avançado</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Dashboard Analytics</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Economia de 1.195 MTN</li>
                                </ul>
                                <Link href="/auth/register">
                                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl h-12">
                                        Assinar Plano
                                    </Button>
                                </Link>
                            </div>

                            {/* Anual */}
                            <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors h-full flex flex-col">
                                <h3 className="text-2xl font-black text-white mb-2">Anual</h3>
                                <p className="text-slate-400 text-sm font-medium mb-8">Acesso completo ao Gestão Flex por 1 ano.</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-black text-white">5.999</span>
                                    <span className="text-slate-500 font-bold ml-1">MTN</span>
                                </div>
                                <ul className="space-y-4 mb-10 text-slate-300 font-medium text-sm flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Clientes Ilimitados</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Motor de Crédito Avançado</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Dashboard Analytics</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Máxima Economia (3.589 MTN)</li>
                                </ul>
                                <Link href="/auth/register">
                                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl h-12">
                                        Assinar Plano
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-32 px-4 bg-slate-950">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <div className="text-center space-y-6">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Dúvidas Frequentes</h2>
                            <p className="text-slate-400 font-medium">Tudo o que você precisa saber sobre a implementação da nossa plataforma.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { q: "Quanto tempo leva para migrar meus dados?", a: "Nossa equipe de Customer Success cuida da migração completa. Para o plano Enterprise, o processo leva em média 3 dias úteis. Exportamos dados de planilhas ou de sistemas legados de forma segura." },
                                { q: "O sistema faz análise automática de crédito da Serasa/SPC?", a: "Sim, através de nossa API (disponível no plano Enterprise), você pode plugar bureaus de créditos externos para realizar a análise preventiva em poucos segundos." },
                                { q: "Existe limite de usuários para a minha equipe (staff)?", a: "Não. Todos os planos permitem cadastrar usuários ilimitados na sua equipe, com diferentes níveis de acesso (Admin, Analista, Cobrador, etc), para organizar a gestão da sua carteira perfeitamente." },
                                { q: "Hospedagem e banco de dados estão inclusos?", a: "Totalmente. O Gestão Flex é um software como serviço (SaaS). Cuidamos dos servidores, segurança, backups contínuos e atualizações, sem custo extra ou necessidade de equipe de TI interna." }
                            ].map((faq, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <h4 className="text-xl font-black text-white mb-4">{faq.q}</h4>
                                    <p className="text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-40 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative rounded-[4rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[140px]" />
                            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

                            <div className="relative z-10 p-12 md:p-24 text-center max-w-4xl mx-auto space-y-12">
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                                    Pronto para <br /> <span className="text-blue-500 italic">vencer</span> no mercado?
                                </h2>
                                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                                    Junte-se à revolução do microcrédito digital. Transforme operações burocráticas em uma máquina de escala financeira ágil.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                    <Link href="/auth/register">
                                        <Button size="lg" className="h-20 px-12 bg-white text-slate-950 hover:bg-slate-100 font-black text-xl rounded-3xl shadow-xl shadow-white/5">
                                            Começar Teste Grátis
                                        </Button>
                                    </Link>
                                    <Link href="/contact">
                                        <Button size="lg" variant="outline" className="h-20 px-12 border-white/20 bg-white/5 text-white hover:bg-white/10 font-black text-xl rounded-3xl backdrop-blur-md">
                                            Falar com Consultor
                                        </Button>
                                    </Link>
                                </div>

                                <div className="pt-12 flex items-center justify-center gap-8 border-t border-white/5">
                                    {["Cancelamento Grátis", "Suporte VIP 24h", "Sem Taxas Escondidas"].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 py-20 px-4 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-1 md:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">
                                Gestão<span className="text-blue-500">Flex</span>
                            </span>
                        </div>
                        <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
                            A plataforma líder em gestão de microcrédito e inclusão financeira na era digital. Elevando padrões operacionais desde 2024.
                        </p>
                    </div>

                    {[
                        { title: "Plataforma", links: ["Funcionalidades", "Automações", "Dashboard", "Segurança"] },
                        { title: "Empresa", links: ["Sobre nós", "Blog", "Preços", "Carreiras"] },
                    ].map((col, i) => (
                        <div key={i} className="space-y-6">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{col.title}</h4>
                            <div className="flex flex-col gap-4 text-slate-500 font-bold text-sm">
                                {col.links.map((link) => (
                                    <Link key={link} href="#" className="hover:text-blue-400 transition-colors">{link}</Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs font-bold text-slate-600">&copy; 2026 Gestão Flex SaaS. Nível Bancário & Escalável.</p>
                    <div className="flex items-center gap-8">
                        {["Termos de Uso", "Privacidade", "Compliance", "API Status"].map((link) => (
                            <Link key={link} href="#" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] transition-colors">{link}</Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
