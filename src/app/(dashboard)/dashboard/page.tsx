"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RiskChart } from "@/components/dashboard/risk-chart";
import { RiskIndicators } from "@/components/dashboard/risk-indicators";
import {
    Briefcase,
    Wallet,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    AlertCircle,
    Calendar,
    Bell,
    CreditCard,
    Users,
    FileText,
    Building2,
    Settings,
    TrendingDown,
    Activity,
    ShieldCheck,
    Lock,
    PlusCircle,
    ArrowRightLeft,
    CheckCircle2,
    Info,
    ExternalLink,
    Banknote,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { GlobalDashboard } from "@/components/dashboard/global-dashboard";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [kpiData, setKpiData] = useState({
        totalLent: 0,
        totalReceived: 0,
        receivables: 0,
        delinquencyRate: 0,
        growthRate: 0,
        efficiencyRate: 0,
        overdueCount: 0,
        overdueAmount: 0,
        pendingApprovals: 0,
        totalBalance: 0,
        chartData: [] as any[],
    });

    const [privacyMode, setPrivacyMode] = useState(false);

    // Load privacy mode from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("dashboard_privacy_mode");
        if (saved === "true") setPrivacyMode(true);
    }, []);

    const togglePrivacyMode = () => {
        const newVal = !privacyMode;
        setPrivacyMode(newVal);
        localStorage.setItem("dashboard_privacy_mode", String(newVal));
    };

    const maskValue = (value: React.ReactNode) => {
        if (privacyMode) return "MZN ••••••";
        return value;
    };

    const isGlobalAdmin = (user?.role as any)?.name === "admin_geral";
    const isOperador = (user?.role as any)?.name === "operador";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClient();
                const {
                    data: { user: authUser },
                } = await supabase.auth.getUser();

                if (authUser) {
                    // Fetch profile
                    const { data: profile } = await supabase
                        .from("users")
                        .select("*, role:roles(name), institutions(name)")
                        .eq("id", authUser.id)
                        .single();

                    if (profile?.institution_id) {
                        const { data: institution } = await supabase
                            .from("institutions")
                            .select(
                                "nuit, address_line, phone, email, logo_url, primary_color",
                            )
                            .eq("id", profile.institution_id)
                            .single();

                        setUser({ ...profile, institution_details: institution });
                    } else {
                        setUser(profile);
                    }

                    // If institucional, fetch live metrics
                    if (profile?.role?.name !== "admin_geral") {
                        // 1. Fetch Loans for Growth Calc (Current vs Last Month)

                        const { data: allLoans } = await supabase
                            .from("loans")
                            .select("loan_amount, created_at")
                            .eq("institution_id", profile.institution_id);

                        const { data: payments } = await supabase
                            .from("payments")
                            .select("amount_paid, payment_date")
                            .eq("institution_id", profile.institution_id);

                        const { data: installments } = await supabase
                            .from("installments")
                            .select("amount, status, due_date")
                            .eq("institution_id", profile.institution_id);
                        const { count: pendingClientsCount } = await supabase
                            .from("clients")
                            .select("*", { count: "exact", head: true })
                            .eq("institution_id", profile.institution_id)
                            .eq("status", "pending");

                        const { data: accounts } = await supabase
                            .from("accounts")
                            .select("balance")
                            .eq("institution_id", profile.institution_id);

                        // --- Calculations ---

                        // 1. Growth (MTD vs SPLM - Month To Date vs Same Period Last Month)
                        const now = new Date();
                        const dayOfMonth = now.getDate();
                        const startOfMonth = new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            1,
                        ).toISOString();
                        const endOfMTD = new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            dayOfMonth,
                            23,
                            59,
                            59,
                        ).toISOString();

                        // Last month same period
                        const startOfLastMonth = new Date(
                            now.getFullYear(),
                            now.getMonth() - 1,
                            1,
                        ).toISOString();
                        const endOfSPLM = new Date(
                            now.getFullYear(),
                            now.getMonth() - 1,
                            dayOfMonth,
                            23,
                            59,
                            59,
                        ).toISOString();

                        const mtdLoans =
                            allLoans?.filter(
                                (l: any) =>
                                    l.created_at >= startOfMonth && l.created_at <= endOfMTD,
                            ) || [];
                        const splmLoans =
                            allLoans?.filter(
                                (l: any) =>
                                    l.created_at >= startOfLastMonth && l.created_at <= endOfSPLM,
                            ) || [];

                        const mtdVol = mtdLoans.reduce(
                            (acc: number, l: any) => acc + Number(l.loan_amount),
                            0,
                        );
                        const splmVol = splmLoans.reduce(
                            (acc: number, l: any) => acc + Number(l.loan_amount),
                            0,
                        );

                        let growth = 0;
                        if (splmVol > 0) {
                            growth = ((mtdVol - splmVol) / splmVol) * 100;
                        } else if (mtdVol > 0) {
                            growth = 100; // 100% growth if started this month
                        } else {
                            growth = 0; // Both are 0
                        }

                        // Efficiency = Total Paid / (Total Paid + Total Overdue)
                        const totalPaid =
                            payments?.reduce(
                                (acc: number, p: any) => acc + Number(p.amount_paid),
                                0,
                            ) || 0;

                        // Fix: Check for due_date < now AND status = 'pending' as overdue
                        const todayStr = now.toISOString().split("T")[0];
                        const pendingItems =
                            installments?.filter((i: any) => i.status === "pending") || [];
                        const overdueItems = pendingItems.filter((inst: any) => {
                            const dueDate = inst.due_date.split("T")[0];
                            return dueDate < todayStr;
                        });

                        const overdueCount = overdueItems.length;
                        const overdueAmount =
                            overdueItems.reduce(
                                (acc: number, i: any) => acc + Number(i.amount),
                                0,
                            ) || 0;

                        const totalInstCount = installments?.length || 0;
                        const safeTotalInst = totalInstCount === 0 ? 1 : totalInstCount;

                        const delinquency = (overdueCount / safeTotalInst) * 100;
                        const efficiency = 100 - delinquency;

                        // 3. Active Portfolio (Sum of all pending installments)
                        const activePortfolio =
                            pendingItems.reduce(
                                (acc: number, i: any) => acc + Number(i.amount),
                                0,
                            ) || 0;

                        // 4. Receivables (Next 30 Days)
                        const thirtyDaysFromNow = new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            now.getDate() + 30,
                        ).toISOString();
                        const receivables30D =
                            pendingItems
                                .filter((i: any) => {
                                    const d = i.due_date.split("T")[0];
                                    return d >= todayStr && d <= thirtyDaysFromNow.split("T")[0];
                                })
                                .reduce((acc: number, i: any) => acc + Number(i.amount), 0) ||
                            0;

                        // 5. Chart Data (Last 6 months)
                        const chartData = [];
                        const monthNames = [
                            "Jan",
                            "Fev",
                            "Mar",
                            "Abr",
                            "Mai",
                            "Jun",
                            "Jul",
                            "Ago",
                            "Set",
                            "Out",
                            "Nov",
                            "Dez",
                        ];
                        for (let i = 5; i >= 0; i--) {
                            const d = new Date();
                            d.setMonth(d.getMonth() - i);
                            const m = d.getMonth();
                            const y = d.getFullYear();
                            const monthStart = new Date(y, m, 1).toISOString();
                            const monthEnd = new Date(y, m + 1, 0, 23, 59, 59).toISOString();

                            const mLent =
                                allLoans
                                    ?.filter(
                                        (l: any) =>
                                            l.created_at >= monthStart && l.created_at <= monthEnd,
                                    )
                                    .reduce(
                                        (acc: number, l: any) => acc + Number(l.loan_amount),
                                        0,
                                    ) || 0;

                            const mPaid =
                                payments
                                    ?.filter(
                                        (p: any) =>
                                            p.payment_date >= monthStart &&
                                            p.payment_date <= monthEnd,
                                    )
                                    .reduce(
                                        (acc: number, p: any) => acc + Number(p.amount_paid),
                                        0,
                                    ) || 0;

                            chartData.push({
                                name: monthNames[m],
                                emprestado: mLent,
                                recebido: mPaid,
                            });
                        }

                        // 3. Totals
                        const totalLent =
                            allLoans?.reduce(
                                (acc: number, l: any) => acc + Number(l.loan_amount),
                                0,
                            ) || 0;

                        // 6. Total Balance
                        const totalBalance = accounts?.reduce((acc: number, a: any) => acc + Number(a.balance), 0) || 0;

                        setKpiData({
                            totalLent: allLoans?.reduce((acc: number, l: any) => acc + Number(l.loan_amount), 0) || 0,
                            totalReceived: totalPaid,
                            receivables: receivables30D,
                            delinquencyRate: delinquency,
                            growthRate: growth,
                            efficiencyRate: efficiency,
                            overdueCount: overdueCount,
                            overdueAmount: overdueAmount,
                            pendingApprovals: pendingClientsCount || 0,
                            totalBalance: totalBalance,
                            chartData: chartData as any[],
                        });
                    }
                }
            } catch (error) {
                console.error("Dashboard metric fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 p-8 pt-6 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isGlobalAdmin) {
        return <GlobalDashboard />;
    }

    const userName = user?.full_name?.split(" ")[0] || "Gestor";
    const today = new Date().toLocaleDateString("pt-MZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    // Animation Variants - Removed Delays for Instant Visibility
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0, // Immediate
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 0 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex-1 space-y-8 md:space-y-10 p-4 md:p-10 pt-6 max-w-7xl mx-auto overflow-hidden">
            {/* Block 0: Strategic Header & Balance Queen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PRIMARY CARD: Saldo Total */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white border-2 border-blue-50 p-6 md:p-10 shadow-xl group"
                >
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Saldo Consolidado</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={togglePrivacyMode}
                                    className="h-10 w-10 rounded-2xl hover:bg-slate-100 text-slate-400"
                                    title={privacyMode ? "Mostrar Valores" : "Ocultar Valores"}
                                >
                                    {privacyMode ? (
                                        <Lock className="w-5 h-5 text-amber-500" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    )}
                                </Button>
                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    Protegido
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter transition-all group-hover:tracking-tight truncate pb-2">
                                {maskValue(formatCurrency(kpiData.totalBalance))}
                            </h1>
                            <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Atualizado agora mesmo • Todas as contas
                            </p>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entradas (Mês)</p>
                                    <p className="text-xl font-black text-slate-900">{maskValue(formatCurrency(kpiData.totalReceived))}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxa de Crescimento</p>
                                    <p className="flex items-center text-xl font-black text-emerald-600">
                                        <ArrowUpRight className="w-4 h-4 mr-1" />
                                        {kpiData.growthRate.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-xl text-blue-600 font-bold hover:bg-blue-50 shrink-0" asChild>
                                <Link href="/finance/accounts">
                                    <span className="hidden sm:inline">Ver Detalhes</span> 
                                    <span className="sm:hidden text-xs">Ver Tudo</span>
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700" />
                </motion.div>

                {/* Secondary Cards Column */}
                <div className="space-y-6">
                    {/* Active Portfolio */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-[2rem] bg-slate-900 text-white shadow-xl relative overflow-hidden group"
                    >
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Carteira Ativa</p>
                        <h3 className="text-3xl font-black tracking-tight mb-4">{maskValue(formatCurrency(kpiData.totalLent))}</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Briefcase className="w-4 h-4 text-blue-400" />
                            Total em circulação
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                    </motion.div>

                    {/* Quick Insight: Receivables */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A Receber (30d)</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{maskValue(formatCurrency(kpiData.receivables))}</h3>
                        <p className="text-xs font-bold text-indigo-600 mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Projeção de fluxo
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Block 1: Centro de Comando (Quick Actions) */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-[0.1em]">Centro de Operações</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Ações Seguras
                    </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Novo Empréstimo", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-500", href: "/loans/new", badge: kpiData.pendingApprovals > 0 ? kpiData.pendingApprovals : null, badgeColor: "bg-blue-600" },
                        { label: "Registrar Pagamento", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-500", href: "/payments", badge: kpiData.overdueCount > 0 ? kpiData.overdueCount : null, badgeColor: "bg-rose-600" },
                        { label: "Transferir Valores", icon: ArrowRightLeft, color: "text-indigo-600", bg: "bg-indigo-500", href: "/finance/accounts" },
                        { label: "Adicionar Cliente", icon: PlusCircle, color: "text-slate-800", bg: "bg-slate-900", href: "/clients" },
                    ].map((action, i) => (
                        <Link key={i} href={action.href}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col items-center text-center gap-4 group relative"
                            >
                                {action.badge && (
                                    <div className={cn("absolute top-4 right-4 h-6 min-w-[1.5rem] px-1.5 flex items-center justify-center rounded-full text-[10px] font-black text-white shadow-lg z-20 animate-bounce-slow", action.badgeColor)}>
                                        {action.badge}
                                    </div>
                                )}
                                <div className={cn("p-5 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110", action.bg)}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-black text-slate-900 tracking-tight">{action.label}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Block 2: Insights Inteligentes & Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Insights List */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-black text-slate-900 px-2 uppercase tracking-[0.1em]">Insights</h3>
                    <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-4 hover:border-blue-200 transition-all cursor-pointer">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">Saúde Financeira Boa</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Seu saldo aumentou {(kpiData.growthRate / 2).toFixed(1)}% esta semana.</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-4 hover:border-emerald-200 transition-all cursor-pointer">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">Eficiência Operacional</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{kpiData.efficiencyRate.toFixed(1)}% das cobranças foram recebidas em dia.</p>
                            </div>
                        </div>
                        {kpiData.overdueCount > 0 && (
                            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 shadow-sm flex items-start gap-4 hover:bg-rose-100 transition-all cursor-pointer group">
                                <div className="p-2 bg-white rounded-lg text-rose-600 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-rose-900 flex items-center justify-between">
                                        Ação Necessária
                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                    </p>
                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1">{kpiData.overdueCount} contratos em atraso agora.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Chart (Existing but Refined) */}
                <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 overflow-hidden">
                    <CardHeader className="p-0 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Evolução da Operação</CardTitle>
                            <CardDescription className="text-xs md:text-sm font-medium mt-1">Comparativo de Empréstimos vs. Recebimentos</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emprestado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recebido</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[300px] w-full">
                            <OverviewChart data={kpiData.chartData} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Block 4: Functionality Grid */}
            <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <div className="h-8 w-2 bg-blue-600 rounded-full"></div>
                        Acesso Rápido
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1 ml-4">
                        Principais módulos para gerir sua operação agora.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {[
                        {
                            label: "Novo Empréstimo",
                            icon: CreditCard,
                            color: "from-blue-600 to-blue-500 shadow-blue-500/30",
                            text: "text-blue-50",
                            textDesc: "text-blue-200",
                            href: "/loans/new",
                            desc: "Criar Contrato",
                        },
                        {
                            label: "Clientes",
                            icon: Users,
                            color: "bg-indigo-50 border border-indigo-100",
                            iconColor: "text-indigo-600 bg-white",
                            href: "/clients",
                            desc: "Base e CRM",
                        },
                        {
                            label: "Pagamentos",
                            icon: Wallet,
                            color: "bg-emerald-50 border border-emerald-100",
                            iconColor: "text-emerald-600 bg-white",
                            href: "/payments",
                            desc: "Registrar Baixa",
                        },
                        {
                            label: "Planos",
                            icon: CreditCard,
                            color: "bg-orange-50 border border-orange-100",
                            iconColor: "text-orange-600 bg-white",
                            href: "/settings/plans",
                            desc: "Assinaturas",
                            adminOnly: true,
                        },
                        {
                            label: "Configurações",
                            icon: Settings,
                            color: "bg-slate-50 border border-slate-200",
                            iconColor: "text-slate-600 bg-white",
                            href: "/settings",
                            desc: "Sistema",
                            adminOnly: true,
                        },
                    ].filter(action => !action.adminOnly || isGlobalAdmin || (user?.role as any)?.name === "gestor").map((action, idx) => (
                        <Link key={idx} href={action.href} className="group outline-none">
                            <Card
                                className={cn(
                                    "border-none shadow-sm hover:shadow-2xl hover:-translate-y-1.5 rounded-[2rem] transition-all duration-500 overflow-hidden relative cursor-pointer ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white",
                                    action.color,
                                )}
                            >
                                <CardContent className="p-8 flex flex-col items-center text-center space-y-6 relative z-10 min-h-[180px] justify-center text-slate-900">
                                    <div className={cn("p-4 rounded-[1.25rem] shadow-sm transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border border-slate-100", action.iconColor)}>
                                        <action.icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black leading-tight">
                                            {action.label}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                                            {action.desc}
                                        </p>
                                    </div>
                                    {action.adminOnly && (
                                        <Badge
                                            variant="outline"
                                            className="text-[9px] bg-slate-900 text-white uppercase tracking-widest font-black absolute top-4 right-4"
                                        >
                                            Admin
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Block 5: Action List */}
            <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 md:grid-cols-1 pt-4"
            >
                <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-white rounded-[2.5rem] p-8">
                    <CardHeader className="p-0 flex flex-row items-center justify-between mb-8">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl mr-3 shadow-inner">
                                    <AlertCircle className="w-5 h-5" strokeWidth={3} />
                                </div>
                                Prioridades do Dia
                            </CardTitle>
                            <CardDescription className="text-sm font-medium mt-2 text-slate-500">
                                Ações imediatas que requerem sua atenção.
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex rounded-xl bg-white hover:bg-slate-50 border-slate-200 px-6 font-bold shadow-sm"
                            asChild
                        >
                            <Link href="/alerts">Central de Alertas</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-4">
                            {/* Alert Item 1 */}
                            <Link
                                href="/loans?status=delinquent"
                                className="block focus:outline-none focus:ring-4 focus:ring-amber-500/20 rounded-[2rem]"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-10 bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500 cursor-pointer group">
                                    <div className="flex flex-col sm:flex-row items-center sm:space-x-8 text-center sm:text-left gap-4">
                                        <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] bg-amber-50 flex items-center justify-center text-3xl md:text-4xl font-black shrink-0 border border-amber-100 group-hover:scale-110 transition-transform duration-500">
                                            {kpiData.overdueCount || 0}
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-slate-900">
                                                Parcelas Vencidas
                                            </p>
                                            <p className="text-base text-slate-500 mt-2">
                                                Recupere aproximandamente{" "}
                                                <span className="font-black text-amber-600 underline underline-offset-4 decoration-amber-200">
                                                    {formatCurrency(kpiData.overdueAmount || 0)}
                                                </span>
                                                {" "}hoje com ações de cobrança.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 mt-6 md:mt-0">
                                        <Button
                                            className="bg-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white font-black rounded-full px-8 py-6 transition-all"
                                        >
                                            Cobrar Agora
                                        </Button>
                                    </div>
                                </div>
                            </Link>

                            {/* Alert Item 2 */}
                            <Link
                                href="/clients?status=pending"
                                className="block focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-[2rem]"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-10 bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 cursor-pointer group">
                                    <div className="flex flex-col sm:flex-row items-center sm:space-x-8 text-center sm:text-left gap-4">
                                        <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] bg-blue-50 flex items-center justify-center text-3xl md:text-4xl font-black shrink-0 border border-blue-100 group-hover:scale-110 transition-transform duration-500">
                                            {kpiData.pendingApprovals || 0}
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-slate-900">
                                                Aprovações Pendentes
                                            </p>
                                            <p className="text-base text-slate-500 mt-2">
                                                Novos clientes aguardando revisão de documentos ou KYC para liberação de crédito.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 mt-6 md:mt-0">
                                        <Button
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white font-black rounded-full px-8 py-6 transition-all"
                                        >
                                            Revisar Agora
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
