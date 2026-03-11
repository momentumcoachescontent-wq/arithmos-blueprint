import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Zap, User, Calendar, ShieldAlert, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, calculateLifePath, ARCHETYPES } from "@/hooks/useProfile";
import { toast } from "sonner";

// Lógica básica temporal de compatibilidad y sinergia (Tono Coach Senior)
const getSynergyReading = (lp1: number, lp2: number) => {
    const diff = Math.abs(lp1 - lp2);
    const isMaster = (num: number) => [11, 22, 33].includes(num);
    const hasMaster = isMaster(lp1) || isMaster(lp2);

    if (lp1 === lp2) {
        return {
            title: "Espejo de Poder",
            description: "Fricción por similitud. Ven el mundo a través del mismo lente táctico. La clave no es competir por la visión, sino dividir el terreno de ejecución. Si no dominan su ego, se anularán mutuamente.",
            score: 85
        };
    } else if (hasMaster) {
        return {
            title: "Colisión de Alta Frecuencia",
            description: "Hay un maestro en la ecuación. La dinámica exige que la visión se ancle en la realidad material. Esta sinergia no permite mediocridad; o se elevan o el sistema colapsa por exceso de voltaje.",
            score: 95
        };
    } else if (diff % 2 === 0) {
        return {
            title: "Simetría Estructural",
            description: "Tienen ritmos de operación compatibles. La energía fluye sin tanta resistencia, pero cuidado con el letargo. Necesitan inyectar fricción creativa para no estancarse en la comodidad.",
            score: 75
        };
    } else {
        return {
            title: "Fricción Evolutiva",
            description: "Dinámica de opuestos. Lo que te falta, el otro lo tiene. Esta es una alianza estratégica pura. La tensión inicial es necesaria; transfórmala en tracción y dominarán el terreno.",
            score: 65
        };
    }
};

const TribunalPoder = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile } = useProfile();
    const [targetName, setTargetName] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    if (!user || !profile) return null;

    const handleSimulate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!targetName || !targetDate) {
            toast.error("Datos incompletos", { description: "Ingresa el nombre y fecha de nacimiento de tu objetivo." });
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        // Simulamos un tiempo de "análisis" para efecto dramático
        setTimeout(() => {
            const targetLP = calculateLifePath(targetDate);
            if (targetLP === 0) {
                toast.error("Fecha inválida", { description: "Formato esperado: YYYY-MM-DD" });
                setIsAnalyzing(false);
                return;
            }

            const targetArchetype = ARCHETYPES[targetLP] || ARCHETYPES[1];
            const synergy = getSynergyReading(profile.lifePathNumber, targetLP);

            setResult({
                name: targetName,
                lifePath: targetLP,
                archetype: targetArchetype.name,
                synergy
            });
            setIsAnalyzing(false);
        }, 1500);
    };

    const resetSimulator = () => {
        setResult(null);
        setTargetName("");
        setTargetDate("");
    };

    return (
        <div className="min-h-screen bg-background px-6 py-12">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Volver al Blueprint
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-sans font-bold uppercase tracking-widest border border-amber-500/20">
                        <Trophy className="h-3 w-3" /> Modo Freemium
                    </div>
                </div>

                {/* Título & Contexto */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Zap className="h-6 w-6 text-amber-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                            Tribunal de <span className="text-amber-500 italic">Poder</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-sans leading-relaxed text-sm md:text-base max-w-2xl">
                        Simulador de sinergia estratégica. Ingresa los datos de un socio, pareja o adversario para decodificar la dinámica oculta entre ambas arquitecturas numerológicas. Conoce si operan como espejo, fricción o colisión de alto octanaje.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            onSubmit={handleSimulate}
                            className="glass rounded-2xl p-6 md:p-8 border-border"
                        >
                            <div className="space-y-6">
                                <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                                    Identificar Objetivo
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Nombre del Objetivo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                            <Input
                                                type="text"
                                                placeholder="Ej. Carlos Slim"
                                                value={targetName}
                                                onChange={(e) => setTargetName(e.target.value)}
                                                className="pl-10 h-14 bg-background/50 border-input font-sans text-lg focus-visible:ring-amber-500/50"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Fecha de Nacimiento</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                            <Input
                                                type="date"
                                                value={targetDate}
                                                onChange={(e) => setTargetDate(e.target.value)}
                                                className="pl-10 h-14 bg-background/50 border-input font-sans text-lg focus-visible:ring-amber-500/50"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isAnalyzing}
                                    className="w-full h-14 text-base font-bold tracking-wide gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-none shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] transition-all"
                                >
                                    {isAnalyzing ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 animate-pulse" />
                                            Decodificando Matriz...
                                        </motion.div>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5" />
                                            Desatar Análisis de Sinergia
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Comparativa de Números */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass rounded-xl p-6 border-primary/20 bg-primary/5 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Sparkles className="w-16 h-16" />
                                    </div>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Tu Arsenal</p>
                                    <h4 className="font-serif font-bold text-lg text-foreground truncate">{profile.name.split(' ')[0]}</h4>
                                    <div className="mt-4 flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-serif font-bold text-primary">{profile.lifePathNumber}</span>
                                        <span className="text-sm font-sans text-primary/60">({profile.archetype})</span>
                                    </div>
                                </div>
                                <div className="glass rounded-xl p-6 border-amber-500/20 bg-amber-500/5 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Zap className="w-16 h-16" />
                                    </div>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">El Objetivo</p>
                                    <h4 className="font-serif font-bold text-lg text-foreground truncate">{result.name.split(' ')[0]}</h4>
                                    <div className="mt-4 flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-serif font-bold text-amber-500">{result.lifePath}</span>
                                        <span className="text-sm font-sans text-amber-500/60">({result.archetype})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Veredicto */}
                            <div className="glass rounded-2xl p-8 border-amber-500/20 shadow-[0_0_30px_-10px_rgba(245,158,11,0.1)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-foreground">
                                            {result.synergy.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500" style={{ width: `${result.synergy.score}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-amber-500">{result.synergy.score}% Afinidad Táctica</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <p className="text-muted-foreground font-sans text-lg leading-relaxed border-l-2 border-amber-500/50 pl-4 py-1 italic">
                                        "{result.synergy.description}"
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border">
                                    <Button
                                        onClick={resetSimulator}
                                        variant="outline"
                                        className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <Activity className="h-4 w-4" />
                                        Analizar Nuevo Objetivo
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TribunalPoder;
