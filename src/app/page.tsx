"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    LineChart,
    Users,
    CreditCard,
    Building2,
    FileText,
    ShieldCheck,
    ShieldAlert,
    TriangleAlert,
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
    Smartphone,
    Bell,
    Calculator,
    UserCheck,
    Check,
    Phone,
    Mail,
    MessageSquare,
    Globe,
    Cloud,
    RefreshCw,
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

    const [showFloatingCTA, setShowFloatingCTA] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setShowFloatingCTA(window.scrollY > 600);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const faqItems = [
        {
            q: "Preciso saber usar tecnologia?",
            a: "Não! O sistema foi desenhado para ser extremamente intuitivo. Se você sabe usar o WhatsApp, conseguirá organizar seu crédito em poucos minutos."
        },
        {
            q: "Funciona no telemóvel?",
            a: "Sim! O GestãoFlex é 100% responsivo. Você pode fazer cobranças e cadastros diretamente do seu smartphone ou tablet."
        },
        {
            q: "É gratuito?",
            a: "Sim! Oferecemos um teste inicial gratuito de 45 dias para você conhecer todas as funcionalidades e ver os resultados na prática."
        }
    ];

    const pricingPlans = [
        {
            name: "Essencial",
            price: "15.000",
            currency: "MZN/mês",
            desc: "Ideal para quem está a começar",
            features: [
                "Até 50 clientes ativos",
                "Gestão de empréstimos",
                "Relatórios automáticos",
                "Suporte prioritário",
            ],
            cta: "Começar Grátis",
            highlighted: false,
        },
        {
            name: "Profissional",
            price: "35.000",
            currency: "MZN/mês",
            desc: "Para quem quer escala e controle",
            features: [
                "Clientes ilimitados",
                "Cálculos avançados",
                "Alertas de cobrança",
                "Exportação Excel/PDF",
            ],
            cta: "Escolher Plano",
            highlighted: true,
        },
        {
            name: "Enterprise",
            price: "Sob consulta",
            currency: "",
            desc: "Para redes e instituições",
            features: [
                "Multi-filiais",
                "API de integração",
                "Gestor de conta",
                "Personalização total",
            ],
            cta: "Contactar Vendas",
            highlighted: false,
        },
    ];

    const stats = [
        { value: "+50", label: "Empréstimos Simulados", icon: Calculator },
        { value: "100%", label: "Foco no Mercado Africano", icon: Globe },
        { value: "0", label: "Erros de Cálculo", icon: ShieldCheck },
        { value: "24/7", label: "Controle Total", icon: Zap },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600/10 selection:text-blue-600 overflow-x-hidden">

            {/* Floating CTA */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: showFloatingCTA ? 1 : 0, y: showFloatingCTA ? 0 : 100 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-2 rounded-full shadow-2xl flex items-center justify-between pl-6 text-sm">
                    <span className="font-bold text-slate-700 hidden sm:block">Não perca mais dinheiro</span>
                    <Link href="/auth/signup">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full px-6 shadow-lg shadow-emerald-500/20">
                            Organizar meu crédito agora
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Navigation */}
            <header className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                scrolled ? "bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm" : "bg-transparent py-6"
            )}>
                <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            Gestão<span className="text-blue-600">Flex</span>
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {[
                            { label: "O Problema", href: "#problema" },
                            { label: "Solução", href: "#solucao" },
                            { label: "Benefícios", href: "#beneficios" },
                            { label: "Segurança", href: "#seguranca" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-sm font-bold text-slate-600 hover:bg-slate-100 px-4 h-11 rounded-xl">
                                Entrar
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-blue-600/20 transition-all">
                                Criar Conta Grátis
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                {/* 1. HERO SECTION */}
                <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
                    {/* Professional Radial Gradients */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[1000px] h-[1000px] bg-blue-50/50 rounded-full blur-[140px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[800px] h-[800px] bg-emerald-50/30 rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-[1400px] mx-auto space-y-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-3 px-5 py-2 bg-slate-50 border border-slate-200/60 rounded-full text-[12px] font-bold text-blue-600 uppercase tracking-[0.2em] shadow-sm"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                Sistema Premium para Microcrédito
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.8 }}
                                className="space-y-8"
                            >
                                <h1 className="text-6xl md:text-8xl font-[800] text-slate-900 tracking-tight leading-[0.9]">
                                    Pare de perder dinheiro com <span className="text-blue-600">inadimplência</span>
                                </h1>
                                <p className="text-xl md:text-2xl font-medium text-slate-500 tracking-tight max-w-5xl mx-auto leading-normal">
                                    Diga adeus aos cadernos e planilhas confusas. O GestãoFlex automatiza sua cobrança e organiza seus lucros em um sistema profissional e moderno.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <Link href="/auth/signup">
                                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-16 px-10 text-lg rounded-xl shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 group w-full sm:w-auto">
                                        Começar grátis agora
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="#demonstracao">
                                    <Button size="lg" variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-16 px-10 text-lg rounded-xl shadow-sm transition-all w-full sm:w-auto">
                                        Ver como funciona
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Hero Mockup with improved depth */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            className="mt-24 relative max-w-6xl mx-auto"
                        >
                            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full -z-10 scale-110" />
                            <img
                                src="/premium-mockup.png"
                                alt="GestãoFlex Dashboard"
                                className="w-full h-auto drop-shadow-[0_32px_64px_rgba(0,0,0,0.12)] rounded-[2rem] border border-white/40 ring-1 ring-slate-200/50"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* 2. PROBLEMA */}
                <section id="problema" className="py-24 bg-slate-50/50 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <FadeIn className="space-y-6">
                                <div className="h-1 w-12 bg-rose-500 rounded-full" />
                                <h2 className="text-4xl md:text-5xl font-[800] text-slate-900 tracking-tight leading-tight">
                                    Crescer sem controle <br />
                                    <span className="text-rose-600">é o caminho para o prejuízo.</span>
                                </h2>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-slate-200 pl-6">
                                    "No final do mês você sente que trabalhou muito, mas o lucro parece ter sumido entre folhas e anotações."
                                </p>
                            </FadeIn>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: "Inadimplência Oculta", desc: "Você demora dias para perceber que alguém não pagou.", icon: Clock },
                                    { title: "ERROS DE CÁLCULO", desc: "Centavos e juros que você perde por falhas manuais.", icon: Calculator },
                                    { title: "REGISTROS FRÁGEIS", desc: "Papéis perdem-se, planilhas corrompem-se e você fica cego.", icon: FileText },
                                    { title: "ZERO ESCALA", desc: "O seu tempo é consumido por tarefas burocráticas.", icon: ShieldAlert },
                                ].map((pain, i) => (
                                    <FadeIn key={i} delay={i * 100}>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 space-y-3 shadow-sm hover:shadow-md transition-all group">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                                                <pain.icon className="h-5 w-5" />
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">{pain.title}</h4>
                                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">{pain.desc}</p>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. SOLUÇÃO */}
                <section id="solucao" className="py-24 bg-white px-6">
                    <div className="max-w-5xl mx-auto text-center space-y-10">
                        <FadeIn className="space-y-4">
                            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em]">Gestão Sem Stress</h2>
                            <h3 className="text-4xl md:text-6xl font-[800] text-slate-900 tracking-tight leading-[1.1]">
                                Deixe o sistema <span className="text-blue-600">fazer o trabalho duro.</span>
                            </h3>
                            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                                O GestãoFlex automatiza toda a burocracia do seu microcrédito para que você foque apenas no que importa: <span className="text-slate-900 font-bold">fazer seu negócio crescer.</span>
                            </p>
                        </FadeIn>
                        
                        <FadeIn delay={200}>
                            <div className="relative group max-w-4xl mx-auto">
                                <div className="absolute inset-0 bg-blue-600/5 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                <img
                                    src="/mockup-tablet-evolution.png"
                                    alt="Interface GestãoFlex"
                                    className="w-full h-auto rounded-2xl border border-slate-100 shadow-xl relative z-10 transition-transform group-hover:scale-[1.01]"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* 4. BENEFÍCIOS (Bento Box Layout) */}
                <section id="beneficios" className="py-24 bg-slate-50/50 relative overflow-hidden px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <FadeIn className="space-y-4 max-w-2xl">
                                <div className="h-1 w-12 bg-emerald-500 rounded-full" />
                                <h2 className="text-4xl md:text-5xl font-[800] text-slate-900 tracking-tight leading-none">
                                    Resultados que você vê <br />
                                    <span className="text-emerald-600">no seu saldo bancário.</span>
                                </h2>
                            </FadeIn>
                            <FadeIn delay={100}>
                                <p className="text-lg text-slate-500 font-medium max-w-xs">
                                    Menos tempo cobrando, mais tempo lucrando.
                                </p>
                            </FadeIn>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
                            {/* Feature 1: Large Bento Card */}
                            <FadeIn className="md:col-span-2 md:row-span-2">
                                <div className="h-full bg-white p-10 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="space-y-4">
                                            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <TrendingUp className="h-7 w-7" />
                                            </div>
                                            <h4 className="text-3xl font-[800] text-slate-900 tracking-tight">Cobrança Automática</h4>
                                            <p className="text-lg text-slate-500 font-medium max-w-md">
                                                O sistema envia lembretes por WhatsApp sem que você precise mover um dedo. Reduza a inadimplência em até 40% já no primeiro mês.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 pt-6">
                                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider">Aumente o Lucro</span>
                                            <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">Zero Esforço</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-10 -right-20 w-80 h-80 bg-emerald-50 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-100/50 transition-all" />
                                </div>
                            </FadeIn>

                            {/* Feature 2: Square Bento Card */}
                            <FadeIn delay={100} className="md:col-span-1 md:row-span-1">
                                <div className="h-full bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 flex flex-col justify-between group">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold text-white">100% Seguro</h4>
                                        <p className="text-slate-400 text-sm font-medium">Dados criptografados e backup automático diário.</p>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Feature 3: Square Bento Card */}
                            <FadeIn delay={200} className="md:col-span-1 md:row-span-1">
                                <div className="h-full bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold text-slate-900">Na palma da mão</h4>
                                        <p className="text-slate-500 text-sm font-medium">Acesse tudo pelo celular de onde estiver. Sem aplicativos pesados.</p>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Feature 4: Wide Bento Card */}
                            <FadeIn delay={300} className="md:col-span-3 md:row-span-1">
                                <div className="h-full bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center gap-10">
                                    <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                        <Users className="h-10 w-10" />
                                    </div>
                                    <div className="space-y-2 text-center md:text-left flex-grow">
                                        <h4 className="text-2xl font-[800] text-slate-900 tracking-tight leading-none">Saiba exatamente quem deve e quanto deve</h4>
                                        <p className="text-slate-500 font-medium">Histórico completo de cada cliente em segundos. Chega de perguntar "quanto falta mesmo?".</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Button className="bg-slate-900 text-white rounded-xl px-8 h-12 font-bold transition-all hover:bg-slate-800">
                                            Ver Clientes
                                        </Button>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 5. FUNCIONALIDADES (Refined Grid) */}
                <section className="py-24 bg-white px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-12">
                                <FadeIn className="space-y-4">
                                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Funcionalidades</h2>
                                    <h3 className="text-4xl md:text-5xl font-[800] text-slate-900 tracking-tight leading-tight">Simplicidade <span className="text-blue-600">que gera escala.</span></h3>
                                    <p className="text-lg text-slate-500 font-medium max-w-lg">
                                        Tudo o que você precisa para gerenciar sua carteira de crédito sem complicações técnicas.
                                    </p>
                                </FadeIn>

                                <div className="grid sm:grid-cols-1 gap-6">
                                    {[
                                        { title: "Gestão de Contratos", desc: "Criação rápida com taxas e juros personalizados.", icon: FileText },
                                        { title: "Acompanhamento em Tempo Real", desc: "Dashboard com indicadores de saúde financeira.", icon: LineChart },
                                        { title: "Relatórios de Performance", desc: "Saiba quanto lucrou e quanto tem a receber em um clique.", icon: BarChart3 },
                                    ].map((feat, i) => (
                                        <FadeIn key={i} delay={i * 100} className="group flex items-start gap-6 p-6 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex flex-shrink-0 items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <feat.icon className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-bold text-slate-900">{feat.title}</h4>
                                                <p className="text-slate-500 text-sm font-medium">{feat.desc}</p>
                                            </div>
                                        </FadeIn>
                                    ))}
                                </div>
                            </div>

                            <FadeIn delay={200} className="relative">
                                <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60" />
                                <div className="p-4 bg-slate-100/50 rounded-[2.5rem] border border-slate-200/50 backdrop-blur-sm shadow-2xl">
                                    <img
                                        src="/mockup-laptop-loan.png"
                                        alt="Funcionalidades GestãoFlex"
                                        className="w-full h-auto rounded-[2rem] shadow-sm"
                                    />
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 6. PROVA / AUTORIDADE (Premium Widgets) */}
                <section className="py-24 bg-slate-900 text-white px-6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)]" />
                    <div className="max-w-7xl mx-auto space-y-20 relative z-10">
                        <FadeIn className="text-center max-w-2xl mx-auto space-y-4">
                            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em]">Confiança & Resultados</h2>
                            <h3 className="text-4xl md:text-5xl font-[800] tracking-tight leading-tight">
                                Desenvolvido para a realidade do <span className="text-blue-400">mercado local.</span>
                            </h3>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold text-blue-300">
                                    +50 empréstimos simulados
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold text-blue-300">
                                    Suporte local dedicado
                                </div>
                            </div>
                        </FadeIn>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    quote: "O GestãoFlex é robusto mas simples. Reduzi minha inadimplência pela metade e hoje durmo tranquilo sabendo que meus dados estão seguros.",
                                    name: "João Silva",
                                    role: "Agente de Crédito",
                                    image: "/testimonials/joao.png",
                                },
                                {
                                    quote: "Migrar do Excel para cá foi a melhor decisão do ano. Meus clientes recebem lembretes e eu recebo os pagamentos em dia.",
                                    name: "Maria Santos",
                                    role: "Gestora Financeira",
                                    image: "/testimonials/maria.png",
                                },
                                {
                                    quote: "Interface rápida e intuitiva. Treinei minha equipe em 20 minutos. Os relatórios são exatamente o que eu precisava.",
                                    name: "António Costa",
                                    role: "Empreendedor",
                                    image: "/testimonials/antonio.png",
                                },
                            ].map((t, i) => (
                                <FadeIn key={i} delay={i * 100}>
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 flex flex-col h-full hover:bg-white/10 transition-all group">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(j => <Star key={j} className="h-4 w-4 fill-blue-400 text-blue-400" />)}
                                        </div>
                                        <p className="text-lg text-slate-300 font-medium leading-relaxed italic">&quot;{t.quote}&quot;</p>
                                        <div className="flex items-center gap-4 pt-6 mt-auto border-t border-white/5">
                                            <div className="h-14 w-14 rounded-full border-2 border-blue-400 p-1 flex-shrink-0">
                                                <img src={t.image} alt={t.name} className="h-full w-full rounded-full object-cover shadow-inner" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-none">{t.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. DEMONSTRAÇÃO (Browser Mockup Refined) */}
                <section id="demonstracao" className="py-24 bg-white px-6">
                    <div className="max-w-7xl mx-auto text-center space-y-12">
                        <FadeIn className="space-y-4">
                            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Interface</h2>
                            <h3 className="text-4xl md:text-5xl font-[800] text-slate-900 tracking-tight leading-tight">Simples como deve ser.</h3>
                        </FadeIn>
                        
                        <FadeIn delay={200} className="relative group max-w-5xl mx-auto">
                            <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full scale-110 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-2xl bg-slate-50 p-2">
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                    <img 
                                        src="/mockup-full-dashboard-wide.png" 
                                        alt="Dashboard do Sistema"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* 8. OFERTA & 9. URGÊNCIA */}
                {/* 8. OFERTA & 9. URGÊNCIA (High-Impact Card) */}
                <section id="oferta" className="py-24 bg-slate-50/50 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-slate-900 rounded-[3.5rem] p-10 lg:p-20 text-white relative overflow-hidden shadow-2xl border border-white/5">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                            
                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-8 text-left">
                                    <FadeIn className="space-y-4">
                                        <div className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-300">
                                            Oferta de Lançamento
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-[800] tracking-tight leading-tight">
                                            Teste grátis por <span className="text-blue-400">45 dias.</span>
                                        </h2>
                                        <p className="text-lg text-slate-400 font-medium">
                                            Sem compromisso, sem cartão de crédito. <br />
                                            Cancele quando quiser se não estiver satisfeito.
                                        </p>
                                    </FadeIn>
                                    <ul className="space-y-4">
                                        {[
                                            "Acesso total a todas as funcionalidades",
                                            "Suporte prioritário via WhatsApp",
                                            "Treinamento personalizado grátis",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                                                <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-10 rounded-3xl space-y-8 backdrop-blur-md">
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Plano Mensal</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-[800]">Grátis</span>
                                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">por 45 dias</span>
                                        </div>
                                        <p className="text-rose-400 text-xs font-bold pt-2 uppercase tracking-wide flex items-center gap-2">
                                            <TriangleAlert className="h-3 w-3" />
                                            Cada dia sem controle é dinheiro perdido.
                                        </p>
                                    </div>
                                    <Link href="/auth/signup">
                                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-500/20 text-lg transition-all active:scale-95">
                                            Criar minha conta agora
                                        </Button>
                                    </Link>
                                    <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        Não requer cartão de crédito
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 10. SEGURANÇA (Refined Widgets) */}
                <section id="seguranca" className="py-24 bg-white px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <FadeIn className="space-y-8">
                                <div className="h-1 w-12 bg-blue-600 rounded-full" />
                                <h2 className="text-4xl md:text-5xl font-[800] text-slate-900 tracking-tight leading-tight">
                                    Segurança de <span className="text-blue-600">nível bancário.</span>
                                </h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                                    Sua empresa não pode parar. Por isso, protegemos seus dados com a tecnologia mais avançada do mercado.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                    {[
                                        { title: "Criptografia SSL", desc: "Segurança ponta a ponta.", icon: ShieldCheck },
                                        { title: "Backups Automáticos", desc: "Seus dados sempre salvos.", icon: Cloud },
                                        { title: "Redundância Total", desc: "Sistema sempre online.", icon: RefreshCw },
                                        { title: "Privacidade Garantida", desc: "Isolamento total de dados.", icon: Lock },
                                    ].map((s, i) => (
                                        <div key={i} className="group flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <s.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-tight">{s.title}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={200} className="relative">
                                <div className="absolute -inset-4 bg-slate-900 rounded-[2.5rem] rotate-2" />
                                <div className="relative bg-slate-900 rounded-[2.5rem] p-10 lg:p-16 text-white space-y-8 overflow-hidden border border-white/5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                                    <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                                        <ShieldCheck className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-6">
                                        <p className="text-2xl md:text-3xl font-[800] tracking-tight leading-tight">
                                            "Segurança não é opcional. Aplicamos padrões globais para que você foque apenas no seu lucro."
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] pt-6 border-t border-white/10">
                                            <Lock className="h-3 w-3" />
                                            ISO 27001 Compliant Infrastructure
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 11. FAQ (Modern Accordion Widgets) */}
                <section id="faq" className="py-24 bg-white px-6">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <FadeIn className="text-center space-y-4">
                            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em]">Perguntas Frequentes</h2>
                            <h3 className="text-4xl md:text-5xl font-[800] text-slate-900 tracking-tight">Tire suas dúvidas.</h3>
                        </FadeIn>
                        <div className="grid gap-3">
                            {faqItems.map((item, i) => (
                                <FadeIn key={i} delay={i * 50}>
                                    <div className={cn("rounded-2xl border transition-all duration-300", activeFaq === i ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200")}>
                                        <button
                                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-6 text-left"
                                        >
                                            <span className="text-lg font-bold text-slate-900 pr-8">{item.q}</span>
                                            <div className={cn("h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 transition-all", activeFaq === i && "rotate-180 bg-blue-600 text-white shadow-md shadow-blue-600/20")}>
                                                <ChevronDown className="h-4 w-4" />
                                            </div>
                                        </button>
                                        <div className={cn("overflow-hidden transition-all duration-300", activeFaq === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0")}>
                                            <div className="p-6 pt-0 text-slate-500 font-medium text-base leading-relaxed">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 12. CTA FINAL (High Impact) */}
                <section className="py-24 bg-white px-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
                    <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
                        <FadeIn className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-[800] text-slate-900 tracking-tight leading-[1.1]">
                                Recupere seu tempo. <br />
                                <span className="text-blue-600">Multiplique seu lucro.</span>
                            </h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">
                                "O melhor momento para organizar seu negócio era ontem. O segundo melhor é agora."
                            </p>
                        </FadeIn>
                        
                        <FadeIn delay={200} className="flex flex-col items-center gap-6">
                            <Link href="/auth/signup">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-16 px-10 text-xl rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                                    Começar agora gratuitamente
                                </Button>
                            </Link>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                Junte-se a dezenas de gestores de sucesso
                            </p>
                        </FadeIn>
                    </div>
                </section>
            </main>

            {/* FOOTER (Professional & Clean) */}
            <footer className="bg-slate-950 text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                    <Zap className="h-6 w-6 fill-white" />
                                </div>
                                <span className="text-xl font-[800] tracking-tight">Gestão <span className="text-blue-500">Flex</span></span>
                            </div>
                            <p className="text-slate-500 font-medium max-w-sm text-sm">
                                Transformando a gestão de microcrédito com tecnologia acessível, segura e focada em resultados reais.
                            </p>
                            <div className="flex gap-4 pt-2">
                                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-blue-600/20 transition-all cursor-pointer">
                                    <Phone className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-blue-600/20 transition-all cursor-pointer">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Produto</h4>
                            <ul className="space-y-2 text-sm text-slate-400 font-medium">
                                <li><Link href="#beneficios" className="hover:text-white transition-colors">Benefícios</Link></li>
                                <li><Link href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                                <li><Link href="#seguranca" className="hover:text-white transition-colors">Segurança</Link></li>
                            </ul>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Links Úteis</h4>
                            <ul className="space-y-2 text-sm text-slate-400 font-medium">
                                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link href="#oferta" className="hover:text-white transition-colors">Preços</Link></li>
                                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Teste Grátis</Link></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <p>© {new Date().getFullYear()} GestãoFlex. Todos os direitos reservados.</p>
                        <div className="flex gap-6">
                            <span>Sistemas Financeiros Inteligentes</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
