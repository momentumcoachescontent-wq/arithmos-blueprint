import { motion } from "framer-motion";
import { CheckCircle2, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mission } from "@/hooks/useMissions";

interface MissionCardProps {
    mission: Mission;
    onComplete: (missionId: string) => void;
    isCompleting?: boolean;
}

export function MissionCard({ mission, onComplete, isCompleting }: MissionCardProps) {
    const isMaster = mission.personalNumber && [11, 22, 33].includes(mission.personalNumber);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-card border rounded-xl p-5 overflow-hidden transition-all ${mission.isCompleted
                    ? "border-primary/30 opacity-70"
                    : isMaster
                        ? "border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                        : "border-border hover:border-border/80"
                }`}
        >
            {isMaster && !mission.isCompleted && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-purple-500 to-transparent" />
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        {isMaster && (
                            <Star className="h-3 w-3 text-primary shrink-0" fill="currentColor" />
                        )}
                        <h3 className={`text-sm font-serif font-semibold truncate ${mission.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                            }`}>
                            {mission.title}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                        {mission.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-sans font-bold text-primary">+{mission.xpReward} XP</span>
                        {isMaster && (
                            <span className="text-[10px] font-sans bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Número Maestro
                            </span>
                        )}
                    </div>
                </div>

                <div className="shrink-0">
                    {mission.isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isCompleting}
                            onClick={() => onComplete(mission.id)}
                            className="text-xs font-sans h-8 px-3 border-primary/30 hover:bg-primary/10 hover:border-primary"
                        >
                            Completar
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function MissionLocked() {
    return (
        <div className="bg-card border border-border rounded-xl p-5 opacity-50 flex items-center gap-4">
            <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
                <p className="text-sm font-sans text-muted-foreground">Misión adicional desbloqueada al completar las anteriores</p>
            </div>
        </div>
    );
}
