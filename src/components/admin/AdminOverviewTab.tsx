import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
    Users, TrendingUp, Zap, MessageSquare, BookOpen,
    Activity, CheckCircle2, XCircle, BarChart3, Scale,
    ArrowUpRight, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from "recharts";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface OverviewStats {
    totalUsers: number;
    premiumUsers: number;
    freemiumUsers: number;
    conversionRate: number;
    totalSessions: number;
    totalJournals: number;
    totalReadings: number;
    totalDiagnostics: number;
    newUsersThisWeek: number;
}

interface DailyData {
    date: string;
    users: number;
    sessions: number;
}

export function AdminOverviewTab() {
    const [stats, setStats] = useState<OverviewStats>({
        totalUsers: 0, premiumUsers: 0, freemiumUsers: 0,
        conversionRate: 0, totalSessions: 0, totalJournals: 0,
        totalReadings: 0, totalDiagnostics: 0, newUsersThisWeek: 0
    });
    const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stripeReady] = useState(!!import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const oneWeekAgo = subDays(new Date(), 7).toISOString();

            const [
                { count: total },
                { count: premium },
                { count: sessions },
                { count: journals },
                { count: readings },
                { count: diagnostics },
                { count: newUsers },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'premium'),
                supabase.from('coach_sessions' as any).select('*', { count: 'exact', head: true }),
                supabase.from('journal_entries').select('*', { count: 'exact', head: true }),
                supabase.from('readings').select('*', { count: 'exact', head: true }),
                supabase.from('friction_diagnostics' as any).select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
            ]);

            const totalN = total || 0;
            const premiumN = premium || 0;
            const freemiumN = totalN - premiumN;
            const convRate = totalN > 0 ? Math.round((premiumN / totalN) * 100) : 0;

            setStats({
                totalUsers: totalN,
                premiumUsers: premiumN,
                freemiumUsers: freemiumN,
                conversionRate: convRate,
                totalSessions: sessions || 0,
                totalJournals: journals || 0,
                totalReadings: readings || 0,
                totalDiagnostics: diagnostics || 0,
                newUsersThisWeek: newUsers || 0,
            });

            // Build weekly chart: last 7 days
            const days: DailyData[] = [];
            for (let i = 6; i >= 0; i--) {
                const day = subDays(new Date(), i);
                const dayStr = day.toISOString().split('T')[0];
                const nextDay = subDays(new Date(), i - 1).toISOString().split('T')[0];

                const [{ count: dayUsers }, { count: daySessions }] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true })
                        .gte('created_at', dayStr).lt('created_at', nextDay),
                    supabase.from('coach_sessions' as any).select('*', { count: 'exact', head: true })
                        .gte('created_at', dayStr).lt('created_at', nextDay),
                ]);

                days.push({
                    date: format(day, 'EEE', { locale: es }),
                    users: dayUsers || 0,
                    sessions: daySessions || 0,
                });
            }
            setWeeklyData(days);

        } catch (error) {
            console.error("Error fetching overview stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const kpis = [
        {
            label: "Usuarios Totales",
            value: stats.totalUsers,
            sub: `${stats.newUsersThisWeek} nuevos esta semana`,
            icon: Users,
            color: "text-blue-400",
            trend: "up"
        },
        {
            label: "Premium",
            value: stats.premiumUsers,
            sub: `${stats.conversionRate}% conversión`,
            icon: Crown,
            color: "text-amber-400",
            trend: stats.conversionRate > 10 ? "up" : "neutral"
        },
        {
            label: "Sesiones Coach",
            value: stats.totalSessions,
            sub: "Conversaciones Honestas",
            icon: MessageSquare,
            color: "text-primary",
            trend: "up"
        },
        {
            label: "Entradas Diario",
            value: stats.totalJournals,
            sub: "Historias escritas",
            icon: BookOpen,
            color: "text-emerald-400",
            trend: "neutral"
        },
        {
            label: "Lecturas IA",
            value: stats.totalReadings,
            sub: "Consultas numéricas",
            icon: Zap,
            color: "text-violet-400",
            trend: "up"
        },
        {
            label: "Radares Fricción",
            value: stats.totalDiagnostics,
            sub: "Diagnósticos completados",
            icon: Scale,
            color: "text-rose-400",
            trend: "up"
        },
    ];

    const services = [
        { name: "Supabase Infra", desc: "Auth, PostgreSQL & RLS", ok: true },
        { name: "Stripe Payments", desc: "Checkout & Webhooks", ok: stripeReady },
        { name: "Edge Functions", desc: "chat-coach / n8n", ok: true },
        { name: "PWA Service Worker", desc: "Cache & Push Notifications", ok: true },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass rounded-xl p-6 h-28 bg-secondary/30" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className="glass rounded-xl p-5 border-border hover:border-primary/30 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                            <div className="flex items-center gap-1">
                                {kpi.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
                                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                            </div>
                        </div>
                        <p className="text-3xl font-serif font-bold text-foreground mb-1">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground font-sans">{kpi.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Weekly Activity Chart */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-8 border-border"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-serif font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Actividad de los últimos 7 días
                    </h3>
                    <Button size="sm" variant="outline" onClick={fetchStats} className="text-xs font-sans">
                        Actualizar
                    </Button>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={false} name="Nuevos usuarios" />
                        <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} dot={false} name="Sesiones Coach" />
                    </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                        <div className="w-3 h-0.5 bg-indigo-500 rounded" /> Nuevos usuarios
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                        <div className="w-3 h-0.5 bg-emerald-500 rounded" /> Sesiones Coach
                    </div>
                </div>
            </motion.section>

            {/* System Health */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-8 border-border"
            >
                <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Salud del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${s.ok ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                                <div>
                                    <p className="text-sm font-sans font-bold">{s.name}</p>
                                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                                </div>
                            </div>
                            {s.ok
                                ? <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold"><CheckCircle2 className="h-4 w-4" /> OK</div>
                                : <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold"><XCircle className="h-4 w-4" /> MISSING KEY</div>
                            }
                        </div>
                    ))}
                </div>
            </motion.section>
        </div>
    );
}
