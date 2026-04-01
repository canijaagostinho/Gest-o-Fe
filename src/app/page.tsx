"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
    Landmark,
    UserCheck2,
    Menu,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

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
    const [user, setUser] = useState<{ id: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setShowFloatingCTA(window.scrollY > 600);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user: authUser } } = await supabase.auth.getUser();
                
                if (authUser) {
                    const { data: profile } = await supabase
                        .from("users")
                        .select("id")
                        .eq("id", authUser.id)
                        .maybeSingle();
                    
                    if (profile) {
                        setUser(authUser);
                        // router.push("/dashboard"); // Removido para permitir visualizar a landing page enquanto logado se desejar
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            }
        };
        checkUser();
    }, [router]);

    const faqItems = [
        {
            q: "Como o sistema garante que eu receba meu capital?",
            a: "O GestãoFlex automatiza a régua de cobrança. O sistema envia lembretes antes, no dia e após o vencimento, garantindo que o seu cliente nunca 'esqueça' de pagar."
        },
        {
            q: "Funciona para quem recebe via M-Pesa?",
            a: "Sim! O sistema é otimizado para o mercado de Moçambique. Você registra o recebimento em segundos e o fluxo de caixa é atualizado em tempo real."
        },
        {
            q: "Posso testar antes de assinar?",
            a: "Com certeza. Oferecemos acesso total gratuito para você ver o dinheiro voltando para o seu bolso antes de investir."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600/10 selection:text-blue-600 overflow-x-hidden">

            {/* 0. HEADER (Premium Glassmorphism - Sticky) */}
            <header className="fixed top-0 left-0 right-0 z-[100] px-3 sm:px-6 py-4 flex justify-center pointer-events-none">
                <nav className="max-w-7xl w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-white/70 backdrop-blur-xl border border-slate-200/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] pointer-events-auto">
                    {/* LEFT: Logo */}
                    <div className="flex-1 flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-600/10 group-hover:scale-105 transition-transform border border-slate-100">
                                <Landmark className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-black text-slate-950 tracking-tight font-sora">
                                Gestão<span className="text-blue-600">Flex</span>
                            </span>
                        </Link>
                    </div>

                    {/* CENTER: Navigation (The core of the alignment fix) */}
                    <div className="hidden lg:flex flex-1 items-center justify-center">
                        <div className="flex items-center gap-8">
                            {[
                                { label: "O Problema", href: "#problema" },
                                { label: "Solução", href: "#solucao" },
                                { label: "Segurança", href: "#faq" },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-[10px] font-black text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-[0.3em] font-sora"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Auth Buttons */}
                    <div className="hidden lg:flex flex-1 items-center justify-end gap-6">
                        <Link 
                            href="/auth/login" 
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors font-sora"
                        >
                            ENTRAR
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 h-12 rounded-xl text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 transition-all font-sora border-none">
                                Criar Conta Grátis
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="lg:hidden flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl pointer-events-auto">
                                    <Menu className="h-6 w-6 text-slate-600" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] p-0 border-none bg-white">
                                <div className="flex flex-col h-full">
                                    <SheetHeader className="p-6 border-b border-slate-100">
                                        <SheetTitle className="text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm relative">
                                                    <Image src="/logo.webp" alt="GestãoFlex Logotipo" fill className="object-cover" />
                                                </div>
                                                <span className="text-lg font-black text-slate-950 font-sora">
                                                    Gestão<span className="text-blue-600">Flex</span>
                                                </span>
                                            </div>
                                        </SheetTitle>
                                    </SheetHeader>
                                    
                                    <div className="flex-grow p-6 space-y-8">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navegação</p>
                                            <div className="grid gap-2">
                                                {[
                                                    { label: "O Problema", href: "#problema" },
                                                    { label: "A Solução", href: "#solucao" },
                                                    { label: "Segurança", href: "#faq" },
                                                ].map((item) => (
                                                    <Link
                                                        key={item.label}
                                                        href={item.href}
                                                        className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition-all"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso</p>
                                            <div className="grid gap-3">
                                                {!user && (
                                                    <Link href="/auth/login">
                                                        <Button variant="outline" className="w-full h-12 rounded-xl justify-start px-6 font-bold border-slate-200">
                                                            Entrar na Conta
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Link href={user ? "/dashboard" : "/auth/signup"}>
                                                    <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-lg shadow-blue-600/20">
                                                        {user ? "Ir para o Dashboard" : "Criar Conta Grátis"}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                {/* 1. HERO SECTION (Pixel-Perfect Split Layout) */}
                <section className="relative min-h-screen flex items-center pt-32 pb-24 lg:pt-32 lg:pb-32 overflow-hidden bg-white">
                    {/* Premium Ambient Background */}
                    <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.05),transparent_60%)] pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                            {/* Left Content Column */}
                            <div className="lg:col-span-5 space-y-10 max-w-2xl flex flex-col items-start text-left order-2 lg:order-1">
                                <FadeIn className="inline-flex items-center gap-3 px-5 py-2 bg-blue-50/50 border border-blue-100/50 rounded-full shadow-sm">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] font-sora">
                                        SISTEMA PREMIUM PARA MICROCRÉDITO
                                    </span>
                                </FadeIn>

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="space-y-8"
                                >
                                    <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-black text-slate-950 tracking-tighter leading-[1.1] font-sora max-w-xl">
                                        Garanta que seu capital volte <span className="text-blue-600">sem correr atrás de devedores.</span>
                                    </h1>
                                    <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed font-inter space-y-4">
                                        <span>
                                            O GestãoFlex organiza cada parcela e elimina falhas manuais na sua carteira. Tenha <span className="text-slate-950 font-black">visibilidade total sobre o seu capital</span> e garanta que cada empréstimo seja recuperado com eficiência.
                                        </span>
                                        <br /><br />
                                        <span className="text-slate-950 font-black italic block">
                                            A solução essencial para microcredores e agentes de crédito.
                                        </span>
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-start w-full"
                                >
                                    <Link href={user ? "/dashboard" : "/auth/signup"} className="w-full sm:w-auto">
                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black h-16 md:h-20 px-10 md:px-14 text-lg md:text-xl rounded-2xl shadow-[0_20px_40px_-12px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.03] active:scale-95 group w-full font-sora border-none">
                                            {user ? "Ir para o Dashboard" : "Criar Conta Grátis"}
                                            <ArrowRight className="ml-2 h-7 w-7 transition-transform group-hover:translate-x-2" />
                                        </Button>
                                    </Link>
                                    <Link href="#demonstracao" className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="bg-white border-blue-600 text-blue-600 font-black h-16 md:h-20 px-10 md:px-14 text-lg md:text-xl rounded-2xl shadow-sm hover:bg-blue-50 transition-all w-full font-sora border-2">
                                            Saiba Mais
                                            <ArrowRight className="ml-2 h-7 w-7 transition-transform group-hover:translate-x-2" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>

                            {/* Right Content Column (Premium 3D Mockup) */}
                            <div className="lg:col-span-7 relative w-full order-1 lg:order-2 flex items-center justify-center">
                                {/* Ambient Glow Background */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                    className="relative z-10 w-full"
                                >
                                    <div className="relative group">
                                        {/* Soft High-End Multi-Gradient Shadow */}
                                        <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/15 via-purple-500/10 to-cyan-400/15 blur-[120px] rounded-full opacity-60 pointer-events-none" />
                                        
                                        <motion.div
                                            animate={{ y: [-15, 5, -15] }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Image
                                                src="/hero-final.webp"
                                                alt="Interface do Dashboard GestãoFlex em dispositivos desktop e mobile demonstrando o ecossistema premium"
                                                width={1200}
                                                height={800}
                                                loading="eager"
                                                priority
                                                className="w-full h-auto drop-shadow-[0_50px_100px_rgba(37,99,235,0.3)] transition-transform duration-700 hover:scale-[1.02] rounded-2xl"
                                            />
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* Accent Element (Subtle Blur) */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/30 blur-[120px] rounded-full pointer-events-none" />
                            </div>
                        </div>
                    </div>


                </section>

                {/* 2. TARGET AUDIENCE (Para Quem É) */}
                <section className="py-24 bg-slate-50 border-y border-slate-200 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-12">
                            <FadeIn className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col gap-8">
                                <div className="space-y-4">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                        <UserCheck className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-950 tracking-tight font-sora italic underline decoration-emerald-500 underline-offset-8">Para quem é o GestãoFlex:</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        "Empreendedores que gerenciam mais de 10 empréstimos ativos.",
                                        "Agentes de crédito que usam M-Pesa ou E-Mola diariamente.",
                                        "Quem está cansado de perder prazos e esquecer cobranças no caderno.",
                                        "Professores ou funcionários que fazem empréstimos extra para complementar renda.",
                                        "Quem quer profissionalizar o negócio e escalar."
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-start gap-4 text-slate-700 font-bold">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>

                            <FadeIn delay={200} className="bg-slate-950 p-12 rounded-[3rem] shadow-2xl flex flex-col gap-8">
                                <div className="space-y-4">
                                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white tracking-tight font-sora">Quem <span className="text-rose-500">NÃO</span> deve usar:</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        "Você é um Banco Comercial ou Seguradora de grande porte.",
                                        "Você faz apenas 1 ou 2 empréstimos por ano para familiares.",
                                        "Você quer um ERP complexo para gestão industrial.",
                                        "Você prefere continuar dependendo da sorte ou do papel.",
                                        "Você não tem interesse em organizar seu fluxo de caixa."
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-start gap-4 text-slate-400 font-bold">
                                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2.5 flex-shrink-0" />
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 3. SHOWROOM SECTION (Visual System Tour) */}
                <section className="py-32 bg-white overflow-hidden" id="demonstracao">
                    <div className="max-w-7xl mx-auto px-6 space-y-32">
                        
                        {/* Showcase 1: Carteira de Crédito */}
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="relative order-2 lg:order-1"
                            >
                                <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/15 via-purple-500/10 to-cyan-400/15 blur-[120px] rounded-full opacity-60 pointer-events-none" />
                                <motion.div 
                                    animate={{ y: [-15, 5, -15] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="relative group"
                                >
                                    <Image
                                        src="/mobile-loan-agent-v3.webp"
                                        alt="Visualização da carteira de clientes e contratos de crédito no smartphone"
                                        width={800}
                                        height={1200}
                                        className="w-full h-auto drop-shadow-[0_45px_90px_rgba(37,99,235,0.2)] rounded-3xl transition-transform duration-700 hover:scale-[1.02]"
                                    />
                                </motion.div>
                            </motion.div>
                            
                            <div className="space-y-8 order-1 lg:order-2">
                                <FadeIn className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black tracking-widest uppercase font-sora">
                                    Módulo de Crédito
                                </FadeIn>
                                <h3 className="text-4xl md:text-5xl lg:text-5xl font-black text-slate-950 tracking-tighter font-sora leading-tight">
                                    Controlo Total da sua <span className="text-blue-600">Carteira de Clientes.</span>
                                </h3>
                                <p className="text-lg text-slate-600 font-medium leading-relaxed font-inter">
                                    Visualize cada contrato, identifique riscos de inadimplência em tempo real e automatize a gestão de cobranças. O GestãoFlex dá-lhe a inteligência necessária para saber exatamente onde o seu capital está alocado.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Monitoramento de Risco da Carteira",
                                        "Alertas automáticos de parcelas vencidas",
                                        "Impressão de contratos e recibos profissionais",
                                        "Histórico completo de cada beneficiário"
                                    ].map((item, id) => (
                                        <li key={id} className="flex items-center gap-3 text-slate-700 font-bold">
                                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Showcase 2: Inteligência Financeira */}
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            <div className="space-y-8">
                                <FadeIn className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black tracking-widest uppercase font-sora">
                                    Relatórios Estratégicos
                                </FadeIn>
                                <h3 className="text-4xl md:text-5xl lg:text-5xl font-black text-slate-950 tracking-tighter font-sora leading-tight">
                                    Decisões Baseadas em <span className="text-emerald-600">Dados Reais.</span>
                                </h3>
                                <p className="text-lg text-slate-600 font-medium leading-relaxed font-inter">
                                    Chega de adivinhações. Tenha relatórios detalhados de lucro líquido, ROI de cada empréstimo e fluxo de caixa consolidado. Entenda a performance da sua operação com gráficos intuitivos e profissionais.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Gráficos Dinâmicos de Receita vs Despesa",
                                        "Cálculo automático de juros e mora",
                                        "Relatórios prontos para exportação PDF/Excel",
                                        "Visibilidade total de custos operacionais"
                                    ].map((item, id) => (
                                        <li key={id} className="flex items-center gap-3 text-slate-700 font-bold">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="relative"
                            >
                                <div className="absolute -inset-10 bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-cyan-500/15 blur-[120px] rounded-full opacity-60 pointer-events-none" />
                                <motion.div 
                                    animate={{ y: [-15, 5, -15] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                    className="relative group"
                                >
                                    <Image
                                        src="/desktop-data-analyst.webp"
                                        alt="Gráficos de inteligência financeira e análise de dados de crédito no computador"
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto drop-shadow-[0_45px_90px_rgba(16,185,129,0.2)] rounded-3xl transition-transform duration-700 hover:scale-[1.02]"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                    </div>
                </section>

                {/* 3. O PROBLEMA (High Contrast Dark Mode) */}
                <section id="problema" className="py-32 bg-slate-950 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <FadeIn className="space-y-8">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">
                                    Cuidado com a sua Margem
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05] font-sora">
                                    CADERNO NÃO É <span className="text-slate-500">FERRAMENTA DE GESTÃO.</span>
                                </h2>
                                <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl font-inter">
                                    Se você trabalha com crédito e ainda usa cadernos ou planilhas, a sua operação está em risco constante.
                                </p>
                            </FadeIn>

                            <div className="grid gap-6">
                                {[
                                    { title: "Inadimplência Oculta", desc: "A cada dia que você não cobra, o risco de nunca receber sobe 15%.", icon: TriangleAlert, color: "bg-rose-500/10 text-rose-500" },
                                    { title: "Cálculos Frágeis", desc: "Planilhas corrompem. Papeis somem. Seus lucros não podem ser voláteis.", icon: Calculator, color: "bg-blue-500/10 text-blue-500" },
                                    { title: "Zero Escala", desc: "Você gasta 80% do tempo administrando e apenas 20% crescendo.", icon: Zap, color: "bg-emerald-500/10 text-emerald-500" },
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

                {/* 4. A SOLUÇÃO */}
                <section id="solucao" className="py-32 bg-white px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto space-y-24">
                        <FadeIn className="text-center space-y-6 max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">
                                A Solução Definitiva
                            </div>
                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tighter leading-[1.05] font-sora">
                                Automatize sua <span className="text-blue-600">cobrança e cálculos.</span>
                            </h3>
                            <p className="text-xl md:text-3xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed font-inter">
                                O GestãoFlex cuida da burocracia para que você foque no que realmente importa: <span className="text-slate-950 font-black italic">fazer seu capital girar.</span>
                            </p>
                        </FadeIn>
                        
                        <div className="grid lg:grid-cols-2 gap-24 items-center">
                            <FadeIn delay={200} className="relative group">
                                <div className="relative">
                                    <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-emerald-400/15 blur-[120px] rounded-full opacity-60 pointer-events-none" />
                                    <motion.div animate={{ y: [-15, 5, -15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
                                        <Image
                                            src="/solucao-final.webp"
                                            alt="Visão geral da solução GestãoFlex para automação de cobranças"
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto drop-shadow-[0_45px_90px_rgba(37,99,235,0.2)] rounded-3xl transition-transform duration-700 hover:scale-[1.02] relative z-10"
                                        />
                                    </motion.div>
                                </div>
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

                            <div className="space-y-10">
                                {[
                                    { title: "Registrar empréstimos em segundos", desc: "Criação rápida com taxas e juros personalizados.", icon: FileText, color: "bg-blue-500/10 text-blue-600" },
                                    { title: "Acompanhar todos os pagamentos", desc: "Baixa automática de parcelas e alertas de vencimento.", icon: RefreshCw, color: "bg-emerald-500/10 text-emerald-600" },
                                    { title: "Ver quem está em atraso", desc: "Histórico completo para evitar maus pagadores.", icon: Users, color: "bg-rose-500/10 text-rose-600" },
                                    { title: "Alertas de vencimentos", desc: "Lembretes automáticos sem que você precise mover um dedo.", icon: Zap, color: "bg-orange-500/10 text-orange-600" },
                                ].map((feat, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform", feat.color)}>
                                            <feat.icon className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <h5 className="text-xl font-bold text-slate-950 tracking-tight font-sora">{feat.title}</h5>
                                            <p className="text-slate-500 font-medium text-lg leading-snug">{feat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. SIMPLICIDADE BENTO GRID */}
                <section className="py-24 bg-slate-50 relative overflow-hidden px-6">
                    <div className="max-w-6xl mx-auto space-y-16 relative z-10">
                        <FadeIn className="text-center space-y-6 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">
                                Poder sem Complexidade
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tighter leading-[1.05] font-sora">
                                Simplicidade que <span className="text-blue-600">gera escala real.</span>
                            </h2>
                            <p className="text-lg md:text-xl font-medium text-slate-500 font-inter max-w-2xl mx-auto">
                                Tudo o que você precisa para gerenciar sua carteira de crédito sem complicações técnicas ou dashboards confusos.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 max-w-5xl mx-auto">
                            {/* Você Empresta, o Sistema Cobra */}
                            <FadeIn delay={100} className="md:col-span-1 md:row-span-2 bg-[#0A0D14] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-xl border border-white/5">
                                <div className="absolute inset-0 bg-[url('/bento-collection.webp')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0D14]/80 to-[#0A0D14] mix-blend-multiply" />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
                                        <TrendingUp className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white font-sora tracking-tight">Você Empresta, O Sistema Cobra.</h3>
                                    <p className="text-slate-400 font-inter leading-relaxed drop-shadow-sm">
                                        Notificações automáticas de vencimento que eliminam falhas de comunicação e reduzem drasticamente a inadimplência na sua carteira.
                                    </p>
                                </div>
                            </FadeIn>

                            {/* Segurança Bancária */}
                            <FadeIn delay={200} className="bg-white border text-center border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm group hover:shadow-md transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-950 font-sora tracking-tight">Segurança Bancária.</h3>
                                <p className="text-sm text-slate-500 font-inter">Infraestrutura de alta disponibilidade com backups em tempo real.</p>
                            </FadeIn>

                            {/* Insight em Tempo Real */}
                            <FadeIn delay={300} className="bg-blue-600 text-center rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('/bento-insight.webp')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 to-blue-600/30" />
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center relative z-10 backdrop-blur-md border border-white/20">
                                    <LineChart className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-white font-sora tracking-tight mt-auto relative z-10 drop-shadow-md">Insight em Tempo Real.</h3>
                            </FadeIn>

                            {/* Relatórios Prontos */}
                            <FadeIn delay={400} className="bg-white text-center border border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-sm group hover:shadow-md transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                    <PieChart className="h-6 w-6 text-slate-900" />
                                </div>
                                <h3 className="text-xl font-black text-slate-950 font-sora tracking-tight">Relatórios Prontos.</h3>
                                <p className="text-sm text-slate-500 font-inter">Saiba quanto lucrou com um clique.</p>
                            </FadeIn>

                            {/* Na Palma da Mão */}
                            <FadeIn delay={500} className="bg-orange-500 rounded-[2.5rem] p-8 flex flex-col items-center justify-end text-center relative overflow-hidden shadow-xl shadow-orange-500/20 min-h-[220px] group border border-orange-400/30">
                                <div className="absolute inset-0 bg-[url('/bento-mobile.webp')] bg-[length:120%_auto] bg-[center_-20px] opacity-100 group-hover:scale-105 group-hover:bg-[center_-10px] transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-orange-800/40 to-transparent" />
                                <div className="h-10 w-10 text-white/50 mb-4 relative z-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                                    <Smartphone className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-white font-sora tracking-tight relative z-10 drop-shadow-md">Na Palma da Mão.</h3>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* 6. VIDEO DEMO */}
                <section className="py-32 bg-[#010309] relative overflow-hidden px-6 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
                    
                    <div className="max-w-4xl mx-auto space-y-16 relative z-10">
                        <FadeIn className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">
                                Demo Interativa
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05] font-sora">
                                Veja o sistema <span className="text-blue-500">em ação real.</span>
                            </h2>
                            <p className="text-lg md:text-xl font-medium text-slate-400 font-inter max-w-2xl mx-auto">
                                Interface simples, rápida e fácil de usar. (Clique para assistir)
                            </p>
                        </FadeIn>

                        <FadeIn delay={200} className="relative rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl bg-black/50 p-2 group cursor-pointer max-w-3xl mx-auto">
                            <Image src="/hero-main.webp" alt="Demonstração em vídeo das principais funcionalidades do sistema GestãoFlex" width={1000} height={600} className="w-full h-auto rounded-[1.5rem] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-all">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] group-hover:scale-110 transition-transform">
                                        <Play className="h-8 w-8 ml-1" />
                                    </div>
                                    <span className="text-white font-black tracking-widest text-sm uppercase px-6 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">Assistir Demonstração</span>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* 7. TESTIMONIALS (Wall of Trust) */}
                <section className="py-32 bg-slate-50 px-6">
                    <div className="max-w-7xl mx-auto space-y-20">
                        <FadeIn className="text-center space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">
                                Feedback de quem usa
                            </div>
                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tighter leading-[1.05] font-sora">
                                Aprovado por <span className="text-blue-600 italic">visionários.</span>
                            </h3>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { 
                                    name: "António Canija", 
                                    role: "Agente Independente", 
                                    text: "O GestãoFlex mudou o jogo para mim. Antes eu perdia horas conferindo quem pagou e quem não pagou. Agora, tudo está a um clique e os juros são calculados sozinhos. Profissionalismo puro!", 
                                    rating: 5,
                                    image: "/avatar-antonio.png"
                                },
                                { 
                                    name: "Zaida Mucavele", 
                                    role: "Gestora de Portfólio", 
                                    text: "O que eu mais gosto é a cobrança automática. Mandar lembrete um por um era um sofrimento. Hoje o sistema faz o trabalho pesado e eu foco em analisar novos empréstimos com segurança.", 
                                    rating: 5,
                                    image: "/avatar-zaida.png"
                                },
                                { 
                                    name: "Ricardo Matsinhe", 
                                    role: "Micro-empreendedor", 
                                    text: "A clareza dos relatórios é o que mais impressiona. Consigo ver meu lucro líquido real e projetar meu crescimento. Recomendo para qualquer um que leve o negócio de crédito a sério.", 
                                    rating: 5,
                                    image: "/avatar-ricardo.png"
                                }
                            ].map((testi, i) => (
                                <FadeIn key={i} delay={i * 100} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                                    <div className="space-y-6">
                                        <div className="flex gap-1 text-blue-600">
                                            {[...Array(testi.rating)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                                        </div>
                                        <p className="text-slate-600 font-medium text-lg leading-relaxed italic">"{testi.text}"</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-10">
                                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                                            <Image src={testi.image.replace('.png', '.webp')} alt={`Foto de perfil de ${testi.name}`} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-950 tracking-tight">{testi.name}</p>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{testi.role}</p>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. SEGURANÇA TOTAL */}
                <section className="py-32 bg-white px-6">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10 order-2 lg:order-1">
                            <FadeIn>
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-900/5 border border-slate-900/10 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6">
                                    Industrial Strength
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-5xl font-black text-slate-950 tracking-tighter leading-[1.05] font-sora">
                                    Seu capital, <span className="text-blue-600">totalmente blindado.</span>
                                </h2>
                                <p className="text-lg text-slate-500 font-medium font-inter mt-6 max-w-lg leading-relaxed">
                                    Sabemos que cada metical emprestado é fruto do seu trabalho. Protegemos seu histórico e seus lucros com criptografia de ponta a ponta.
                                </p>
                            </FadeIn>
                            
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <FadeIn delay={100} className="space-y-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <h5 className="font-black text-slate-950 uppercase tracking-widest text-[10px]">Criptografia SSL</h5>
                                    <p className="text-slate-500">Segurança ponta a ponta.</p>
                                </FadeIn>
                                <FadeIn delay={200} className="space-y-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900">
                                        <Cloud className="h-5 w-5" />
                                    </div>
                                    <h5 className="font-black text-slate-950 uppercase tracking-widest text-[10px]">Backups 24/7</h5>
                                    <p className="text-slate-500">Seus dados sempre salvos.</p>
                                </FadeIn>
                                <FadeIn delay={300} className="space-y-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900">
                                        <RefreshCw className="h-5 w-5" />
                                    </div>
                                    <h5 className="font-black text-slate-950 uppercase tracking-widest text-[10px]">Redundância</h5>
                                    <p className="text-slate-500">Sistema sempre online.</p>
                                </FadeIn>
                                <FadeIn delay={400} className="space-y-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <h5 className="font-black text-slate-950 uppercase tracking-widest text-[10px]">Privacidade</h5>
                                    <p className="text-slate-500">Isolamento total de dados.</p>
                                </FadeIn>
                            </div>
                        </div>

                        <FadeIn delay={200} className="order-1 lg:order-2 bg-[#0A0D14] p-12 rounded-[3rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)] pointer-events-none" />
                            <div className="relative z-10 space-y-12 h-full flex flex-col justify-center">
                                <div className="h-14 w-14 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="h-7 w-7 text-blue-500" />
                                </div>
                                <p className="text-2xl md:text-3xl text-white font-sora font-black tracking-tight leading-snug">
                                    "Segurança não é opcional. Aplicamos padrões globais para que você foque apenas no seu lucro."
                                </p>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                                    <span className="flex items-center gap-2"><Lock className="h-3 w-3" /> Cloud Infrastructure</span>
                                    <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Verified Daily</span>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* 9. PRE-FOOTER FINAL CTA */}
                <section className="py-40 bg-white relative overflow-hidden px-6 text-center">
                    <div className="max-w-3xl mx-auto space-y-12 relative z-10">
                        <FadeIn className="space-y-6">
                            <h2 className="text-5xl md:text-6xl lg:text-[4rem] font-black text-slate-950 tracking-tighter leading-[1.05] font-sora">
                                Chega de <span className="text-blue-600">perder dinheiro.</span> Profissionalize-se hoje.
                            </h2>
                            <p className="text-lg text-slate-400 font-medium italic">
                                "Organizei meus empréstimos em 10 minutos e nunca mais dormi preocupado com o caderno."
                            </p>
                        </FadeIn>
                        
                        <FadeIn delay={200}>
                            <Link href="/auth/signup" className="text-white hover:text-white">
                                <Button className="h-16 px-10 rounded-full font-black text-sm uppercase tracking-widest bg-blue-600 hover:bg-blue-700 !text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
                                    COMEÇAR AGORA GRATUITAMENTE
                                </Button>
                            </Link>
                            <div className="mt-8 flex justify-center items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Trusted by 50+ lenders nationwide
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* 10. FAQ */}
                <section id="faq" className="py-32 bg-slate-50 px-6">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <FadeIn className="text-center space-y-4">
                            <h3 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tight font-sora">Dúvidas Frequentes</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm italic">Respostas diretas para as suas perguntas</p>
                        </FadeIn>

                        <div className="space-y-4">
                            {faqItems.map((item, i) => (
                                <FadeIn key={i} delay={i * 50}>
                                    <div 
                                        className="bg-white rounded-3xl border border-slate-100 overflow-hidden cursor-pointer group"
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    >
                                        <div className="p-8 flex items-center justify-between">
                                            <p className="font-black text-slate-900 text-lg tracking-tight pr-8">{item.q}</p>
                                            <div className={cn("h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center transition-transform", activeFaq === i ? "rotate-45 bg-blue-50 text-blue-600" : "group-hover:bg-slate-100")}>
                                                <Plus className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <motion.div
                                            initial={false}
                                            animate={{ height: activeFaq === i ? "auto" : 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-8 pb-8 pt-0">
                                                <p className="text-slate-500 font-medium text-lg leading-relaxed">{item.a}</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. FOOTER */}
                <footer className="bg-slate-950 text-white py-24 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
                            <div className="col-span-1 md:col-span-2 space-y-8">
                                <Link href="/" className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                                        <img src="/logo.png" alt="Logo" className="h-full w-full object-cover rounded-xl" />
                                    </div>
                                    <span className="text-2xl font-black tracking-tight font-sora">Gestão<span className="text-blue-500">Flex</span></span>
                                </Link>
                                <p className="text-slate-400 font-medium max-w-sm text-lg leading-relaxed">
                                    Transformando a gestão de microcrédito com tecnologia acessível, segura e focada em resultados reais em Moçambique.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 font-sora">Produto</h4>
                                <ul className="space-y-3 text-lg text-slate-400 font-bold">
                                    <li><Link href="#problema" className="hover:text-white transition-colors">O Problema</Link></li>
                                    <li><Link href="#solucao" className="hover:text-white transition-colors">A Solução</Link></li>
                                </ul>
                            </div>
                            
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 font-sora">Links Úteis</h4>
                                <ul className="space-y-3 text-lg text-slate-400 font-bold">
                                    <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                    <li><Link href="/auth/login" className="hover:text-white transition-colors">Entrar</Link></li>
                                    <li><Link href="/auth/signup" className="hover:text-white transition-colors">Criar Conta</Link></li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 font-sora">Contactos</h4>
                                <ul className="space-y-4 font-inter">
                                    <li>
                                        <a href="tel:+258834646942" className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all shadow-inner">
                                                <Phone className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors tracking-wide">(+258) 83 464 6942</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:gestaoflexmoz@gmail.com" className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all shadow-inner">
                                                <Mail className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors tracking-wide">gestaoflexmoz@gmail.com</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] font-sora">
                            <p>© {new Date().getFullYear()} GestãoFlex. Todos os direitos reservados.</p>
                            <div className="flex gap-8">
                                <span>Design Premium para Credores</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

            {/* FLOATING CTA BAR (Bottom - Full Width) */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: showFloatingCTA ? 1 : 0, y: showFloatingCTA ? 0 : 100 }}
                className="fixed bottom-0 left-0 right-0 z-[100] w-full pointer-events-none"
            >
                <div className="bg-white/95 backdrop-blur-2xl border-t border-slate-200/60 p-4 sm:p-5 flex items-center justify-between sm:px-12 text-sm w-full mx-auto pointer-events-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-10">
                        <span className="text-lg sm:text-xl font-black text-slate-950 font-sora">
                            Gestão<span className="text-blue-600">Flex</span>
                        </span>
                        <span className="font-black text-slate-500 hidden md:block uppercase tracking-widest text-[11px]">
                            Não perca mais dinheiro: Garanta hoje mesmo o controle da sua operação.
                        </span>
                    </div>
                    <Link href="/auth/signup" className="w-full sm:w-auto text-white hover:text-white">
                        <Button className="bg-blue-600 hover:bg-blue-700 !text-white font-black rounded-xl px-8 h-12 sm:h-14 shadow-lg shadow-blue-600/20 text-xs sm:text-[11px] uppercase tracking-widest w-full font-sora border-none">
                            Começar Agora Gratuitamente
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
