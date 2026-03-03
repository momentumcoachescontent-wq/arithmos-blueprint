import { motion } from "framer-motion";

interface XPBarProps {
    xp: number;
    level: number;
    progressPercent: number;
    nextLevelXp: number;
    compact?: boolean;
}

const LEVEL_NAMES: Record<number, string> = {
    1: "Iniciado",
    2: "Explorador",
    3: "Estratega",
    4: "Guardián",
    5: "Visionario",
    6: "Arquitecto",
    7: "Maestro",
    8: "Iluminado",
    9: "Alquimista",
    10: "Trascendente",
};

export function XPBar({ xp, level, progressPercent, nextLevelXp, compact = false }: XPBarProps) {
    const levelName = LEVEL_NAMES[level] || `Nivel ${level}`;

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sans font-bold text-primary">{levelName}</span>
                    <span className="text-xs text-muted-foreground font-sans">· Nv.{level}</span>
                </div>
                <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                    />
                </div>
                <span className="text-xs text-muted-foreground font-sans">{xp} XP</span>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <span className="text-sm font-serif font-semibold text-foreground">{levelName}</span>
                    <span className="ml-2 text-xs text-muted-foreground font-sans">Nivel {level}</span>
                </div>
                <div className="text-right">
                    <span className="text-xs text-muted-foreground font-sans">{xp} / {nextLevelXp} XP</span>
                </div>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(270, 70%, 65%))"
                    }}
                />
            </div>
            <p className="text-xs text-muted-foreground font-sans mt-2 text-center">
                {nextLevelXp - xp} XP para {LEVEL_NAMES[level + 1] || `Nivel ${level + 1}`}
            </p>
        </div>
    );
}
