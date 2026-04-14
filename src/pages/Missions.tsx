import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useMissions } from "@/hooks/useMissions";
import { useStats } from "@/hooks/useStats";
import { MissionCard, MissionLocked } from "@/components/MissionCard";
import { XPBar } from "@/components/XPBar";

const Missions = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { profile } = useProfile();
    const { missions, fetchMissions, completeMission } = useMissions(user?.id, profile?.birthDate);
    const { stats, fetchStats, awardXp } = useStats(user?.id);
    const [completing, setCompleting] = useState<string | null>(null);
    const [xpGained, setXpGained] = useState<{ amount: number; id: string } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) { navigate("/onboarding"); return; }
        fetchMissions();
        fetchStats();
    }, [isAuthenticated, navigate, fetchMissions, fetchStats]);

    const handleComplete = async (missionId: string) => {
        if (!profile) return;
        setCompleting(missionId);
        const mission = missions.find(m => m.id === missionId);
        const personalNumber = mission?.personalNumber ?? 1;

        await completeMission(missionId, personalNumber, async (xp) => {
            const oldLevel = stats?.level || 1;
            await awardXp(xp);
            setXpGained({ amount: xp, id: missionId });

            setTimeout(() => setXpGained(null), 2500);
        });
        setCompleting(null);
    };

    const completed = missions.filter(m => m.isCompleted).length;
    const allDone = missions.length > 0 && completed === missions.length;

    return (
        <CosmicShell particles particlePalette="violet">
            <div className="min-h-screen pb-24 px-6 py-8 overflow-y-auto no-scrollbar">
                <header className="mb-8">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <button 
                            onClick={() => navigate("/dashboard")} 
                            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-sans"
                        >
                            <ArrowLeft className="h-4 w-4" /> Dashboard
                        </button>
                        {stats && <XPBar {...stats} compact />}
                    </div>
                </header>

                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="h-5 w-5 text-violet-400" />
                        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--cosm-font-display)" }}>
                            Misiones del Día
                        </h1>
                    </div>
                    <p className="text-xs font-sans mb-8" style={{ color: "hsl(260 10% 60%)" }}>
                        Basadas en tu número personal de hoy · {completed}/{missions.length} completadas
                    </p>

                    {stats && <div className="mb-8"><XPBar {...stats} /></div>}

                    {allDone && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 text-center mb-8 rounded-[32px]"
                            style={{ 
                                background: "hsla(145 60% 10% / 0.3)", 
                                border: "1px solid hsla(145 60% 40% / 0.3)" 
                            }}
                        >
                            <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                            <p className="font-bold text-white" style={{ fontFamily: "var(--cosm-font-display)" }}>
                                ¡Todas las misiones completadas!
                            </p>
                            <p className="text-xs font-sans mt-1 text-white/60">
                                Regresa mañana para nuevas misiones de poder.
                            </p>
                        </motion.div>
                    )}

                    <div className="space-y-4 relative">
                        <AnimatePresence>
                            {xpGained && (
                                <motion.div
                                    key={xpGained.id}
                                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, y: -20, scale: 1 }}
                                    exit={{ opacity: 0, y: -40 }}
                                    className="fixed top-24 right-6 bg-violet-600 text-white px-4 py-2 rounded-full font-sans font-bold text-sm shadow-[0_0_20px_hsla(270,80%,50%,0.5)] z-50"
                                >
                                    +{xpGained.amount} XP
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {missions.map((mission) => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                                onComplete={handleComplete}
                                isCompleting={completing === mission.id}
                            />
                        ))}
                        {missions.length < 3 && <MissionLocked />}
                    </div>

                    <div className="mt-12 text-center">
                        <Button 
                            variant="ghost" 
                            className="text-white/40 hover:text-white/70 text-xs font-sans" 
                            onClick={() => navigate("/journal")}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Abrir Diario de Sombras
                        </Button>
                    </div>
                </div>
            </div>
        </CosmicShell>
    );
};

export default Missions;
