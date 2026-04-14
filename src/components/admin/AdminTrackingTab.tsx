import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Clock, MousePointerClick, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export function AdminTrackingTab() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTelemetry = async () => {
            const { data, error } = await supabase
                .from('user_telemetry')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1000); // Last 1000 events for quick dashboard
            
            if (data) setEvents(data);
            setIsLoading(false);
        };
        fetchTelemetry();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10 text-muted-foreground">Cargando telemetría...</div>;
    }

    // Process data for charts
    const featuresCount = events.reduce((acc, event) => {
        if (event.target_feature && event.event_name !== 'heartbeat') {
            acc[event.target_feature] = (acc[event.target_feature] || 0) + 1;
        }
        return acc;
    }, {});

    const pieData = Object.entries(featuresCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);

    // Calculate average session duration
    // A session is grouped by session_id. We find max duration for each session.
    const sessions = events.reduce((acc, event) => {
        if (!acc[event.session_id]) acc[event.session_id] = 0;
        if (event.duration_seconds > acc[event.session_id]) {
            acc[event.session_id] = event.duration_seconds;
        }
        return acc;
    }, {});

    const totalDuration = Object.values(sessions).reduce((a: any, b: any) => a + b, 0);
    const avgSessionSeconds = Object.keys(sessions).length > 0 
        ? Math.floor((totalDuration as number) / Object.keys(sessions).length) 
        : 0;
    
    const avgMinutes = Math.floor(avgSessionSeconds / 60);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Centro de Rastreo y Comportamiento</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass rounded-xl p-6 border-border flex items-center justify-between">
                    <div>
                        <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1">Promedio Sesión</p>
                        <p className="text-3xl font-serif font-bold text-foreground">{avgMinutes} min</p>
                    </div>
                    <Clock className="w-8 h-8 text-emerald-400 opacity-80" />
                </div>
                <div className="glass rounded-xl p-6 border-border flex items-center justify-between">
                    <div>
                        <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1">Eventos Atrapados</p>
                        <p className="text-3xl font-serif font-bold text-foreground">{events.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-400 opacity-80" />
                </div>
                <div className="glass rounded-xl p-6 border-border flex items-center justify-between">
                    <div>
                        <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1">Sesiones Únicas</p>
                        <p className="text-3xl font-serif font-bold text-foreground">{Object.keys(sessions).length}</p>
                    </div>
                    <MousePointerClick className="w-8 h-8 text-purple-400 opacity-80" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 border-border">
                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> Funciones más usadas
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', borderColor: '#ffffff20' }} 
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center flex-wrap gap-3 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-xl p-6 border-border">
                    <h3 className="text-sm font-semibold mb-4">Feed de Eventos en Vivo (10 recientes)</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                        {events.slice(0, 10).map((ev) => (
                            <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                                <div>
                                    <p className="text-sm font-medium text-foreground">{ev.event_name}</p>
                                    <p className="text-xs text-muted-foreground">Target: {ev.target_feature || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(ev.created_at).toLocaleTimeString('es-MX')}
                                    </p>
                                    {ev.duration_seconds > 0 && (
                                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {ev.duration_seconds}s
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
