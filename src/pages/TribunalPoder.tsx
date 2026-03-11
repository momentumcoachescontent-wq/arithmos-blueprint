import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Zap, User, Calendar, ShieldAlert, Sparkles, Activity, Target, Heart, Eye, Milestone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, calculateLifePath, ARCHETYPES, calculateNameValue, reduceToSingleDigitOrMaster } from "@/hooks/useProfile";
import { toast } from "sonner";

// Funciones de cálculo rápido numerológico
const getSoulUrge = (name: string) => reduceToSingleDigitOrMaster(calculateNameValue(name, 'vowels'));
const getPersonality = (name: string) => reduceToSingleDigitOrMaster(calculateNameValue(name, 'consonants'));
const getExpression = (name: string) => reduceToSingleDigitOrMaster(calculateNameValue(name, 'all'));
const getMaturity = (lp: number, exp: number) => reduceToSingleDigitOrMaster(lp + exp);

// Base de sinergia entre Camino de Vida principal
const getSynergyReading = (lp1: number, lp2: number) => {
    const diff = Math.abs(lp1 - lp2);
    const hasMaster = [11, 22, 33].includes(lp1) || [11, 22, 33].includes(lp2);

    if (lp1 === lp2) {
        return {
            title: "Espejo de Poder",
            description: "Fricción por similitud. Ven el mundo a través del mismo lente táctico. La clave no es competir por la visión, sino dividir el terreno de ejecución. Si no dominan su ego, se anularán mutuamente.",
            score: 85,
            strategy: "Deleguen áreas exclusivas de mando. Jamás microgestionen al otro.",
            care: "Cuidado con proyectar su propia autocrítica en el otro. Reconozcan el cansancio espejo."
        };
    } else if (hasMaster) {
        return {
            title: "Colisión de Alta Frecuencia",
            description: "Hay un maestro en la ecuación. La dinámica exige que la visión se ancle en la realidad material. Esta sinergia no permite mediocridad; o se elevan o el sistema colapsa por exceso de voltaje.",
            score: 95,
            strategy: "Anclen la visión utópica a métricas diarias de la realidad (grounding).",
            care: "El que sostiene el número maestro no debe volverse un tirano espiritual; el otro no debe sentirse empequeñecido."
        };
    } else if (diff % 2 === 0) {
        return {
            title: "Simetría Estructural",
            description: "Tienen ritmos de operación compatibles. La energía fluye sin tanta resistencia, pero cuidado con el letargo. Necesitan inyectar fricción creativa para no estancarse en la comodidad.",
            score: 75,
            strategy: "Establezcan retos a corto plazo para romper la inercia. Innoven al menos una vez por mes.",
            care: "Eviten el exceso de pasividad colectiva. Rompan la codependencia tomando descansos separados."
        };
    } else {
        return {
            title: "Fricción Evolutiva",
            description: "Dinámica de opuestos. Lo que te falta, el otro lo tiene. Esta es una alianza estratégica pura. La tensión inicial es necesaria; transfórmala en tracción y dominarán el terreno.",
            score: 65,
            strategy: "Conviertan el conflicto en dialéctica: Que gane la mejor idea, no el ego más grande.",
            care: "La irritación inicial constante; filtren la forma en la que se exigen mutuamente para que no sea un desgaste inútil."
        };
    }
};

const getDetailedCompatibility = (uNum: number, tNum: number, label: string) => {
    const isOdd1 = uNum % 2 !== 0;
    const isOdd2 = tNum % 2 !== 0;
    if (uNum === tNum) return `Alineación exacta en ${label}. Resuenan en la misma frecuencia sin esfuerzo.`;
    if (isOdd1 === isOdd2) return `Concordancia en ${label}. Sus impulsos fluyen paralelos aunque con matices distintos.`;
    return `Tensión dinámica en ${label}. Requieren negociación explícita para conciliar enfoques divergentes.`;
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

        setTimeout(() => {
            const tLP = calculateLifePath(targetDate);
            if (tLP === 0) {
                toast.error("Fecha inválida");
                setIsAnalyzing(false);
                return;
            }

            // Cálculos del usuario (Arsenal)
            const uExp = getExpression(profile.name);
            const uSoul = getSoulUrge(profile.name);
            const uPer = getPersonality(profile.name);
            const uMat = getMaturity(profile.lifePathNumber, uExp);

            // Cálculos del Objetivo
            const tExp = getExpression(targetName);
            const tSoul = getSoulUrge(targetName);
            const tPer = getPersonality(targetName);
            const tMat = getMaturity(tLP, tExp);

            const targetArchetype = ARCHETYPES[tLP] || ARCHETYPES[1];
            const synergy = getSynergyReading(profile.lifePathNumber, tLP);

            setResult({
                target: {
                    name: targetName,
                    lp: tLP,
                    exp: tExp,
                    soul: tSoul,
                    per: tPer,
                    mat: tMat,
                    archetype: targetArchetype.name
                },
                user: {
                    lp: profile.lifePathNumber,
                    exp: uExp,
                    soul: uSoul,
                    per: uPer,
                    mat: uMat,
                },
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
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
                        <ArrowLeft className="h-4 w-4" /> Volver al Blueprint
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-sans font-bold uppercase tracking-widest border border-amber-500/20">
                        <Trophy className="h-3 w-3" /> Arsenal Analítico
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Zap className="h-6 w-6 text-amber-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                            Tribunal de <span className="text-amber-500 italic">Poder</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-sans leading-relaxed text-sm md:text-base max-w-3xl">
                        Simulador avanzado de compatibilidad estratégica. Introduce los datos clave de tu socio, cliente o pareja para desentrañar la integración de sus cinco pilares (Camino de Vida, Expresión, Deseo, Personalidad y Madurez).
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
                                    Perfilar Objetivo Táctico
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Nombre Completo del Objetivo (Importante para calcular letras)</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                            <Input
                                                type="text"
                                                placeholder="Ej. Carlos Slim Domínguez"
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
                                            Desensamblando Matriz Numérica...
                                        </motion.div>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5" />
                                            Generar Veredicto de Sinergia
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Arsenal de Vida */}
                                <div className="glass rounded-xl p-6 border-primary/20 bg-primary/5 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Sparkles className="w-16 h-16" />
                                    </div>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Tu Arsenal ({profile.name.split(' ')[0]})</p>
                                    <div className="mt-4 flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-serif font-bold text-primary">{result.user.lp}</span>
                                        <span className="text-sm font-sans text-primary/60">({profile.archetype})</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-primary/10">
                                        <div className="text-center"><Eye className="h-4 w-4 mx-auto text-primary/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.user.exp}</span></div>
                                        <div className="text-center"><Heart className="h-4 w-4 mx-auto text-primary/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.user.soul}</span></div>
                                        <div className="text-center"><User className="h-4 w-4 mx-auto text-primary/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.user.per}</span></div>
                                        <div className="text-center"><Milestone className="h-4 w-4 mx-auto text-primary/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.user.mat}</span></div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-1">
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Expresión</div>
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Deseo</div>
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Personalidad</div>
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Madurez</div>
                                    </div>
                                </div>

                                {/* Target */}
                                <div className="glass rounded-xl p-6 border-amber-500/20 bg-amber-500/5 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Target className="w-16 h-16" />
                                    </div>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">El Objetivo ({result.target.name.split(' ')[0]})</p>
                                    <div className="mt-4 flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-serif font-bold text-amber-500">{result.target.lp}</span>
                                        <span className="text-sm font-sans text-amber-500/60">({result.target.archetype})</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-amber-500/10">
                                        <div className="text-center"><Eye className="h-4 w-4 mx-auto text-amber-500/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.target.exp}</span></div>
                                        <div className="text-center"><Heart className="h-4 w-4 mx-auto text-amber-500/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.target.soul}</span></div>
                                        <div className="text-center"><User className="h-4 w-4 mx-auto text-amber-500/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.target.per}</span></div>
                                        <div className="text-center"><Milestone className="h-4 w-4 mx-auto text-amber-500/70 mb-1" /><span className="text-xs font-bold text-foreground">{result.target.mat}</span></div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-1">
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Expresión</div>
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Deseo</div>
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Personalidad</div>
                                        <div className="text-[9px] uppercase tracking-tighter text-muted-foreground">Madurez</div>
                                    </div>
                                </div>
                            </div>

                            {/* Integracion General */}
                            <div className="glass rounded-2xl p-8 border-amber-500/20 shadow-[0_0_30px_-10px_rgba(245,158,11,0.1)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-foreground">
                                            Veredicto: {result.synergy.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500" style={{ width: `${result.synergy.score}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-amber-500">{result.synergy.score}% Afinidad Táctica (Nivel Base)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-muted-foreground font-sans text-lg leading-relaxed border-l-2 border-amber-500/50 pl-4 py-1 italic">
                                            "{result.synergy.description}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                                        <div className="p-4 rounded-xl bg-secondary/50 border border-emerald-500/20">
                                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2">
                                                <Shield className="h-4 w-4" /> Estrategia de Poder
                                            </h4>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-sans">{result.synergy.strategy}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-secondary/50 border border-rose-500/20">
                                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose-400 mb-2">
                                                <ShieldAlert className="h-4 w-4" /> Shadow Work (Cuidados)
                                            </h4>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-sans">{result.synergy.care}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-Afinidades Explicadas */}
                            <div className="glass rounded-xl p-6 border-border">
                                <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">Afinidad por Pilares</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-background border border-border">
                                        <div className="flex items-center gap-2 mb-2"><Eye className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-bold uppercase">Expresión de Talento</span></div>
                                        <p className="text-xs text-muted-foreground font-sans leading-relaxed">{getDetailedCompatibility(result.user.exp, result.target.exp, 'la forma de actuar e impresionar a otros')}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background border border-border">
                                        <div className="flex items-center gap-2 mb-2"><Heart className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-bold uppercase">Deseo del Alma</span></div>
                                        <p className="text-xs text-muted-foreground font-sans leading-relaxed">{getDetailedCompatibility(result.user.soul, result.target.soul, 'la brújula interna y motivaciones secretas')}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background border border-border">
                                        <div className="flex items-center gap-2 mb-2"><User className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-bold uppercase">Personalidad Exterior</span></div>
                                        <p className="text-xs text-muted-foreground font-sans leading-relaxed">{getDetailedCompatibility(result.user.per, result.target.per, 'la imagen pública y primera impresión')}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background border border-border">
                                        <div className="flex items-center gap-2 mb-2"><Milestone className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-bold uppercase">Destino en la Madurez</span></div>
                                        <p className="text-xs text-muted-foreground font-sans leading-relaxed">{getDetailedCompatibility(result.user.mat, result.target.mat, 'el ritmo de vida después de los 40 años')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={resetSimulator}
                                    variant="outline"
                                    className="w-full h-14 gap-2 text-muted-foreground hover:text-foreground font-bold"
                                >
                                    <Activity className="h-4 w-4" />
                                    Analizar Nuevo Objetivo
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TribunalPoder;
