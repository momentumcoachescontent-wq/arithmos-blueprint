import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Zap, Wind, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useSynchronicity } from "@/hooks/useSynchronicity";

const Gauge = ({ value, label, color }: { value: number; label: string; color: string }) => {
    const radius = 40;
    const circumference = Math.PI * radius; // Media luna
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative h-24 w-40 flex items-end justify-center overflow-hidden">
                <svg className="w-full h-full transform translate-y-2">
                    {/* Background Arc */}
                    <path
                        d="M 10 80 A 70 70 0 0 1 150 80"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Progress Arc */}
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: value / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        d="M 10 80 A 70 70 0 0 1 150 80"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute top-10 flex flex-col items-center">
                    <span className="text-3xl font-serif font-bold text-foreground">
                        {value}%
                    </span>
                </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-sans text-center">
                {label}
            </p>
        </div>
    );
};

const Synchronicity = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { analyzeEvent, isAnalyzing, result, limitReached, checkLimit, reset } = useSynchronicity(user?.id);
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
        <div className="min-h-screen bg-background px-6 py-12 pb-32">
            <div className="max-w-4xl mx-auto">
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
                        Describe ese número repetido, coincidencia extraña o evento inusual. Arithmos lo analizará bajo tu frecuencia personal.
                    </p>
                </motion.div>

                {/* Input Section */}
                {!result && (
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
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 font-sans text-sm">
                                    <ShieldAlert className="h-5 w-5 shrink-0" />
                                    Has alcanzado el límite de 3 consultas diarias. Vuelve en 24 horas.
                                </div>
                            )}

                            <Textarea
                                placeholder="Describe el evento sin preocuparte por los números..."
                                className="min-h-[150px] bg-secondary/50 border-border font-sans text-lg focus:ring-primary/20"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={limitReached}
                            />

                            <Button
                                onClick={handleAnalyze}
                                disabled={!description.trim() || isAnalyzing || limitReached}
                                className={`w-full h-14 text-lg font-medium gap-2 ${limitReached ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'glow-indigo'}`}
                            >
                                {isAnalyzing ? (
                                    <motion.div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sintonizando Frecuencia...
                                    </motion.div>
                                ) : (
                                    <>
                                        Analizar Sincronicidad
                                        <Send className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="glass rounded-3xl p-10 border-primary/20 relative shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                                <h3 className="text-xl font-serif font-semibold mb-8 flex items-center gap-3 text-amber-400">
                                    <Zap className="h-6 w-6" />
                                    Revelación del Coach
                                </h3>
                                <p className="text-foreground/90 font-serif leading-relaxed text-xl italic border-l-4 border-amber-400/30 pl-8 mb-12">
                                    "{result.analysis}"
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-border/20">
                                    <Gauge
                                        value={result.significance}
                                        label="Grado de Relevancia"
                                        color="#818cf8"
                                    />
                                    <Gauge
                                        value={result.influence}
                                        label="Grado de Influencia"
                                        color="#fbbf24"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-1 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="glass rounded-2xl p-8 border-emerald-500/20 bg-emerald-500/5 flex items-start gap-6"
                                >
                                    <div className="p-3 rounded-full bg-emerald-500/20">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-emerald-400 mb-2">
                                            Paso Táctico Sugerido
                                        </h4>
                                        <p className="text-foreground/80 font-sans text-lg leading-relaxed">
                                            {result.actionStep}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex justify-center pt-8">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        reset();
                                        setDescription("");
                                    }}
                                    className="text-muted-foreground hover:text-foreground gap-2"
                                >
                                    Realizar otra consulta
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Synchronicity;
