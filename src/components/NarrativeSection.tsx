import { motion } from "framer-motion";
import { Sparkles, Zap, Eye } from "lucide-react";

interface NarrativeSectionProps {
    narrative?: string;
    powerStrategy?: string;
    shadowWork?: string;
    archetypeName: string;
}

export function NarrativeSection({
    narrative,
    powerStrategy,
    shadowWork,
    archetypeName,
}: NarrativeSectionProps) {
    const hasData = narrative || powerStrategy || shadowWork;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 space-y-4"
        >
            <h3 className="text-xs font-sans tracking-widest text-muted-foreground uppercase">
                Interpretación Maestra · {archetypeName}
            </h3>

            {!hasData && (
                <div className="bg-card/30 border border-dashed border-border rounded-xl p-8 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-sans text-muted-foreground italic">
                        Tu análisis narrativo profundo está siendo procesado por el Coach Arithmos.
                        Presiona "Recalcular" o vuelve en unos instantes para sintonizar tu frecuencia.
                    </p>
                </div>
            )}

            {/* Narrativa Principal */}
            {narrative && (
                <div className="relative bg-card border border-border rounded-xl p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-purple-500 to-transparent" />
                    <div className="flex gap-3 mb-3">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs font-sans font-semibold text-primary uppercase tracking-wider">
                            Tu Lectura de Vida
                        </span>
                    </div>
                    <p className="text-sm font-sans text-foreground/90 leading-relaxed">
                        {narrative}
                    </p>
                </div>
            )}

            {/* Estrategia de Poder + Trabajo de Sombra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {powerStrategy && (
                    <div className="bg-card border border-primary/20 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="h-4 w-4 text-primary" />
                                <span className="text-xs font-sans font-bold text-primary uppercase tracking-wider">
                                    Estrategia de Poder
                                </span>
                            </div>
                            <p className="text-sm font-sans text-foreground/85 leading-relaxed">
                                {powerStrategy}
                            </p>
                        </div>
                    </div>
                )}

                {shadowWork && (
                    <div className="bg-card border border-border/60 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Eye className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-sans font-bold text-amber-500 uppercase tracking-wider">
                                    Trabajo de Sombra
                                </span>
                            </div>
                            <p className="text-sm font-sans text-foreground/75 leading-relaxed italic">
                                {shadowWork}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
