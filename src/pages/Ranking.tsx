import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Crown, Shield, MapPin, Globe, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
        <div className="min-h-screen bg-[#0a0512]">
            <header className="px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between opacity-80">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-white hover:text-white/70 text-sm font-sans transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Retroceder
                    </button>
                    <span className="text-[10px] tracking-widest uppercase text-white/50 font-bold">Gamificación Local</span>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 pb-20">
                <div className="mb-8 text-center pt-4">
                    <h1 className="text-3xl font-black text-white italic mb-2 tracking-tighter" style={{ fontFamily: "var(--cosm-font-display)" }}>
                        El más alineado.
                    </h1>
                    <p className="text-sm text-white/60 font-sans max-w-[280px] mx-auto">
                        Compite por la máxima frecuencia vibracional en tu zona.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-1 mb-8 flex flex-col gap-1 backdrop-blur-xl">
                   {/* Region Toggle */}
                   <div className="flex w-full">
                     <button 
                       onClick={() => setRegion("local")}
                       className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${region === 'local' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                     >
                       <MapPin className="w-3 h-3" /> {userCity}
                     </button>
                     <button 
                       onClick={() => setRegion("global")}
                       className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${region === 'global' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                     >
                       <Globe className="w-3 h-3" /> Global
                     </button>
                   </div>
                   {/* Timeframe Toggle */}
                   <div className="flex w-full">
                     <button 
                       onClick={() => setTimeframe("weekly")}
                       className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${timeframe === 'weekly' ? 'bg-white/10 text-emerald-400' : 'text-white/40'}`}
                     >
                       <Calendar className="w-3 h-3" /> Semana
                     </button>
                     <button 
                       onClick={() => setTimeframe("all-time")}
                       className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${timeframe === 'all-time' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                     >
                       <Clock className="w-3 h-3" /> Histórico
                     </button>
                   </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                        <Trophy className="h-10 w-10 text-white/20 mx-auto mb-4" />
                        <p className="text-white/80 font-sans text-sm mb-2 font-bold">Aún no hay nadie en tu región.</p>
                        <p className="text-xs text-white/50 font-sans max-w-[200px] mx-auto">Invita a tus amigos con el Radar Cósmico para empezar la competencia local.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                        {filteredEntries.map((entry, idx) => {
                            const isMe = entry.user_id === user?.id;
                            const levelName = LEVEL_NAMES[entry.level] || `Nivel ${entry.level}`;
                            return (
                                <motion.div
                                    layout
                                    key={entry.user_id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className={`relative rounded-2xl p-4 flex items-center gap-4 border overflow-hidden ${isMe ? "border-purple-500/50 bg-purple-500/10" : "border-white/10 bg-white/5"} backdrop-blur-md`}
                                >
                                    {isMe && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />}

                                    {/* Position */}
                                    <div className="w-8 flex items-center justify-center shrink-0">
                                        {idx < 3 ? POSITION_ICONS[idx] : (
                                            <span className="text-sm font-sans font-black text-white/40">{idx + 1}</span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full border border-white/20 bg-black flex items-center justify-center shrink-0 shadow-inner">
                                        <span className="text-xl font-serif font-bold text-white opacity-80">{entry.life_path_number}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 z-10">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-sans font-black text-white truncate uppercase tracking-tight">{entry.name}</p>
                                            {isMe && <span className="text-[9px] uppercase tracking-widest font-black bg-purple-500 text-white px-2 py-0.5 rounded-full">Tú</span>}
                                        </div>
                                        <p className="text-[11px] text-white/50 font-sans truncate font-medium uppercase tracking-widest mt-0.5">{entry.archetype}</p>
                                    </div>

                                    {/* XP */}
                                    <div className="text-right shrink-0 z-10">
                                        <p className={`text-base font-sans font-black ${isMe ? 'text-purple-300' : 'text-white'}`}>{entry.xp.toLocaleString()}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">XP</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ranking;
