import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Zap, Wind, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useSynchronicity } from "@/hooks/useSynchronicity";

const Synchronicity = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { analyzeEvent, isAnalyzing, result, limitReached, checkLimit } = useSynchronicity(user?.id);
    const [description, setDescription] = useState("");

    useState(() => {
        checkLimit();
    });

    const handleAnalyze = async () => {
        if (!description.trim() || limitReached) return;
        try {
            await analyzeEvent(description);
        } catch (error: any) {
            console.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-background px-6 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 text-sm font-sans"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Dashboard
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm uppercase tracking-[0.3em] text-bronze font-sans">
                            Consultas de Sincronicidad
                        </p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gradient-silver mb-6">
                        El lenguaje del Caos Ordenado
                    </h1>
                    <p className="text-muted-foreground font-sans text-lg max-w-2xl leading-relaxed">
                        Describe ese número repetido, coincidencia extraña o evento inusual que has experimentado hoy. Arithmos lo analizará bajo tu frecuencia personal.
                    </p>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-8 border-border mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wind className="h-24 w-24 text-primary" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        {limitReached && (
                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-500 font-sans text-sm">
                                <ShieldAlert className="h-5 w-5 shrink-0" />
                                Has alcanzado el límite de 3 consultas diarias. Vuelve en 24 horas para más revelaciones.
                            </div>
                        )}

                        <Textarea
                            placeholder="Ej: He visto el número 222 tres veces en el camino al trabajo, y luego recibí un correo de un cliente antiguo..."
                            className="min-h-[150px] bg-secondary/50 border-border font-sans text-lg focus:ring-primary/20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={limitReached}
                        />

                        <Button
                            onClick={handleAnalyze}
                            disabled={!description.trim() || isAnalyzing || limitReached}
                            className={`w-full h-14 text-lg font-medium gap-2 ${limitReached ? 'bg-muted cursor-not-allowed text-muted-foreground' : 'glow-indigo'}`}
                        >
                            {isAnalyzing ? (
                                <motion.div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Descifrando Patrones...
                                </motion.div>
                            ) : limitReached ? (
                                "Límite Diario Alcanzado"
                            ) : (
                                <>
                                    Analizar Sincronicidad
                                    <Send className="h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6 mb-20"
                        >
                            <div className="glass rounded-2xl p-8 border-primary/20 relative">
                                <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-400" />
                                    Análisis Narrativo
                                </h3>
                                <p className="text-foreground/90 font-sans leading-relaxed text-lg italic border-l-2 border-amber-400/50 pl-6">
                                    "{result.analysis}"
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="glass rounded-xl p-6 border-indigo-500/20 bg-indigo-500/5">
                                    <h4 className="flex items-center gap-2 text-sm font-sans font-bold uppercase tracking-widest text-indigo-400 mb-4">
                                        <ShieldAlert className="h-4 w-4" />
                                        Grado de Relevancia
                                    </h4>
                                    <div className="relative h-4 w-full bg-background/50 rounded-full overflow-hidden border border-border/30">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.significance}%` }}
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 font-sans text-right">
                                        {result.significance}% — Intensidad de la señal detectada
                                    </p>
                                </div>

                                <div className="glass rounded-xl p-6 border-emerald-500/20 bg-emerald-500/5">
                                    <h4 className="flex items-center gap-2 text-sm font-sans font-bold uppercase tracking-widest text-emerald-400 mb-4">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Paso Táctico Sugerido
                                    </h4>
                                    <p className="text-foreground/90 font-sans text-sm">
                                        {result.actionStep}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Synchronicity;
