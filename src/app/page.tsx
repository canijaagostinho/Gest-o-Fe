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
            q: "Preciso saber usar computador?",
            a: "Não! O sistema foi desenhado para ser intuitivo. Se você sabe usar o WhatsApp, conseguirá usar o GestãoFlex em poucos minutos."
        },
        {
            q: "Funciona no telemóvel?",
            a: "Sim! O sistema é 100% responsivo e possui uma interface otimizada para smartphones e tablets."
        },
        {
            q: "Tem custo?",
            a: "Você pode começar gratuitamente para conhecer as funcionalidades. Temos planos que crescem com o seu negócio."
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
            ],
            cta: "Começar Grátis",
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
                "Cobrança automática",
                "Relatórios PDF/Excel",
            ],
            cta: "Solicitar Demo",
            highlighted: true,
        },
        {
            name: "Enterprise",
            price: "Sob consulta",
            currency: "",
            desc: "Para redes de grande porte",
            features: [
                "Multi-filiais",
                "API completa",
                "Personalização total",
                "Gestor dedicado",
            ],
            cta: "Falar com Especialista",
            highlighted: false,
        },
    ];

    const stats = [
        { value: "+500", label: "Gestores Activos", icon: Building2 },
        { value: "40%", label: "Menos Inadimplência", icon: TrendingUp },
        { value: "3x", label: "Mais Rapidez", icon: Zap },
        { value: "99.9%", label: "Segurança Total", icon: ShieldCheck },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600/10 selection:text-blue-600 overflow-x-hidden">

            {/* Floating CTA */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: showFloatingCTA ? 1 : 0, y: showFloatingCTA ? 0 : 100 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-2 rounded-full shadow-2xl flex items-center justify-between pl-6">
                    <span className="text-sm font-bold text-slate-700 hidden sm:block">Controle total hoje mesmo</span>
                    <Link href="#demonstracao">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full px-6 shadow-lg shadow-emerald-500/20">
                            Criar Conta Grátis
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
                        <Link href="#demonstracao">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-blue-600/20 transition-all">
                                Criar Conta Grátis
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                {/* 1. HERO SECTION */}
                <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden bg-white">
                    {/* Premium Background Elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
                    <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none opacity-50" />
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-4xl mx-auto space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-sm"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Premium SaaS para Microcrédito
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-8"
                            >
                                <h1 className="text-6xl md:text-8xl font-[900] text-slate-900 tracking-tighter leading-[0.95] lg:px-10">
                                    Controle total do seu <span className="text-blue-600">microcrédito</span>
                                </h1>
                                <p className="text-xl md:text-3xl font-medium text-slate-500 tracking-tight max-w-3xl mx-auto leading-tight">
                                    Sem erros, sem confusão e sem planilhas. Automatize cobranças e acompanhe pagamentos em tempo real.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-6 justify-center"
                            >
                                <Link href="#demonstracao">
                                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black h-16 px-10 text-lg rounded-2xl shadow-2xl shadow-emerald-500/30 group w-full sm:w-auto">
                                        Começar gratuitamente agora
                                        <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="#solucao">
                                    <Button size="lg" variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-black h-16 px-10 text-lg rounded-2xl shadow-sm w-full sm:w-auto">
                                        Ver como funciona
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Hero Mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                            className="mt-20 relative max-w-6xl mx-auto"
                        >
                            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full -z-10 scale-110" />
                            
                            <img
                                src="/hero-mockup.png"
                                alt="Dashboard GestãoFlex"
                                className="w-full h-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2rem] border border-slate-100"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* 2. PROBLEMA */}
                <section id="problema" className="py-32 bg-slate-50 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <FadeIn className="space-y-8">
                                <div className="h-1.5 w-16 bg-rose-500 rounded-full" />
                                <h2 className="text-4xl md:text-6xl font-[900] text-slate-900 tracking-tighter leading-none">
                                    Se você gere crédito manualmente… <br />
                                    <span className="text-rose-500">você está a perder dinheiro.</span>
                                </h2>
                                <p className="text-xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-200 pl-6">
                                    "No fim do mês, você trabalhou duro, atendeu clientes, mas não sabe exatamente para onde o seu dinheiro foi ou quem ainda te deve."
                                </p>
                            </FadeIn>
                            
                            <div className="grid sm:grid-cols-2 gap-6">
                                {[
                                    { title: "Clientes esquecem", desc: "A cada dia de atraso, seu lucro diminui sem você perceber.", icon: Clock },
                                    { title: "Registos no papel", desc: "Cadernos perdem-se. Planilhas corrompem-se. Sua empresa para.", icon: FileText },
                                    { title: "Cálculos errados", desc: "Um erro na vírgula pode custar meses de rendimento.", icon: Calculator },
                                    { title: "Zero Controle", desc: "Você cresce sem saber se está realmente tendo lucro ou prejuízo.", icon: ShieldAlert },
                                ].map((pain, i) => (
                                    <FadeIn key={i} delay={i * 100}>
                                        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all group">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                <pain.icon className="h-6 w-6" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900">{pain.title}</h4>
                                            <p className="text-slate-500 text-sm font-semibold">{pain.desc}</p>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. SOLUÇÃO */}
                <section id="solucao" className="py-32 bg-white px-6">
                    <div className="max-w-5xl mx-auto text-center space-y-12">
                        <FadeIn className="space-y-6">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">A Solução Moderna</h2>
                            <h3 className="text-5xl md:text-7xl font-[900] text-slate-900 tracking-tighter leading-[0.9]">
                                O <span className="text-blue-600">GestãoFlex</span> resolve tudo isso automaticamente
                            </h3>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto">
                                Um sistema simples e inteligente para controlar todo o seu microcrédito em um único lugar. Do pequeno empreendedor à grande instituição.
                            </p>
                        </FadeIn>
                        
                        <FadeIn delay={200}>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <img
                                    src="/mockup-parcelas.png"
                                    alt="GestãoFlex Dashboard"
                                    className="w-full h-auto rounded-[2.5rem] border border-slate-100 shadow-2xl relative z-10"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* 4. BENEFÍCIOS */}
                <section id="beneficios" className="py-32 bg-slate-50 px-6">
                    <div className="max-w-7xl mx-auto">
                        <FadeIn className="text-center max-w-2xl mx-auto space-y-6 mb-24">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Resultados Reais</h2>
                            <h3 className="text-5xl md:text-6xl font-[900] text-slate-900 tracking-tighter leading-none">Foco total no seu lucro.</h3>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { title: "Cálculos Automáticos", desc: "Esqueça a calculadora. Juros, multas e parcelas são gerados em segundos.", icon: Calculator },
                                { title: "Controle de Empréstimos", desc: "Saiba exatamente quanto tem na rua e quando o dinheiro volta.", icon: TrendingUp },
                                { title: "Histórico de Clientes", desc: "Perfil completo de cada tomador para evitar maus pagadores.", icon: Users },
                                { title: "Redução de Erros", desc: "Elimine falhas humanas que custam caro para o seu negócio.", icon: ShieldCheck },
                                { title: "Economia de Tempo", desc: "Recupere horas do seu dia automatizando tarefas repetitivas.", icon: Clock },
                                { title: "Mais Organização", desc: "Tudo centralizado, seguro e acessível de qualquer lugar.", icon: Zap },
                            ].map((benefit, i) => (
                                <FadeIn key={i} delay={i * 100}>
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-600/5 transition-all group h-full">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all mb-8">
                                            <benefit.icon className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 mb-4">{benefit.title}</h4>
                                        <p className="text-slate-500 font-semibold leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. FUNCIONALIDADES */}
                <section className="py-32 bg-white px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-24 items-center">
                            <div className="space-y-12">
                                <FadeIn className="space-y-6">
                                    <h2 className="text-sm font-black text-emerald-500 uppercase tracking-widest">Funcionalidades</h2>
                                    <h3 className="text-5xl font-[900] text-slate-900 tracking-tighter leading-none">Tudo o que você precisa em um só lugar</h3>
                                </FadeIn>

                                <div className="space-y-8">
                                    {[
                                        { title: "Cadastro de Clientes", desc: "Fichas completas com fotos, documentos e referências." },
                                        { title: "Gestão de Empréstimos", desc: "Contratos flexíveis, taxas personalizadas e prazos variados." },
                                        { title: "Controle de Pagamentos", desc: "Baixa automática de parcelas e alertas de vencimento." },
                                        { title: "Relatórios Automáticos", desc: "PDFs profissionais prontos para imprimir ou enviar." },
                                        { title: "Dashboard Intuitivo", desc: "Gráficos claros que mostram a saúde do seu negócio." },
                                    ].map((feat, i) => (
                                        <FadeIn key={i} delay={i * 100} className="flex gap-6 group">
                                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-500 font-bold text-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                {i + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-slate-900">{feat.title}</h4>
                                                <p className="text-slate-500 font-semibold">{feat.desc}</p>
                                            </div>
                                        </FadeIn>
                                    ))}
                                </div>
                            </div>

                            <FadeIn delay={200} className="relative">
                                <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] -z-10 opacity-60" />
                                <img
                                    src="/mockup-emprestimos.png"
                                    alt="Funcionalidades GestãoFlex"
                                    className="w-full h-auto rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-100"
                                />
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 6. PROVA / AUTORIDADE */}
                <section className="py-32 bg-slate-900 text-white px-6">
                    <div className="max-w-7xl mx-auto space-y-24">
                        <FadeIn className="text-center max-w-3xl mx-auto space-y-6">
                            <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.3em]">Prova Real</h2>
                            <h3 className="text-5xl font-[900] tracking-tighter leading-none text-white">
                                Desenvolvido com foco na realidade de <span className="text-blue-400">quem faz acontecer.</span>
                            </h3>
                            <p className="text-xl text-slate-400 font-medium">
                                Junte-se a centenas de gestores que transformaram o caos em lucro.
                            </p>
                        </FadeIn>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    quote: "O GestãoFlex é robusto mas simples. Reduzi minha inadimplência pela metade e hoje durmo tranquilo sabendo que meus dados estão seguros.",
                                    name: "João Silva",
                                    role: "Agente Independente",
                                    company: "Silva Crédito",
                                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                                },
                                {
                                    quote: "Migrar do Excel para cá foi a melhor decisão do ano. Meus clientes recebem lembretes e eu recebo os pagamentos em dia. O sistema se paga sozinho.",
                                    name: "Maria Santos",
                                    role: "Gestora",
                                    company: "Santos Financeira",
                                    image: "https://images.unsplash.com/photo-1567532939604-b6c5b0adcc80?w=100&h=100&fit=crop",
                                },
                                {
                                    quote: "Interface rápida e intuitiva. Treinei minha equipe em 30 minutos. Os relatórios são exatamente o que eu precisava para crescer.",
                                    name: "António Costa",
                                    role: "CEO",
                                    company: "Costa & Filhos",
                                    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop",
                                },
                            ].map((t, i) => (
                                <FadeIn key={i} delay={i * 120}>
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2.5rem] space-y-8 flex flex-col h-full hover:bg-white/10 transition-all">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(j => <Star key={j} className="h-5 w-5 fill-blue-400 text-blue-400" />)}
                                        </div>
                                        <p className="text-xl text-slate-300 font-medium leading-relaxed italic">&quot;{t.quote}&quot;</p>
                                        <div className="flex items-center gap-5 pt-8 border-t border-white/10">
                                            <img src={t.image} alt={t.name} className="h-14 w-14 rounded-full border-2 border-blue-400/30 object-crop" />
                                            <div>
                                                <p className="font-black text-white text-lg leading-tight">{t.name}</p>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t.role} · {t.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. DEMONSTRAÇÃO */}
                <section id="demonstracao" className="py-32 bg-white px-6">
                    <div className="max-w-7xl mx-auto text-center space-y-16">
                        <FadeIn className="space-y-6">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">Demonstração</h2>
                            <h3 className="text-5xl font-[900] text-slate-900 tracking-tighter leading-none">Interface simples, rápida e fácil de usar</h3>
                        </FadeIn>
                        
                        <FadeIn delay={200} className="relative group max-w-5xl mx-auto">
                            <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative aspect-video bg-slate-100 rounded-[2.5rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
                                <img 
                                    src="/hero-mockup.png" 
                                    alt="Demonstração do Sistema" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 group-hover:bg-slate-900/40 transition-all cursor-pointer">
                                    <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                                        <Zap className="h-10 w-10 fill-white" />
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* 8. OFERTA & 9. URGÊNCIA */}
                <section className="py-32 bg-slate-50 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-blue-600 rounded-[3.5rem] p-12 lg:p-24 text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.4)] text-center">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                            
                            <div className="relative z-10 max-w-4xl mx-auto space-y-10">
                                <FadeIn className="space-y-6">
                                    <h2 className="text-5xl md:text-8xl font-[900] tracking-tighter leading-[0.9]">
                                        Comece agora <br />sem risco
                                    </h2>
                                    <p className="text-xl md:text-2xl text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
                                        Teste gratuitamente e veja como é fácil organizar seu negócio. Pare de perder dinheiro por falta de controle.
                                    </p>
                                </FadeIn>
                                
                                <FadeIn delay={200} className="space-y-8">
                                    <p className="text-emerald-300 font-black uppercase tracking-widest text-sm bg-emerald-500/10 inline-block px-4 py-2 rounded-full">
                                        ⚠️ URGENCIAL: Recupere o controle antes que as perdas aumentem.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                        <Link href="#demonstracao">
                                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-black h-20 px-12 text-xl rounded-2xl shadow-2xl">
                                                Criar minha conta grátis
                                            </Button>
                                        </Link>
                                    </div>
                                </FadeIn>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 10. SEGURANÇA */}
                <section id="seguranca" className="py-32 bg-white px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <FadeIn className="space-y-8">
                                <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">Segurança Máxima</h2>
                                <h3 className="text-5xl font-[900] text-slate-900 tracking-tighter leading-none">
                                    Seus dados protegidos por tecnologia de <span className="text-blue-600">nível bancário</span>
                                </h3>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                                    Nós levamos a segurança a sério. Utilizamos criptografia de ponta a ponta e infraestrutura redundante para garantir que sua empresa nunca pare.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-8 pt-4">
                                    {[
                                        { title: "Criptografia SSL", desc: "Protocolos de segurança máxima." },
                                        { title: "Backups Diários", desc: "Suas informações sempre salvas." },
                                        { title: "Isolamento de Dados", desc: "Privacidade total garantida." },
                                        { title: "Auditoria 24/7", desc: "Monitoramento constante." },
                                    ].map((s, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight">{s.title}</p>
                                                <p className="text-sm text-slate-500 font-semibold">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                            
                            <FadeIn delay={200} className="relative">
                                <div className="absolute inset-0 bg-blue-600/5 rounded-[3rem] -rotate-3" />
                                <div className="relative bg-slate-900 rounded-[3rem] p-12 text-white space-y-10 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
                                    <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                                        <ShieldCheck className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-6">
                                        <p className="text-3xl font-black tracking-tight leading-tight italic">
                                            "Segurança em primeiro lugar. Focamos na tecnologia para que você foque no crescimento."
                                        </p>
                                        <div className="flex items-center gap-4 text-sm font-bold text-blue-400 uppercase tracking-widest pt-4 border-t border-white/10">
                                            <Lock className="h-4 w-4" />
                                            Certificado ISO / SOC2 Ready
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 11. FAQ */}
                <section id="faq" className="py-32 bg-white px-6">
                    <div className="max-w-4xl mx-auto space-y-20">
                        <FadeIn className="text-center space-y-6">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Perguntas Frequentes</h2>
                            <h3 className="text-5xl font-[900] text-slate-900 tracking-tighter leading-none">Tire suas dúvidas</h3>
                        </FadeIn>
                        <div className="grid gap-4">
                            {faqItems.map((item, i) => (
                                <FadeIn key={i} delay={i * 60}>
                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden hover:border-blue-200 transition-all">
                                        <button
                                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-8 text-left transition-colors"
                                        >
                                            <span className="text-xl font-black text-slate-900 pr-8">{item.q}</span>
                                            <div className={cn("h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400 transition-transform", activeFaq === i && "rotate-180 bg-blue-600 text-white shadow-lg shadow-blue-600/20")}>
                                                <ChevronDown className="h-5 w-5" />
                                            </div>
                                        </button>
                                        <div className={cn("overflow-hidden transition-all duration-300", activeFaq === i ? "max-h-60" : "max-h-0")}>
                                            <div className="p-8 pt-0 text-slate-500 font-semibold text-lg leading-relaxed">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 12. CTA FINAL */}
                <section className="py-32 bg-white px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <FadeIn className="space-y-6">
                            <h2 className="text-6xl md:text-8xl font-[900] text-slate-900 tracking-tighter leading-[0.9]">
                                Comece a controlar seu negócio <span className="text-blue-600 italic">hoje mesmo</span>
                            </h2>
                            <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto">
                                Pare de trabalhar no escuro. Tenha controle total do seu dinheiro e escale sua operação.
                            </p>
                        </FadeIn>
                        
                        <FadeIn delay={200}>
                            <Link href="#demonstracao">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-[900] h-20 px-12 text-2xl rounded-3xl shadow-[0_40px_80px_-20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
                                    Criar minha conta agora
                                </Button>
                            </Link>
                        </FadeIn>
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
