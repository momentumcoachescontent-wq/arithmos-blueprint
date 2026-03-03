import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Crown, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface RankingEntry {
    user_id: string;
    xp: number;
    level: number;
    name: string;
    archetype: string;
    life_path_number: number;
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

    useEffect(() => {
        if (!isAuthenticated) { navigate("/onboarding"); return; }

        const fetchRanking = async () => {
            const { data } = await supabase
                .from('user_stats')
                .select(`
          user_id, xp, level,
          profiles!inner(name, archetype, life_path_number)
        `)
                .eq('show_in_ranking', true)
                .order('xp', { ascending: false })
                .limit(20);

            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setEntries(data.map((d: any) => ({
                    user_id: d.user_id,
                    xp: d.xp,
                    level: d.level,
                    name: d.profiles?.name || "Anónimo",
                    archetype: d.profiles?.archetype || "",
                    life_path_number: d.profiles?.life_path_number || 0,
                })));
            }
            setIsLoading(false);
        };

        fetchRanking();
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Dashboard
                    </button>
                    <span className="text-xs text-muted-foreground font-sans">Tribunal de Poder</span>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h1 className="text-2xl font-serif font-semibold text-foreground">Tribunal de Poder</h1>
                </div>
                <p className="text-sm text-muted-foreground font-sans mb-8">Los estrategas que más han transformado su sombra en poder.</p>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground font-sans">Cargando ranking...</p>
                ) : entries.length === 0 ? (
                    <div className="text-center py-16 bg-card border border-border rounded-xl">
                        <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-sans text-sm mb-2">El Tribunal aún está vacío.</p>
                        <p className="text-xs text-muted-foreground font-sans">Sé el primero en activar tu visibilidad en el Dashboard.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map((entry, idx) => {
                            const isMe = entry.user_id === user?.id;
                            const levelName = LEVEL_NAMES[entry.level] || `Nivel ${entry.level}`;
                            return (
                                <motion.div
                                    key={entry.user_id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-card border rounded-xl p-5 flex items-center gap-4 ${isMe ? "border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.1)]" : "border-border"
                                        }`}
                                >
                                    {/* Position */}
                                    <div className="w-8 flex items-center justify-center shrink-0">
                                        {idx < 3 ? POSITION_ICONS[idx] : (
                                            <span className="text-sm font-sans font-bold text-muted-foreground">{idx + 1}</span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-base font-serif font-bold text-primary">{entry.life_path_number}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-sans font-semibold text-foreground truncate">{entry.name}</p>
                                            {isMe && <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-sans">Tú</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-sans truncate">{entry.archetype} · {levelName}</p>
                                    </div>

                                    {/* XP */}
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-sans font-bold text-foreground">{entry.xp.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground font-sans">XP</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ranking;
