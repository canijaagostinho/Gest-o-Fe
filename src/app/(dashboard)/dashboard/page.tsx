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
import {
    ShieldCheck,
    Lock,
    Activity,
    Bell,
    Plus,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// New Dashboard Components
import { SmartAlerts } from "@/components/dashboard/smart-alerts";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { ActionCenter } from "@/components/dashboard/action-center";
import { PriorityLists } from "@/components/dashboard/priority-lists";

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
        delinquencyAmount: 0,
        pendingApprovals: 0,
        totalBalance: 0,
        chartData: [] as any[],
        overdueItems: [] as any[],
        upcomingItems: [] as any[],
        totalLoansCount: 0,
        lentCount: 0,
        receivablesCount: 0,
    });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClient();
                const {
                    data: { user: authUser },
                } = await supabase.auth.getUser();

                if (authUser) {
                    const { data: profile } = await supabase
                        .from("users")
                        .select("*, role:roles(name), institutions(name)")
                        .eq("id", authUser.id)
                        .single();

                    if (profile?.institution_id) {
                        const { data: institution } = await supabase
                            .from("institutions")
                            .select("nuit, address_line, phone, email, logo_url, primary_color")
                            .eq("id", profile.institution_id)
                            .single();
                        setUser({ ...profile, institution_details: institution });
                    } else {
                        setUser(profile);
                    }

                    if (profile?.role?.name !== "admin_geral") {
                        const { data: allLoans } = await supabase
                            .from("loans")
                            .select("id, loan_amount, created_at, status")
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

                        // --- Metrics & Calculations ---
                        const dayOfMonth = now.getDate();
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                        const endOfMTD = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, 23, 59, 59).toISOString();
                        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
                        const endOfSPLM = new Date(now.getFullYear(), now.getMonth() - 1, dayOfMonth, 23, 59, 59).toISOString();

                        const mtdVol = allLoans?.filter(l => l.created_at >= startOfMonth && l.created_at <= endOfMTD).reduce((acc, l) => acc + Number(l.loan_amount), 0) || 0;
                        const splmVol = allLoans?.filter(l => l.created_at >= startOfLastMonth && l.created_at <= endOfSPLM).reduce((acc, l) => acc + Number(l.loan_amount), 0) || 0;
                        const growth = splmVol > 0 ? ((mtdVol - splmVol) / splmVol) * 100 : (mtdVol > 0 ? 100 : 0);

                        const pendingItems = installments?.filter(i => i.status === "pending") || [];
                        const overdueItems = pendingItems.filter(i => i.due_date.split("T")[0] < todayStr);
                        const overdueAmount = (overdueItems && overdueItems.length > 0) ? overdueItems.reduce((acc, i) => acc + Number(i.amount), 0) : 0;
                        const delinquencyRateVal = (installments && installments.length > 0) 
                            ? (overdueItems.length / installments.length) * 100 
                            : 0;

                        const activePortfolio = pendingItems.reduce((acc, i) => acc + Number(i.amount), 0) || 0;
                        const thirtyDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString().split("T")[0];
                        const receivables30DItems = pendingItems.filter(i => {
                            const d = i.due_date.split("T")[0];
                            return d >= todayStr && d <= thirtyDays;
                        });
                        const receivables30D = receivables30DItems.reduce((acc, i) => acc + Number(i.amount), 0) || 0;

                        const lentCountVal = allLoans?.filter(l => l.status === "active").length || 0;
                        const receivablesCountVal = receivables30DItems.length;

                        // Chart Data
                        const chartData = [];
                        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                        for (let i = 5; i >= 0; i--) {
                            const d = new Date();
                            d.setMonth(d.getMonth() - i);
                            const m = d.getMonth();
                            const y = d.getFullYear();
                            const monthStart = new Date(y, m, 1).toISOString();
                            const monthEnd = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
                            const mLent = allLoans?.filter(l => l.created_at >= monthStart && l.created_at <= monthEnd).reduce((acc, l) => acc + Number(l.loan_amount), 0) || 0;
                            const mPaid = payments?.filter(p => p.payment_date >= monthStart && p.payment_date <= monthEnd).reduce((acc, p) => acc + Number(p.amount_paid), 0) || 0;
                            chartData.push({ name: monthNames[m], emprestado: mLent, recebido: mPaid });
                        }

                        // Priority Data
                        const { data: realOverdueItems } = await supabase.from("installments").select("id, amount, due_date, loans(clients(full_name))").eq("institution_id", profile.institution_id).eq("status", "pending").lt("due_date", todayStr).order("due_date", { ascending: true }).limit(5);
                        const { data: realUpcomingItems } = await supabase.from("installments").select("id, amount, due_date, loans(clients(full_name))").eq("institution_id", profile.institution_id).eq("status", "pending").gte("due_date", todayStr).order("due_date", { ascending: true }).limit(5);

                        setKpiData({
                            totalLent: activePortfolio, // Using active portfolio for clarity
                            totalReceived: payments?.reduce((acc, p) => acc + Number(p.amount_paid), 0) || 0,
                            receivables: receivables30D,
                            delinquencyRate: delinquencyRateVal || 0,
                            delinquencyAmount: overdueAmount || 0,
                            growthRate: growth,
                            efficiencyRate: 100 - delinquencyRateVal,
                            overdueCount: overdueItems.length,
                            pendingApprovals: pendingClientsCount || 0,
                            totalBalance: accounts?.reduce((acc, a) => acc + Number(a.balance), 0) || 0,
                            chartData: chartData as any[],
                            totalLoansCount: allLoans?.length || 0,
                            lentCount: lentCountVal,
                            receivablesCount: receivablesCountVal,
                            overdueItems: (realOverdueItems as any)?.map((i: any) => ({
                                id: i.id,
                                name: i.loans?.clients?.full_name || "Cliente",
                                amount: i.amount,
                                date: Math.floor((now.getTime() - new Date(i.due_date).getTime()) / (1000 * 60 * 60 * 24)).toString(),
                                status: "overdue"
                            })) || [],
                            upcomingItems: (realUpcomingItems as any)?.map((i: any) => ({
                                id: i.id,
                                name: i.loans?.clients?.full_name || "Cliente",
                                amount: i.amount,
                                date: i.due_date,
                                status: "upcoming"
                            })) || [],
                        });
                    }
                }
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 p-8 pt-6 bg-[#F8FAFC] min-h-screen">
                <div className="max-w-7xl mx-auto space-y-10">
                    <Skeleton className="h-10 w-[300px] rounded-xl" />
                    <div className="grid gap-6 md:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (isGlobalAdmin) return <GlobalDashboard />;

    const alerts = [];
    
    // 1. Critical Overdue Alerts (Max 3 individual, else consolidated)
    if (kpiData.overdueCount > 0) {
        if (kpiData.overdueCount <= 3) {
            kpiData.overdueItems.forEach((item: any) => {
                alerts.push({ 
                    type: "error" as const, 
                    detail: item.name,
                    subDetail: `${formatCurrency(item.amount)} • ATRASO CRÍTICO`,
                    message: "atraso crítico", 
                    count: 1, 
                    href: `/notifications/system?focus=overdue&id=${item.id}` 
                });
            });
        } else {
            alerts.push({ 
                type: "error" as const, 
                message: "clientes em atraso crítico", 
                count: kpiData.overdueCount, 
                href: "/notifications/system?focus=overdue" 
            });
        }
    }

    // 2. Payments Due Today (Max 3 individual, else consolidated)
    const paymentsToday = kpiData.upcomingItems.filter((i: any) => i.date.split("T")[0] === todayStr);
    if (paymentsToday.length > 0) {
        if (paymentsToday.length <= 3) {
            paymentsToday.forEach((item: any) => {
                alerts.push({ 
                    type: "warning" as const, 
                    detail: item.name,
                    subDetail: `${formatCurrency(item.amount)} • VENCE HOJE`,
                    message: "pagamento hoje", 
                    count: 1, 
                    href: "/payments" 
                });
            });
        } else {
            const totalToday = paymentsToday.reduce((acc: number, i: any) => acc + Number(i.amount), 0);
            alerts.push({ 
                type: "warning" as const, 
                message: "pagamentos vencem hoje", 
                subDetail: `${formatCurrency(totalToday)} total`,
                count: paymentsToday.length, 
                href: "/payments" 
            });
        }
    }

    return (
        <div className="flex-1 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
            <div className="relative max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                
                {/* 1. Greeting */}
                <div className="flex flex-col gap-1 px-2">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Olá, {user?.full_name?.split(" ")[0] || "Gestor"} 👋
                    </h1>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                        CENTRO DE CONTROLE • {new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long' })}
                    </p>
                </div>

                {/* 2. KPIs */}
                <MetricsGrid data={kpiData} privacyMode={privacyMode} maskValue={maskValue} />

                {/* 3. Main Grid 70/30 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Operation Area (Left) */}
                    <div className="lg:col-span-8 space-y-12">
                        <section className="space-y-6">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                <Activity className="h-4 w-4 text-blue-600" /> Histórico de Carteira
                            </h3>
                            <ChartsSection overviewData={kpiData.chartData} />
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pagamentos Pendentes
                            </h3>
                            <PriorityLists overdueItems={kpiData.overdueItems} upcomingItems={kpiData.upcomingItems} />
                        </section>
                    </div>

                    {/* Quick Access Area (Right) */}
                    <aside className="lg:col-span-4 space-y-10">
                        <section className="space-y-6">
                             <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <Bell className="h-4 w-4 text-rose-500" /> Alertas Críticos
                            </h3>
                            <SmartAlerts alerts={alerts} />
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <Plus className="h-4 w-4 text-blue-600" /> Atalhos do Sistema
                            </h3>
                            <ActionCenter overdueToCharge={kpiData.overdueCount} />
                        </section>

                        <Card className="p-8 bg-slate-950 border-none rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl group">
                             <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-blue-500/20 rounded-2xl ring-1 ring-blue-500/30">
                                        <Lock className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <Badge variant="outline" className={cn("transition-colors", privacyMode ? "border-emerald-500 text-emerald-400" : "border-white/20 text-white/50")}>
                                        {privacyMode ? "PROTEGIDO" : "PÚBLICO"}
                                    </Badge>
                                </div>
                                <p className="text-sm font-black tracking-tight leading-tight">Os valores estão {privacyMode ? "ocultos" : "visíveis"} para segurança.</p>
                                <Button onClick={togglePrivacyMode} className={cn("w-full font-black text-xs uppercase tracking-widest rounded-2xl h-11", privacyMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white/10 hover:bg-white/20")}>
                                    {privacyMode ? "Mostrar Valores" : "Ativar Sigilo"}
                                </Button>
                             </div>
                             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/20 transition-all" />
                        </Card>
                    </aside>
                </div>

                <div className="pt-20 pb-10 flex flex-col items-center gap-4 opacity-20 transition-opacity hover:opacity-100">
                    <div className="h-px w-full bg-slate-200" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">GESTÃO FLEX • SISTEMA DE MICROCRÉDITO</p>
                </div>
            </div>
        </div>
    );
}
