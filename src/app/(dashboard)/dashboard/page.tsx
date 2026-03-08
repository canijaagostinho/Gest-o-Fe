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
    Plus,
    Settings,
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
        chartData: [] as any[],
    });

    const isGlobalAdmin = (user?.role as any)?.name === "admin_geral";

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

                        setKpiData({
                            totalLent: activePortfolio,
                            totalReceived: totalPaid,
                            receivables: receivables30D,
                            delinquencyRate: delinquency,
                            growthRate: growth,
                            efficiencyRate: efficiency,
                            overdueCount,
                            overdueAmount,
                            pendingApprovals: pendingClientsCount || 0,
                            chartData,
                        });
                    }
                }
            } catch (error: any) {
                console.error("CRITICAL ERROR in Dashboard fetch:", error);
                if (error.name === "AbortError") {
                    console.warn(
                        "Fetch aborted - common in development with React Strict Mode.",
                    );
                }
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
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-2 max-w-7xl mx-auto">
            {/* Block 1: Welcome Banner (Hero) - Premium Navy */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-8 text-white shadow-2xl shadow-blue-900/20 border border-white/10"
            >
                {/* Decorative Shapes - Premium Subtle */}
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-500/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[100%] bg-indigo-500/20 blur-[80px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center space-x-2 bg-white/10 w-fit px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                {user?.institutions?.name || "Gestão Flex"}
                            </div>

                            {/* Profile Completion Alert - Compact Pill */}
                            {user?.role?.name === "gestor" &&
                                (!user?.institution_details?.nuit ||
                                    !user?.institution_details?.address_line ||
                                    !user?.institution_details?.phone ||
                                    !user?.institution_details?.email) && (
                                    <Link href="/settings" className="group/alert">
                                        <div className="flex items-center space-x-2 bg-amber-500/20 hover:bg-amber-500/30 w-fit px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-amber-500/30 transition-all">
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-400 group-hover/alert:scale-110 transition-transform" />
                                            <span className="text-amber-400">Perfil Incompleto</span>
                                            <ChevronRight className="h-3 w-3 text-amber-500" />
                                        </div>
                                    </Link>
                                )}
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                            Olá, <span className="text-blue-400">{userName}</span>
                        </h2>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                            Bem-vindo ao seu painel de controle. Aqui está o resumo atualizado
                            da sua carteira e as próximas ações recomendadas.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <Button
                                className="bg-blue-600 text-white hover:bg-blue-500 rounded-full px-8 py-6 text-sm font-bold shadow-lg shadow-blue-900/50 hover:shadow-blue-600/50 transition-all hover:-translate-y-0.5"
                                asChild
                            >
                                <Link href="/settings/plans">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Planos e Assinaturas
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-full px-8 py-6 text-sm font-bold backdrop-blur-sm transition-all"
                                asChild
                            >
                                <Link href="/reports">Ver Relatórios</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Summary in Hero - Compact Row */}
                    <div className="flex gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 mt-2 md:mt-0 justify-center md:justify-end">
                        <div className="text-center md:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Crescimento
                            </p>
                            <p className="text-2xl md:text-3xl font-black text-white">
                                {kpiData.growthRate > 0 ? "+" : ""}
                                {kpiData.growthRate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="w-px bg-white/10 h-10 self-center mx-4 hidden md:block" />
                        <div className="text-center md:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Eficiência
                            </p>
                            <p className="text-2xl md:text-3xl font-black text-white">
                                {kpiData.efficiencyRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Block 2: Main KPIs (CoinDepo Style - Vertical Stack) */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            >
                {/* KPI 1: Active Portfolio */}
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl transition-all group-hover:bg-white/10" />
                        <div className="absolute inset-0 bg-dot-pattern opacity-[0.05]" />
                        <div className="relative space-y-4 px-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-white/10 rounded-2xl text-white group-hover:scale-110 transition-transform">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">
                                    Carteira Ativa
                                </p>
                                <h3
                                    className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight"
                                    title={formatCurrency(kpiData.totalLent)}
                                >
                                    {formatCurrency(kpiData.totalLent)}
                                </h3>
                                <div
                                    className={`flex items-center mt-3 text-[10px] font-black w-fit px-2.5 py-1 rounded-full ${kpiData.growthRate >= 0 ? "text-emerald-100 bg-emerald-500/20 border border-emerald-500/30" : "text-rose-100 bg-rose-500/20 border border-rose-500/30"}`}
                                >
                                    {kpiData.growthRate >= 0 ? (
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                    )}
                                    {kpiData.growthRate > 0 ? "+" : ""}
                                    {kpiData.growthRate.toFixed(1)}% mês
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* KPI 2: Received */}
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl transition-all group-hover:bg-white/20" />
                        <div className="absolute inset-0 bg-dot-pattern opacity-[0.1]" />
                        <div className="relative space-y-4 px-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-white/20 rounded-2xl text-white group-hover:scale-110 transition-transform">
                                    <Wallet className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-teal-100 uppercase tracking-[0.15em] mb-1">
                                    Total Recebido
                                </p>
                                <h3
                                    className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight"
                                    title={formatCurrency(kpiData.totalReceived)}
                                >
                                    {formatCurrency(kpiData.totalReceived)}
                                </h3>
                                <div className="flex items-center mt-3 text-[10px] font-black text-teal-100 bg-black/10 border border-black/5 w-fit px-2.5 py-1 rounded-full">
                                    <ArrowUpRight className="h-3 w-3 mr-1" /> Recebido
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* KPI 3: Receivables */}
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl transition-all group-hover:bg-white/20" />
                        <div className="absolute inset-0 bg-dot-pattern opacity-[0.1]" />
                        <div className="relative space-y-4 px-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-white/20 rounded-2xl text-white group-hover:scale-110 transition-transform">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-100 uppercase tracking-[0.15em] mb-1">
                                    A Receber (30D)
                                </p>
                                <h3
                                    className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight"
                                    title={formatCurrency(kpiData.receivables)}
                                >
                                    {formatCurrency(kpiData.receivables)}
                                </h3>
                                <div className="flex items-center mt-3 text-[10px] font-black text-amber-100 bg-black/10 border border-black/5 w-fit px-2.5 py-1 rounded-full">
                                    Fluxo Previsto
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* KPI 4: Risk */}
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl transition-all group-hover:bg-white/20" />
                        <div className="absolute inset-0 bg-dot-pattern opacity-[0.1]" />
                        <div className="relative space-y-4 px-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-white/20 rounded-2xl text-white group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.15em] mb-1">
                                    Risco da Carteira
                                </p>
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight whitespace-nowrap">
                                    {kpiData.delinquencyRate.toFixed(1)}%
                                </h3>
                                <div
                                    className={`flex items-center mt-3 text-[10px] font-black w-fit px-2.5 py-1 rounded-full ${kpiData.delinquencyRate < 5 ? "text-blue-100 bg-black/10 border border-black/5" : "text-rose-100 bg-rose-500/60 border border-rose-500/80 shadow-md shadow-rose-900/20"}`}
                                >
                                    {kpiData.delinquencyRate < 5 ? (
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                    ) : (
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                    )}
                                    {kpiData.delinquencyRate < 3
                                        ? "Excelente"
                                        : kpiData.delinquencyRate < 10
                                            ? "Atenção"
                                            : "Crítico"}
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Block 3: Charts */}
            <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
                {/* Main Scale Chart */}
                <Card className="col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] p-8">
                    <CardHeader className="p-0 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                    Evolução da Carteira
                                </CardTitle>
                                <CardDescription className="text-sm font-medium mt-1">
                                    Crescimento do volume emprestado vs. recebido.
                                </CardDescription>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                Semestral
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[350px] w-full">
                            <OverviewChart data={kpiData.chartData} />
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Distribution Chart - Pie Chart + Progress Bars */}
                <Card className="col-span-1 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] p-8">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                            Status de Risco
                        </CardTitle>
                        <CardDescription className="text-sm font-medium mt-1">
                            Distribuição de contratos por atraso.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Pie Chart */}
                        <div className="h-[220px] flex items-center justify-center mb-10">
                            <RiskChart />
                        </div>

                        {/* Progress Bars Section - Now Dynamic */}
                        <RiskIndicators />
                    </CardContent>
                </Card>
            </motion.div>

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
                            color: "from-indigo-600 to-indigo-500 shadow-indigo-500/30",
                            text: "text-indigo-50",
                            textDesc: "text-indigo-200",
                            href: "/clients",
                            desc: "Base e CRM",
                        },
                        {
                            label: "Pagamentos",
                            icon: Wallet,
                            color: "from-emerald-600 to-emerald-500 shadow-emerald-500/30",
                            text: "text-emerald-50",
                            textDesc: "text-emerald-200",
                            href: "/payments",
                            desc: "Registrar Baixa",
                        },
                        {
                            label: "Planos",
                            icon: CreditCard,
                            color: "from-orange-500 to-amber-500 shadow-orange-500/30",
                            text: "text-orange-50",
                            textDesc: "text-orange-200",
                            href: "/settings/plans",
                            desc: "Assinaturas",
                            adminOnly: true,
                        },
                        {
                            label: "Configurações",
                            icon: Settings,
                            color: "from-slate-800 to-slate-700 shadow-slate-800/30",
                            text: "text-slate-50",
                            textDesc: "text-slate-300",
                            href: "/settings",
                            desc: "Sistema",
                            adminOnly: true,
                        },
                    ].map((action, idx) => (
                        <Link key={idx} href={action.href} className="group outline-none">
                            <Card
                                className={cn(
                                    "border-none shadow-lg hover:shadow-2xl hover:-translate-y-1.5 bg-gradient-to-br rounded-[2rem] transition-all duration-300 overflow-hidden relative cursor-pointer ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500",
                                    action.color,
                                )}
                            >
                                {/* Shine effect */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all z-0"
                                    style={{ transform: "translateX(-100%)" }}
                                />
                                {/* Background blur drops */}
                                <div className="absolute -right-6 -top-6 bg-white/20 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 z-0" />
                                <div className="absolute -left-6 -bottom-6 bg-black/10 w-24 h-24 rounded-full blur-xl z-0" />

                                <CardContent className="p-6 md:p-8 flex flex-col items-center text-center space-y-4 relative z-10 text-white min-h-[160px] justify-center">
                                    <div className="p-4 rounded-[1.25rem] bg-white/20 backdrop-blur-md shadow-inner transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 text-white border border-white/10">
                                        <action.icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-[16px] md:text-lg font-black leading-tight text-white drop-shadow-sm">
                                            {action.label}
                                        </p>
                                        <p
                                            className={cn(
                                                "text-[10px] md:text-[11px] font-bold mt-1.5 uppercase tracking-widest",
                                                action.textDesc,
                                            )}
                                        >
                                            {action.desc}
                                        </p>
                                    </div>
                                    {action.adminOnly && (
                                        <Badge
                                            variant="outline"
                                            className="text-[9px] bg-black/20 border-white/10 text-white uppercase tracking-widest font-black absolute top-4 right-4 backdrop-blur-sm"
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
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gradient-to-r from-white to-slate-50/80 rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)] hover:border-amber-200 transition-all duration-300 cursor-pointer group">
                                    <div className="flex items-center space-x-6">
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center text-amber-600 text-2xl font-black shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300 border border-amber-200/50">
                                            {kpiData.overdueCount || 0}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                                                Parcelas Vencidas
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Acompanhamento necessário para recuperar{" "}
                                                <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                                    {formatCurrency(kpiData.overdueAmount || 0)}
                                                </span>
                                                .
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100/50 font-bold rounded-xl pointer-events-none px-4"
                                        >
                                            Analisar Impacto
                                        </Button>
                                        <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-amber-200 group-hover:bg-amber-50 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Alert Item 2 */}
                            <Link
                                href="/clients?status=pending"
                                className="block focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-[2rem]"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gradient-to-r from-white to-slate-50/80 rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] hover:border-blue-200 transition-all duration-300 cursor-pointer group">
                                    <div className="flex items-center space-x-6">
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 text-2xl font-black shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300 border border-blue-200/50">
                                            {kpiData.pendingApprovals || 0}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                                                Aprovações Pendentes
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Novos clientes aguardando revisão de documentos ou KYC.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-blue-700 hover:text-blue-800 hover:bg-blue-100/50 font-bold rounded-xl pointer-events-none px-4"
                                        >
                                            Revisar Agora
                                        </Button>
                                        <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                        </div>
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
