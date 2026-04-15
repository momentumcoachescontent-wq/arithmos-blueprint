import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Crown, Shield, MapPin, Globe, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CosmicShell from "@/ui/CosmicShell";
import { useAuth } from "@/hooks/useAuth";

interface RankingEntry {
    user_id: string;
    xp: number;
    level: number;
    name: string;
    archetype: string;
    life_path_number: number;
    birth_place?: string;
}

const LEVEL_NAMES: Record<number, string> = {
    1: "Iniciado", 2: "Explorador", 3: "Estratega", 4: "Guardián",
    5: "Visionario", 6: "Arquitecto", 7: "Maestro", 8: "Iluminado",
    9: "Alquimista", 10: "Trascendente",
};

const POSITION_ICONS = [
    <Crown key="1" className="h-5 w-5 text-amber-400" />,
    <Trophy key="2" className="h-5 w-5 text-slate-400" />,
    <Shield key="3" className="h-5 w-5 text-amber-600" />,
];

const Ranking = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [entries, setEntries] = useState<RankingEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [region, setRegion] = useState<"global" | "local">("local");
    const [timeframe, setTimeframe] = useState<"all-time" | "weekly">("weekly");
    const [userCity, setUserCity] = useState("Tu Ciudad");

    useEffect(() => {
        if (!isAuthenticated) { navigate("/onboarding"); return; }

        const fetchRanking = async () => {
            setIsLoading(true);
            const { data } = await supabase
                .from('user_stats')
                .select(`
                  user_id, xp, level,
                  profiles!inner(name, archetype, life_path_number, birth_place)
                `)
                .eq('show_in_ranking', true)
                .order('xp', { ascending: false })
                .limit(50); // Fetch more to do local filtering

            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = data.map((d: any) => ({
                    user_id: d.user_id,
                    xp: d.xp,
                    level: d.level,
                    name: d.profiles?.name || "Anónimo",
                    archetype: d.profiles?.archetype || "",
                    life_path_number: d.profiles?.life_path_number || 0,
                    birth_place: d.profiles?.birth_place || "Desconocido",
                }));

                const me = mapped.find(u => u.user_id === user?.id);
                if (me && me.birth_place !== "Desconocido") {
                  setUserCity(me.birth_place.split(",")[0]); // Just get city name
                }

                setEntries(mapped);
            }
            setIsLoading(false);
        };

        fetchRanking();
    }, [isAuthenticated, navigate, user?.id]);

    // Apply Filters (Simulated logic for PoC: dividing XP for weekly, filtering for local)
    const filteredEntries = useMemo(() => {
      let filtered = [...entries];
      
      if (region === "local") {
         filtered = filtered.filter(e => e.birth_place?.includes(userCity) || e.user_id === user?.id);
      }

      if (timeframe === "weekly") {
         // Simulate weekly XP (randomized deterministically based on user_id)
         filtered = filtered.map(e => ({
           ...e,
           xp: Math.round(e.xp * 0.1) // Fake 10% for weekly
         })).sort((a, b) => b.xp - a.xp);
      } else {
         filtered = filtered.sort((a, b) => b.xp - a.xp);
      }

      return filtered.slice(0, 20);
    }, [entries, region, timeframe, userCity, user?.id]);

    return (
        <CosmicShell particles particlePalette="violet">
            <div className="min-h-screen pb-32 overflow-y-auto no-scrollbar">
                <header className="px-6 py-4">
                    <div className="max-w-2xl mx-auto flex items-center justify-between opacity-80">
                        <button 
                            onClick={() => navigate("/dashboard")} 
                            className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-sans transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Volver al Blueprint
                        </button>
                        <span className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-black">Escalafón de Poder</span>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto px-6 pb-20">
                    <div className="mb-8 text-center pt-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <h1 className="text-4xl font-bold text-white italic mb-2 tracking-tighter" style={{ fontFamily: "var(--cosm-font-display)" }}>
                                El más <span className="text-violet-500">alineado</span>.
                            </h1>
                            <p className="text-sm text-white/40 font-sans max-w-[280px] mx-auto uppercase tracking-wide">
                                Compite por la máxima frecuencia vibracional en tu zona.
                            </p>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="cosmic-card p-2 mb-10 flex flex-col gap-2 bg-white/5 border-white/10">
                        {/* Region Toggle */}
                        <div className="flex w-full bg-black/40 rounded-2xl p-1 border border-white/5">
                            <button 
                                onClick={() => setRegion("local")}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${region === 'local' ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                            >
                                <MapPin className="w-3.5 h-3.5" /> {userCity}
                            </button>
                            <button 
                                onClick={() => setRegion("global")}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${region === 'global' ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                            >
                                <Globe className="w-3.5 h-3.5" /> Global
                            </button>
                        </div>
                        {/* Timeframe Toggle */}
                        <div className="flex w-full bg-black/40 rounded-2xl p-1 border border-white/5">
                            <button 
                                onClick={() => setTimeframe("weekly")}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${timeframe === 'weekly' ? 'bg-white/10 text-emerald-400 shadow-[0_0_15px_-5px_hsla(142,70%,45%,0.3)]' : 'text-white/20 hover:text-white/40'}`}
                            >
                                <Calendar className="w-3.5 h-3.5" /> Semana
                            </button>
                            <button 
                                onClick={() => setTimeframe("all-time")}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${timeframe === 'all-time' ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                            >
                                <Clock className="w-3.5 h-3.5" /> Histórico
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Sincronizando Frecuencias...</span>
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="text-center py-20 cosmic-card border-dashed border-white/10">
                            <Trophy className="h-12 w-12 text-white/10 mx-auto mb-6" />
                            <p className="text-white font-bold text-sm mb-2 uppercase tracking-widest">Territorio Virgen</p>
                            <p className="text-[11px] text-white/40 font-sans max-w-[220px] mx-auto leading-relaxed">
                                No hay registros en tu zona. Invita a otros con el <span className="text-violet-400">Radar Cósmico</span> para dominar esta región.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredEntries.map((entry, idx) => {
                                    const isMe = entry.user_id === user?.id;
                                    const isTop3 = idx < 3;
                                    return (
                                        <motion.div
                                            layout
                                            key={entry.user_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`relative rounded-[2.5rem] p-5 flex items-center gap-5 border transition-all ${isMe ? "border-violet-500/40 bg-violet-600/10 shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)]" : "border-white/5 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/10"} backdrop-blur-xl relative overflow-hidden`}
                                        >
                                            {/* Position Label */}
                                            <div className="w-10 flex items-center justify-center shrink-0">
                                                {isTop3 ? POSITION_ICONS[idx] : (
                                                    <span className="text-xs font-black text-white/20">#{idx + 1}</span>
                                                )}
                                            </div>

                                            {/* User Bio Wrapper */}
                                            <div className="flex flex-1 items-center gap-4 min-w-0">
                                                {/* Archetype Badge */}
                                                <div className="w-14 h-14 rounded-[1.25rem] bg-black/40 border border-white/10 flex items-center justify-center shrink-0 relative group">
                                                    <span className="text-2xl font-bold text-white/90" style={{ fontFamily: "var(--cosm-font-display)" }}>{entry.life_path_number}</span>
                                                    {isMe && <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border border-black animate-pulse" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-sm font-black text-white truncate uppercase tracking-tight">{entry.name}</p>
                                                        {isMe && <span className="text-[8px] uppercase tracking-widest font-black bg-violet-500 text-white px-2 py-0.5 rounded-full shadow-lg">YO</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-white/30 font-black truncate uppercase tracking-widest">{entry.archetype}</p>
                                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span className="text-[9px] text-violet-400 font-bold uppercase tracking-tighter truncate">{entry.birth_place?.split(',')[0]}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* XP Score */}
                                            <div className="text-right shrink-0 pr-2">
                                                <p className={`text-xl font-bold tracking-tighter transition-colors ${isMe ? 'text-violet-300' : 'text-white'}`} style={{ fontFamily: "var(--cosm-font-display)" }}>
                                                    {entry.xp.toLocaleString()}
                                                </p>
                                                <p className="text-[8px] uppercase font-black tracking-[0.2em] text-white/20">XP Freq</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </CosmicShell>
    );
};

export default Ranking;
