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
    Play,
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
                "Suporte prioritário via WhatsApp",
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
                "Cálculos avançados de juros",
                "Alertas de cobrança SMS/Zap",
                "Exportação Excel/PDF",
                "Gestão de Fiadores",
            ],
            cta: "Escolher Profissional",
            highlighted: true,
        },
        {
            name: "Enterprise",
            price: "Sob consulta",
            currency: "",
            desc: "Para redes e instituições",
            features: [
                "Múltiplas filiais/agentes",
                "API de integração total",
                "Gestor de conta dedicado",
                "Personalização da marca",
                "Backup em tempo real",
            ],
            cta: "Contactar Consultor",
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
            {/* 0. HEADER (Premium Glassmorphism) */}
            <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex justify-center pointer-events-none">
                <nav className="max-w-7xl w-full flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border border-slate-200/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                <Zap className="h-6 w-6 fill-white" />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight font-sora">
                                Gestão<span className="text-blue-600">Flex</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {[
                            { label: "O Problema", href: "#problema" },
                            { label: "A Solução", href: "#solucao" },
                            { label: "Funcionalidades", href: "#funcionalidades" },
                            { label: "Segurança", href: "#seguranca" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-all uppercase tracking-[0.2em] relative group py-2"
                            >
                                {item.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-xs font-bold text-slate-500 hover:text-slate-900 px-4 h-10 rounded-xl transition-colors">
                                Entrar
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-5 h-10 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                                Criar Conta Grátis
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                {/* 1. HERO SECTION (Fintech Premium) */}
                <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
                    {/* Deep Premium Gradients */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[1200px] h-[1200px] bg-blue-50/60 rounded-full blur-[160px] pointer-events-none opacity-50" />
                    <div className="absolute top-[20%] left-0 -translate-x-1/3 w-[800px] h-[800px] bg-emerald-50/40 rounded-full blur-[140px] pointer-events-none opacity-40" />
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-[1400px] mx-auto space-y-12">
                            <FadeIn
                                className="inline-flex items-center gap-3 px-6 py-2 bg-blue-50/50 border border-blue-100 rounded-full shadow-sm mx-auto"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                <span className="text-[11px] font-black text-blue-700 uppercase tracking-[0.2em] font-sora">
                                    Trusted by +50 Financial Institutions
                                </span>
                            </FadeIn>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-10"
                            >
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-[1000] text-slate-950 tracking-[-0.04em] leading-[0.95] md:leading-[1] font-sora">
                                    Domine o seu<br />
                                    <span className="text-blue-600">microcrédito.</span>
                                </h1>
                                <p className="text-xl md:text-2xl font-medium text-slate-500 max-w-4xl mx-auto leading-relaxed font-inter">
                                    Pare de lutar com cadernos e planilhas confusas. O <span className="text-slate-950 font-black">GestãoFlex</span> é a plataforma definitiva para automatizar suas cobranças e escalar seus lucros com a **segurança que o mercado moçambicano exige.**
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col sm:flex-row gap-6 justify-center"
                            >
                                <Link href="/auth/signup">
                                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-[1000] h-20 px-12 text-xl rounded-2xl shadow-[0_20px_40px_-12px_rgba(249,115,22,0.4)] transition-all hover:scale-[1.03] active:scale-95 group w-full sm:w-auto font-sora tracking-tight">
                                        Começar grátis agora
                                        <ArrowRight className="ml-2 h-7 w-7 transition-transform group-hover:translate-x-2" />
                                    </Button>
                                </Link>
                                <Link href="#demonstracao">
                                    <Button size="lg" variant="outline" className="bg-white border-slate-200 text-slate-900 font-[1000] h-20 px-12 text-xl rounded-2xl shadow-sm hover:bg-slate-50 transition-all w-full sm:w-auto font-sora tracking-tight border-2">
                                        Ver como funciona
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Ultra-High Fidelity Hybrid Multi-Device Mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            className="mt-20 relative max-w-[1400px] mx-auto px-4 perspective-[2000px]"
                        >
                            <div className="relative flex items-center justify-center min-h-[500px] lg:min-h-[750px] pt-12 select-none pointer-events-none">
                                
                                {/* 1. iMac Studio Display (The Foundation - Center) */}
                                <div className="relative z-10 w-full lg:w-[85%] mx-auto transform-gpu transition-all duration-700">
                                    <div className="relative rounded-[2.5rem] p-2.5 bg-gradient-to-br from-slate-200 to-slate-400 border border-slate-500/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                                        {/* Monitor Bezel */}
                                        <div className="rounded-[2.1rem] overflow-hidden border-[12px] border-slate-900 bg-black shadow-inner relative">
                                            {/* Screen/Screenshot Interior */}
                                            <div className="aspect-[16/9] w-full overflow-hidden relative">
                                                <img
                                                    src="/mockups/dashboard-sharp.png"
                                                    alt="GestãoFlex Desktop Dashboard Sharp"
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Realistic Screen Glare */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* iMac Stand */}
                                    <div className="absolute bottom-[-45px] left-1/2 -translate-x-1/2 w-[22%] h-[40px] bg-gradient-to-b from-slate-400 to-slate-500 rounded-b-xl border-x border-b border-slate-500/30 -z-10" />
                                    <div className="absolute bottom-[-55px] left-1/2 -translate-x-1/2 w-[60%] h-8 bg-black/30 blur-3xl -z-20" />
                                </div>

                                {/* 2. iPad Pro Mockup (Floating Right-Bottom) */}
                                <motion.div 
                                    initial={{ x: 100, opacity: 0, rotateY: -10 }}
                                    whileInView={{ x: 0, opacity: 1, rotateY: -6 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className="absolute -right-4 lg:right-[-2%] bottom-[12%] z-20 w-[42%] lg:w-[35%] hidden md:block"
                                >
                                    <div className="relative rounded-[2.2rem] p-1.5 bg-slate-900 border-[8px] border-slate-800 shadow-[20px_40px_80px_rgba(0,0,0,0.5)] aspect-[4/3] transform-gpu">
                                        <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-slate-950 border border-white/5 relative">
                                            {/* Camera Module */}
                                            <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-16 h-1.5 bg-black rounded-b-full z-10" />
                                            <img
                                                src="/mockups/tablet-sharp.png"
                                                alt="GestãoFlex Tablet View"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Top Polish Gloss */}
                                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 3. iPhone 15 Pro (Top Layer - Far Right) */}
                                <motion.div 
                                    initial={{ x: 150, opacity: 0, rotateY: -15 }}
                                    whileInView={{ x: 0, opacity: 1, rotateY: -10 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                    className="absolute right-[-20px] lg:right-[-6%] bottom-[-10%] z-30 w-[22%] lg:w-[17%] hidden lg:block"
                                >
                                    <div className="relative rounded-[3.2rem] p-2 bg-slate-800 border-[8px] border-slate-700 shadow-[30px_60px_100px_rgba(0,0,0,0.7)] aspect-[9/19.5] transform-gpu">
                                        {/* Physical Buttons */}
                                        <div className="absolute left-[-11px] top-24 w-[3.5px] h-10 bg-slate-700 rounded-l-md" />
                                        <div className="absolute left-[-11px] top-40 w-[3.5px] h-14 bg-slate-700 rounded-l-md" />
                                        <div className="absolute left-[-11px] top-56 w-[3.5px] h-14 bg-slate-700 rounded-l-md" />
                                        <div className="absolute right-[-11px] top-44 w-[4px] h-20 bg-slate-700 rounded-r-md" />

                                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-200 relative">
                                            {/* Dynamic Island */}
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[38%] h-7 bg-black rounded-full z-[100] flex items-center justify-center">
                                                <div className="h-1 w-1 bg-blue-500/30 rounded-full blur-[0.5px] ml-auto mr-4" />
                                            </div>

                                            {/* LIVE DASHBOARD SIMULATION (100% Crisp Level) */}
                                            <div className="w-full h-full flex flex-col pt-8 px-4 gap-4 bg-white overflow-hidden pointer-events-none">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] text-white font-black">G</div>
                                                        <span className="text-[12px] font-black text-slate-800">Gestão<span className="text-blue-600">Flex</span></span>
                                                    </div>
                                                    <div className="h-2.5 w-8 bg-slate-100 rounded-full" />
                                                </div>

                                                <div className="space-y-0.5 mt-2">
                                                    <h3 className="text-sm font-black text-slate-800">Bem-vindo, litos 👋</h3>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Controle Financeiro</p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-2">
                                                        <div className="h-8 w-8 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                            <TrendingUp className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[7px] font-black text-slate-400 uppercase">Receita Total</p>
                                                            <p className="text-base font-black text-slate-900 leading-none">MZN 1.1M</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-2">
                                                        <div className="h-8 w-8 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                                            <ShieldAlert className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[7px] font-black text-slate-400 uppercase">Inadimplência</p>
                                                            <p className="text-base font-black text-slate-900 leading-none">05.2%</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pb-10">
                                                    <div className="bg-blue-600 w-full py-4 rounded-2xl shadow-lg shadow-blue-600/30 text-center">
                                                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Baixar Relatórios</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Top Polish Reflection */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Premium Trust Badge */}
                                <div className="absolute -top-12 -left-8 bg-white/95 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_48px_96px_rgba(0,0,0,0.2)] border border-slate-100/50 hidden xl:block z-40 transform -rotate-2 hover:rotate-0 transition-all duration-700 cursor-default">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                            <ShieldCheck className="h-10 w-10 stroke-[1.5]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Segurança Total</p>
                                            <p className="text-3xl font-[1000] text-slate-900 tracking-tighter">BANCÁRIA</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. PROBLEMA (Narrative Overhaul) */}
                <section id="problema" className="py-32 bg-slate-950 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <FadeIn className="space-y-8">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">
                                    Cuidado com a sua Margem
                                </div>
                                <h2 className="text-5xl md:text-7xl font-[1000] text-white tracking-[-0.03em] leading-[1] font-sora">
                                    CADERNO NÃO É <br />
                                    <span className="text-slate-500">FERRAMENTA DE GESTÃO.</span>
                                </h2>
                                <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl font-inter">
                                    Se você trabalha com crédito e ainda usa cadernos ou planilhas, a sua operação está em risco constante.
                                </p>
                                <div className="space-y-4 pt-4">
                                    {[
                                        "Inadimplência que você nem percebe",
                                        "Horas perdidas com cálculos manuais",
                                        "Erros humanos que custam caro",
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-4 text-slate-300 font-bold">
                                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>

                            <div className="grid gap-4">
                                {[
                                    { title: "Inadimplência Oculta", desc: "A cada dia que você não cobra, o risco de nunca receber sobe 15%.", icon: TriangleAlert, color: "bg-rose-500/10 text-rose-500" },
                                    { title: "Cálculos Frágeis", desc: "Planilhas corrompem. Papeis somem. Seus lucros não deveriam ser tão voláteis.", icon: Calculator, color: "bg-blue-500/10 text-blue-500" },
                                    { title: "Zero Escala", desc: "Você gasta 80% do tempo administrando e apenas 20% crescendo seu negócio.", icon: Zap, color: "bg-emerald-500/10 text-emerald-500" },
                                ].map((pain, i) => (
                                    <FadeIn key={i} delay={i * 100}>
                                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 group hover:bg-white/10 transition-all">
                                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", pain.color)}>
                                                <pain.icon className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-bold text-white tracking-tight">{pain.title}</h4>
                                                <p className="text-slate-400 font-medium leading-relaxed text-sm">{pain.desc}</p>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. SOLUÇÃO (Premium Split Layout) */}
                <section id="solucao" className="py-32 bg-white px-6">
                    <div className="max-w-7xl mx-auto space-y-24">
                        <FadeIn className="text-center space-y-6 max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">
                                A Solução Definitiva
                            </div>
                            <h3 className="text-5xl md:text-7xl font-[1000] text-slate-950 tracking-[-0.03em] leading-[1] font-sora">
                                Deixe o sistema <br />
                                <span className="text-blue-600">fazer o trabalho duro.</span>
                            </h3>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed font-inter">
                                O GestãoFlex automatiza sua operação para que você foque apenas no que importa: <span className="text-slate-950 font-black italic">fazer seu lucro crescer.</span>
                            </p>
                        </FadeIn>
                        
                        <div className="grid lg:grid-cols-2 gap-24 items-center">
                            <FadeIn delay={200} className="relative group overflow-visible">
                                <div className="absolute -inset-10 bg-blue-600/5 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity -z-10" />
                                <div className="p-4 bg-slate-950 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] transform group-hover:scale-[1.02] transition-transform duration-700 border-8 border-slate-900 relative">
                                    <img
                                        src="/mockups/tablet-sharp.png"
                                        alt="Interface de Empréstimos GestãoFlex Real"
                                        className="w-full h-auto rounded-[2.2rem] shadow-2xl"
                                    />
                                    {/* Glass Reflection Overlay */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                </div>
                                {/* Floating Metric Card */}
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -bottom-10 -right-10 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 hidden sm:block z-20"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <TrendingUp className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inadimplência</p>
                                            <p className="text-2xl font-black text-slate-950">-42.5%</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </FadeIn>

                            <FadeIn delay={100} className="space-y-10">
                                <h4 className="text-2xl font-black text-slate-950 tracking-tight font-sora">Controle total, esforço zero.</h4>
                                <div className="space-y-8">
                                    {[
                                        { title: "Registrar empréstimos em segundos", desc: "Criação rápida com taxas e juros personalizados.", icon: FileText, color: "bg-blue-500/10 text-blue-600" },
                                        { title: "Acompanhar todos os pagamentos", desc: "Baixa automática de parcelas e alertas de vencimento.", icon: RefreshCw, color: "bg-emerald-500/10 text-emerald-600" },
                                        { title: "Ver quem está em atraso", desc: "Histórico completo para evitar maus pagadores.", icon: Users, color: "bg-rose-500/10 text-rose-600" },
                                        { title: "Alertas de vencimentos", desc: "Lembretes por WhatsApp sem que você precise mover um dedo.", icon: Zap, color: "bg-orange-500/10 text-orange-600" },
                                    ].map((feat, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform", feat.color)}>
                                                <feat.icon className="h-7 w-7" />
                                            </div>
                                            <div className="space-y-1 pt-1">
                                                <h5 className="text-xl font-bold text-slate-950 tracking-tight font-sora">{feat.title}</h5>
                                                <p className="text-slate-500 font-medium text-lg leading-snug">{feat.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 4. FUNCIONALIDADES (Master Bento Grid) */}
                <section id="funcionalidades" className="py-32 bg-slate-50/50 px-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="max-w-7xl mx-auto space-y-20">
                        <FadeIn className="text-center space-y-6 max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">
                                Poder Sem Complexidade
                            </div>
                            <h3 className="text-5xl md:text-7xl font-[1000] text-slate-950 tracking-[-0.03em] leading-[1] font-sora">
                                Simplicidade que <br />
                                <span className="text-blue-600">gera escala real.</span>
                            </h3>
                            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed font-inter">
                                Tudo o que você precisa para gerenciar sua carteira de crédito sem complicações técnicas ou dashboards confusos.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
                            {/* Card 1: WhatsApp (Large 2x2) */}
                            <FadeIn className="md:col-span-2 md:row-span-2">
                                <div className="h-full bg-slate-950 p-12 rounded-[3.5rem] shadow-2xl group overflow-hidden relative flex flex-col justify-between border border-white/5">
                                    <div className="relative z-10 space-y-6">
                                        <div className="h-16 w-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <TrendingUp className="h-8 w-8" />
                                        </div>
                                        <h4 className="text-4xl font-black text-white tracking-tight leading-tight font-sora">
                                            Cobrança Automática <br />
                                            via <span className="text-emerald-500">WhatsApp.</span>
                                        </h4>
                                        <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed font-inter">
                                            Notificações automáticas de vencimento que eliminam falhas de comunicação e reduzem drasticamente a inadimplência na sua carteira.
                                        </p>
                                    </div>
                                    <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/15 transition-all" />
                                    <div className="relative z-10 flex items-center gap-4 pt-10">
                                        <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400">ROI Imediato</span>
                                        <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400">Zero Esforço</span>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Card 2: Security (Tall 1x2) */}
                            <FadeIn delay={100} className="md:col-span-1 md:row-span-2">
                                <div className="h-full bg-white p-10 rounded-[3.5rem] border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:border-blue-500/30 transition-all">
                                    <div className="space-y-6">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                            <ShieldCheck className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-950 tracking-tight font-sora">Segurança <br />Bancária.</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed font-inter">
                                            Infraestrutura de alta disponibilidade com backups em tempo real, garantindo que sua operação e dados financeiros estejam sempre protegidos.
                                        </p>
                                    </div>
                                    <div className="pt-10 border-t border-slate-100 space-y-4">
                                        <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            Cloud Real-time
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            SSL 256-bit
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Card 3: Analytics (Wide 1x1 on Large) */}
                            <FadeIn delay={200} className="md:col-span-1 md:row-span-1">
                                <div className="h-full bg-blue-600 p-8 rounded-[3.5rem] shadow-2xl flex flex-col justify-between group">
                                    <div className="h-12 w-12 rounded-xl bg-white/20 text-white flex items-center justify-center">
                                        <LineChart className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-xl font-black text-white tracking-tight font-sora leading-tight">Insight em Tempo Real.</h4>
                                </div>
                            </FadeIn>

                            {/* Card 4: Reports (Large 1x2 on right or custom) */}
                            <FadeIn delay={300} className="lg:col-span-2 lg:row-span-1">
                                <div className="h-full bg-white p-8 rounded-[3.5rem] border border-slate-200/60 shadow-sm flex items-center gap-10 group overflow-hidden">
                                    <div className="h-20 w-20 flex-shrink-0 rounded-[2rem] bg-slate-950 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                        <BarChart3 className="h-10 w-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-slate-950 tracking-tight font-sora">Relatórios Prontos.</h4>
                                        <p className="text-slate-500 font-medium font-inter">Saiba quanto lucrou com apenas um clique.</p>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Card 5: Mobile (Wide bottom) */}
                            <FadeIn delay={400} className="md:col-span-3 lg:col-span-1 lg:row-span-1">
                                <div className="h-full bg-orange-500 rounded-[3.5rem] shadow-2xl shadow-orange-500/20 flex flex-col justify-center items-center text-center group overflow-hidden relative">
                                    <img 
                                        src="/mockups/mobile-hand-mockup.png" 
                                        alt="Sistema na palma da mão" 
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600/80 to-transparent" />
                                    <div className="relative z-10 p-10">
                                        <Smartphone className="h-12 w-12 text-white mb-4 mx-auto transform group-hover:-rotate-12 transition-transform" />
                                        <h4 className="text-2xl font-black text-white tracking-tight font-sora">Na Palma da Mão.</h4>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 5. DEPOIMENTOS (Wall of Love) */}
                <section id="beneficios" className="py-32 bg-white px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto space-y-24 relative z-10">
                        <FadeIn className="text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">
                                Feedback Real
                            </div>
                            <h3 className="text-5xl md:text-7xl font-[1000] text-slate-950 tracking-[-0.03em] font-sora leading-[1]">
                                O mercado já <br />
                                <span className="text-blue-600">está mudando.</span>
                            </h3>
                            <p className="text-xl text-slate-500 font-medium font-inter">
                                Junte-se a dezenas de empreendedores que profissionalizaram sua gestão.
                            </p>
                        </FadeIn>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    quote: "Antes do GestãoFlex, eu perdia horas conferindo comprovantes do M-Pesa. Agora, as parcelas caem e o sistema já me avisa quem pagou. Minha carteira de 20 clientes virou 60 sem eu perder o controle.",
                                    name: "Litos Tembe",
                                    role: "Agente de Microcrédito - Maputo",
                                    image: "/testimonials/joao.png",
                                },
                                {
                                    quote: "O que eu mais gosto é a cobrança automática no WhatsApp. Mandar lembrete um por um era um sofrimento. Hoje o sistema faz o trabalho pesado e eu foco em analisar novos empréstimos com segurança.",
                                    name: "Zaida Mucavele",
                                    role: "Gestora Financeira - Beira",
                                    image: "/testimonials/maria.png",
                                },
                                {
                                    quote: "Trabalho com crédito há 10 anos e nunca vi algo tão adaptado à nossa realidade. O relatório de inadimplência é cirúrgico. Consigo ver onde meu capital está preso e agir antes do prejuízo.",
                                    name: "Arlindo Mondlane",
                                    role: "Consultor de Negócios - Nampula",
                                    image: "/testimonials/antonio.png",
                                },
                            ].map((t, i) => (
                                <FadeIn key={i} delay={i * 100}>
                                    <div className="bg-slate-50 p-10 rounded-[3rem] space-y-8 flex flex-col h-full hover:shadow-2xl hover:shadow-blue-900/5 transition-all group border border-slate-100">
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map(j => <Star key={j} className="h-5 w-5 fill-orange-400 text-orange-400" />)}
                                        </div>
                                        <p className="text-xl text-slate-600 font-medium leading-relaxed italic font-inter">&quot;{t.quote}&quot;</p>
                                        <div className="flex items-center gap-5 pt-8 mt-auto border-t border-slate-200/60">
                                            <div className="h-16 w-16 rounded-3xl border-2 border-white overflow-hidden shadow-lg flex-shrink-0">
                                                <img src={t.image} alt={t.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-950 text-lg leading-none font-sora tracking-tight">{t.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{t.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. DEMONSTRAÇÃO (Studio Aesthetic) */}
                <section id="demonstracao" className="py-32 bg-slate-950 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)] opacity-50" />
                    <div className="max-w-7xl mx-auto space-y-24 relative z-10">
                        <FadeIn className="text-center space-y-6 max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">
                                Demo Interativa
                            </div>
                            <h3 className="text-5xl md:text-7xl font-[1000] text-white tracking-[-0.03em] font-sora leading-[1]">
                                Veja o sistema <br />
                                <span className="text-slate-500">em ação real.</span>
                            </h3>
                            <p className="text-xl text-slate-400 font-medium font-inter">Interface simples, rápida e fácil de usar. (Clique para assistir)</p>
                        </FadeIn>
                        
                        <FadeIn delay={200} className="relative group max-w-6xl mx-auto lg:perspective-[2000px]">
                            <div className="absolute -inset-10 bg-blue-600/10 blur-[120px] rounded-full scale-110 opacity-30 group-hover:opacity-60 transition-opacity" />
                            <div className="relative rounded-[3rem] border-x-[12px] border-t-[12px] border-b-[40px] border-slate-900 overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.8)] bg-slate-950 aspect-video flex items-center justify-center cursor-pointer transform group-hover:rotate-x-2 transition-transform duration-1000">
                                {/* Video Placeholder Content */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 group-hover:scale-105 transition-transform duration-1000" />
                                <img
                                    src="/mockups/video-poster.png"
                                    alt="Demonstração GestãoFlex"
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-700"
                                />
                                <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
                                    <div className="h-28 w-28 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.6)] transform group-hover:scale-125 transition-transform duration-500">
                                        <Play className="h-12 w-12 fill-current ml-2" />
                                    </div>
                                    <p className="text-white font-black uppercase tracking-[0.4em] text-sm bg-black/60 px-8 py-3 rounded-2xl backdrop-blur-md border border-white/10 group-hover:bg-blue-600 transition-colors">
                                        Assistir Demonstração
                                    </p>
                                </div>
                                {/* Hardware Detail */}
                                <div className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-800 rounded-full opacity-50" />
                            </div>
                        </FadeIn>

                        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto pt-16">
                            {[
                                { title: "Interface Intuitiva", desc: "Desenvolvida para ser simples, mesmo para quem não entende de tecnologia.", icon: MonitorSmartphone, color: "bg-blue-500/10 text-blue-500" },
                                { title: "Multi-Dispositivo", desc: "Acesse pelo telemóvel, tablet ou computador, de onde estiver.", icon: Smartphone, color: "bg-emerald-500/10 text-emerald-500" },
                                { title: "Exportação Pro", desc: "PDFs prontos para imprimir ou enviar aos seus clientes em um clique.", icon: FileText, color: "bg-orange-500/10 text-orange-500" },
                            ].map((item, i) => (
                                <FadeIn key={i} delay={i * 100}>
                                    <div className="space-y-6 text-center md:text-left group">
                                        <div className={cn("h-16 w-16 mx-auto md:mx-0 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", item.color)}>
                                            <item.icon className="h-8 w-8" />
                                        </div>
                                        <h4 className="text-2xl font-black text-white tracking-tight font-sora">{item.title}</h4>
                                        <p className="text-slate-400 font-medium leading-relaxed font-inter">{item.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. OFERTA (Stripe-Grade Pricing) */}
                <section id="oferta" className="py-32 bg-slate-50/50 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-slate-950 rounded-[4rem] p-10 lg:p-24 text-white relative overflow-hidden shadow-2xl border border-white/5">
                            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2" />
                            
                            <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                                <div className="space-y-10 text-left">
                                    <FadeIn className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 font-inter">
                                            Acesso Imediato
                                        </div>
                                        <h2 className="text-5xl md:text-8xl font-[1000] tracking-[-0.04em] leading-[1] font-sora">
                                            Recupere o <br />
                                            <span className="text-blue-500">seu controle.</span>
                                        </h2>
                                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed font-inter">
                                            Comece hoje sem riscos. Teste todas as funcionalidades por <span className="text-white font-black underline decoration-blue-500 underline-offset-8">45 dias totalmente grátis.</span>
                                        </p>
                                    </FadeIn>
                                    <div className="space-y-6 pt-4">
                                        {[
                                            "Acesso total a todas as funcionalidades",
                                            "Suporte prioritário via WhatsApp",
                                            "Treinamento personalizado grátis",
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-5 text-slate-300 font-bold font-inter group">
                                                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-transform">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <FadeIn delay={200} className="bg-white p-12 rounded-[3.5rem] space-y-10 shadow-3xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] font-inter">Promoção Ativa</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] font-inter">Acesso Vitalício + Free Trial</p>
                                            <div className="flex items-baseline gap-4 pt-2">
                                                <span className="text-9xl font-[1000] text-slate-950 tracking-tighter leading-none font-sora">ZERO</span>
                                                <span className="text-slate-400 font-black uppercase text-xl tracking-widest bg-slate-100 px-5 py-2 rounded-2xl font-inter">MT</span>
                                            </div>
                                        </div>
                                        <p className="text-rose-500 text-sm font-black pt-4 uppercase tracking-[0.2em] flex items-center gap-3 bg-rose-500/5 p-5 rounded-[2rem] border border-rose-500/10 font-sora">
                                            <TriangleAlert className="h-5 w-5" />
                                            Vagas limitadas para lançamento.
                                        </p>
                                    </div>
                                    <Link href="/auth/signup">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-24 rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(37,99,235,0.4)] text-2xl transition-all active:scale-95 font-sora tracking-tight">
                                            Criar Conta Grátis
                                            <ArrowRight className="ml-3 h-8 w-8" />
                                        </Button>
                                    </Link>
                                    <p className="text-center text-slate-400 text-[10px] font-black font-inter tracking-widest uppercase">
                                        Sem cartão necessário • Cancele quando quiser
                                    </p>
                                </FadeIn>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. SEGURANÇA (Industrial Trust) */}
                <section id="seguranca" className="py-32 bg-white px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-24 items-center">
                            <FadeIn className="space-y-10">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 font-inter">
                                        Industrial Strength
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-[1000] text-slate-950 tracking-[-0.03em] font-sora leading-[1]">
                                        Segurança de <br />
                                        <span className="text-blue-600">nível bancário.</span>
                                    </h2>
                                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg font-inter">
                                        Sua empresa não pode parar. Protegemos seus lucros com os mesmos padrões de segurança das maiores fintechs globais.
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-8 pt-4">
                                    {[
                                        { title: "Criptografia SSL", desc: "Segurança ponta a ponta.", icon: ShieldCheck },
                                        { title: "Backups 24/7", desc: "Seus dados sempre salvos.", icon: Cloud },
                                        { title: "Redundância", desc: "Sistema sempre online.", icon: RefreshCw },
                                        { title: "Privacidade", desc: "Isolamento total de dados.", icon: Lock },
                                    ].map((s, i) => (
                                        <div key={i} className="group flex items-start gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                <s.icon className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-950 leading-tight font-sora tracking-tight uppercase text-sm">{s.title}</p>
                                                <p className="text-xs font-bold text-slate-400 tracking-wide font-inter">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={200} className="relative group">
                                <div className="absolute -inset-6 bg-slate-950 rounded-[4rem] group-hover:rotate-1 transition-transform duration-1000" />
                                <div className="relative bg-slate-950 rounded-[3.5rem] p-12 lg:p-20 text-white space-y-10 overflow-hidden border border-white/5 shadow-3xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                                    <div className="h-20 w-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transform group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="h-10 w-10" />
                                    </div>
                                    <div className="space-y-8">
                                        <p className="text-3xl md:text-4xl font-[1000] tracking-tight leading-tight font-sora italic">
                                            "Segurança não é opcional. Aplicamos padrões globais para que você foque apenas no seu lucro."
                                        </p>
                                        <div className="flex flex-wrap items-center gap-6 pt-10 border-t border-white/10">
                                            <div className="flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] font-inter">
                                                <Lock className="h-4 w-4" />
                                                Cloud Infrastructure
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] font-inter">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Verified Daily
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 9. FAQ (Senior UI Accordion) */}
                <section id="faq" className="py-32 bg-slate-50 px-6">
                    <div className="max-w-4xl mx-auto space-y-20">
                        <FadeIn className="text-center space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 font-inter">
                                FAQ
                            </div>
                            <h3 className="text-5xl md:text-7xl font-[1000] text-slate-950 tracking-[-0.03em] font-sora leading-[1]">
                                Tire suas <br />
                                <span className="text-blue-600">dúvidas.</span>
                            </h3>
                        </FadeIn>
                        <div className="grid gap-4">
                            {faqItems.map((item, i) => (
                                <FadeIn key={i} delay={i * 50}>
                                    <div className={cn("rounded-[2rem] border transition-all duration-500", activeFaq === i ? "bg-white border-blue-500/20 shadow-2xl shadow-blue-900/5" : "bg-white/50 border-slate-200/60 hover:border-blue-500/30")}>
                                        <button
                                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-8 text-left"
                                        >
                                            <span className="text-xl font-black text-slate-950 pr-8 font-sora tracking-tight">{item.q}</span>
                                            <div className={cn("h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 transition-all duration-500", activeFaq === i && "rotate-180 bg-blue-600 text-white shadow-lg shadow-blue-600/20")}>
                                                <ChevronDown className="h-5 w-5" />
                                            </div>
                                        </button>
                                        <div className={cn("overflow-hidden transition-all duration-500 ease-in-out", activeFaq === i ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                                            <div className="p-8 pt-0 text-slate-500 font-medium text-lg leading-relaxed font-inter border-t border-slate-50 mt-4">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 10. CTA FINAL (Senior Aesthetic) */}
                <section className="py-40 bg-white px-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
                    <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
                        <FadeIn className="space-y-6">
                            <h2 className="text-6xl md:text-8xl font-[1000] text-slate-950 tracking-[-0.04em] leading-[1] font-sora">
                                Recupere seu tempo. <br />
                                <span className="text-blue-600">Multiplique seu lucro.</span>
                            </h2>
                            <p className="text-2xl text-slate-500 font-medium max-w-3xl mx-auto italic font-inter leading-relaxed">
                                "O melhor momento para organizar seu negócio era ontem. <br /> O segundo melhor é agora."
                            </p>
                        </FadeIn>
                        
                        <FadeIn delay={200} className="flex flex-col items-center gap-10">
                            <Link href="/auth/signup">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black h-24 px-16 text-2xl rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 font-sora tracking-tight uppercase">
                                    Começar agora gratuitamente
                                </Button>
                            </Link>
                            <div className="flex items-center gap-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-inter">
                                    Trusted by 50+ lenders nationwide
                                </p>
                            </div>
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
                                <span className="text-xl font-[800] tracking-tight">Gestão<span className="text-blue-500">Flex</span></span>
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
