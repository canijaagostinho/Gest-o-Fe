"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
    CheckCircle2,
    Star,
    Cpu,
    MonitorSmartphone,
    ShieldAlert,
    Bell,
    Calculator,
    UserCheck,
    Check,
    Phone,
    Mail,
    MessageSquare,
    Globe,
    Award,
    Target,
    Clock,
    HeartHandshake,
    Building,
    Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Fade-in on scroll hook
function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const { ref, inView } = useInView();
    return (
        <div
            ref={ref}
            className={cn("transition-all duration-700", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const faqItems = [
        {
            q: "Como funciona a implementação do sistema?",
            a: "Nossa implementação é rápida e guiada. Em 3 a 5 dias úteis, sua equipe estará treinada e o sistema configurado com as regras e produtos do seu negócio. Fornecemos suporte dedicado durante toda a transição."
        },
        {
            q: "Meus dados estão realmente seguros?",
            a: "Utilizamos criptografia de ponta a ponta (AES-256) e infraestrutura de nível bancário com backups automáticos diários, isolamento total de dados por instituição e conformidade com as melhores práticas de segurança."
        },
        {
            q: "Existe suporte técnico disponível?",
            a: "Sim. Oferecemos suporte especializado via chat em tempo real, email e telefone, com tempos de resposta garantidos em contrato (SLA de até 4 horas para casos críticos)."
        },
        {
            q: "Posso acessar o sistema pelo telemóvel?",
            a: "Sim! O sistema é 100% responsivo e possui uma interface otimizada para smartphones e tablets, permitindo gerir o negócio de qualquer lugar, a qualquer hora."
        },
        {
            q: "O sistema pode ser personalizado para minha instituição?",
            a: "Sim. O nosso motor de crédito e os fluxos operacionais são altamente configuráveis para se adaptarem às regras, produtos e processos específicos da sua instituição."
        },
        {
            q: "Qual é o período mínimo de contrato?",
            a: "Trabalhamos com contratos mensais ou anuais (com desconto). Não há penalidade de saída. A nossa confiança no produto é a nossa maior garantia."
        }
    ];

    const pricingPlans = [
        {
            name: "Essencial",
            price: "15.000",
            currency: "MZN/mês",
            desc: "Ideal para instituições em crescimento",
            features: [
                "Até 500 clientes activos",
                "Gestão de empréstimos",
                "Relatórios básicos",
                "Suporte via email",
                "1 utilizador admin",
                "Backup diário",
            ],
            cta: "Começar Agora",
            highlighted: false,
        },
        {
            name: "Profissional",
            price: "35.000",
            currency: "MZN/mês",
            desc: "Para instituições em expansão rápida",
            features: [
                "Clientes ilimitados",
                "Motor de crédito avançado",
                "Dashboards em tempo real",
                "Cobrança automática",
                "Relatórios exportáveis (PDF/Excel)",
                "Até 10 utilizadores",
                "Suporte prioritário (SLA 4h)",
                "Integração bancária",
            ],
            cta: "Solicitar Demo",
            highlighted: true,
        },
        {
            name: "Enterprise",
            price: "Sob consulta",
            currency: "",
            desc: "Para redes e cooperativas de grande porte",
            features: [
                "Multi-filiais e multi-moeda",
                "API completa de integração",
                "Utilizadores ilimitados",
                "Personalização total",
                "Gestor de conta dedicado",
                "SLA garantido 24/7",
                "Auditoria e conformidade",
            ],
            cta: "Falar com Especialista",
            highlighted: false,
        },
    ];

    const stats = [
        { value: "+500", label: "Instituições Activas", icon: Building2 },
        { value: "40%", label: "Redução de Inadimplência", icon: TrendingUp },
        { value: "3x", label: "Mais Produtividade", icon: Zap },
        { value: "99.9%", label: "Uptime Garantido", icon: ShieldCheck },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600/10 selection:text-blue-600 overflow-x-hidden">

            {/* Navigation */}
            <header className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                scrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm" : "bg-transparent py-6"
            )}>
                <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            Gestão<span className="text-blue-600">Flex</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: "Soluções", href: "#solucoes" },
                            { label: "Benefícios", href: "#beneficios" },
                            { label: "Preços", href: "#precos" },
                            { label: "FAQ", href: "#faq" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-sm font-semibold text-slate-600 hover:bg-slate-100 px-4 h-10">
                                Entrar
                            </Button>
                        </Link>
                        <Link href="#demonstracao">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 h-10 shadow-lg shadow-blue-600/20 transition-all">
                                Solicitar Demo
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                {/* 1. HERO */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/60 to-white">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[700px] h-[700px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-emerald-50/60 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div className="space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-[12px] font-bold text-blue-700 uppercase tracking-wider"
                            >
                                <Zap className="h-3 w-3" />
                                Gestão Inteligente de Microcrédito
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-6"
                            >
                                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                                    Mais <span className="text-blue-600 italic">Escala</span>, <br />
                                    Total <span className="text-blue-600 italic">Controlo</span>, <br />
                                    Maior <span className="text-emerald-600 italic">Lucro.</span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
                                    A plataforma definitiva para automatizar todo o ciclo do microcrédito, reduzir a inadimplência e transformar a sua operação financeira.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Link href="#demonstracao">
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 text-base rounded-xl shadow-xl shadow-blue-600/20 group w-full sm:w-auto">
                                        Solicitar Demonstração Grátis
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="#solucoes">
                                    <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-14 px-8 text-base rounded-xl w-full sm:w-auto">
                                        Ver como funciona
                                    </Button>
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-6 pt-4 border-t border-slate-100"
                            >
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
                                            {["MF", "AC", "BM", "RM"][i - 1]}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm font-semibold text-slate-500">
                                    <span className="text-slate-900 font-bold">+500 instituições</span> já confiam em nós.
                                </p>
                            </motion.div>
                        </div>

                        {/* Hero visual — mockup image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                            className="relative hidden lg:block"
                        >
                            {/* Glow behind image */}
                            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full -z-10 scale-110" />

                            {/* Main mockup */}
                            <img
                                src="/hero-mockup.png"
                                alt="Dashboard GestãoFlex em múltiplos dispositivos"
                                className="w-full h-auto drop-shadow-2xl rounded-2xl"
                            />

                            {/* Floating badge — top left */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-2xl shadow-blue-600/15 border border-slate-100 px-4 py-3 flex items-center gap-3"
                            >
                                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inadimplência</p>
                                    <p className="text-lg font-extrabold text-slate-900 leading-tight">-40% <span className="text-emerald-500 text-sm">↓</span></p>
                                </div>
                            </motion.div>

                            {/* Floating badge — bottom right */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="absolute -right-6 bottom-1/4 bg-white rounded-2xl shadow-2xl shadow-blue-600/15 border border-slate-100 px-4 py-3 flex items-center gap-3"
                            >
                                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uptime</p>
                                    <p className="text-lg font-extrabold text-slate-900 leading-tight">99.9%</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. STATS BAR */}
                <section className="py-16 bg-slate-900 px-6">
                    <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <FadeIn key={i} delay={i * 100}>
                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto">
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{stat.value}</p>
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>

                {/* 3. PROBLEMA */}
                <section className="py-24 bg-white px-6">
                    <div className="max-w-7xl mx-auto">
                        <FadeIn className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                            <h2 className="text-sm font-black text-rose-500 uppercase tracking-[0.2em]">O Desafio</h2>
                            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">O Excel não foi feito para gerir o seu futuro.</h3>
                            <p className="text-lg text-slate-500 font-medium">Muitas instituições perdem dinheiro e eficiência por falta de ferramentas adequadas.</p>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Caos no Excel", desc: "Planilhas complexas que geram erros humanos e perda de dados críticos.", icon: FileText },
                                { title: "Falta de Controlo", desc: "Dificuldade em saber quem pagou, quem deve e quando cobrar.", icon: ShieldAlert },
                                { title: "Inadimplência Alta", desc: "Sem alertas automáticos, o atraso torna-se prejuízo inevitável.", icon: TrendingUp },
                                { title: "Relatórios Fracos", desc: "Horas perdidas a consolidar dados que não refletem a realidade.", icon: BarChart3 },
                            ].map((pain, i) => (
                                <FadeIn key={i} delay={i * 100}>
                                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 hover:border-rose-200 hover:bg-rose-50/30 transition-all group h-full">
                                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-rose-500 transition-colors">
                                            <pain.icon className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900">{pain.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{pain.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. SOLUÇÃO */}
                <section id="solucoes" className="py-24 bg-slate-900 text-white px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.15),transparent_60%)]" />
                    <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                        <FadeIn className="space-y-8">
                            <div className="inline-flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs">
                                <div className="h-1 w-8 bg-blue-500" />
                                A Solução Definitiva
                            </div>
                            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                                Deixe para trás o manual. <br />
                                Entre na <span className="text-blue-400">Era do Controlo.</span>
                            </h2>
                            <p className="text-lg text-slate-400 font-medium leading-relaxed">
                                O GestãoFlex automatiza todo o ciclo do microcrédito — desde a simulação inicial até à cobrança automática — funcionando como o centro de comando digital do seu negócio.
                            </p>
                            <div className="space-y-4 pt-4 text-slate-200 font-medium">
                                {[
                                    "Automatize 100% dos seus fluxos operacionais.",
                                    "Tenha visão clara de cada centavo em tempo real.",
                                    "Tome decisões baseadas em dados, não em palpites.",
                                    "Reduza erros humanos e aumente a confiança."
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <Link href="#demonstracao">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 text-base rounded-xl shadow-xl shadow-blue-600/40">
                                    Descobrir Todos os Módulos
                                </Button>
                            </Link>
                        </FadeIn>
                        <FadeIn delay={150} className="relative">
                            <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full -z-10" />
                            <img
                                src="/mockup-parcelas.png"
                                alt="GestãoFlex - Gestão de parcelas e contratos em múltiplos dispositivos"
                                className="w-full h-auto rounded-2xl drop-shadow-2xl"
                            />
                        </FadeIn>
                    </div>
                </section>

                {/* 5. BENEFÍCIOS */}
                <section id="beneficios" className="py-24 bg-slate-50 px-6">
                    <div className="max-w-7xl mx-auto">
                        <FadeIn className="text-center max-w-2xl mx-auto space-y-6 mb-20">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Benefícios de Alto Impacto</h2>
                            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Foco total no seu crescimento.</h3>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: "Automação de Processos", desc: "Elimine tarefas repetitivas e aumente a produtividade da sua equipe em até 3x.", icon: Zap, label: "Produtividade" },
                                { title: "Redução da Inadimplência", desc: "Regras de crédito inteligentes e cobrança automática que aumentam o seu lucro real.", icon: TrendingUp, label: "Rentabilidade" },
                                { title: "Dashboards em Tempo Real", desc: "Visibilidade total do negócio para decisões rápidas, precisas e seguras.", icon: PieChart, label: "Controlo" },
                                { title: "Segurança de Dados", desc: "Arquitectura de nível bancário para garantir que os seus activos estejam sempre protegidos.", icon: Lock, label: "Confiança" },
                            ].map((benefit, i) => (
                                <FadeIn key={i} delay={i * 100}>
                                    <div className="flex gap-6 p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all group h-full">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex flex-shrink-0 items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <benefit.icon className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{benefit.label}</span>
                                            <h4 className="text-xl font-bold text-slate-900">{benefit.title}</h4>
                                            <p className="text-slate-500 font-medium leading-relaxed text-sm">{benefit.desc}</p>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. FUNCIONALIDADES */}
                <section className="py-24 bg-white px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        {/* Top header */}
                        <FadeIn className="text-center max-w-2xl mx-auto space-y-4 mb-16">
                            <div className="h-1.5 w-12 bg-emerald-500 rounded-full mx-auto" />
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Poderoso por dentro, <br /><span className="text-blue-600">SIMPLES</span> por fora.</h2>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                Complexidade técnica com uma interface intuitiva que qualquer pessoa pode operar.
                            </p>
                        </FadeIn>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Features list */}
                            <div className="grid sm:grid-cols-2 gap-y-8 gap-x-6">
                                {[
                                    { title: "Gestão de Clientes", desc: "Cadastro completo com histórico de empréstimos e perfil de risco.", icon: Users },
                                    { title: "Simulação de Empréstimos", desc: "Cálculos instantâneos de juros, multas e prazos personalizados.", icon: Calculator },
                                    { title: "Motor de Crédito", desc: "Avaliação automática baseada em regras de negócio configuráveis.", icon: Cpu },
                                    { title: "Cobrança Automática", desc: "Lembretes automáticos e controlo rigoroso de datas de pagamento.", icon: Bell },
                                    { title: "Relatórios Exportáveis", desc: "PDF e Excel de alta qualidade para auditoria e gestão financeira.", icon: FileText },
                                    { title: "Controlo de Utilizadores", desc: "Permissões granulares para cada membro da sua instituição.", icon: UserCheck },
                                ].map((feat, i) => (
                                    <FadeIn key={i} delay={i * 80}>
                                        <div className="flex gap-4 group p-4 rounded-xl hover:bg-blue-50 transition-colors">
                                            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <feat.icon className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-base font-bold text-slate-900">{feat.title}</h4>
                                                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>

                            {/* Real screenshot */}
                            <FadeIn delay={200} className="relative">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10" />
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
                                <img
                                    src="/mockup-emprestimos.png"
                                    alt="GestãoFlex - Lista de empréstimos no MacBook"
                                    className="w-full h-auto rounded-2xl shadow-2xl shadow-slate-900/10"
                                />
                                {/* Feature callout */}
                                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status em tempo real</p>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">● Activo</span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">● Em Análise</span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">● Vencido</span>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>

                        <div className="text-center mt-12">
                            <Link href="#demonstracao">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-600/20">
                                    Ver tour completo do sistema
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 7. PÚBLICO-ALVO */}
                <section className="py-24 bg-slate-50 px-6">
                    <div className="max-w-7xl mx-auto text-center space-y-16">
                        <FadeIn className="space-y-4">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">Público-Alvo</h2>
                            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Feito para o ecossistema financeiro.</h3>
                        </FadeIn>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Instituições de Microcrédito", icon: Landmark, desc: "Gerencie toda a carteira com precisão." },
                                { label: "Cooperativas de Crédito", icon: HeartHandshake, desc: "Fortaleça a governança e a confiança." },
                                { label: "ONGs Financeiras", icon: Globe, desc: "Impacto social com controlo total." },
                                { label: "Fintechs Emergentes", icon: Zap, desc: "Escale rapidamente com tecnologia sólida." },
                            ].map((target, i) => (
                                <FadeIn key={i} delay={i * 100}>
                                    <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 h-full">
                                        <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                                            <target.icon className="h-7 w-7" />
                                        </div>
                                        <p className="font-extrabold text-slate-900 text-base leading-tight">{target.label}</p>
                                        <p className="text-xs text-slate-500 font-medium">{target.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. TESTEMUNHOS */}
                <section className="py-24 bg-white px-6">
                    <div className="max-w-7xl mx-auto">
                        <FadeIn className="text-center space-y-4 mb-16">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">Prova Social</h2>
                            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">O que dizem os nossos clientes.</h3>
                        </FadeIn>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    quote: "A transição do Excel para o GestãoFlex foi o marco de crescimento da nossa cooperativa. Inadimplência caiu 40% em 3 meses.",
                                    name: "Dr. Manuel Antunes",
                                    role: "Director Financeiro",
                                    company: "MicroCred Moz",
                                    initial: "MA",
                                    stars: 5,
                                },
                                {
                                    quote: "Antes levávamos 2 dias para fechar o relatório mensal. Hoje fazemos em minutos. O sistema é incrivelmente rápido e intuitivo.",
                                    name: "Fátima Nhantumbo",
                                    role: "Gestora de Operações",
                                    company: "Cooperativa Unida",
                                    initial: "FN",
                                    stars: 5,
                                },
                                {
                                    quote: "A segurança e a rastreabilidade que o GestãoFlex oferece dão-nos confiança total para apresentar resultados aos nossos parceiros internacionais.",
                                    name: "Carlos Machava",
                                    role: "CEO",
                                    company: "FinanSol ONG",
                                    initial: "CM",
                                    stars: 5,
                                },
                            ].map((t, i) => (
                                <FadeIn key={i} delay={i * 120}>
                                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 space-y-6 h-full flex flex-col hover:shadow-lg hover:border-blue-200 transition-all">
                                        <div className="flex gap-1">
                                            {Array.from({ length: t.stars }).map((_, j) => (
                                                <Star key={j} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                                            ))}
                                        </div>
                                        <p className="text-slate-700 font-medium leading-relaxed italic flex-grow">&quot;{t.quote}&quot;</p>
                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                                            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {t.initial}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">{t.name}</p>
                                                <p className="text-xs font-semibold text-slate-500">{t.role} · {t.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>

                        {/* Trust logos */}
                        <div className="flex flex-wrap justify-center gap-12 pt-16 opacity-40 grayscale">
                            {["Segurança Nível Bancário", "Proteção de Dados ISO", "Processamento 24/7", "Auditoria Verificada"].map((label, i) => (
                                <div key={i} className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 9. PREÇOS */}
                <section id="precos" className="py-24 bg-slate-900 text-white px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(37,99,235,0.2),transparent_60%)]" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <FadeIn className="text-center space-y-4 mb-16">
                            <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest">Planos e Preços</h2>
                            <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Plano certo para cada etapa.</h3>
                            <p className="text-slate-400 font-medium max-w-xl mx-auto">Sem custos ocultos. Sem surpresas. Cancele quando quiser.</p>
                        </FadeIn>
                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            {pricingPlans.map((plan, i) => (
                                <FadeIn key={i} delay={i * 120}>
                                    <div className={cn(
                                        "rounded-2xl p-8 border space-y-8 h-full flex flex-col relative",
                                        plan.highlighted
                                            ? "bg-blue-600 border-blue-500 shadow-[0_0_80px_rgba(37,99,235,0.3)]"
                                            : "bg-white/5 border-white/10 backdrop-blur-sm"
                                    )}>
                                        {plan.highlighted && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                                                Mais Popular
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-black text-white">{plan.name}</h4>
                                            <p className="text-xs text-blue-200 font-semibold">{plan.desc}</p>
                                        </div>
                                        <div>
                                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                            {plan.currency && <span className="text-sm text-blue-200 ml-2 font-semibold">{plan.currency}</span>}
                                        </div>
                                        <div className="space-y-3 flex-grow">
                                            {plan.features.map((f, j) => (
                                                <div key={j} className="flex items-start gap-3">
                                                    <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", plan.highlighted ? "text-white" : "text-emerald-400")} />
                                                    <span className={cn("text-sm font-medium", plan.highlighted ? "text-blue-100" : "text-slate-300")}>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Link href="#demonstracao" className="block">
                                            <Button className={cn(
                                                "w-full h-12 font-bold rounded-xl",
                                                plan.highlighted
                                                    ? "bg-white text-blue-600 hover:bg-blue-50"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                            )}>
                                                {plan.cta}
                                            </Button>
                                        </Link>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 10. CTA FORTE */}
                <section id="demonstracao" className="py-24 px-6 relative bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white space-y-10 relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(30,58,138,0.4)]">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                            <FadeIn className="relative z-10 space-y-4">
                                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
                                    Pronto para ter controlo <br />TOTAL do seu negócio?
                                </h2>
                                <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
                                    Reserve 15 minutos para uma demonstração gratuita e veja como podemos transformar a sua operação.
                                </p>
                            </FadeIn>

                            {/* Contact form */}
                            <FadeIn delay={200} className="relative z-10 max-w-xl mx-auto">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="O seu nome"
                                            className="h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40 w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nome da instituição"
                                            className="h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40 w-full"
                                        />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <input
                                            type="email"
                                            placeholder="O seu email"
                                            className="h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40 w-full"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Telefone / WhatsApp"
                                            className="h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40 w-full"
                                        />
                                    </div>
                                    <Button className="w-full h-12 bg-white text-blue-600 hover:bg-blue-50 font-black text-base rounded-xl shadow-2xl">
                                        Solicitar Demonstração Gratuita →
                                    </Button>
                                    <p className="text-[11px] text-blue-200 text-center">Sem compromisso. Resposta em menos de 24 horas.</p>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 11. FAQ */}
                <section id="faq" className="py-24 bg-slate-50 px-6">
                    <div className="max-w-3xl mx-auto space-y-16">
                        <FadeIn className="text-center space-y-4">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">Dúvidas Frequentes</h2>
                            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Perguntas comuns</h3>
                        </FadeIn>
                        <div className="space-y-3">
                            {faqItems.map((item, i) => (
                                <FadeIn key={i} delay={i * 60}>
                                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="font-bold text-slate-900 pr-8">{item.q}</span>
                                            <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform flex-shrink-0", activeFaq === i && "rotate-180")} />
                                        </button>
                                        <div className={cn("overflow-hidden transition-all duration-300", activeFaq === i ? "max-h-48" : "max-h-0")}>
                                            <div className="p-6 pt-0 text-slate-600 font-medium leading-relaxed border-t border-slate-100">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-white py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <span className="text-xl font-bold tracking-tight">
                                    Gestão<span className="text-blue-400">Flex</span>
                                </span>
                            </div>
                            <p className="text-slate-400 max-w-sm leading-relaxed font-medium text-sm">
                                Transformando a gestão de microcrédito com tecnologia de ponta e foco total no sucesso dos nossos clientes.
                            </p>
                            {/* Contact info */}
                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                    <span>contacto@gestaoflex.co.mz</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-400" />
                                    <span>+258 84 000 0000</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {[
                                    { icon: MessageSquare, label: "WhatsApp" },
                                    { icon: Globe, label: "Web" },
                                    { icon: Mail, label: "Email" },
                                ].map((social, i) => (
                                    <div key={i} className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer" title={social.label}>
                                        <social.icon className="h-4 w-4" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {[
                            { title: "Produto", links: ["Funcionalidades", "Segurança", "Planos", "Demo"] },
                            { title: "Empresa", links: ["Sobre Nós", "Blog", "Parceiros", "Contacto"] },
                        ].map((col, i) => (
                            <div key={i} className="space-y-6">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">{col.title}</h4>
                                <div className="flex flex-col gap-3 text-slate-400 font-semibold text-sm">
                                    {col.links.map((link) => (
                                        <Link key={link} href="#" className="hover:text-blue-400 transition-colors">{link}</Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">© 2026 GESTÃO FLEX. TODOS OS DIREITOS RESERVADOS.</p>
                        <div className="flex items-center gap-6">
                            {["Termos", "Privacidade", "Cookies"].map((link) => (
                                <Link key={link} href="#" className="text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-all">{link}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
