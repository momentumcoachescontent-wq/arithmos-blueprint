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
        const personalNumber = missions.find(m => m.id === missionId)?.personalNumber ?? 1;
        await completeMission(missionId, personalNumber, async (xp) => {
            await awardXp(xp);
            setXpGained({ amount: xp, id: missionId });
            setTimeout(() => setXpGained(null), 2500);
        });
        setCompleting(null);
    };

    const completed = missions.filter(m => m.isCompleted).length;
    const allDone = missions.length > 0 && completed === missions.length;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Dashboard
                    </button>
                    {stats && <XPBar {...stats} compact />}
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h1 className="text-2xl font-serif font-semibold text-foreground">Misiones del Día</h1>
                </div>
                <p className="text-sm text-muted-foreground font-sans mb-8">
                    Basadas en tu número personal de hoy · {completed}/{missions.length} completadas
                </p>

                {stats && <div className="mb-8"><XPBar {...stats} /></div>}

                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center mb-8"
                    >
                        <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="font-serif text-foreground font-semibold">¡Todas las misiones completadas!</p>
                        <p className="text-sm text-muted-foreground font-sans mt-1">Regresa mañana para nuevas misiones de poder.</p>
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
                                className="fixed top-24 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full font-sans font-bold text-sm shadow-lg z-50"
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

                <div className="mt-8 text-center">
                    <Button variant="ghost" className="text-muted-foreground text-sm font-sans" onClick={() => navigate("/journal")}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Abrir Diario de Sombras
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Missions;
